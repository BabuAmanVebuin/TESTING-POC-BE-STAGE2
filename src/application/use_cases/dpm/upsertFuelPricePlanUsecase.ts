import { FuelPriceRepositoryPort } from "../../port/FuelPriceRepositoryPort.js"
import { FuelPricePlan } from "../../../domain/models/FuelPrice.js"

/**
 * Use case for upserting (creating or updating) fuel price plan.
 * @param fuelPriceRepository - The repository responsible for interacting with fuel price plan data.
 * @param workUnitCtx - The work unit context for the database operation.
 * @param fuelPricePlan - An array of FuelPricePlan objects to upsert.
 * @returns A Promise that resolves when the upsert operation is completed.
 */
export const upsertFuelPricePlanUsecase = async <WorkUnitCtx>(
  fuelPriceRepository: FuelPriceRepositoryPort<WorkUnitCtx>,
  workUnitCtx: WorkUnitCtx,
  fuelPricePlans: FuelPricePlan[],
): Promise<void> => {
  // Get the current date and time for timestamping the operation
  const currentDateTime = new Date()

  // Upsert Fuel Price Plan using the repository
  await fuelPriceRepository.upsertFuelPricePlan(workUnitCtx, fuelPricePlans, currentDateTime)
}
