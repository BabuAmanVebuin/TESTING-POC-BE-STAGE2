import { jsonResponseWithErrorHandler } from "../../../decorators.js"
import { Request } from "express"
import { upsertGenerationOutputPlanResponse } from "../../../../domain/entities/dpm/generationOutputPlan.js"
import { BasicChargeRepositoryPort } from "../../../../application/port/BasicChargeRepositoryPort.js"
import { upsertBasicChargePlanRequest } from "../../../../domain/entities/dpm/basicChargePlan.js"
import { upsertBasicChargePlanUsecase } from "../../../../application/use_cases/dpm/upsertBasicChargePlanUsecase.js"

/**
 * Controller function for handling requests to upsert basic charge plans.
 * @param input - The request payload containing basic charge plans to upsert.
 * @param basicChargeRepository - The repository responsible for interacting with basic charge plan data.
 * @returns A Promise that resolves to the response indicating success or an error.
 */
const controller = async <X>(
  input: upsertBasicChargePlanRequest,
  basicChargeRepository: BasicChargeRepositoryPort<X>,
): Promise<upsertGenerationOutputPlanResponse> => {
  if (input.length) {
    // Map input to match the expected format for upsertBasicChargePlanUsecase
    const mappedInput = input.map((elt) => ({
      plantCode: elt["plant-id"],
      unitCode: elt["unit-id"],
      fiscalYear: elt["fiscal-year"],
      operationInput: elt["operation-input"],
      maintenanceInput: elt["maintenance-input"],
      userId: elt["user-id"],
    }))

    // Execute the upsertBasicChargePlan use case within a transactional context
    await basicChargeRepository.wrapInWorkUnitCtx(async (workUnitCtx) =>
      upsertBasicChargePlanUsecase(basicChargeRepository, workUnitCtx, mappedInput),
    )
  }

  // Return success response
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
const consolidate = (request: Request): upsertBasicChargePlanRequest => {
  if (Array.isArray(request.body)) {
    return request.body.map((x: Record<string, unknown>) => ({
      "plant-id": x["plant-id"] as string,
      "unit-id": x["unit-id"] as string,
      "fiscal-year": Number(x["fiscal-year"]),
      "operation-input": x["operation-input"] === null ? null : Number(x["operation-input"]),
      "maintenance-input": x["maintenance-input"] === null ? null : Number(x["maintenance-input"]),
      "user-id": x["user-id"] as string,
    })) as upsertBasicChargePlanRequest
  }
  return null as unknown as upsertBasicChargePlanRequest
}

/**
 * Exported function to consolidate Express request body and invoke the controller.
 */
export const consolidateUpsertBasicChargePlanRequest = consolidate

/**
 * Exported function to create the Express controller for handling upsertBasicChargePlan requests.
 * @param basicChargeRepository - The repository responsible for interacting with basic charge plan data.
 * @param unitMasterRepository - The repository responsible for interacting with unit master data.
 * @returns An Express controller function.
 */
export const upsertBasicChargePlanController = <X>(basicChargeRepository: BasicChargeRepositoryPort<X>) =>
  jsonResponseWithErrorHandler((x) => controller(consolidate(x), basicChargeRepository))
