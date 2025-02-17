import { Request } from "express"
import { jsonResponseWithErrorHandler } from "../../../decorators.js"
import { OptionalNumber } from "../../tot/v1/utils.js"
import {
  getGrossMarginForecastRequest,
  getGrossMarginForecastAPIResponse,
} from "../../../../domain/entities/dpm/grossMarginForecast.js"
import { getGrossMarginForecastFn, truncGrossMargin } from "./helper/businessPlan/grossMarginHelper.js"

type requestType = getGrossMarginForecastRequest
type responseType = getGrossMarginForecastAPIResponse

const data = async (input: requestType) => {
  const { grossMarginSfData, calculatedGrossMarginData } = await getGrossMarginForecastFn(input)
  return [grossMarginSfData, truncGrossMargin(calculatedGrossMarginData)].flat()
}

const controller = async (input: requestType, dataFn = data): Promise<responseType> => ({
  code: 200,
  body: await dataFn(input),
})

const consolidate = (request: Request): requestType => ({
  "plant-id": request.query["plant-id"] as string,
  "unit-id": request.query["unit-id"] as string,
  "start-fiscal-year": OptionalNumber(request.query["start-fiscal-year"]),
  "end-fiscal-year": OptionalNumber(request.query["end-fiscal-year"]),
})

export const consolidateGetGrossMarginForecastRequest = consolidate
export const getGrossMarginForecast = controller
export const getGrossMarginForecastController = jsonResponseWithErrorHandler((x) =>
  controller(consolidate(x) as requestType),
)
