import { BasicChargePlanData, BasicChargePlanDataFromDB } from "../../../domain/entities/dpm/basicChargePlan.js"
import { BasicChargeRepositoryPort } from "../../port/BasicChargeRepositoryPort.js"

/**
 * Use case for retrieving basic charge plans.
 * @param basicChargeRepository - The repository responsible for accessing basic charge plan data.
 * @param workUnitCtx - The work unit context for the database operation.
 * @param plantCode - The code of the plant for which to retrieve basic charge plans.
 * @param unitCode - Optional. The code of the unit for more specific filtering.
 * @param startFiscalYear - Optional. The start fiscal year for filtering.
 * @param endFiscalYear - Optional. The end fiscal year for filtering.
 * @returns A Promise that resolves to an array of BasicChargePlanData.
 */
export const getBasicChargePlanUsecase = async <WorkUnitCtx>(
  basicChargeRepository: BasicChargeRepositoryPort<WorkUnitCtx>,
  workUnitCtx: WorkUnitCtx,
  plantCode: string,
  unitCode?: string,
  startFiscalYear?: number,
  endFiscalYear?: number,
): Promise<BasicChargePlanData[]> => {
  // Retrieve basic charge plans from the repository
  const data = await basicChargeRepository.getBasicChargePlan(
    workUnitCtx,
    plantCode,
    unitCode,
    startFiscalYear,
    endFiscalYear,
  )

  // Map the retrieved data to the application-specific format
  return data.map((row: BasicChargePlanDataFromDB) => ({
    "plant-id": row.PLANT_CODE,
    "unit-id": row.UNIT_CODE,
    "fiscal-year": row.FISCAL_YEAR,
    "operation-input": row.OPERATION_INPUT !== null ? Number(row.OPERATION_INPUT) : null,
    "maintenance-input": row.MAINTENANCE_INPUT !== null ? Number(row.MAINTENANCE_INPUT) : null,
    sum: Number(row.SUM),
  }))
}
