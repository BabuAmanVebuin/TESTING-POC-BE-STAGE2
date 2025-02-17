// Imported from DPM-BE, commit d0e2f45544cc9890762f93cf3e8f224f15efd619
import { DateTime, Duration } from "luxon"
import { Kpi003SubcacheMinimalRow, UnscaledEstimates } from "../../../domain/models/dpm/Kpi003Cache.js"
import { DATE_CONST } from "../../../config/dpm/constant.js"
import { _annualPeriod, _annualSeries } from "../../../domain/models/dpm/KPI003/Kpi003MeasureAnnualGranularity.js"
import { _monthlyPeriod, _monthlySeries } from "../../../domain/models/dpm/KPI003/Kpi003MeasureMonthlyGranularity.js"
import { _weeklyPeriod, _weeklySeries } from "../../../domain/models/dpm/KPI003/Kpi003MeasureWeeklyGranularity.js"
import { _dailyPeriod, _dailySeries } from "../../../domain/models/dpm/KPI003/Kpi003MeasureDailyGranularity.js"
import { _FrequencyEntry } from "../../../domain/models/dpm/KPI003/Kpi003MeasureDataSeries.js"

export const generateKpi003MeasureEntryUseCase = <
  Period extends _annualPeriod | _monthlyPeriod | _weeklyPeriod | _dailyPeriod,
  Series extends _annualSeries | _monthlySeries | _weeklySeries | _dailySeries,
>(
  hashedPlannedRows: Map<string, Kpi003SubcacheMinimalRow>,
  hashedActualOrForecastRows: Map<string, Kpi003SubcacheMinimalRow>,
  start: DateTime,
  fakePeriodLength: number,
  realPeriodLength: number,
  frameDuration: (idx: number) => Duration,
  convert: (original: number) => number,
  unscaledEstimates: UnscaledEstimates,
): _FrequencyEntry<Series, Period> => {
  const period = [...Array(fakePeriodLength).keys()].map((idx) => {
    return idx < realPeriodLength ? start.plus(frameDuration(idx)).toFormat(DATE_CONST.ISO_8601_KPI003) : null
  }) as Period

  return {
    Estimates: {
      Planned: unscaledEstimates?.planned && convert(unscaledEstimates?.planned),
      Actual: unscaledEstimates?.actual && convert(unscaledEstimates?.actual),
      Forecast: unscaledEstimates?.forecast && convert(unscaledEstimates?.forecast),
    },
    Period: period,
    Planned: period.map((key: string | null) => {
      if (key === null) {
        return null
      }
      const row = hashedPlannedRows.get(key)
      if (row === undefined) {
        return null
      }
      if (row?.FORECAST_CATEGORY === "Planned") {
        return convert(row.VALUE)
      }
      return null
    }) as Series,
    Actual: period.map((key: string | null) => {
      if (key === null) {
        return null
      }
      const row = hashedActualOrForecastRows.get(key)
      if (row === undefined) {
        return null
      }
      if (row.FORECAST_CATEGORY === "Actual" && row.VALUE != null) {
        return convert(row.VALUE)
      }
      return null
    }) as Series,
    Forecast: period.map((key: string | null) => {
      if (key === null) {
        return null
      }
      const row = hashedActualOrForecastRows.get(key)
      if (row === undefined) {
        return null
      }
      if (row?.FORECAST_CATEGORY === "Forecast") {
        return convert(row.VALUE)
      }
      return null
    }) as Series,
  }
}
