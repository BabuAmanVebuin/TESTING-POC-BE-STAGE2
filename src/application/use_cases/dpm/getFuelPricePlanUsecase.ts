import { FuelPricePlanResponse, fuelPricePlanDbType } from "../../../domain/entities/dpm/fuelPricePlan.js"
import { FuelPriceRepositoryPort } from "../../port/FuelPriceRepositoryPort.js"

/**
 * Use case for retrieving fuel price plans.
 * @param fuePriceRepository - The repository responsible for accessing fuel price plan data.
 * @param workUnitCtx - The work unit context for the database operation.
 * @param plantCode - The code of the plant for which to retrieve fuel price plans.
 * @param startFiscalYear - Optional. The start fiscal year for filtering.
 * @param endFiscalYear - Optional. The end fiscal year for filtering.
 * @returns A Promise that resolves to an array of FuePricePlanData.
 */
export const getFuelPricePlanUsecase = async <WorkUnitCtx>(
  fuePriceRepository: FuelPriceRepositoryPort<WorkUnitCtx>,
  workUnitCtx: WorkUnitCtx,
  plantCode: string,
  startFiscalYear?: number,
  endFiscalYear?: number,
): Promise<FuelPricePlanResponse[]> => {
  // Retrieve fuel price plans from the repository
  const data = await fuePriceRepository.getFuelPricePlan(workUnitCtx, plantCode, startFiscalYear, endFiscalYear)

  // Map the retrieved data to the application-specific format
  return data.map((row: fuelPricePlanDbType) => ({
    "plant-id": row.PLANT_CODE,
    "fiscal-year": row.FISCAL_YEAR,
    value: Number(row.VALUE),
  }))
}
