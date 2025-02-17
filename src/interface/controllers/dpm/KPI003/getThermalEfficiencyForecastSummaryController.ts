import { Request } from "express"
import { jsonResponseWithErrorHandler } from "../../../decorators.js"
import { OptionalNumber } from "../../tot/v1/utils.js"
import {
  getThermalEfficiencyForecastSummaryRequest,
  getThermalEfficiencySummaryAPIResponse,
  getThermalEfficiencyForecastSummaryResponse,
  thermalEfficiencyForecastSummarySnowflakeType,
} from "../../../../domain/entities/dpm/thermalEfficiencyForecastSummary.js"
import { getGenerationOutputForecastFn } from "./getGenerationOutputForecastController.js"
import { getThermalEfficiencyForecastFn } from "./helper/businessPlan/thermalEfficiencyHelper.js"
import { getGenerationOutputForecastResponse } from "../../../../domain/entities/dpm/generationOutputForecast.js"
import { getThermalEfficiencyForecastResponse } from "../../../../domain/entities/dpm/thermalEfficiencyForecast.js"
import { currentFiscalYear, fixedNumber } from "./helper/businessPlan/businessPlanHelper.js"
import { getGenerationOutputForecastSummaryFn } from "./getGenerationOutputForecastSummaryController.js"
import { getGenerationOutputForecastSummaryResponse } from "../../../../domain/entities/dpm/generationOutputForecastSummary.js"
import { readSqlFile } from "./utils.js"
import { snowflakeSelectWrapper, wrapInSnowflakeTransaction } from "../../../../infrastructure/orm/snowflake/index.js"

const RES_DOT_POSITION = 2

const SF_QUERY = readSqlFile("getSfThermalEfficiencyForecastSummary")

type requestType = getThermalEfficiencyForecastSummaryRequest
type responseType = getThermalEfficiencySummaryAPIResponse
type responseDataType = getThermalEfficiencyForecastSummaryResponse

type snowflakeType = thermalEfficiencyForecastSummarySnowflakeType

type unitIdAndFiscalYear = string
type plnatIdAndFiscalYear = string
type unitWiseHeatInputType = {
  "plant-id": string
  "unit-id": string
  "fiscal-year": number
  value: number
}
type heatInputType = responseDataType

