// Imported from DPM-BE, commit d0e2f45544cc9890762f93cf3e8f224f15efd619
import { SpreadJson } from "../../../domain/models/dpm/KPI003/Index.js"
import { env } from "../../../infrastructure/env/dpm/index.js"
import { Kpi003RepositoryPort } from "../../../infrastructure/repositories/dpm/snowflake/kpi003RepositorySnowflake.js"
import { getForecastValueFiscalYearUseCase } from "./getForecastValueCurrentYearUseCase.js"
import { generateKpi003MeasureSectionUseCase } from "./generateKpi003MeasureSectionUseCase.js"
import { getKpi003ResponseTimeRangeUseCase } from "./getKpi003ResponseTimeRangeUseCase.js"

// Function to generate spread JSON
export const generateSpreadResponseUseCase = async (
  plantCode: string,
  unitCode: string | null,
  timestamp: number,
  kpi003Repository: Kpi003RepositoryPort,
  t: any,
): Promise<SpreadJson> => {
  // Get the date and time range for KPI003 measurements based on the given timestamp
  const kpi003MeasureDateTimeRange = getKpi003ResponseTimeRangeUseCase(timestamp)

  // Fetch spread estimates asynchronously using Promise.all
  const [
    plannedRows,
    actualOrForecastRows,
    annualEstimatesArray,
    monthlyEstimatesArray,
    weeklyEstimatesArray,
    dailyEstimatesArray,
    spreadCurrentFiscalYearEstimates,
    forecastValueFiscalYear,
  ] = await Promise.all([
    kpi003Repository.getKpi003SubcacheRows(
      plantCode,
      unitCode,
      kpi003MeasureDateTimeRange.monthlySubcacheStart,
      kpi003MeasureDateTimeRange.monthlySubcacheEnd,
      kpi003MeasureDateTimeRange.dailySubcacheStart,
      kpi003MeasureDateTimeRange.dailySubcacheEnd,
      kpi003MeasureDateTimeRange.hourlySubcacheStart,
      kpi003MeasureDateTimeRange.hourlySubcacheEnd,
      "Spread",
      "planned",
    ),
    kpi003Repository.getKpi003SubcacheRows(
      plantCode,
      unitCode,
      kpi003MeasureDateTimeRange.monthlySubcacheStart,
      kpi003MeasureDateTimeRange.monthlySubcacheEnd,
      kpi003MeasureDateTimeRange.dailySubcacheStart,
      kpi003MeasureDateTimeRange.dailySubcacheEnd,
      kpi003MeasureDateTimeRange.hourlySubcacheStart,
      kpi003MeasureDateTimeRange.hourlySubcacheEnd,
      "Spread",
      "actual_or_forecast",
    ),
    // Fetch annual spread estimates
    kpi003Repository.getSpreadEstimates(
      plantCode,
      unitCode,
      "annual",
      kpi003MeasureDateTimeRange.annualEstimatesStart,
      env.KPI003_YEAR_HALF_RANGE * 2,
    ),
    // Fetch monthly spread estimates
    kpi003Repository.getSpreadEstimates(
      plantCode,
      unitCode,
      "monthly",
      kpi003MeasureDateTimeRange.monthlyEstimatesStart,
      env.KPI003_MONTH_HALF_RANGE * 2,
    ),
    // Fetch weekly spread estimates
    kpi003Repository.getSpreadEstimates(
      plantCode,
      unitCode,
      "weekly",
      kpi003MeasureDateTimeRange.weeklyEstimatesStart,
      env.KPI003_WEEK_HALF_RANGE * 2,
    ),
    // Fetch daily spread estimates
    kpi003Repository.getSpreadEstimates(
      plantCode,
      unitCode,
      "daily",
      kpi003MeasureDateTimeRange.dailyEstimatesStart,
      env.KPI003_DAY_HALF_RANGE * 2,
    ),
    // Fetch spread estimates for the current fiscal year
    kpi003Repository.getSpreadEstimates(
      plantCode,
      unitCode,
      "annual",
      kpi003MeasureDateTimeRange.currentFiscalYearStart,
      1,
    ),
    // Fetch forecast value for the current fiscal year
    getForecastValueFiscalYearUseCase(
      plantCode,
      unitCode,
      "Spread",
      kpi003MeasureDateTimeRange.currentFiscalYearStart.year,
      kpi003Repository,
    ),
  ])

  // Generate the spread JSON object
  const returnJson: SpreadJson = {
    PlantCode: plantCode,
    UnitCode: unitCode,
    Spread: generateKpi003MeasureSectionUseCase({
      timeRangeDates: kpi003MeasureDateTimeRange,
      subcache: {
        plannedRows,
        actualOrForecastRows,
      },
      estimates: {
        annualEstimatesArray,
        monthlyEstimatesArray,
        weeklyEstimatesArray,
        dailyEstimatesArray,
      },
      unscaledCurrentYear: {
        forecast: forecastValueFiscalYear,
        planned: spreadCurrentFiscalYearEstimates[0]?.planned || 0,
      },
      otherPrefix: null,
      otherSuffix: t("VALUE.SUFFIX_YEN_KWH"),
      otherConversion: (foo) => Math.trunc(foo * 10) / 10, // Trunc the value to one decimal place
      dailyPrefix: null,
      dailySuffix: t("VALUE.SUFFIX_YEN_KWH"),
      dailyConversion: (foo) => Math.trunc(foo * 10) / 10, // Trunc the value to one decimal place
    }),
  }
  return returnJson
}
