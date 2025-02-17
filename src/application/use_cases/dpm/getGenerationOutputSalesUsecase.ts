import {
  GenerationOutputPlanData,
  GenerationOutputPlanDataFromDB,
} from "../../../domain/entities/dpm/generationOutputPlan.js"
import { GenerationOutputRepositoryPort } from "../../port/GenerationOutputRepositoryPort.js"
export const getGenerationOutputSalesUsecase = async <WorkUnitCtx>(
  plantCode: string,
  unitCode: string | undefined,
  startFiscalYear: number | undefined,
  endFiscalYear: number | undefined,
  limit: number | undefined,
  offset: number | undefined,
  generationOutputRepository: GenerationOutputRepositoryPort<WorkUnitCtx>,
  workUnitCtx: WorkUnitCtx,
): Promise<GenerationOutputPlanData[]> => {
  const data = await generationOutputRepository.getGenerationOutputPlan(
    workUnitCtx,
    plantCode,
    unitCode,
    startFiscalYear,
    endFiscalYear,
    limit,
    offset,
  )
  return data.map((row: GenerationOutputPlanDataFromDB) => ({
    "plant-id": row.PLANT_CODE,
    "unit-id": row.UNIT_CODE,
    "fiscal-year": row.FISCAL_YEAR,
    value: row.VALUE !== null ? Number(row.VALUE) : null,
    "correction-value": row.CORRECTION_VALUE !== null ? Number(row.CORRECTION_VALUE) : null,
    sum: Number(row.sum),
  }))
}
