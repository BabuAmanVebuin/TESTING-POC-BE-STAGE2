// Imported from DPM-BE, commit d0e2f45544cc9890762f93cf3e8f224f15efd619
import { getForecastValueFiscalYearUseCase } from "./getForecastValueCurrentYearUseCase.js"
import { generateKpi003MeasureSectionUseCase } from "./generateKpi003MeasureSectionUseCase.js"
import { getKpi003ResponseTimeRangeUseCase } from "./getKpi003ResponseTimeRangeUseCase.js"
import { Kpi003RepositoryPort } from "../../../infrastructure/repositories/dpm/snowflake/kpi003RepositorySnowflake.js"
import { GenerationOutputMarketJson } from "../../../domain/models/dpm/KPI003/Index.js"
import { env } from "../../../infrastructure/env/dpm/index.js"

// Function to generate GenerationOutputMarket JSON
export const generateGenerationOutputMarketResponseUseCase = async (
  plantCode: string,
  unitCode: string | null,
  timestamp: number,
  kpi003Repository: Kpi003RepositoryPort,
  t: any,
): Promise<GenerationOutputMarketJson> => {
  // Get the date and time range for KPI003 measurements based on the given timestamp
  const kpi003MeasureDateTimeRange = getKpi003ResponseTimeRangeUseCase(timestamp)

  // Fetch GenerationOutput estimates asynchronously using Promise.all
  const [
    plannedRows,
    actualOrForecastRows,
    annualEstimatesArray,
    monthlyEstimatesArray,
    weeklyEstimatesArray,
    dailyEstimatesArray,
    GenerationOutputMarketCurrentFiscalYearEstimates,
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
      "GenerationOutput",
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
      "GenerationOutput",
      "actual_or_forecast",
    ),
    // Fetch annual GenerationOutput estimates
    kpi003Repository.getGenerationOutputEstimates(
      plantCode,
      unitCode,
      "annual",
      kpi003MeasureDateTimeRange.annualEstimatesStart,
      env.KPI003_YEAR_HALF_RANGE * 2,
    ),
    // Fetch monthly GenerationOutput estimates
    kpi003Repository.getGenerationOutputEstimates(
      plantCode,
      unitCode,
      "monthly",
      kpi003MeasureDateTimeRange.monthlyEstimatesStart,
      env.KPI003_MONTH_HALF_RANGE * 2,
    ),
    // Fetch weekly GenerationOutput estimates
    kpi003Repository.getGenerationOutputEstimates(
      plantCode,
      unitCode,
      "weekly",
      kpi003MeasureDateTimeRange.weeklyEstimatesStart,
      env.KPI003_WEEK_HALF_RANGE * 2,
    ),
    // Fetch daily GenerationOutput estimates
    kpi003Repository.getGenerationOutputEstimates(
      plantCode,
      unitCode,
      "daily",
      kpi003MeasureDateTimeRange.dailyEstimatesStart,
      env.KPI003_DAY_HALF_RANGE * 2,
    ),
    // Fetch GenerationOutput estimates for the current fiscal year
    kpi003Repository.getGenerationOutputEstimates(
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
      "GenerationOutput",
      kpi003MeasureDateTimeRange.currentFiscalYearStart.year,
      kpi003Repository,
    ),
  ])

  // Generate the GenerationOutputMarketPPA JSON object
  const returnJson: GenerationOutputMarketJson = {
    PlantCode: plantCode,
    UnitCode: unitCode,
    GenerationOutputMarket: generateKpi003MeasureSectionUseCase({
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
        planned: GenerationOutputMarketCurrentFiscalYearEstimates[0]?.planned || 0,
      },
      otherPrefix: null,
      otherSuffix: t("VALUE.GWH"),
      otherConversion: (foo) => (plantCode === "ASG" ? Math.trunc((foo * 0.1) / 10) / 100 : Math.trunc(foo / 10) / 100), //  ASG - Multiply the value with 0.1 and then convert value into GWh & trunc the value to two decimal place, NonASG - convert the actual value into GWh & trunc the value to two decimal place
      dailyPrefix: null,
      dailySuffix: t("VALUE.MWH"),
      dailyConversion: (foo) => (plantCode === "ASG" ? Math.trunc(foo * 0.1) : Math.trunc(foo)), // ASG - Multiply the value with 0.1 and then convert value into MWh & trunc the value to the whole number, NonASG - convert the actual value into MWh & trunc the value to the whole number
    }),
  }
  return returnJson
}
