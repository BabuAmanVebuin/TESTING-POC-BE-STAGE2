// Imported from DPM-BE, commit d0e2f45544cc9890762f93cf3e8f224f15efd619
import { AvailabilityJson } from "../../../domain/models/dpm/KPI003/Index.js"
import { env } from "../../../infrastructure/env/dpm/index.js"
import { Kpi003RepositoryPort } from "../../../infrastructure/repositories/dpm/snowflake/kpi003RepositorySnowflake.js"
import { getForecastValueFiscalYearUseCase } from "./getForecastValueCurrentYearUseCase.js"
import { generateKpi003MeasureSectionUseCase } from "./generateKpi003MeasureSectionUseCase.js"
import { getKpi003ResponseTimeRangeUseCase } from "./getKpi003ResponseTimeRangeUseCase.js"

// Function to generate availability JSON
export const generateAvailabilityResponseUseCase = async (
  plantCode: string,
  unitCode: string | null,
  timestamp: number,
  kpi003Repository: Kpi003RepositoryPort,
  t: any,
): Promise<AvailabilityJson> => {
  // Get the date and time range for KPI003 measurements based on the given timestamp
  const kpi003MeasureDateTimeRange = getKpi003ResponseTimeRangeUseCase(timestamp)

  // Fetch availability estimates asynchronously using Promise.all
  const [
    plannedRows,
    actualOrForecastRows,
    annualEstimatesArray,
    monthlyEstimatesArray,
    weeklyEstimatesArray,
    dailyEstimatesArray,
    availabilityCurrentFiscalYearEstimates,
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
      "Availability",
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
      "Availability",
      "actual_or_forecast",
    ),
    // Fetch annual availability estimates
    kpi003Repository.getAvailabilityEstimates(
      plantCode,
      unitCode,
      "annual",
      kpi003MeasureDateTimeRange.annualEstimatesStart,
      env.KPI003_YEAR_HALF_RANGE * 2,
    ),
    // Fetch monthly availability estimates
    kpi003Repository.getAvailabilityEstimates(
      plantCode,
      unitCode,
      "monthly",
      kpi003MeasureDateTimeRange.monthlyEstimatesStart,
      env.KPI003_MONTH_HALF_RANGE * 2,
    ),
    // Fetch weekly availability estimates
    kpi003Repository.getAvailabilityEstimates(
      plantCode,
      unitCode,
      "weekly",
      kpi003MeasureDateTimeRange.weeklyEstimatesStart,
      env.KPI003_WEEK_HALF_RANGE * 2,
    ),
    // Fetch daily availability estimates
    kpi003Repository.getAvailabilityEstimates(
      plantCode,
      unitCode,
      "daily",
      kpi003MeasureDateTimeRange.dailyEstimatesStart,
      env.KPI003_DAY_HALF_RANGE * 2,
    ),
    // Fetch availability estimates for the current fiscal year
    kpi003Repository.getAvailabilityEstimates(
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
      "Availability",
      kpi003MeasureDateTimeRange.currentFiscalYearStart.year,
      kpi003Repository,
    ),
  ])

  // Generate the availability JSON object
  const returnJson: AvailabilityJson = {
    PlantCode: plantCode,
    UnitCode: unitCode,
    Availability: generateKpi003MeasureSectionUseCase({
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
        planned: availabilityCurrentFiscalYearEstimates[0]?.planned || 0,
      },
      otherPrefix: null,
      otherSuffix: t("VALUE.SUFFIX_PERCENTAGE"),
      otherConversion: (foo) => Math.round(foo * 1000) / 10, // convert value in percentage & round the value to one decimal place
      dailyPrefix: null,
      dailySuffix: t("VALUE.SUFFIX_PERCENTAGE"),
      dailyConversion: (foo) => Math.round(foo * 1000) / 10, // convert value in percentage & round the value to one decimal place
    }),
  }
  return returnJson
}
