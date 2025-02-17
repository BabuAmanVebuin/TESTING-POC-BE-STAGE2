import { BasicChargeRepositoryPort } from "../../port/BasicChargeRepositoryPort.js"
import { BasicChargeForecast } from "../../../domain/models/BasicCharge.js"

/**
 * Use case for upserting (creating or updating) basic charge forecast.
 * @param basicChargeRepository - The repository responsible for interacting with basic charge plan data.
 * @param workUnitCtx - The work unit context for the database operation.
 * @param basicChargeForecast - An array of BasicChargeForecast objects to upsert.
 * @returns A Promise that resolves when the upsert operation is completed.
 */
export const upsertBasicChargeForecastUsecase = async <WorkUnitCtx>(
  basicChargeRepository: BasicChargeRepositoryPort<WorkUnitCtx>,
  workUnitCtx: WorkUnitCtx,
  basicChargeForecasts: BasicChargeForecast[],
): Promise<void> => {
  // Get the current date and time for timestamping the operation
  const currentDateTime = new Date()

  // Upsert basic charge plans using the repository
  await basicChargeRepository.upsertBasicChargeForecast(workUnitCtx, basicChargeForecasts, currentDateTime)
}
