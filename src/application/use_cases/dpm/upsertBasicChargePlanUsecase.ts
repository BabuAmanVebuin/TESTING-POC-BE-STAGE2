import { BasicChargePlan } from "../../../domain/models/BasicCharge.js"
import { BasicChargeRepositoryPort } from "../../port/BasicChargeRepositoryPort.js"

/**
 * Use case for upserting (creating or updating) basic charge plans.
 * @param basicChargeRepository - The repository responsible for interacting with basic charge plan data.
 * @param workUnitCtx - The work unit context for the database operation.
 * @param basicChargePlans - An array of BasicChargePlan objects to upsert.
 * @returns A Promise that resolves when the upsert operation is completed.
 */
export const upsertBasicChargePlanUsecase = async <WorkUnitCtx>(
  basicChargeRepository: BasicChargeRepositoryPort<WorkUnitCtx>,
  workUnitCtx: WorkUnitCtx,
  basicChargePlans: BasicChargePlan[],
): Promise<void> => {
  // Get the current date and time for timestamping the operation
  const currentDateTime = new Date()

  // Upsert basic charge plans using the repository
  await basicChargeRepository.upsertBasicChargePlan(workUnitCtx, basicChargePlans, currentDateTime)
}
