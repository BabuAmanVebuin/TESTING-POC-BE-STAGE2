import { Request } from "express"
import { jsonResponseWithErrorHandler } from "../../../decorators.js"
import { OptionalNumber } from "../../tot/v1/utils.js"
import { QueryTypes, Transaction } from "sequelize"
import { sequelize, wrapInTransaction } from "../../../../infrastructure/orm/sqlize/index.js"
import { readSqlFile } from "./utils.js"
import { currentFiscalYear, fixedNumber } from "./helper/businessPlan/businessPlanHelper.js"
import {
  SnowflakeTransaction,
  snowflakeSelectWrapper,
  wrapInSnowflakeTransaction,
} from "../../../../infrastructure/orm/snowflake/index.js"
import {
  OpexSummaryData,
  OpexSummaryForForecastFromSF,
  OpexSummaryFromSqlDB,
  getOpexSummaryRequest,
  getOpexSummaryResponse,
  opexSummaryTransformedSqlData,
} from "../../../../domain/entities/dpm/opexSummary.js"

const SQL_QUERY_PLAN = readSqlFile("getOpexSummaryForPlan")

const SQL_QUERY_FORECAST = readSqlFile("getOpexSummaryForForecast")

const PLANT_WISE_SF_QUERY = readSqlFile("getSfOpexSummaryForForecastPlantWise")
const UNIT_WISE_SF_QUERY = readSqlFile("getSfOpexSummaryForForecastUnitWise")

type requestType = getOpexSummaryRequest
type responseType = getOpexSummaryResponse
type responseDataType = OpexSummaryData

type databaseType = OpexSummaryFromSqlDB
type snowflakeType = OpexSummaryForForecastFromSF

enum Measure {
  Opex = "OPEX",
  OperationCost = "OperationCost",
  MaintenanceCost = "MaintenanceCost",
}

const query = (input: requestType, inputQuery: string) => {
  let ret = inputQuery
  ret =
    input["unit-id"] === undefined
      ? ret.replace("%unitIdFilter%", "TRUE")
      : ret.replace("%unitIdFilter%", "UNIT_CODE = :unitId")

  ret =
    input["start-fiscal-year"] === undefined
      ? ret.replace("%startFiscalYearFilter%", "TRUE")
      : ret.replace("%startFiscalYearFilter%", "FISCAL_YEAR >= :startFiscalYear")

  ret =
    input["end-fiscal-year"] === undefined
      ? ret.replace("%endFiscalYearFilter%", "TRUE")
      : ret.replace("%endFiscalYearFilter%", "FISCAL_YEAR <= :endFiscalYear")

  return ret
}

const opexForecastSummaryHelper = (opexSqlValue: number | null, opexSfValue: number | null): number | null => {
  let totalForecastSum = null
  if (opexSqlValue !== null || opexSfValue !== null) {
    const summaryForcastSum = (opexSqlValue || 0) + (opexSfValue || 0)
    totalForecastSum = Math.ceil(summaryForcastSum / 1000000) / 100
  }
  return totalForecastSum ? fixedNumber(totalForecastSum) : null
}

const getOpexSummaryForPlanData = async (input: requestType, transaction: Transaction) => {
  const res = await sequelize.query<databaseType>(query(input, SQL_QUERY_PLAN), {
    replacements: {
      plantCode: input["plant-id"],
      unitId: input["unit-id"],
      startFiscalYear: input["start-fiscal-year"],
      endFiscalYear: input["end-fiscal-year"],
    },
    type: QueryTypes.SELECT,
    plain: true,
    transaction,
  })
  return res !== null && res.SUM !== null
    ? {
        sum: res.SUM ? res.SUM : null,
        "operation-cost": res.OPERATION_COST ? res.OPERATION_COST : null,
        "maintenance-cost": res.MAINTENANCE_COST ? res.MAINTENANCE_COST : null,
      }
    : null
}

const getOpexForecastData = async (input: requestType, transaction: Transaction) => {
  const res = await sequelize.query<databaseType>(query(input, SQL_QUERY_FORECAST), {
    replacements: {
      plantCode: input["plant-id"],
      unitId: input["unit-id"],
      startFiscalYear: input["start-fiscal-year"],
      endFiscalYear: input["end-fiscal-year"],
      currentFiscalYear: currentFiscalYear(),
    },
    transaction,
    type: QueryTypes.SELECT,
    plain: true,
    raw: true,
  })
  return res !== null && res.SUM !== null
    ? {
        sum: res.SUM,
        "operation-cost": res.OPERATION_COST ? res.OPERATION_COST : null,
        "maintenance-cost": res.MAINTENANCE_COST ? res.MAINTENANCE_COST : null,
      }
    : null
}

