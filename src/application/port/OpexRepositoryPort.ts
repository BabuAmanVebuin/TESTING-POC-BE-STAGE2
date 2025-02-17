import { opexPlanDataFromDB } from "../../domain/entities/dpm/opexPlan.js"
import { opexPlanSummaryDataFromDB } from "../../domain/entities/dpm/opexPlanSummary.js"
import { OpexPlan } from "../../domain/models/Opex.js"

export type OpexRepositoryPort<WorkUnitCtx> = {
  wrapInWorkUnitCtx: <X>(fn: (workUnitCtx: WorkUnitCtx) => Promise<X>) => Promise<X>
  getOpexPlan: (
    workUnitCtx: WorkUnitCtx,
    plantCode: string,
    unitCode?: string | undefined,
    startFiscalYear?: number | undefined,
    endFiscalYear?: number | undefined,
  ) => Promise<opexPlanDataFromDB[]>
  getOpexPlanSummary: (
    workUnitCtx: WorkUnitCtx,
    plantCode: string,
    startFiscalYear?: number | undefined,
    endFiscalYear?: number | undefined,
  ) => Promise<opexPlanSummaryDataFromDB[]>
  upsertOpexPlan: (workUnitCtx: WorkUnitCtx, opexPlans: OpexPlan[], currentDateTime: Date) => Promise<void>
}
