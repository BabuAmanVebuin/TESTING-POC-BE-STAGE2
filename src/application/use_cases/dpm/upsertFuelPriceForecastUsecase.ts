import { FuelPriceRepositoryPort } from "../../port/FuelPriceRepositoryPort.js"
import { FuelPriceForecast } from "../../../domain/models/FuelPrice.js"

/**
 * Use case for upserting (creating or updating) fuel price forecast.
 * @param fuelPriceRepository - The repository responsible for interacting with fuel price plan data.
 * @param workUnitCtx - The work unit context for the database operation.
 * @param fuelPriceForecast - An array of FuelPriceForecast objects to upsert.
 * @returns A Promise that resolves when the upsert operation is completed.
 */
export const upsertFuelPriceForecastUsecase = async <WorkUnitCtx>(
  fuelPriceRepository: FuelPriceRepositoryPort<WorkUnitCtx>,
  workUnitCtx: WorkUnitCtx,
  fuelPriceForecasts: FuelPriceForecast[],
): Promise<void> => {
  // Get the current date and time for timestamping the operation
  const currentDateTime = new Date()

  // Upsert Fuel Price Forecast using the repository
  await fuelPriceRepository.upsertFuelPriceForecast(workUnitCtx, fuelPriceForecasts, currentDateTime)
}
