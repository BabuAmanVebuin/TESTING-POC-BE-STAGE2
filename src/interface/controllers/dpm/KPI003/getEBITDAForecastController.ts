import { Request } from "express"
import { jsonResponseWithErrorHandler } from "../../../decorators.js"
import { OptionalNumber } from "../../tot/v1/utils.js"
import {
  getEbitdaForecastAPIResponse,
  getEbitdaForecastRequest,
  getEbitdaForecastResponse,
} from "../../../../domain/entities/dpm/ebitdaForecast.js"
import { getEbitdaForecastFn, truncEbitda } from "./helper/businessPlan/ebitdaHelper.js"

type requestType = getEbitdaForecastRequest
type responseDataType = getEbitdaForecastResponse
type responseType = getEbitdaForecastAPIResponse

const data = async (input: requestType): Promise<responseDataType[]> => {
  return getEbitdaForecastFn(input).then(truncEbitda)
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

export const consolidateGetEbitdaForecastRequest = consolidate
export const getEbitdaForecast = controller
export const getEbitdaForecastController = jsonResponseWithErrorHandler((x) =>
  controller(consolidate(x) as requestType),
)
