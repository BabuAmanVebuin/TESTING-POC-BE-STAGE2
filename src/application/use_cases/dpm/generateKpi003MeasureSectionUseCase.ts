// Imported from DPM-BE, commit d0e2f45544cc9890762f93cf3e8f224f15efd619
import { DateTime, Duration } from "luxon"
import {
  Kpi003SubcacheFetchResult,
  Kpi003SubcacheMinimalRow,
  UnscaledEstimates,
} from "../../../domain/models/dpm/Kpi003Cache.js"
import { env } from "../../../infrastructure/env/dpm/index.js"
import { DATE_CONST } from "../../../config/dpm/constant.js"
import { formatDateWithTimeZone } from "../../utils.js"
import { _measure } from "../../../domain/models/dpm/KPI003/Index.js"
import { _annual } from "../../../domain/models/dpm/KPI003/Kpi003MeasureAnnualGranularity.js"
import { _monthly } from "../../../domain/models/dpm/KPI003/Kpi003MeasureMonthlyGranularity.js"
import { _weekly } from "../../../domain/models/dpm/KPI003/Kpi003MeasureWeeklyGranularity.js"
import { _daily } from "../../../domain/models/dpm/KPI003/Kpi003MeasureDailyGranularity.js"
import { generateKpi003MeasureSubSectionUseCase } from "./generateKpi003MeasureSubSectionUseCase.js"

/**
 * Hashes an array of Kpi003SubcacheMinimalRow objects into a Map with the date string as the key.
 * @param rows - Array of Kpi003SubcacheMinimalRow objects to be hashed.
 * @returns Map with the date string as the key and Kpi003SubcacheMinimalRow as the value.
 */
export const hashRows = (rows: Kpi003SubcacheMinimalRow[]): Map<string, Kpi003SubcacheMinimalRow> => {
  const map = new Map<string, Kpi003SubcacheMinimalRow>()
  for (const row of rows) {
    const dtString = formatDateWithTimeZone(row.START, DATE_CONST.ISO_8601_KPI003)
    map.set(dtString, row)
  }
  return map
}
/**
 * Generate the KPI003 measure section based on the provided parameters.
 * @returns Promise that resolves to the generated KPI003 measure section.
 */
export const generateKpi003MeasureSectionUseCase = <
  OtherPrefix extends string | null,
  OtherSuffix extends string | null,
  DailyPrefix extends string | null,
  DailySuffix extends string | null,
