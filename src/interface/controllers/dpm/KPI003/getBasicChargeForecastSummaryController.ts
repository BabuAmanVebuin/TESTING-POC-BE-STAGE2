import { Request } from "express"
import { jsonResponseWithErrorHandler } from "../../../decorators.js"
import { OptionalNumber } from "../../tot/v1/utils.js"
import { BasicChargeRepositoryPort } from "../../../../application/port/BasicChargeRepositoryPort.js"
import {
  getBasicChargeForecastSummaryResponse,
  getBasicChargeForecastSummaryRequest,
} from "../../../../domain/entities/dpm/basicChargeForecastSummary.js"
import { getBasicChargeForecastSummaryUsecase } from "../../../../application/use_cases/dpm/getBasicChargeForecastSummaryUseCase.js"

/**
 * Controller function for handling requests to retrieve basic charge forecast summary.
 * @param input - The request payload containing parameters for retrieving basic charge forecast summary.
 * @param basicChargeRepository - The repository responsible for interacting with basic charge forecast summary data.
 * @returns A Promise that resolves to the response containing basic charge forecast summary data or an error message.
 */
const controller = async <X>(
  input: getBasicChargeForecastSummaryRequest,
  basicChargeRepository: BasicChargeRepositoryPort<X>,
): Promise<getBasicChargeForecastSummaryResponse> => {
  // Execute the getBasicChargeForecastSummary use case within a transactional context
  const body = await basicChargeRepository.wrapInWorkUnitCtx(async (workUnitCtx) =>
    getBasicChargeForecastSummaryUsecase(
      basicChargeRepository,
      workUnitCtx,
      undefined,
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
 * Consolidates Express request query parameters into a structured object.
 * @param request - The Express request object containing query parameters.
 * @returns A structured object.
 */
const consolidate = (request: Request): getBasicChargeForecastSummaryRequest => ({
  "plant-id": request.query["plant-id"] as string,
  "start-fiscal-year": OptionalNumber(request.query["start-fiscal-year"]),
  "end-fiscal-year": OptionalNumber(request.query["end-fiscal-year"]),
})

/**
 * Exported function to consolidate Express request query parameters and invoke the controller.
 */
export const consolidateGetBasicChargeForecastSummaryRequest = consolidate

/**
 * Exported function to create the Express controller for handling getBasicChargeForecastSummary requests.
 * @param basicChargeRepository - The repository responsible for interacting with basic charge forecast summary data.
 * @returns An Express controller function.
 */
export const getBasicChargeForecastSummaryController = <X>(basicChargeRepository: BasicChargeRepositoryPort<X>) =>
  jsonResponseWithErrorHandler((x) => controller(consolidate(x), basicChargeRepository))
