import { Request } from "express"
import { jsonResponseWithErrorHandler } from "../../../decorators.js"
import { OptionalNumber } from "../../tot/v1/utils.js"
import { fixedNumber } from "./helper/businessPlan/businessPlanHelper.js"
import { wrapInSnowflakeTransaction } from "../../../../infrastructure/orm/snowflake/index.js"
import { getGenerationOutputSalesUsecase } from "../../../../application/use_cases/dpm/getGenerationOutputSalesUsecase.js"
import {
  getGrossMarginSummaryRequest,
  getGrossMarginSummaryResponse,
  grossMarginSummaryData,
  grossMarginSummaryFromSF,
} from "../../../../domain/entities/dpm/grossMarginSummary.js"
import { GenerationOutputRepositorySequelizeMysql } from "../../../../infrastructure/repositories/dpm/GenerationOutputRepositorySequelizeMySQL.js"
import {
  getGrossMarginForecastPlantSummarySfData,
  getGrossMarginForecastUnitSummarySfData,
} from "./helper/businessPlan/grossMarginDbHelper.js"
import { getGrossMarginForecastFn, getGrossMarginForecastSummaryFn } from "./helper/businessPlan/grossMarginHelper.js"
import { getGrossMarginForecastSummaryResponse } from "../../../../domain/entities/dpm/grossMarginForecastSummary.js"
import { getGrossMarginForecastResponse } from "../../../../domain/entities/dpm/grossMarginForecast.js"

type requestType = getGrossMarginSummaryRequest
type responseType = getGrossMarginSummaryResponse
type responseDataType = grossMarginSummaryData

const DOT_POSITION = 2
const ONE_HANDRED_MILLION = 100000000

const getSfForecastData = (input: requestType) =>
  wrapInSnowflakeTransaction(async (snowflakeTransaction) => {
    return input["unit-id"] === undefined
      ? await getGrossMarginForecastPlantSummarySfData(input, snowflakeTransaction)
      : await getGrossMarginForecastUnitSummarySfData(
          {
            "plant-id": input["plant-id"],
            "unit-id": input["unit-id"],
            "start-fiscal-year": input["start-fiscal-year"],
            "end-fiscal-year": input["end-fiscal-year"],
          },
          snowflakeTransaction,
        )
  })

const getForecastData = async (input: requestType) => {
  return input["unit-id"] === undefined
    ? await getGrossMarginForecastSummaryFn(input)
    : await getGrossMarginForecastFn({
        "plant-id": input["plant-id"],
        "unit-id": input["unit-id"],
        "start-fiscal-year": input["start-fiscal-year"],
        "end-fiscal-year": input["end-fiscal-year"],
      })
}

const calcTotalOfForecastMySqlData = (data: getGrossMarginForecastSummaryResponse[]) => {
  if (data.length === 0) {
    return null
  }
  const ret = data.reduce((acc, cur) => (acc += cur.value * Math.pow(10, DOT_POSITION)), 0)
  return ret / Math.pow(10, DOT_POSITION)
}

const calcSfAndMySqlData = (snowflake: number | null, database: number | null) => {
  if (snowflake === null && database === null) {
    return null
  }
  const total = (snowflake || 0) + (database || 0) * ONE_HANDRED_MILLION // snowflakeのデータは円、MySQLのデータは億円のため、円に変換して計算する
  return Math.trunc(total / fixedNumber(ONE_HANDRED_MILLION / Math.pow(10, DOT_POSITION))) / Math.pow(10, DOT_POSITION) // レスポンスの値は億円で、小数点以下第3位を切り捨てる
}

const data = async (input: requestType): Promise<responseDataType> => {
  const [planData, forecastSfData, { calculatedGrossMarginData }] = await Promise.all([
    GenerationOutputRepositorySequelizeMysql.wrapInWorkUnitCtx(async (workUnitCtx) =>
      getGenerationOutputSalesUsecase(
        input["plant-id"],
        input["unit-id"],
        input["start-fiscal-year"],
        input["end-fiscal-year"],
        undefined,
        undefined,
        GenerationOutputRepositorySequelizeMysql,
        workUnitCtx,
      ),
    ),
    getSfForecastData(input).then((x) => (x.length === 0 ? null : x[0].VALUE)),
    getForecastData(input),
  ])
  const totalForecastData = calcTotalOfForecastMySqlData(calculatedGrossMarginData)
  return {
    plan: planData.length === 0 ? null : 0, // generation outputの計画がデータなしの場合null、ある場合は0になる（そういう仕様）
    forecast: calcSfAndMySqlData(forecastSfData, totalForecastData),
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

export const consolidateGetGrossMarginSummaryRequest = consolidate
export const getGrossMarginSummary = controller
export const getGrossMarginSummaryController = jsonResponseWithErrorHandler((x) =>
  controller(consolidate(x) as requestType),
)
export const grossMarginSummaryTestFn = (
  grossMarginSfData: grossMarginSummaryFromSF[],
  grossMarginDbData: getGrossMarginForecastResponse[] | getGrossMarginForecastSummaryResponse[],
): number | null => {
  const totalForecastData = calcTotalOfForecastMySqlData(grossMarginDbData)
  return calcSfAndMySqlData(grossMarginSfData.length === 0 ? null : grossMarginSfData[0].VALUE, totalForecastData)
}
