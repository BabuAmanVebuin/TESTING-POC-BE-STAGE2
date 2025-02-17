import { Request } from "express"
import { jsonResponseWithErrorHandler } from "../../../decorators.js"
import { BasicChargeRepositoryPort } from "../../../../application/port/BasicChargeRepositoryPort.js"
import {
  upsertBasicChargeForecastAPIResponse,
  upsertBasicChargeForecastRequest,
} from "../../../../domain/entities/dpm/basicChargeForecast.js"
import { upsertBasicChargeForecastUsecase } from "../../../../application/use_cases/dpm/upsertBasicChargeForecastUsecase.js"

/**
 * Controller function for handling requests to upsert basic charge forecast.
 * @param input - The request payload containing basic charge forecast to upsert.
 * @param basicChargeRepository - The repository responsible for interacting with basic charge forecast data.
 * @returns A Promise that resolves to the response indicating success or an error.
 */
const controller = async <X>(
  input: upsertBasicChargeForecastRequest,
  basicChargeRepository: BasicChargeRepositoryPort<X>,
): Promise<upsertBasicChargeForecastAPIResponse> => {
  const mappedInput = input.map((elt) => {
    // Map input to match the expected format for upsertBasicChargePlanUsecase
    return {
      plantCode: elt["plant-id"],
      unitCode: elt["unit-id"],
      fiscalYear: elt["fiscal-year"],
      operationInput: elt["operation-input"],
      maintenanceInput: elt["maintenance-input"],
      userId: elt["user-id"],
    }
  })
  await basicChargeRepository.wrapInWorkUnitCtx(async (workUnitCtx) =>
    upsertBasicChargeForecastUsecase(basicChargeRepository, workUnitCtx, mappedInput),
  )
  // Return success response with the retrieved basic charge plan data
  return {
    code: 200,
    body: "OK",
  }
}

/**
 * Consolidates Express request body into a structured object.
 * @param request - The Express request object containing the request body.
 * @returns A structured object.
 */
const consolidate = (request: Request): upsertBasicChargeForecastRequest => {
  if (Array.isArray(request.body)) {
    return request.body.map((x: Record<string, unknown>) => ({
      "plant-id": x["plant-id"] as string,
      "unit-id": x["unit-id"] as string,
      "fiscal-year": Number(x["fiscal-year"]),
      "operation-input": x["operation-input"] === null ? null : Number(x["operation-input"]),
      "maintenance-input": x["maintenance-input"] === null ? null : Number(x["maintenance-input"]),
      "user-id": x["user-id"] as string,
    })) as upsertBasicChargeForecastRequest
  }
  return null as unknown as upsertBasicChargeForecastRequest
}

/**
 * Exported function to consolidate Express request body and invoke the controller.
 */
export const consolidateUpsertBasicChargeForecastRequest = consolidate

/**
 * Exported function to create the Express controller for handling upsertBasicChargeforecast requests.
 * @param basicChargeRepository - The repository responsible for interacting with basic charge forecast data.
 * @param unitMasterRepository - The repository responsible for interacting with unit master data.
 * @returns An Express controller function.
 */
export const upsertBasicChargeForecastController = <X>(basicChargeRepository: BasicChargeRepositoryPort<X>) =>
  jsonResponseWithErrorHandler((x) => controller(consolidate(x), basicChargeRepository))
