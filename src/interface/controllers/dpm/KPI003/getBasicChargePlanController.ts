import { jsonResponseWithErrorHandler } from "../../../decorators.js"
import { Request } from "express"
import { OptionalNumber } from "../../tot/v1/utils.js"
import {
  getBasicChargePlanRequest,
  getBasicChargePlanResponse,
} from "../../../../domain/entities/dpm/basicChargePlan.js"
import { BasicChargeRepositoryPort } from "../../../../application/port/BasicChargeRepositoryPort.js"
import { getBasicChargePlanUsecase } from "../../../../application/use_cases/dpm/getBasicChargePlanUsecase.js"

/**
 * Controller function for handling requests to retrieve basic charge plans.
 * @param input - The request payload containing parameters for retrieving basic charge plans.
 * @param basicChargeRepository - The repository responsible for interacting with basic charge plan data.
 * @returns A Promise that resolves to the response containing basic charge plan data or an error message.
 */
const controller = async <X>(
  input: getBasicChargePlanRequest,
  basicChargeRepository: BasicChargeRepositoryPort<X>,
): Promise<getBasicChargePlanResponse> => {
  // Execute the getBasicChargePlan use case within a transactional context
  const body = await basicChargeRepository.wrapInWorkUnitCtx(async (workUnitCtx) =>
    getBasicChargePlanUsecase(
      basicChargeRepository,
      workUnitCtx,
      input["plant-id"],
      input["unit-id"],
      input["start-fiscal-year"],
      input["end-fiscal-year"],
    ),
  )

  // Return success response with the retrieved basic charge plan data
  return {
    code: 200,
    body,
  }
}

/**
 * Consolidates Express request query parameters into a structured object.
 * @param request - The Express request object containing query parameters.
 * @returns A structured object.
 */
const consolidate = (request: Request): getBasicChargePlanRequest => ({
  "plant-id": request.query["plant-id"] as string,
  "unit-id": request.query["unit-id"] as string,
  "start-fiscal-year": OptionalNumber(request.query["start-fiscal-year"]),
  "end-fiscal-year": OptionalNumber(request.query["end-fiscal-year"]),
})

/**
 * Exported function to consolidate Express request query parameters and invoke the controller.
 */
export const consolidateGetBasicChargePlanRequest = consolidate

/**
 * Exported function to create the Express controller for handling getBasicChargePlan requests.
 * @param basicChargeRepository - The repository responsible for interacting with basic charge plan data.
 * @returns An Express controller function.
 */
export const getBasicChargePlanController = <X>(basicChargeRepository: BasicChargeRepositoryPort<X>) =>
  jsonResponseWithErrorHandler((x) => controller(consolidate(x), basicChargeRepository))