>({
  timeRangeDates,
  subcache,
  estimates,
  unscaledCurrentYear,
  otherPrefix,
  otherSuffix,
  otherConversion,
  dailyPrefix,
  dailySuffix,
  dailyConversion,
}: {
  timeRangeDates: {
    annualEstimatesStart: DateTime
    monthlyEstimatesStart: DateTime
    weeklyEstimatesStart: DateTime
    dailyEstimatesStart: DateTime
  }
  subcache: {
    plannedRows: Kpi003SubcacheFetchResult
    actualOrForecastRows: Kpi003SubcacheFetchResult
  }
  estimates: {
    annualEstimatesArray: UnscaledEstimates[]
    monthlyEstimatesArray: UnscaledEstimates[]
    weeklyEstimatesArray: UnscaledEstimates[]
    dailyEstimatesArray: UnscaledEstimates[]
  }
  unscaledCurrentYear: {
    planned: number
    forecast: number
  }
  otherPrefix: OtherPrefix
  otherSuffix: OtherSuffix
  otherConversion: (original: number) => number
  dailyPrefix: DailyPrefix
  dailySuffix: DailySuffix
  dailyConversion: (original: number) => number
}): _measure<OtherPrefix, OtherSuffix, DailyPrefix, DailySuffix> => {
  // Hash the planned and actual/forecast rows for efficient lookup
  const hashedHourlyPlannedRows = hashRows(subcache.plannedRows.hourly)
  const hashedDailyPlannedRows = hashRows(subcache.plannedRows.daily)
  const hashedMonthlyPlannedRows = hashRows(subcache.plannedRows.monthly)
  const hashedCumulativePlannedRows = hashRows(subcache.plannedRows.cumulativeMonthly)
  const hashedHourlyActualOrForecastRows = hashRows(subcache.actualOrForecastRows.hourly)
  const hashedDailyActualOrForecastRows = hashRows(subcache.actualOrForecastRows.daily)
  const hashedMonthlyActualOrForecastRows = hashRows(subcache.actualOrForecastRows.monthly)
  const hashedCumulativeActualOrForecastRows = hashRows(subcache.actualOrForecastRows.cumulativeMonthly)

  return {
    Annual: generateKpi003MeasureSubSectionUseCase({
      prefix: otherPrefix,
      suffix: otherSuffix,
      hashedPlannedRows: hashedMonthlyPlannedRows,
      hashedActualOrForecastRows: hashedMonthlyActualOrForecastRows,
      start: timeRangeDates.annualEstimatesStart,
      outerLength: env.KPI003_YEAR_HALF_RANGE * 2,
      getOuterDuration: (idx) => Duration.fromObject({ years: idx }),
      fakeInnerLength: 12,
      getRealInnerLength: () => 12,
      getInnerDuration: (idx) => Duration.fromObject({ months: idx }),
      convertor: otherConversion,
      estimatesArray: estimates.annualEstimatesArray,
    }) as _annual<OtherPrefix, OtherSuffix>,
    Monthly: generateKpi003MeasureSubSectionUseCase({
      prefix: otherPrefix,
      suffix: otherSuffix,
      hashedPlannedRows: hashedDailyPlannedRows,
      hashedActualOrForecastRows: hashedDailyActualOrForecastRows,
      start: timeRangeDates.monthlyEstimatesStart,
      outerLength: env.KPI003_MONTH_HALF_RANGE * 2,
      getOuterDuration: (idx) => Duration.fromObject({ months: idx }),
      fakeInnerLength: 31, // max 31 days per month, but we won't use all of them for every month.
      getRealInnerLength: (dt) => dt.daysInMonth as number,
      getInnerDuration: (idx) => Duration.fromObject({ days: idx }),
      convertor: otherConversion,
      estimatesArray: estimates.monthlyEstimatesArray,
    }) as _monthly<OtherPrefix, OtherSuffix>,
    Weekly: generateKpi003MeasureSubSectionUseCase({
      prefix: otherPrefix,
      suffix: otherSuffix,
      hashedPlannedRows: hashedDailyPlannedRows,
      hashedActualOrForecastRows: hashedDailyActualOrForecastRows,
      start: timeRangeDates.weeklyEstimatesStart,
      outerLength: env.KPI003_WEEK_HALF_RANGE * 2,
      getOuterDuration: (idx) => Duration.fromObject({ weeks: idx }),
      fakeInnerLength: 7,
      getRealInnerLength: () => 7,
      getInnerDuration: (idx) => Duration.fromObject({ days: idx }),
      convertor: otherConversion,
      estimatesArray: estimates.weeklyEstimatesArray,
    }) as _weekly<OtherPrefix, OtherSuffix>,
    Daily: generateKpi003MeasureSubSectionUseCase({
      prefix: dailyPrefix,
      suffix: dailySuffix,
      hashedPlannedRows: hashedHourlyPlannedRows,
      hashedActualOrForecastRows: hashedHourlyActualOrForecastRows,
      start: timeRangeDates.dailyEstimatesStart,
      outerLength: env.KPI003_DAY_HALF_RANGE * 2,
      getOuterDuration: (idx) => Duration.fromObject({ days: idx }),
      fakeInnerLength: 24, // This could bite us in the ass in the future. A day could have up to 25 hours due to daylight saving time
      getRealInnerLength: () => 24, // Same idea, we may need to handle daylight saving time at some point,
      getInnerDuration: (idx) => Duration.fromObject({ hours: idx }),
      convertor: dailyConversion,
      estimatesArray: estimates.dailyEstimatesArray,
    }) as _daily<DailyPrefix, DailySuffix>,
    Cumulative: generateKpi003MeasureSubSectionUseCase({
      prefix: otherPrefix,
      suffix: otherSuffix,
      hashedPlannedRows: hashedCumulativePlannedRows,
      hashedActualOrForecastRows: hashedCumulativeActualOrForecastRows,
      start: timeRangeDates.annualEstimatesStart,
      outerLength: env.KPI003_YEAR_HALF_RANGE * 2,
      getOuterDuration: (idx) => Duration.fromObject({ years: idx }),
      fakeInnerLength: 12,
      getRealInnerLength: () => 12,
      getInnerDuration: (idx) => Duration.fromObject({ months: idx }),
      convertor: otherConversion,
      estimatesArray: estimates.annualEstimatesArray,
    }) as _annual<OtherPrefix, OtherSuffix>,
    ForecastCurrentYear: unscaledCurrentYear.forecast && otherConversion(unscaledCurrentYear.forecast),
    PlannedCurrentYear: unscaledCurrentYear.planned && otherConversion(unscaledCurrentYear.planned),
  }
}
