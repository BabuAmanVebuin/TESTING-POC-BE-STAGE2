import {
  BasicChargeForecastDataFromDB,
  BasicChargeForecastData,
} from "../../../domain/entities/dpm/basicChargeForecast.js"
import { BasicChargeRepositoryPort } from "../../port/BasicChargeRepositoryPort.js"

/**
 * Use case for retrieving basic charge forecast.
 * @param basicChargeRepository - The repository responsible for accessing basic charge forecast data.
 * @param workUnitCtx - The work unit context for the database operation.
 * @param plantCode - The code of the plant for which to retrieve basic charge forecast.
 * @param unitCode - Optional. The code of the unit for more specific filtering.
 * @param startFiscalYear - Optional. The start fiscal year for filtering.
 * @param endFiscalYear - Optional. The end fiscal year for filtering.
 * @returns A Promise that resolves to an array of BasicChargeForecastData.
 */
export const getBasicChargeForecastUsecase = async <WorkUnitCtx>(
  basicChargeRepository: BasicChargeRepositoryPort<WorkUnitCtx>,
  workUnitCtx: WorkUnitCtx,
  plantCode: string,
  unitCode?: string,
  startFiscalYear?: number,
  endFiscalYear?: number,
): Promise<BasicChargeForecastData[]> => {
  // Retrieve basic charge forecast from the repository
  const data = await basicChargeRepository.getBasicChargeForecast(
    workUnitCtx,
    plantCode,
    unitCode,
    startFiscalYear,
    endFiscalYear,
  )

  // Map the retrieved data to the application-specific format
  return data.map((row: BasicChargeForecastDataFromDB) => ({
    "plant-id": row.PLANT_CODE,
    "unit-id": row.UNIT_CODE,
    "fiscal-year": row.FISCAL_YEAR,
    "operation-input": row.OPERATION_INPUT !== null ? Number(row.OPERATION_INPUT) : null,
    "maintenance-input": row.MAINTENANCE_INPUT !== null ? Number(row.MAINTENANCE_INPUT) : null,
    sum: Number(row.SUM),
  }))
}
