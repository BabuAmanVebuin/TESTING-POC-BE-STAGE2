import { jsonResponseWithErrorHandler } from "../../../decorators.js"
import { Request } from "express"
import { OptionalNumber } from "../../tot/v1/utils.js"
import {
  getBasicChargeForecastRequest,
  getBasicChargeForecastResponse,
} from "../../../../domain/entities/dpm/basicChargeForecast.js"
import { BasicChargeRepositoryPort } from "../../../../application/port/BasicChargeRepositoryPort.js"
import { getBasicChargeForecastUsecase } from "../../../../application/use_cases/dpm/getBasicChargeForecastUseCase.js"

/**
 * Controller function for handling requests to retrieve basic charge forecast.
 * @param input - The request payload containing parameters for retrieving basic charge forecast.
 * @param basicChargeRepository - The repository responsible for interacting with basic charge forecast data.
 * @returns A Promise that resolves to the response containing basic charge forecast data or an error message.
 */
const controller = async <X>(
  input: getBasicChargeForecastRequest,
  basicChargeRepository: BasicChargeRepositoryPort<X>,
): Promise<getBasicChargeForecastResponse> => {
  // Execute the getBasicChargeForecast use case within a transactional context
  const body = await basicChargeRepository.wrapInWorkUnitCtx(async (workUnitCtx) =>
    getBasicChargeForecastUsecase(
      basicChargeRepository,
      workUnitCtx,
      input["plant-id"],
      input["unit-id"],
      input["start-fiscal-year"],
      input["end-fiscal-year"],
    ),
  )

  // Return success response with the retrieved basic charge forecast data
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
const consolidate = (request: Request): getBasicChargeForecastRequest => ({
  "plant-id": request.query["plant-id"] as string,
  "unit-id": request.query["unit-id"] as string,
  "start-fiscal-year": OptionalNumber(request.query["start-fiscal-year"]),
  "end-fiscal-year": OptionalNumber(request.query["end-fiscal-year"]),
})

/**
 * Exported function to consolidate Express request query parameters and invoke the controller.
 */
export const consolidateGetBasicChargeForecastRequest = consolidate

/**
 * Exported function to create the Express controller for handling getBasicChargeForecast requests.
 * @param basicChargeRepository - The repository responsible for interacting with basic charge forecast data.
 * @returns An Express controller function.
 */
export const getBasicChargeForecastController = <X>(basicChargeRepository: BasicChargeRepositoryPort<X>) =>
  jsonResponseWithErrorHandler((x) => controller(consolidate(x), basicChargeRepository))
