import { Request } from "express"
import { jsonResponseWithErrorHandler } from "../../../decorators.js"
import { OptionalNumber } from "../../tot/v1/utils.js"
import { QueryTypes, Transaction } from "sequelize"
import { sequelize, wrapInTransaction } from "../../../../infrastructure/orm/sqlize/index.js"
import { readSqlFile } from "./utils.js"
import {
  GenerationOutputSummaryData,
  GenerationOutputSummaryForForecastFromSF,
  GenerationOutputSummaryFromSqlDB,
  getGenerationOutputSummaryRequest,
  getGenerationOutputSummaryResponse,
} from "../../../../domain/entities/dpm/generationOutputSummary.js"
import { currentFiscalYear } from "./helper/businessPlan/businessPlanHelper.js"
import {
  SnowflakeTransaction,
  snowflakeSelectWrapper,
  wrapInSnowflakeTransaction,
} from "../../../../infrastructure/orm/snowflake/index.js"

const SQL_QUERY_PLAN = readSqlFile("getGenerationOuputSummaryForPlan")

const SQL_QUERY_FORECAST = readSqlFile("getGenerationOuputSummaryForForecast")
const PLANT_WISE_SF_QUERY = readSqlFile("getSfGenerationOutputSummaryForForecastPlantWise")
const UNIT_WISE_SF_QUERY = readSqlFile("getSfGenerationOutputSummaryForForecastUnitWise")

type requestType = getGenerationOutputSummaryRequest
type responseType = getGenerationOutputSummaryResponse
type responseDataType = GenerationOutputSummaryData

type databaseType = GenerationOutputSummaryFromSqlDB
type snowflakeType = GenerationOutputSummaryForForecastFromSF

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

const getGenerationOutputSummaryForPlanData = async (input: requestType, transaction: Transaction) => {
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
  return res?.sum ? Number(res.sum) : null
}

const getGenerationOutputForecastData = async (input: requestType, transaction: Transaction) => {
  const res = await sequelize.query<databaseType>(query(input, SQL_QUERY_FORECAST), {
    replacements: {
      plantId: input["plant-id"],
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
  return res ? res.sum : res
}
const transform = (sum: number | null) => {
  return sum ? sum * 1000 : sum
}

const sfQuery = (input: requestType) => {
  let ret
  if (input["unit-id"] === undefined) {
    ret = PLANT_WISE_SF_QUERY
  } else {
    ret = UNIT_WISE_SF_QUERY
    ret = ret.replace("%unitIdFilter%", "cr.UNIT_CODE = :3")
  }
  ret =
    input["start-fiscal-year"] === undefined
      ? ret.replace("%startFiscalYearFilter%", "TRUE")
      : ret.replace("%startFiscalYearFilter%", "cr.FISCAL_YEAR >= :4")

  ret =
    input["end-fiscal-year"] === undefined
      ? ret.replace("%endFiscalYearFilter%", "TRUE")
      : ret.replace("%endFiscalYearFilter%", "cr.FISCAL_YEAR <= :5")
  return ret
}

export const getGenerationOutputSummarySfData = (
  input: requestType,
  snowflakeTransaction: SnowflakeTransaction,
): Promise<snowflakeType[]> =>
  snowflakeSelectWrapper<snowflakeType>(snowflakeTransaction, {
    sqlText: sfQuery(input),
    binds: [
      currentFiscalYear(),
      input["plant-id"],
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

export const calcGenerationOutputSummaryForForecast = async (input: requestType): Promise<number | null> => {
  const [generationOutputSummaryForForecast, generationOutputSummaryForForecastSfTotal] = await Promise.all([
    wrapInTransaction((transaction) => getGenerationOutputForecastData(input, transaction).then(transform)),
    wrapInSnowflakeTransaction((snowflakeTransaction) =>
      getGenerationOutputSummarySfData(input, snowflakeTransaction).then(transformSf),
    ),
  ])
  if (generationOutputSummaryForForecast !== null || generationOutputSummaryForForecastSfTotal !== null) {
    const summaryForcastSum =
      (generationOutputSummaryForForecast || 0) + (generationOutputSummaryForForecastSfTotal || 0)
    return summaryForcastSum
  } else return null
}

const data = async (input: requestType): Promise<responseDataType> => {
  const [generationOutputSummaryForPlanData, generationOutputSummaryForForecastSum] = await Promise.all([
    wrapInTransaction((transaction) => getGenerationOutputSummaryForPlanData(input, transaction)),
    calcGenerationOutputSummaryForForecast(input),
  ])
  const totalPlan = generationOutputSummaryForPlanData
  let totalForecast = null

  if (generationOutputSummaryForForecastSum !== null) {
    totalForecast = Math.trunc(generationOutputSummaryForForecastSum / 10) / 100 // convert value into GWh from MWh & trunc the value to two decimal place
  }

  return {
    plan: totalPlan,
    forecast: totalForecast,
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

export const consolidateGetGenerationOutputSummaryRequest = consolidate
export const getGenerationOutputSummary = controller
export const getGenerationOutputSummaryController = jsonResponseWithErrorHandler((x) =>
  controller(consolidate(x) as requestType),
)
export const getGenerationOutputSummaryFn = data
