import { BasicChargePlanSummaryData } from "../../../domain/entities/dpm/basicChargePlanSummary.js"
import { BasicChargeRepositoryPort } from "../../port/BasicChargeRepositoryPort.js"

/**
 * Usecase function to retrieve basic charge plan summary data
 *
 * @param basicChargeRepository - Repository providing data access methods
 * @param workUnitCtx - Context related to the work unit
 * @param plantCode - Plant code for which the summary is requested
 * @param startFiscalYear - Optional start fiscal year for filtering data
 * @param endFiscalYear - Optional end fiscal year for filtering data
 * @returns Promise containing an array of BasicChargePlanSummaryData
 */
export const getBasicChargePlanSummaryUsecase = async <WorkUnitCtx>(
  basicChargeRepository: BasicChargeRepositoryPort<WorkUnitCtx>,
  workUnitCtx: WorkUnitCtx,
  plantCode: string,
  startFiscalYear?: number,
  endFiscalYear?: number,
): Promise<BasicChargePlanSummaryData[]> => {
  // Retrieve basic charge plan summary data from the repository
  const data = await basicChargeRepository.getBasicChargePlanSummary(
    workUnitCtx,
    plantCode,
    startFiscalYear,
    endFiscalYear,
  )

  // Map the retrieved database format to the external format
  return data.map((row) => ({
    "plant-id": row.PLANT_CODE,
    "fiscal-year": row.FISCAL_YEAR,
    value: Number(row.VALUE),
  }))
}
