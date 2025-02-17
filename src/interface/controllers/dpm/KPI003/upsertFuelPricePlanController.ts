import { Request } from "express"
import { jsonResponseWithErrorHandler } from "../../../decorators.js"
import { FuelPriceRepositoryPort } from "../../../../application/port/FuelPriceRepositoryPort.js"
import {
  upsertFuelPricePlanAPIResponse,
  upsertFuelPricePlanRequest,
} from "../../../../domain/entities/dpm/fuelPricePlan.js"
import { upsertFuelPricePlanUsecase } from "../../../../application/use_cases/dpm/upsertFuelPricePlanUsecase.js"

/**
 * Controller function for handling requests to upsert fuel cost plan.
 * @param input - The request payload containing fuel cost plan to upsert.
 * @param fuelPriceRepository - The repository responsible for interacting with fuel cost plan data.
 * @returns A Promise that resolves to the response indicating success or an error.
 */
const controller = async <X>(
  input: upsertFuelPricePlanRequest,
  fuelPriceRepository: FuelPriceRepositoryPort<X>,
): Promise<upsertFuelPricePlanAPIResponse> => {
  const mappedInput = input.map((elt) => {
    // Map input to match the expected format for upsertFuelPricePlanUsecase
    return {
      plantCode: elt["plant-id"],
      fiscalYear: elt["fiscal-year"],
      value: elt["value"],
      userId: elt["user-id"],
    }
  })
  await fuelPriceRepository.wrapInWorkUnitCtx(async (workUnitCtx) =>
    upsertFuelPricePlanUsecase(fuelPriceRepository, workUnitCtx, mappedInput),
  )
  // Return success response with the retrieved fuel cost plan data
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
const consolidate = (request: Request): upsertFuelPricePlanRequest => {
  if (Array.isArray(request.body)) {
    return request.body.map((x: Record<string, unknown>) => ({
      "plant-id": x["plant-id"] as string,
      "fiscal-year": Number(x["fiscal-year"]),
      value: x["value"] === null ? null : Number(x["value"]),
      "user-id": x["user-id"] as string,
    })) as upsertFuelPricePlanRequest
  }
  return null as unknown as upsertFuelPricePlanRequest
}

/**
 * Exported function to consolidate Express request body and invoke the controller.
 */
export const consolidateUpsertFuelPricePlanRequest = consolidate

/**
 * Exported function to create the Express controller for handling upsertFuelPriceplan requests.
 * @param fuelPriceRepository - The repository responsible for interacting with fuel cost plan data.
 * @returns An Express controller function.
 */
export const upsertFuelPricePlanController = <X>(fuelPriceRepository: FuelPriceRepositoryPort<X>) =>
  jsonResponseWithErrorHandler((x) => controller(consolidate(x), fuelPriceRepository))
