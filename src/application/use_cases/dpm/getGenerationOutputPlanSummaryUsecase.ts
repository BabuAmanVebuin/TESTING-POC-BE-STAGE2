import {
  GenerationOutputPlanSummaryData,
  GenerationOutputPlanSummaryDataFromDB,
} from "../../../domain/entities/dpm/generationOutputPlanSummary.js"
import { GenerationOutputRepositoryPort } from "../../port/GenerationOutputRepositoryPort.js"
export const getGenerationOutputPlanSummaryUsecase = async <WorkUnitCtx>(
  plantCode: string,
  startFiscalYear: number | undefined,
  endFiscalYear: number | undefined,
  generationOutputRepository: GenerationOutputRepositoryPort<WorkUnitCtx>,
  workUnitCtx: WorkUnitCtx,
): Promise<GenerationOutputPlanSummaryData[]> => {
  const data = await generationOutputRepository.getGenerationOutputPlanSummary(
    workUnitCtx,
    plantCode,
    startFiscalYear,
    endFiscalYear,
  )
  return data.map((row: GenerationOutputPlanSummaryDataFromDB) => ({
    "plant-id": row.PLANT_CODE,
    "fiscal-year": row.FISCAL_YEAR,
    value: Number(row.VALUE),
  }))
}
