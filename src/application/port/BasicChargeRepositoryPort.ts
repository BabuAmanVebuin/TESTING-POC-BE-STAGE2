import { BasicChargePlanDataFromDB } from "../../domain/entities/dpm/basicChargePlan.js"
import { BasicChargeForecastDataFromDB } from "../../domain/entities/dpm/basicChargeForecast.js"
import { BasicChargePlanSummaryDataFromDB } from "../../domain/entities/dpm/basicChargePlanSummary.js"
import { BasicChargePlan } from "../../domain/models/BasicCharge.js"

import { BasicChargeForecast } from "../../domain/models/BasicCharge.js"
import { basicChargeForecastSummaryDataFromDB } from "../../domain/entities/dpm/basicChargeForecastSummary.js"
/**
 * Represents the work unit context type for the BasicChargeRepositoryPort.
 * This type is used to manage transactions or other contextual operations.
 */
export type BasicChargeRepositoryPort<WorkUnitCtx> = {
  wrapInWorkUnitCtx: <X>(fn: (workUnitCtx: WorkUnitCtx) => Promise<X>) => Promise<X>
  getBasicChargePlan: (
    workUnitCtx: WorkUnitCtx,
    plantCode: string,
    unitCode?: string,
    startFiscalYear?: number,
    endFiscalYear?: number,
  ) => Promise<BasicChargePlanDataFromDB[]>
  getBasicChargeForecast: (
    workUnitCtx: WorkUnitCtx,
    plantCode: string,
    unitCode?: string,
    startFiscalYear?: number,
    endFiscalYear?: number,
  ) => Promise<BasicChargeForecastDataFromDB[]>
  getBasicChargePlanSummary: (
    workUnitCtx: WorkUnitCtx,
    plantCode: string,
    startFiscalYear?: number,
    endFiscalYear?: number,
  ) => Promise<BasicChargePlanSummaryDataFromDB[]>
  upsertBasicChargePlan: (
    workUnitCtx: WorkUnitCtx,
    generationOutputPlans: BasicChargePlan[],
    currentDateTime: Date,
  ) => Promise<void>
  upsertBasicChargeForecast: (
    workUnitCtx: WorkUnitCtx,
    BasicChargeForecast: BasicChargeForecast[],
    currentDateTime: Date,
  ) => Promise<void>
  getBasicChargeForecastSummary: (
    workUnitCtx: WorkUnitCtx,
    currentFiscalYear: number | undefined,
    plantCode: string,
    startFiscalYear?: number,
    endFiscalYear?: number,
  ) => Promise<basicChargeForecastSummaryDataFromDB[]>
}
