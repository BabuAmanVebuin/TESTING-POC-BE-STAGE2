import { Request } from "express"
import { jsonResponseWithErrorHandler } from "../../../decorators.js"
import { OptionalNumber } from "../../tot/v1/utils.js"
import { wrapInTransaction } from "../../../../infrastructure/orm/sqlize/index.js"
import { currentFiscalYear, fixedNumber } from "./helper/businessPlan/businessPlanHelper.js"
import {
  SnowflakeTransaction,
  snowflakeSelectWrapper,
  wrapInSnowflakeTransaction,
} from "../../../../infrastructure/orm/snowflake/index.js"
import { readSqlFile } from "./utils.js"
import {
  getHeatRateForecastSummaryRequest,
  getHeatRateForecastSummaryResponse,
  heatRateForecastSummaryData,
  heatRateForecastSummarySfFromDB,
} from "../../../../domain/entities/dpm/heatRateForecastSummary.js"
import { thermalEfficiencyForecastSummaryDataFn } from "./getThermalEfficiencyForecastSummaryController.js"
import { getThermalEfficiencyForecastSummaryResponse } from "../../../../domain/entities/dpm/thermalEfficiencyForecastSummary.js"

const SF_QUERY = readSqlFile("getSfHeatRateForecastSummary")
const DOT_POSITION = 2

type requestType = getHeatRateForecastSummaryRequest
type responseType = getHeatRateForecastSummaryResponse
type responseDataType = heatRateForecastSummaryData

type thermalEfficiencyForecastSummaryDataType = getThermalEfficiencyForecastSummaryResponse

const sfQuery = (query: string, input: requestType) => {
  let ret = query
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
const transformSf = (data: heatRateForecastSummarySfFromDB[]) =>
  data.map((x) => ({
    "plant-id": x.PLANT_CODE,
    "fiscal-year": x.FISCAL_YEAR,
    value: Number(x.VALUE.toFixed(2)),
  }))

const filterByFiscalYear = <T extends { "fiscal-year": number }>(data: T[]) =>
  data.filter((elem: T) => elem["fiscal-year"] > currentFiscalYear())

const calcHeatRateForecastSummary = (
  thermalEfficiencies: thermalEfficiencyForecastSummaryDataType[],
): responseDataType[] =>
  thermalEfficiencies.map((x) => ({
    ...x,
    value: 3600 / (x.value / 100),
  }))

const roundValues = <T extends { value: number }>(data: T[]) =>
  data.map((x) => ({
    ...x,
    value: fixedNumber(x.value, DOT_POSITION),
  }))

const getHeatRateForecastSfData = (
  input: requestType,
  query: string,
  snowflakeTransaction: SnowflakeTransaction,
): Promise<heatRateForecastSummarySfFromDB[]> =>
  snowflakeSelectWrapper<heatRateForecastSummarySfFromDB>(snowflakeTransaction, {
    sqlText: sfQuery(query, input),
    binds: [currentFiscalYear(), input["plant-id"], input["start-fiscal-year"] || "", input["end-fiscal-year"] || ""],
  })

const data = async (input: requestType): Promise<responseDataType[]> => {
  const [snowflakeHeatRateData, thermalEfficiencyForecastSummary] = await Promise.all([
    wrapInSnowflakeTransaction((snowflakeTransaction) =>
      getHeatRateForecastSfData(input, SF_QUERY, snowflakeTransaction).then(transformSf),
    ),
    // Get thermalEfficiencyForecastSummary data after current fiscal year
    wrapInTransaction(() => thermalEfficiencyForecastSummaryDataFn(input).then(filterByFiscalYear)),
  ])

  const heatRateForcastSummaryData = calcHeatRateForecastSummary(thermalEfficiencyForecastSummary)

  return [snowflakeHeatRateData, roundValues(heatRateForcastSummaryData)].flat()
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

export const consolidateGetHeatRateForecastSummaryRequest = consolidate
export const getHeatRateForecastSummary = controller
export const getHeatRateForecastSummaryController = jsonResponseWithErrorHandler((x) =>
  controller(consolidate(x) as requestType),
)
export const heatRateForecastSummaryCalcTestFn = (
  thermalEfficiencies: thermalEfficiencyForecastSummaryDataType[],
): responseDataType[] => roundValues(calcHeatRateForecastSummary(thermalEfficiencies))
