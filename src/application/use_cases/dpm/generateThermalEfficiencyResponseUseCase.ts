// Imported from DPM-BE, commit d0e2f45544cc9890762f93cf3e8f224f15efd619
import { getForecastValueFiscalYearUseCase } from "./getForecastValueCurrentYearUseCase.js"
import { generateKpi003MeasureSectionUseCase } from "./generateKpi003MeasureSectionUseCase.js"
import { getKpi003ResponseTimeRangeUseCase } from "./getKpi003ResponseTimeRangeUseCase.js"
import { Kpi003RepositoryPort } from "../../../infrastructure/repositories/dpm/snowflake/kpi003RepositorySnowflake.js"
import { ThermalEfficiencyJson } from "../../../domain/models/dpm/KPI003/Index.js"
import { env } from "../../../infrastructure/env/dpm/index.js"

// Function to generate ThermalEfficiency JSON
export const generateThermalEfficiencyResponseUseCase = async (
  plantCode: string,
  unitCode: string | null,
  timestamp: number,
  kpi003Repository: Kpi003RepositoryPort,
  t: any,
): Promise<ThermalEfficiencyJson> => {
  // Get the date and time range for KPI003 measurements based on the given timestamp
  const kpi003MeasureDateTimeRange = getKpi003ResponseTimeRangeUseCase(timestamp)

  // Fetch ThermalEfficiency estimates asynchronously using Promise.all
  const [
    plannedRows,
    actualOrForecastRows,
    annualEstimatesArray,
    monthlyEstimatesArray,
    weeklyEstimatesArray,
    dailyEstimatesArray,
    ThermalEfficiencyCurrentFiscalYearEstimates,
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
      "ThermalEfficiency",
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
      "ThermalEfficiency",
      "actual_or_forecast",
    ),
    // Fetch annual ThermalEfficiency estimates
    kpi003Repository.getThermalEfficiencyEstimates(
      plantCode,
      unitCode,
      "annual",
      kpi003MeasureDateTimeRange.annualEstimatesStart,
      env.KPI003_YEAR_HALF_RANGE * 2,
    ),
    // Fetch monthly ThermalEfficiency estimates
    kpi003Repository.getThermalEfficiencyEstimates(
      plantCode,
      unitCode,
      "monthly",
      kpi003MeasureDateTimeRange.monthlyEstimatesStart,
      env.KPI003_MONTH_HALF_RANGE * 2,
    ),
    // Fetch weekly ThermalEfficiency estimates
    kpi003Repository.getThermalEfficiencyEstimates(
      plantCode,
      unitCode,
      "weekly",
      kpi003MeasureDateTimeRange.weeklyEstimatesStart,
      env.KPI003_WEEK_HALF_RANGE * 2,
    ),
    // Fetch daily ThermalEfficiency estimates
    kpi003Repository.getThermalEfficiencyEstimates(
      plantCode,
      unitCode,
      "daily",
      kpi003MeasureDateTimeRange.dailyEstimatesStart,
      env.KPI003_DAY_HALF_RANGE * 2,
    ),
    // Fetch ThermalEfficiency estimates for the current fiscal year
    kpi003Repository.getThermalEfficiencyEstimates(
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
      "ThermalEfficiency",
      kpi003MeasureDateTimeRange.currentFiscalYearStart.year,
      kpi003Repository,
    ),
  ])

  // Generate the ThermalEfficiency JSON object
  const returnJson: ThermalEfficiencyJson = {
    PlantCode: plantCode,
    UnitCode: unitCode,
    ThermalEfficiency: generateKpi003MeasureSectionUseCase({
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
        planned: ThermalEfficiencyCurrentFiscalYearEstimates[0]?.planned || 0,
      },
      otherPrefix: null,
      otherSuffix: t("VALUE.SUFFIX_PERCENTAGE"),
      otherConversion: (foo) => Math.round(foo * 10000) / 100, // convert value in percentage & round the value to two decimal place
      dailyPrefix: null,
      dailySuffix: t("VALUE.SUFFIX_PERCENTAGE"),
      dailyConversion: (foo) => Math.round(foo * 10000) / 100, // convert value in percentage & round the value to two decimal place
    }),
  }
  return returnJson
}
