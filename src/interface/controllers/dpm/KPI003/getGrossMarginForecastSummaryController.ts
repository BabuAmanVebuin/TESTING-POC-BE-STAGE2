import { Request } from "express"
import { jsonResponseWithErrorHandler } from "../../../decorators.js"
import { OptionalNumber } from "../../tot/v1/utils.js"
import { getGrossMarginForecastSummaryFn, truncGrossMarginSummary } from "./helper/businessPlan/grossMarginHelper.js"
import {
  getGrossMarginForecastSummaryRequest,
  getGrossMarginForecastSummaryAPIResponse,
} from "../../../../domain/entities/dpm/grossMarginForecastSummary.js"

type requestType = getGrossMarginForecastSummaryRequest
type responseType = getGrossMarginForecastSummaryAPIResponse

const data = async (input: requestType) => {
  const { grossMarginSfData, calculatedGrossMarginData } = await getGrossMarginForecastSummaryFn(input)
  const truncedData = truncGrossMarginSummary(calculatedGrossMarginData)
  return [grossMarginSfData, truncedData].flat()
}
const controller = async (input: requestType, dataFn = data): Promise<responseType> => ({
  code: 200,
  body: await dataFn(input),
})

const consolidate = (request: Request): requestType => ({
  "plant-id": request.query["plant-id"] as string,
  "start-fiscal-year": OptionalNumber(request.query["start-fiscal-year"]),
  "end-fiscal-year": OptionalNumber(request.query["end-fiscal-year"]),
})

export const consolidateGetGrossMarginForecastSummaryRequest = consolidate
export const getGrossMarginForecastSummary = controller
export const getGrossMarginForecastSummaryController = jsonResponseWithErrorHandler((x) =>
  controller(consolidate(x) as requestType),
)
