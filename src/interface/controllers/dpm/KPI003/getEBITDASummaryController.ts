import { Request } from "express"
import { jsonResponseWithErrorHandler } from "../../../decorators.js"
import { OptionalNumber } from "../../tot/v1/utils.js"
import {
  EbitdaSummaryData,
  EbitdaSummaryForForecastFromMySQL,
  EbitdaSummaryForForecastFromSF,
  getEbitdaSummaryRequest,
  getEbitdaSummaryResponse,
} from "../../../../domain/entities/dpm/ebitdaSummary.js"
import {
  SnowflakeTransaction,
  snowflakeSelectWrapper,
  wrapInSnowflakeTransaction,
} from "../../../../infrastructure/orm/snowflake/index.js"
import { readSqlFile } from "./utils.js"
import { currentFiscalYear } from "./helper/businessPlan/businessPlanHelper.js"
import { calcEbitdaSummaryData, ebitdaDataFn } from "./helper/businessPlan/ebitdaHelper.js"
import { dataForecastSummaryFn } from "./getEBITDAForecastSummaryController.js"
import { QueryTypes, Transaction } from "sequelize"
import { sequelize, wrapInTransaction } from "../../../../infrastructure/orm/sqlize/index.js"

const PLANT_WISE_SF_QUERY = readSqlFile("getSfEbitdaSummaryForForecastPlantWise")
const UNIT_WISE_SF_QUERY = readSqlFile("getSfEbitdaSummaryForForecastUnitWise")

const QUERY = readSqlFile("getEbitdaPlanAllSummary")

type requestType = getEbitdaSummaryRequest
type responseType = getEbitdaSummaryResponse
type responseDataType = EbitdaSummaryData
type databaseType = EbitdaSummaryForForecastFromMySQL
type snowflakeType = EbitdaSummaryForForecastFromSF

const getEbitdaDataSummary = async (input: requestType) => {
  const [, grossMarginData, basicChargeData, opexData] = await dataForecastSummaryFn(input)
  return calcEbitdaSummaryData(grossMarginData, basicChargeData, opexData)
}

const getEbitdaSummaryForForecastData = async (input: requestType) => {
  const ebitdaData = input["unit-id"] !== undefined ? await ebitdaDataFn(input) : await getEbitdaDataSummary(input)
  const filtredEbitdaData = ebitdaData.filter((data) => data["fiscal-year"] > currentFiscalYear())
  if (filtredEbitdaData.length === 0) return null
  const transformedData = filtredEbitdaData
    .map((data) => data.value * 100000000)
    .reduce((accumulator, currentValue) => {
      return accumulator + currentValue
    }, 0)
  return transformedData
}

const sfQuery = (input: requestType) => {
  let ret
  if (input["unit-id"] === undefined) {
    ret = PLANT_WISE_SF_QUERY
  } else {
    ret = UNIT_WISE_SF_QUERY
    ret = ret.replace("%unitIdFilter%", "c.UNIT_CODE = :3")
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

const getEbitdaSummarySfData = async (
  input: requestType,
  snowflakeTransaction: SnowflakeTransaction,
): Promise<number | null> => {
  const ebitdaSummarySfData = await snowflakeSelectWrapper<snowflakeType>(snowflakeTransaction, {
    sqlText: sfQuery(input),
    binds: [
      currentFiscalYear(),
      input["plant-id"],
      input["unit-id"] || "",
      input["start-fiscal-year"] || "",
      input["end-fiscal-year"] || "",
    ],
  })
  return ebitdaSummarySfData.length === 0 ? null : ebitdaSummarySfData[0].VALUE
}

const query = (input: requestType) => {
  let ret = QUERY

  ret =
    input["unit-id"] === undefined
      ? ret.replace("%unitIdFilter%", "TRUE")
      : ret.replace("%unitIdFilter%", "bc.UNIT_CODE = :unitId")

  ret =
    input["start-fiscal-year"] === undefined
      ? ret.replace("%startFiscalYearFilter%", "TRUE")
      : ret.replace("%startFiscalYearFilter%", "bc.FISCAL_YEAR >= :startFiscalYear")

  ret =
    input["end-fiscal-year"] === undefined
      ? ret.replace("%endFiscalYearFilter%", "TRUE")
      : ret.replace("%endFiscalYearFilter%", "bc.FISCAL_YEAR <= :endFiscalYear")

  return ret
}

const getEbitdaPlanSummaryData = async (input: requestType, transaction: Transaction): Promise<databaseType | null> =>
  sequelize.query(query(input), {
    replacements: {
      plantId: input["plant-id"],
      unitId: input["unit-id"],
      startFiscalYear: input["start-fiscal-year"],
      endFiscalYear: input["end-fiscal-year"],
    },
    transaction,
    type: QueryTypes.SELECT,
    raw: true,
    plain: true,
  })

const transform = (data: databaseType | null) => (data === null ? null : Number(data.VALUE))

const data = async (input: requestType): Promise<responseDataType> => {
  const [ebidtaSummaryForPlanDataValue, ebidtaSummaryForForecastDataValue, ebidtaSummaryForForecastSfDataValue] =
    await Promise.all([
      wrapInTransaction((transaction) => getEbitdaPlanSummaryData(input, transaction).then(transform)),
      getEbitdaSummaryForForecastData(input),
      wrapInSnowflakeTransaction((snowflakeTransaction) => getEbitdaSummarySfData(input, snowflakeTransaction)),
    ])
  const planTotal = ebidtaSummaryForPlanDataValue
  let forecastTotal = null
  if (ebidtaSummaryForForecastDataValue !== null || ebidtaSummaryForForecastSfDataValue !== null) {
    const forecastSum = (ebidtaSummaryForForecastDataValue || 0) + (ebidtaSummaryForForecastSfDataValue || 0)
    forecastTotal = Math.trunc(forecastSum / 1000000) / 100
  }

  return {
    plan: planTotal,
    forecast: forecastTotal,
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

export const consolidateGetEbitdaSummaryRequest = consolidate
export const getEbitdaSummary = controller
export const getEbitdaSummaryController = jsonResponseWithErrorHandler((x) => controller(consolidate(x) as requestType))
export const getEbitdaSummaryFn = data
