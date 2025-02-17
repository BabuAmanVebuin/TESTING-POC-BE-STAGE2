// Imported from DPM-BE, commit d0e2f45544cc9890762f93cf3e8f224f15efd619
/**
 * Interface for start stop count
 */
export interface StartStopCounts {
  FORECAST_CATEGORY: string
  START_COUNT: number
}

/**
 * [Get] start stop counts API response
 */
export interface StartStopCountsAPIResponse {
  PlantCode: string
  UnitCode: string | null
  FiscalYear: number
  ActualCount: number
  ForecastCount: number
}
