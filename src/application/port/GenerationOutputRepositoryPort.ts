import { GenerationOutputPlanDataFromDB } from "../../domain/entities/dpm/generationOutputPlan.js"
import { GenerationOutputPlanSummaryDataFromDB } from "../../domain/entities/dpm/generationOutputPlanSummary.js"
import { GenerationOutputPlan } from "../../domain/models/GenerationOutput.js"
export type GenerationOutputRepositoryPort<WorkUnitCtx> = {
  wrapInWorkUnitCtx: <X>(fn: (workUnitCtx: WorkUnitCtx) => Promise<X>) => Promise<X>
  upsertGenerationOutputPlan: (
    workUnitCtx: WorkUnitCtx,
    generationOutputPlans: GenerationOutputPlan[],
    currentDateTime: Date,
  ) => Promise<void>
  getGenerationOutputPlan: (
    workUnitCtx: WorkUnitCtx,
    plantCode: string,
    unitCode?: string | undefined,
    startFiscalYear?: number | undefined,
    endFiscalYear?: number | undefined,
    limit?: number | undefined,
    offset?: number | undefined,
  ) => Promise<GenerationOutputPlanDataFromDB[]>
  getGenerationOutputPlanSummary: (
    workUnitCtx: WorkUnitCtx,
    plantCode: string,
    startFiscalYear?: number | undefined,
    endFiscalYear?: number | undefined,
  ) => Promise<GenerationOutputPlanSummaryDataFromDB[]>
}
