import { jsonResponseWithErrorHandler } from "../../../decorators.js"
import { Request } from "express"
import { OptionalNumber } from "../../tot/v1/utils.js"
import { getFuelPricePlanAPIResponse, getFuelPricePlanRequest } from "../../../../domain/entities/dpm/fuelPricePlan.js"
import { FuelPriceRepositoryPort } from "../../../../application/port/FuelPriceRepositoryPort.js"
import { getFuelPricePlanUsecase } from "../../../../application/use_cases/dpm/getFuelPricePlanUsecase.js"

/**
 * Controller function for handling requests to retrieve fuel price plans.
 * @param input - The request payload containing parameters for retrieving fuel price plans.
 * @param fuelPriceRepository - The repository responsible for interacting with fuel price plan data.
 * @returns A Promise that resolves to the response containing fuel price plan data or an error message.
 */
const controller = async <X>(
  input: getFuelPricePlanRequest,
  fuelPriceRepository: FuelPriceRepositoryPort<X>,
): Promise<getFuelPricePlanAPIResponse> => {
  // Execute the getFuelPricePlan use case within a transactional context
  const body = await fuelPriceRepository.wrapInWorkUnitCtx(async (workUnitCtx) =>
    getFuelPricePlanUsecase(
      fuelPriceRepository,
      workUnitCtx,
      input["plant-id"],
      input["start-fiscal-year"],
      input["end-fiscal-year"],
    ),
  )

  // Return success response with the retrieved fuel price plan data
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
const consolidate = (request: Request): getFuelPricePlanRequest => ({
  "plant-id": request.query["plant-id"] as string,
  "start-fiscal-year": OptionalNumber(request.query["start-fiscal-year"]),
  "end-fiscal-year": OptionalNumber(request.query["end-fiscal-year"]),
})

/**
 * Exported function to consolidate Express request query parameters and invoke the controller.
 */
export const consolidateGetFuelPricePlanRequest = consolidate

/**
 * Exported function to create the Express controller for handling getFuelPricePlan requests.
 * @param fuelPriceRepository - The repository responsible for interacting with fuel price plan data.
 * @returns An Express controller function.
 */
export const getFuelPricePlanController = <X>(fuelPriceRepository: FuelPriceRepositoryPort<X>) =>
  jsonResponseWithErrorHandler((x) => controller(consolidate(x), fuelPriceRepository))
