import { Request } from "express"
import { jsonResponseWithErrorHandler } from "../../../decorators.js"
import { OptionalNumber } from "../../tot/v1/utils.js"
import {
  getLifeCycleCostRequest,
  getLifeCycleCostResponse,
  lifeCycleCostData,
} from "../../../../domain/entities/dpm/lifeCycleCost.js"
import { cielLcc, getLcc } from "./helper/businessPlan/lifeCycleCostHelper.js"

type requestType = getLifeCycleCostRequest
type responseType = getLifeCycleCostResponse
type responseDataType = lifeCycleCostData

const data = async (input: requestType): Promise<responseDataType> => await getLcc(input).then(cielLcc)

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

export const consolidateGetLifeCycleCostRequest = consolidate
export const getLifeCycleCost = controller
export const getLifeCycleCostController = jsonResponseWithErrorHandler((x) => controller(consolidate(x) as requestType))
