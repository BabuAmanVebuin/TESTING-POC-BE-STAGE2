// Imported from DPM-BE, commit d0e2f45544cc9890762f93cf3e8f224f15efd619
import { getForecastValueFiscalYearUseCase } from "./getForecastValueCurrentYearUseCase.js"
import { generateKpi003MeasureSectionUseCase } from "./generateKpi003MeasureSectionUseCase.js"
import { getKpi003ResponseTimeRangeUseCase } from "./getKpi003ResponseTimeRangeUseCase.js"
import { Kpi003RepositoryPort } from "../../../infrastructure/repositories/dpm/snowflake/kpi003RepositorySnowflake.js"
import { GenerationOutputPPAJson } from "../../../domain/models/dpm/KPI003/Index.js"
import { env } from "../../../infrastructure/env/dpm/index.js"
import { Kpi003SubcacheFetchResult, UnscaledEstimates } from "../../../domain/models/dpm/Kpi003Cache.js"

// Function to generate GenerationOutputPPA JSON
export const generateGenerationOutputPPAResponseUseCase = async (
  plantCode: string,
  unitCode: string | null,
  timestamp: number,
  kpi003Repository: Kpi003RepositoryPort,
  t: any,
): Promise<GenerationOutputPPAJson> => {
  let plannedRows: Kpi003SubcacheFetchResult = {
      cumulativeMonthly: [],
      monthly: [],
      daily: [],
      hourly: [],
    },
    actualOrForecastRows: Kpi003SubcacheFetchResult = {
      cumulativeMonthly: [],
      monthly: [],
      daily: [],
      hourly: [],
    },
    annualEstimatesArray: UnscaledEstimates[] = [],
    monthlyEstimatesArray: UnscaledEstimates[] = [],
    weeklyEstimatesArray: UnscaledEstimates[] = [],
    dailyEstimatesArray: UnscaledEstimates[] = [],
    generationOutputCurrentFiscalYearEstimates: UnscaledEstimates[] = [],
    forecastValueFiscalYear = 0

  // Get the date and time range for KPI003 measurements based on the given timestamp
  const kpi003MeasureDateTimeRange = getKpi003ResponseTimeRangeUseCase(timestamp)

  const getASGGenerationOutputPPAData = (): [
    Promise<Kpi003SubcacheFetchResult>,
    Promise<Kpi003SubcacheFetchResult>,
    Promise<UnscaledEstimates[]>,
    Promise<UnscaledEstimates[]>,
    Promise<UnscaledEstimates[]>,
    Promise<UnscaledEstimates[]>,
    Promise<UnscaledEstimates[]>,
    Promise<number>,
  ] => {
    return [
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
      // Fetch annual GenerationOutputPPA estimates
      kpi003Repository.getGenerationOutputEstimates(
        plantCode,
        unitCode,
        "annual",
        kpi003MeasureDateTimeRange.annualEstimatesStart,
        env.KPI003_YEAR_HALF_RANGE * 2,
      ),
      // Fetch monthly GenerationOutputPPA estimates
      kpi003Repository.getGenerationOutputEstimates(
        plantCode,
        unitCode,
        "monthly",
        kpi003MeasureDateTimeRange.monthlyEstimatesStart,
        env.KPI003_MONTH_HALF_RANGE * 2,
      ),
      // Fetch weekly GenerationOutputPPA estimates
      kpi003Repository.getGenerationOutputEstimates(
        plantCode,
        unitCode,
        "weekly",
        kpi003MeasureDateTimeRange.weeklyEstimatesStart,
        env.KPI003_WEEK_HALF_RANGE * 2,
      ),
      // Fetch daily GenerationOutputPPA estimates
      kpi003Repository.getGenerationOutputEstimates(
        plantCode,
        unitCode,
        "daily",
        kpi003MeasureDateTimeRange.dailyEstimatesStart,
        env.KPI003_DAY_HALF_RANGE * 2,
      ),
      // Fetch GenerationOutputPPA estimates for the current fiscal year
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
    ]
  }

  // Fetch GenerationOutputPPA estimates asynchronously using Promise.all
  ;[
    plannedRows,
    actualOrForecastRows,
    annualEstimatesArray,
    monthlyEstimatesArray,
    weeklyEstimatesArray,
    dailyEstimatesArray,
    generationOutputCurrentFiscalYearEstimates,
    forecastValueFiscalYear,
  ] = await (plantCode === "ASG"
    ? Promise.all(getASGGenerationOutputPPAData())
    : [
        plannedRows,
        actualOrForecastRows,
        annualEstimatesArray,
        monthlyEstimatesArray,
        weeklyEstimatesArray,
        dailyEstimatesArray,
        generationOutputCurrentFiscalYearEstimates,
        forecastValueFiscalYear,
      ])

  // Generate the GenerationOutputPPA JSON object
  const returnJson: GenerationOutputPPAJson = {
    PlantCode: plantCode,
    UnitCode: unitCode,
    GenerationOutputPPA: generateKpi003MeasureSectionUseCase({
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
        planned: generationOutputCurrentFiscalYearEstimates[0]?.planned || 0,
      },
      otherPrefix: null,
      otherSuffix: t("VALUE.GWH"),
      otherConversion: (foo) => (plantCode === "ASG" ? Math.trunc((foo * 0.9) / 10) / 100 : 0), //  ASG - Multiply the value with 0.9 and then convert value into GWh & trunc the value to two decimal place, NonASG - returns 0
      dailyPrefix: null,
      dailySuffix: t("VALUE.MWH"),
      dailyConversion: (foo) => (plantCode === "ASG" ? Math.trunc(foo * 0.9) : 0), // ASG - Multiply the value with 0.9 and then convert value into MWh & trunc the value to the whole number, NonASG - returns 0
    }),
  }
  return returnJson
}