const transform = (opexForecastData: opexSummaryTransformedSqlData | null) => {
  return opexForecastData
    ? {
        sum: opexForecastData.sum * 100000000,
        "operation-cost": (opexForecastData["operation-cost"] || 0) * 100000000,
        "maintenance-cost": (opexForecastData["maintenance-cost"] || 0) * 100000000,
      }
    : opexForecastData
}

const sfQuery = (input: requestType) => {
  let ret
  if (input["unit-id"] === undefined) {
    ret = PLANT_WISE_SF_QUERY
  } else {
    ret = UNIT_WISE_SF_QUERY
    ret = ret.replace("%unitIdFilter%", "c.UNIT_CODE = :4")
  }
  ret =
    input["start-fiscal-year"] === undefined
      ? ret.replace("%startFiscalYearFilter%", "TRUE")
      : ret.replace("%startFiscalYearFilter%", "cr.FISCAL_YEAR >= :5")

  ret =
    input["end-fiscal-year"] === undefined
      ? ret.replace("%endFiscalYearFilter%", "TRUE")
      : ret.replace("%endFiscalYearFilter%", "cr.FISCAL_YEAR <= :6")
  return ret
}

const getOpexSummarySfData = (
  input: requestType,
  measure: string,
  snowflakeTransaction: SnowflakeTransaction,
): Promise<snowflakeType[]> =>
  snowflakeSelectWrapper<snowflakeType>(snowflakeTransaction, {
    sqlText: sfQuery(input),
    binds: [
      currentFiscalYear(),
      input["plant-id"],
      measure,
      input["unit-id"] || "",
      input["start-fiscal-year"] || "",
      input["end-fiscal-year"] || "",
    ],
  })

const transformSf = (data: snowflakeType[]) => {
  if (data.length === 0) return null
  return data.reduce((accumulator, currentValue) => {
    return accumulator + currentValue.VALUE
  }, 0)
}

const data = async (input: requestType): Promise<responseDataType> => {
  const [
    opexSummaryForPlanData,
    opexSummaryForForecast,
    opexSummaryForForecastSfOpex,
    opexSummaryForForecastSfOperationCost,
    opexSummaryForForecastSfMaintenanceCost,
  ] = await Promise.all([
    wrapInTransaction((transaction) => getOpexSummaryForPlanData(input, transaction)),
    wrapInTransaction((transaction) => getOpexForecastData(input, transaction).then(transform)),
    wrapInSnowflakeTransaction((snowflakeTransaction) =>
      getOpexSummarySfData(input, Measure.Opex, snowflakeTransaction).then(transformSf),
    ),
    wrapInSnowflakeTransaction((snowflakeTransaction) =>
      getOpexSummarySfData(input, Measure.OperationCost, snowflakeTransaction).then(transformSf),
    ),
    wrapInSnowflakeTransaction((snowflakeTransaction) =>
      getOpexSummarySfData(input, Measure.MaintenanceCost, snowflakeTransaction).then(transformSf),
    ),
  ])

  const opexSummarySum = {
    plan: opexSummaryForPlanData?.sum === null || undefined ? null : Number(opexSummaryForPlanData?.sum),
    forecast: opexForecastSummaryHelper(opexSummaryForForecast?.sum || null, opexSummaryForForecastSfOpex),
  }
  const opexSummaryOperationCost = {
    plan:
      opexSummaryForPlanData?.["operation-cost"] === null || undefined
        ? null
        : Number(opexSummaryForPlanData?.["operation-cost"]),
    forecast: opexForecastSummaryHelper(
      opexSummaryForForecast?.["operation-cost"] || null,
      opexSummaryForForecastSfOperationCost,
    ),
  }
  const opexSummaryMaintenanceCost = {
    plan:
      opexSummaryForPlanData?.["maintenance-cost"] === null || undefined
        ? null
        : Number(opexSummaryForPlanData?.["maintenance-cost"]),
    forecast: opexForecastSummaryHelper(
      opexSummaryForForecast?.["maintenance-cost"] || null,
      opexSummaryForForecastSfMaintenanceCost,
    ),
  }

  return {
    sum: opexSummarySum,
    "operation-cost": opexSummaryOperationCost,
    "maintenance-cost": opexSummaryMaintenanceCost,
  }
}

const controller = async (input: requestType, dataFn = data): Promise<responseType> => {
  return {
    code: 200,
    body: await dataFn(input),
  }
}

const consolidate = (request: Request): requestType => ({
  "plant-id": request.query["plant-id"] as string,
  "unit-id": request.query["unit-id"] as string,
  "start-fiscal-year": OptionalNumber(request.query["start-fiscal-year"]),
  "end-fiscal-year": OptionalNumber(request.query["end-fiscal-year"]),
})

export const consolidateGetOpexSummaryRequest = consolidate
export const getOpexSummary = controller
export const getOpexSummaryController = jsonResponseWithErrorHandler((x) => controller(consolidate(x) as requestType))
export const getOpexSummaryFn = data
