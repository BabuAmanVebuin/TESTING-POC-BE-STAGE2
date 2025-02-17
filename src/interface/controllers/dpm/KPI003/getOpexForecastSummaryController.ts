import { Request } from "express"
import { jsonResponseWithErrorHandler } from "../../../decorators.js"
import { OptionalNumber } from "../../tot/v1/utils.js"
import { QueryTypes, Transaction } from "sequelize"
import { sequelize, wrapInTransaction } from "../../../../infrastructure/orm/sqlize/index.js"
import { readSqlFile } from "./utils.js"
import {
  SnowflakeTransaction,
  snowflakeSelectWrapper,
  wrapInSnowflakeTransaction,
} from "../../../../infrastructure/orm/snowflake/index.js"
import { currentFiscalYear } from "./helper/businessPlan/businessPlanHelper.js"
import {
  getOpexForecastSummaryRequest,
  getOpexForecastSummaryAPIResponse,
  getOpexForecastSummaryResponse,
  opexForecastSummaryDbType,
  opexForecastSummarySnowflakeType,
} from "../../../../domain/entities/dpm/opexForecastSummary.js"

const QUERY = readSqlFile("getOpexForecastSummary")
const SF_QUERY = readSqlFile("getSfOpexForecastSummary")
const SF_OPERATION_QUERY = readSqlFile("getSfOperationCostForecastSummary")
const SF_MAINTENANCE_QUERY = readSqlFile("getSfMaintenanceCostForecastSummary")

type requestType = getOpexForecastSummaryRequest
type responseType = getOpexForecastSummaryAPIResponse
type responseDataType = getOpexForecastSummaryResponse

type databaseType = opexForecastSummaryDbType
type snowflakeType = opexForecastSummarySnowflakeType

type plantIdAndFiscalYear = string

const query = (input: requestType) => {
  let ret = QUERY
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

const getOpexForecastData = (input: requestType, transaction: Transaction) =>
  sequelize.query<databaseType>(query(input), {
    replacements: {
      plantId: input["plant-id"],
      startFiscalYear: input["start-fiscal-year"],
      endFiscalYear: input["end-fiscal-year"],
      currentFiscalYear: currentFiscalYear(),
    },
    transaction,
    type: QueryTypes.SELECT,
    raw: true,
  })

const transform = (data: databaseType[]) =>
  data.map((x) => ({
    "plant-id": x.PLANT_CODE,
    "fiscal-year": x.FISCAL_YEAR,
    "operation-cost": x.OPERATION_COST === null ? null : Number(x.OPERATION_COST),
    "maintenance-cost": x.MAINTENANCE_COST === null ? null : Number(x.MAINTENANCE_COST),
    sum: Number(x.SUM),
  }))

const sfQuery = (input: requestType, targetQuery: string) => {
  let ret = targetQuery
  ret =
    input["start-fiscal-year"] === undefined
      ? ret.replace("%startFiscalYearFilter%", "TRUE")
      : ret.replace("%startFiscalYearFilter%", "cr.FISCAL_YEAR >= :3")

  ret =
    input["end-fiscal-year"] === undefined
      ? ret.replace("%endFiscalYearFilter%", "TRUE")
      : ret.replace("%endFiscalYearFilter%", "cr.FISCAL_YEAR <= :4")

  return ret
}

const getSfData = (
  input: requestType,
  query: string,
  snowflakeTransaction: SnowflakeTransaction,
): Promise<snowflakeType[]> =>
  snowflakeSelectWrapper<snowflakeType>(snowflakeTransaction, {
    sqlText: sfQuery(input, query),
    binds: [currentFiscalYear(), input["plant-id"], input["start-fiscal-year"] || "", input["end-fiscal-year"] || ""],
  })

const getSfDataRecord = (data: snowflakeType[]) =>
  data.reduce(
    (acc, cur) => {
      acc[`${cur.PLANT_CODE}:${cur.FISCAL_YEAR}`] = cur
      return acc
    },
    {} as Record<plantIdAndFiscalYear, snowflakeType>,
  )

const transformSf = (
  opexData: snowflakeType[],
  operationData: Record<plantIdAndFiscalYear, snowflakeType>,
  maintenanceData: Record<plantIdAndFiscalYear, snowflakeType>,
) =>
  opexData.map((x) => {
    const operationValue = operationData[`${x.PLANT_CODE}:${x.FISCAL_YEAR}`]?.VALUE ?? null
    const maintenanceValue = maintenanceData[`${x.PLANT_CODE}:${x.FISCAL_YEAR}`]?.VALUE ?? null
    return {
      "plant-id": x.PLANT_CODE,
      "fiscal-year": x.FISCAL_YEAR,
      "operation-cost": operationValue === null ? null : Number(Math.ceil(operationValue / 1000000) / 100), // convert value into 億円 from 円 & ceil the value to two decimal place
      "maintenance-cost": maintenanceValue === null ? null : Number(Math.ceil(maintenanceValue / 1000000) / 100), // convert value into 億円 from 円 & ceil the value to two decimal place
      sum: Math.ceil(x.VALUE / 1000000) / 100, // convert value into 億円 from 円 & ceil the value to two decimal place
    }
  })

const data = async (input: requestType): Promise<responseDataType[]> => {
  const [databaseData, sfOpexData, sfOperationData, sfMaintenanceData] = await wrapInSnowflakeTransaction(
    (snowflakeTransaction) =>
      Promise.all([
        wrapInTransaction((transaction) => getOpexForecastData(input, transaction).then(transform)),
        getSfData(input, SF_QUERY, snowflakeTransaction),
        getSfData(input, SF_OPERATION_QUERY, snowflakeTransaction).then(getSfDataRecord),
        getSfData(input, SF_MAINTENANCE_QUERY, snowflakeTransaction).then(getSfDataRecord),
      ]),
  )
  const snowflakeData = transformSf(sfOpexData, sfOperationData, sfMaintenanceData)
  return [databaseData, snowflakeData].flat()
}

const controller = async (input: requestType, dataFn = data): Promise<responseType> => {
  return {
    code: 200,
    body: await dataFn(input),
  }
}

const consolidate = (request: Request): requestType => ({
  "plant-id": request.query["plant-id"] as string,
  "start-fiscal-year": OptionalNumber(request.query["start-fiscal-year"]),
  "end-fiscal-year": OptionalNumber(request.query["end-fiscal-year"]),
})

export const consolidateGetOpexForecastSummaryRequest = consolidate
export const getOpexForecast = controller
export const getOpexForecastSummaryController = jsonResponseWithErrorHandler((x) =>
  controller(consolidate(x) as requestType),
)
export const getOpexForecastSummaryFn = data
