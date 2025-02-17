import { opexPlanSummaryData, opexPlanSummaryDataFromDB } from "../../../domain/entities/dpm/opexPlanSummary.js"
import { OpexRepositoryPort } from "../../port/OpexRepositoryPort.js"
export const getOpexPlanSummaryUseCase = async <WorkUnitCtx>(
  plantCode: string,
  startFiscalYear: number | undefined,
  endFiscalYear: number | undefined,
  opexRepository: OpexRepositoryPort<WorkUnitCtx>,
  workUnitCtx: WorkUnitCtx,
): Promise<opexPlanSummaryData[]> => {
  const data = await opexRepository.getOpexPlanSummary(workUnitCtx, plantCode, startFiscalYear, endFiscalYear)
  return data.map((row: opexPlanSummaryDataFromDB) => ({
    "plant-id": row.PLANT_CODE,
    "fiscal-year": row.FISCAL_YEAR,
    "operation-cost": row.OPERATION_COST === null ? null : Number(row.OPERATION_COST),
    "maintenance-cost": row.MAINTENANCE_COST === null ? null : Number(row.MAINTENANCE_COST),
    sum: Number(row.SUM),
  }))
}
