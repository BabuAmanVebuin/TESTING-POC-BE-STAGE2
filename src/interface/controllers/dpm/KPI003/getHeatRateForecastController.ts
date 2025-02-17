import { Request } from "express"
import { jsonResponseWithErrorHandler } from "../../../decorators.js"
import { OptionalNumber } from "../../tot/v1/utils.js"
import { wrapInTransaction } from "../../../../infrastructure/orm/sqlize/index.js"
import {
  getHeatRateForecastAPIResponse,
  getHeatRateForecastRequest,
  getHeatRateForecastResponse,
  heatRateForecastSnowflakeType,
} from "../../../../domain/entities/dpm/heatRateForecast.js"
import { getThermalEfficiencyForecastFn } from "./helper/businessPlan/thermalEfficiencyHelper.js"
import { currentFiscalYear, filterByFiscalYear } from "./helper/businessPlan/businessPlanHelper.js"
import {
  SnowflakeTransaction,
  snowflakeSelectWrapper,
  wrapInSnowflakeTransaction,
} from "../../../../infrastructure/orm/snowflake/index.js"
import { readSqlFile } from "./utils.js"
import { getThermalEfficiencyForecastResponse } from "../../../../domain/entities/dpm/thermalEfficiencyForecast.js"
import { getGenerationOutputForecastFn } from "./getGenerationOutputForecastController.js"

const SF_QUERY = readSqlFile("getSfHeatRateForecast")

type requestType = getHeatRateForecastRequest
type responseType = getHeatRateForecastAPIResponse
type responseDataType = getHeatRateForecastResponse

const sfQuery = (query: string, input: requestType) => {
  let ret = query
  ret =
    input["unit-id"] === undefined
      ? ret.replace("%unitIdFilter%", "TRUE")
      : ret.replace("%unitIdFilter%", "cr.UNIT_CODE = :3")

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
const transformSf = (data: heatRateForecastSnowflakeType[]) =>
  data.map((x) => ({
    "plant-id": x.PLANT_CODE,
    "unit-id": x.UNIT_CODE,
    "fiscal-year": x.FISCAL_YEAR,
    value: Number(x.VALUE.toFixed(2)),
  }))
export const calcThermalEfficiencyHeatRateFn = (data: getThermalEfficiencyForecastResponse[]): responseDataType[] =>
  data
    .filter((element) => element["fiscal-year"] > currentFiscalYear())
    .map((heatRateDataElement) => ({
      "plant-id": heatRateDataElement["plant-id"],
      "unit-id": heatRateDataElement["unit-id"],
      "fiscal-year": heatRateDataElement["fiscal-year"],
      value: heatRateDataElement?.sum ? Number((3600 / (heatRateDataElement.sum / 100)).toFixed(2)) : null,
    }))

const getHeatRateForecastSfData = (
  input: requestType,
  query: string,
  snowflakeTransaction: SnowflakeTransaction,
): Promise<heatRateForecastSnowflakeType[]> =>
  snowflakeSelectWrapper<heatRateForecastSnowflakeType>(snowflakeTransaction, {
    sqlText: sfQuery(query, input),
    binds: [
      currentFiscalYear(),
      input["plant-id"],
      input["unit-id"] || "",
      input["start-fiscal-year"] || "",
      input["end-fiscal-year"] || "",
    ],
  })

const data = async (input: requestType): Promise<responseDataType[]> => {
  const [generationOutputData, snowflakeHeatRateData] = await Promise.all([
    wrapInTransaction(() => getGenerationOutputForecastFn(input).then(filterByFiscalYear)),
    wrapInSnowflakeTransaction((snowflakeTransaction) =>
      getHeatRateForecastSfData(input, SF_QUERY, snowflakeTransaction).then(transformSf),
    ),
  ])
  const targetFiscalYears = generationOutputData.map((x) => x["fiscal-year"])
  const thermalEfficiencyData =
    targetFiscalYears.length === 0
      ? []
      : await wrapInTransaction(() =>
          getThermalEfficiencyForecastFn({
            "plant-id": input["plant-id"],
            "unit-id": input["unit-id"],
            "start-fiscal-year": Math.min(...targetFiscalYears) || undefined,
            "end-fiscal-year": Math.max(...targetFiscalYears) || undefined,
          }),
        )

  const heatRateData = calcThermalEfficiencyHeatRateFn(thermalEfficiencyData)
  return [heatRateData, snowflakeHeatRateData].flat()
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

export const consolidateGetHeatRateForecastRequest = consolidate
export const getHeatRateForecast = controller
export const getHeatRateForecastController = jsonResponseWithErrorHandler((x) =>
  controller(consolidate(x) as requestType),
)
export const getHeatRateForecastFn = data
