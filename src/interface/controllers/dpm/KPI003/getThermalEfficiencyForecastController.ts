import { Request } from "express"
import {
  getThermalEfficiencyForecastAPIResponse,
  getThermalEfficiencyForecastRequest,
} from "../../../../domain/entities/dpm/thermalEfficiencyForecast.js"
import { jsonResponseWithErrorHandler } from "../../../decorators.js"
import { OptionalNumber } from "../../tot/v1/utils.js"
import {
  getThermalEfficiencyForecastFn,
  getThermalEfficiencyResDotPosition,
} from "./helper/businessPlan/thermalEfficiencyHelper.js"

type requestType = getThermalEfficiencyForecastRequest
type responseType = getThermalEfficiencyForecastAPIResponse

const data = (input: requestType) => getThermalEfficiencyForecastFn(input).then(getThermalEfficiencyResDotPosition)

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

export const consolidateGetThermalEfficiencyForecastRequest = consolidate
export const getThermalEfficiencyForecast = controller
export const getThermalEfficiencyForecastController = jsonResponseWithErrorHandler((x) =>
  controller(consolidate(x) as requestType),
)
