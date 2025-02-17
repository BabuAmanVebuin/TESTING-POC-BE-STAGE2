import { fuelPricePlanDbType } from "../../domain/entities/dpm/fuelPricePlan.js"
import { FuelPriceForecast, FuelPricePlan } from "../../domain/models/FuelPrice.js"
/**
 * Represents the work unit context type for the FuelPriceRepositoryPort.
 * This type is used to manage transactions or other contextual operations.
 */
export type FuelPriceRepositoryPort<WorkUnitCtx> = {
  wrapInWorkUnitCtx: <X>(fn: (workUnitCtx: WorkUnitCtx) => Promise<X>) => Promise<X>
  upsertFuelPriceForecast: (
    workUnitCtx: WorkUnitCtx,
    FuelPriceForecast: FuelPriceForecast[],
    currentDateTime: Date,
  ) => Promise<void>
  getFuelPricePlan: (
    workUnitCtx: WorkUnitCtx,
    plantCode: string,
    startFiscalYear?: number,
    endFiscalYear?: number,
  ) => Promise<fuelPricePlanDbType[]>
  upsertFuelPricePlan: (
    workUnitCtx: WorkUnitCtx,
    FuelPricePlan: FuelPricePlan[],
    currentDateTime: Date,
  ) => Promise<void>
}
