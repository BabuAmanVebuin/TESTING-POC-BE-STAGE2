import {
  basicChargeForecastSummaryDataFromDB,
  getBasicChargeForecastSummaryData,
} from "../../../domain/entities/dpm/basicChargeForecastSummary.js"
import { BasicChargeRepositoryPort } from "../../port/BasicChargeRepositoryPort.js"

/**
 * Use case for retrieving basic charge forecast.
 * @param basicChargeRepository - The repository responsible for accessing basic charge forecast data.
 * @param workUnitCtx - The work unit context for the database operation.
 * @param plantCode - The code of the plant for which to retrieve basic charge forecast.
 * @param startFiscalYear - Optional. The start fiscal year for filtering.
 * @param endFiscalYear - Optional. The end fiscal year for filtering.
 * @returns A Promise that resolves to an array of BasicChargeForecastData.
 */
export const getBasicChargeForecastSummaryUsecase = async <WorkUnitCtx>(
  basicChargeRepository: BasicChargeRepositoryPort<WorkUnitCtx>,
  workUnitCtx: WorkUnitCtx,
  currentFiscalYear: number | undefined,
  plantCode: string,
  startFiscalYear: number | undefined,
  endFiscalYear: number | undefined,
): Promise<getBasicChargeForecastSummaryData[]> => {
  const data = await basicChargeRepository.getBasicChargeForecastSummary(
    workUnitCtx,
    currentFiscalYear,
    plantCode,
    startFiscalYear,
    endFiscalYear,
  )
  return data.map((row: basicChargeForecastSummaryDataFromDB) => ({
    "plant-id": row.PLANT_CODE,
    "fiscal-year": row.FISCAL_YEAR,
    value: Number(row.VALUE),
  }))
}
