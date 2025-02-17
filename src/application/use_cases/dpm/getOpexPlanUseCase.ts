import { opexPlanData, opexPlanDataFromDB } from "../../../domain/entities/dpm/opexPlan.js"
import { OpexRepositoryPort } from "../../port/OpexRepositoryPort.js"
export const getOpexPlanUseCase = async <WorkUnitCtx>(
  plantCode: string,
  unitCode: string | undefined,
  startFiscalYear: number | undefined,
  endFiscalYear: number | undefined,
  opexRepository: OpexRepositoryPort<WorkUnitCtx>,
  workUnitCtx: WorkUnitCtx,
): Promise<opexPlanData[]> => {
  const data = await opexRepository.getOpexPlan(workUnitCtx, plantCode, unitCode, startFiscalYear, endFiscalYear)
  return data.map((row: opexPlanDataFromDB) => ({
    "plant-id": row.PLANT_CODE,
    "unit-id": row.UNIT_CODE,
    "fiscal-year": row.FISCAL_YEAR,
    "operation-cost": row.OPERATION_COST === null ? null : Number(row.OPERATION_COST),
    "maintenance-cost": row.MAINTENANCE_COST === null ? null : Number(row.MAINTENANCE_COST),
    sum: Number(row.SUM),
  }))
}