const sfQuery = (input: requestType) => {
  let ret = SF_QUERY
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

const getGenerationOutputForecastSummarySfData = (input: requestType): Promise<snowflakeType[]> =>
  wrapInSnowflakeTransaction((snowflakeTransaction) =>
    snowflakeSelectWrapper<snowflakeType>(snowflakeTransaction, {
      sqlText: sfQuery(input),
      binds: [currentFiscalYear(), input["plant-id"], input["start-fiscal-year"] || "", input["end-fiscal-year"] || ""],
    }),
  )

const transformSfThermalEfficiencyForecastSummaryData = (thermalEfficiencySfData: snowflakeType[]) =>
  thermalEfficiencySfData.map((x) => ({
    "plant-id": x.PLANT_CODE,
    "fiscal-year": x.FISCAL_YEAR,
    value: fixedNumber(x.VALUE * 100),
  }))

const transformGenerationOutputSummary = (generationOutputSummary: getGenerationOutputForecastSummaryResponse[]) =>
  generationOutputSummary.reduce(
    (acc, cur) => {
      acc[`${cur["plant-id"]}:${cur["fiscal-year"]}`] = cur
      return acc
    },
    {} as Record<plnatIdAndFiscalYear, getGenerationOutputForecastSummaryResponse>,
  )

const transformThermalEfficiency = (thermalEfficiencyData: getThermalEfficiencyForecastResponse[]) =>
  thermalEfficiencyData.reduce(
    (acc, cur) => {
      acc[`${cur["unit-id"]}:${cur["fiscal-year"]}`] = cur
      return acc
    },
    {} as Record<unitIdAndFiscalYear, getThermalEfficiencyForecastResponse>,
  )

const calculateUnitWiseHeatInput = async (
  generationOutputData: getGenerationOutputForecastResponse[],
  thermalEfficiencyRecord: Record<unitIdAndFiscalYear, getThermalEfficiencyForecastResponse>,
) =>
  generationOutputData.map<unitWiseHeatInputType>((x) => ({
    "plant-id": x["plant-id"],
    "unit-id": x["unit-id"],
    "fiscal-year": x["fiscal-year"],
    value:
      thermalEfficiencyRecord[`${x["unit-id"]}:${x["fiscal-year"]}`] === undefined
        ? 0
        : fixedNumber(x.sum / thermalEfficiencyRecord[`${x["unit-id"]}:${x["fiscal-year"]}`].sum || 0),
  }))

const calculateHeatInputSummary = (unitWiseHeatInput: unitWiseHeatInputType[]) =>
  Object.values(
    unitWiseHeatInput.reduce(
      (acc, cur) => {
        if (acc[`${cur["plant-id"]}:${cur["fiscal-year"]}`] === undefined) {
          acc[`${cur["plant-id"]}:${cur["fiscal-year"]}`] = {
            "plant-id": cur["plant-id"],
            "fiscal-year": cur["fiscal-year"],
            value: 0,
          }
        }
        acc[`${cur["plant-id"]}:${cur["fiscal-year"]}`].value += cur.value
        return acc
      },
      {} as Record<plnatIdAndFiscalYear, heatInputType>,
    ),
  )

const calculateThermalEfficiencySummary = (
  heatInput: heatInputType[],
  generationOutputSummaryData: Record<plnatIdAndFiscalYear, getGenerationOutputForecastSummaryResponse>,
) =>
  heatInput.map((x) => {
    return {
      "plant-id": x["plant-id"],
      "fiscal-year": x["fiscal-year"],
      value: fixedNumber(generationOutputSummaryData[`${x["plant-id"]}:${x["fiscal-year"]}`].value / x.value),
    }
  })

const calculate = async (
  generationOutputData: getGenerationOutputForecastResponse[],
  thermalEfficiencyRecord: Record<unitIdAndFiscalYear, getThermalEfficiencyForecastResponse>,
  generationOutputSummaryData: Record<plnatIdAndFiscalYear, getGenerationOutputForecastSummaryResponse>,
): Promise<responseDataType[]> => {
  const heatInput = await calculateUnitWiseHeatInput(generationOutputData, thermalEfficiencyRecord).then(
    calculateHeatInputSummary,
  )
  return calculateThermalEfficiencySummary(heatInput, generationOutputSummaryData)
}

const getResDotPosition = (data: responseDataType[]) =>
  data.map((x) => ({
    ...x,
    value: Math.round(x.value * Math.pow(10, RES_DOT_POSITION)) / Math.pow(10, RES_DOT_POSITION), // 小数点第3位を四捨五入
  }))

const getAfterFiscalYearData = <T extends { "fiscal-year": number }>(res: T[]) =>
  res.filter((x) => x["fiscal-year"] > currentFiscalYear())

const getCalculatedData = async (input: requestType): Promise<responseDataType[]> => {
  const [thermalEfficiencySfData, generationOutputData, generationOutputSummaryData] = await Promise.all([
    getGenerationOutputForecastSummarySfData(input).then(transformSfThermalEfficiencyForecastSummaryData),
    getGenerationOutputForecastFn(input).then(getAfterFiscalYearData),
    getGenerationOutputForecastSummaryFn(input).then(getAfterFiscalYearData).then(transformGenerationOutputSummary),
  ])
  if (generationOutputData.length === 0) {
    return thermalEfficiencySfData
  }
  const targetFiscalYears = generationOutputData.map((x) => x["fiscal-year"])
  const thermalEfficiencyData =
    targetFiscalYears.length === 0
      ? {}
      : await getThermalEfficiencyForecastFn({
          "plant-id": input["plant-id"],
          "start-fiscal-year": Math.min(...targetFiscalYears) || undefined,
          "end-fiscal-year": Math.max(...targetFiscalYears) || undefined,
        }).then(transformThermalEfficiency)

  const thermalEfficiencySummary = await calculate(
    generationOutputData,
    thermalEfficiencyData,
    generationOutputSummaryData,
  )
  return [thermalEfficiencySfData, thermalEfficiencySummary].flat()
}

const data = (input: requestType) => getCalculatedData(input).then(getResDotPosition)

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

export const consolidateGetThermalEfficiencyForecastSummaryRequest = consolidate
export const getThermalEfficiencyForecastSummary = controller
export const getThermalEfficiencyForecastSummaryController = jsonResponseWithErrorHandler((x) =>
  controller(consolidate(x) as requestType),
)
export const thermalEfficiencyForecastSummaryDataFn = getCalculatedData

export const thermalEfficiencyForecastSummaryCalcTestFn = (
  generationOutputData: getGenerationOutputForecastResponse[],
  thermalEfficiencyRecord: Record<unitIdAndFiscalYear, getThermalEfficiencyForecastResponse>,
  generationOutputSummaryData: Record<plnatIdAndFiscalYear, getGenerationOutputForecastSummaryResponse>,
): Promise<responseDataType[]> =>
  calculate(generationOutputData, thermalEfficiencyRecord, generationOutputSummaryData).then(getResDotPosition)
