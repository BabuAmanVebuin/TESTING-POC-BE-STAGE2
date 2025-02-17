import { Request } from "express"
import { jsonResponseWithErrorHandler } from "../../../decorators.js"
import { FuelPriceRepositoryPort } from "../../../../application/port/FuelPriceRepositoryPort.js"
import {
  upsertFuelPriceForecastAPIResponse,
  upsertFuelPriceForecastRequest,
} from "../../../../domain/entities/dpm/fuelPriceForecast.js"
import { upsertFuelPriceForecastUsecase } from "../../../../application/use_cases/dpm/upsertFuelPriceForecastUsecase.js"

/**
 * Controller function for handling requests to upsert fuel cost forecast.
 * @param input - The request payload containing fuel cost forecast to upsert.
 * @param fuelPriceRepository - The repository responsible for interacting with fuel cost forecast data.
 * @returns A Promise that resolves to the response indicating success or an error.
 */
const controller = async <X>(
  input: upsertFuelPriceForecastRequest,
  fuelPriceRepository: FuelPriceRepositoryPort<X>,
): Promise<upsertFuelPriceForecastAPIResponse> => {
  const mappedInput = input.map((elt) => {
    // Map input to match the expected format for upsertFuelPriceForecastUsecase
    return {
      plantCode: elt["plant-id"],
      fiscalYear: elt["fiscal-year"],
      value: elt["value"],
      userId: elt["user-id"],
    }
  })
  await fuelPriceRepository.wrapInWorkUnitCtx(async (workUnitCtx) =>
    upsertFuelPriceForecastUsecase(fuelPriceRepository, workUnitCtx, mappedInput),
  )
  // Return success response with the retrieved fuel cost forecast data
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
const consolidate = (request: Request): upsertFuelPriceForecastRequest => {
  if (Array.isArray(request.body)) {
    return request.body.map((x: Record<string, unknown>) => ({
      "plant-id": x["plant-id"] as string,
      "fiscal-year": Number(x["fiscal-year"]),
      value: x["value"] === null ? null : Number(x["value"]),
      "user-id": x["user-id"] as string,
    })) as upsertFuelPriceForecastRequest
  }
  return null as unknown as upsertFuelPriceForecastRequest
}

/**
 * Exported function to consolidate Express request body and invoke the controller.
 */
export const consolidateUpsertFuelPriceForecastRequest = consolidate

/**
 * Exported function to create the Express controller for handling upsertFuelPriceforecast requests.
 * @param fuelPriceRepository - The repository responsible for interacting with fuel cost forecast data.
 * @returns An Express controller function.
 */
export const upsertFuelPriceForecastController = <X>(fuelPriceRepository: FuelPriceRepositoryPort<X>) =>
  jsonResponseWithErrorHandler((x) => controller(consolidate(x), fuelPriceRepository))
