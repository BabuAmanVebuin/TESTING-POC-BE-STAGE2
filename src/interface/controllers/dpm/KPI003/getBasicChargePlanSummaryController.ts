import { jsonResponseWithErrorHandler } from "../../../decorators.js"
import { Request } from "express"
import { BasicChargeRepositoryPort } from "../../../../application/port/BasicChargeRepositoryPort.js"
import { OptionalNumber } from "../../tot/v1/utils.js"
import {
  getBasicChargePlanSummaryRequest,
  getBasicChargePlanSummaryResponse,
} from "../../../../domain/entities/dpm/basicChargePlanSummary.js"
import { getBasicChargePlanSummaryUsecase } from "../../../../application/use_cases/dpm/getBasicChargePlanSummaryUsecase.js"

/**
 * Controller function for handling the request to retrieve basic charge plan summary
 *
 * @param input - Request parameters
 * @param basicChargeRepository - Repository providing data access methods
 * @returns Promise containing the response with basic charge plan summary data
 */
const controller = async <X>(
  input: getBasicChargePlanSummaryRequest,
  basicChargeRepository: BasicChargeRepositoryPort<X>,
): Promise<getBasicChargePlanSummaryResponse> => {
  // Execute the getBasicChargePlanSummaryUsecase use case within a transactional context
  const body = await basicChargeRepository.wrapInWorkUnitCtx(async (workUnitCtx) =>
    getBasicChargePlanSummaryUsecase(
      basicChargeRepository,
      workUnitCtx,
      input["plant-id"],
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
 * Function to consolidate request parameters from an Express request
 *
 * @param request - Express request object containing request parameters
 * @returns Consolidated request object
 */
const consolidate = (request: Request): getBasicChargePlanSummaryRequest => ({
  "plant-id": request.query["plant-id"] as string,
  "start-fiscal-year": OptionalNumber(request.query["start-fiscal-year"]),
  "end-fiscal-year": OptionalNumber(request.query["end-fiscal-year"]),
})

/**
 * Exporting consolidated request function for external use
 */
export const consolidateGetBasicChargePlanSummaryRequest = consolidate

/**
 * Controller function for handling the request to retrieve basic charge plan summary
 *
 * @param basicChargeRepository - Repository providing data access methods
 * @returns An Express controller function.
 */
export const getBasicChargePlanSummaryController = <X>(basicChargeRepository: BasicChargeRepositoryPort<X>) =>
  jsonResponseWithErrorHandler((x) => controller(consolidate(x), basicChargeRepository))
