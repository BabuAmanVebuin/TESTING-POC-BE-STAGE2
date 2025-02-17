// Imported from DPM-BE, commit d0e2f45544cc9890762f93cf3e8f224f15efd619
import { Kpi003RepositoryPort } from "../../port/repositories/dpm/Kpi003RepositoryPort.js"

/**
 * Function to get the last forecast value of fiscal year GRANULARITY='MONTH_CUMULATIVE'
 */
export const getForecastValueFiscalYearUseCase = async (
  plantCode: string,
  unitCode: string | null,
  measure: string,
  fiscalYear: number,
  kpiRepository: Kpi003RepositoryPort,
): Promise<number> => {
  if (unitCode === null) {
    const { FORECAST_CATEGORY, value } = await kpiRepository.getKpi003PlantWiseYearEndActualOrForecastValue(
      plantCode,
      measure,
      fiscalYear,
    )
    return FORECAST_CATEGORY === "Actual" ? 0 : value
  } else {
    const { FORECAST_CATEGORY, value } = await kpiRepository.getKpi003UnitWiseYearEndActualOrForecastValue(
      unitCode,
      measure,
      fiscalYear,
    )
    return FORECAST_CATEGORY === "Actual" ? 0 : value
  }
}
