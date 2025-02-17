// Initially copied from DPM-BE, commit d0e2f45544cc9890762f93cf3e8f224f15efd619
import { DateTime } from "luxon"
import { Kpi002Json } from "../../../../domain/models/dpm/Kpi002Json.js"
import {
  Measures,
  TableForecastType,
  Kpi003SubcacheFetchResult,
  UnscaledEstimates,
} from "../../../../domain/models/dpm/Kpi003Cache.js"

export type Kpi003RepositoryPort = {
  getPastAnnualTotalGrossMarginCache: (
    plantCode: string,
    unitCode: string | null,
    currentFiscalYear: number,
  ) => Promise<Map<number, number>>
  getKpi002Data: (plantCode: string, unitCode: string | null, fiscalYear: number) => Promise<Kpi002Json>
  getKpi003SubcacheRows: (
    plantCode: string,
    unitCode: string | null,
    monthlyStart: DateTime,
    monthlyEnd: DateTime,
    dailyStart: DateTime,
    dailyEnd: DateTime,
    hourlyStart: DateTime,
    hourlyEnd: DateTime,
    measure: Measures,
    forecastCategory: TableForecastType,
  ) => Promise<Kpi003SubcacheFetchResult>
  getAvailabilityEstimates: (
    plantCode: string,
    unitCode: string | null,
    granularity: "annual" | "monthly" | "weekly" | "daily",
    start: DateTime,
    length: number,
  ) => Promise<UnscaledEstimates[]>
  getEBITDAEstimates: (
    plantCode: string,
    unitCode: string | null,
    granularity: "annual" | "monthly" | "weekly" | "daily",
    start: DateTime,
    length: number,
  ) => Promise<UnscaledEstimates[]>
  getOPEXEstimates: (
    plantCode: string,
    unitCode: string | null,
    granularity: "annual" | "monthly" | "weekly" | "daily",
    start: DateTime,
    length: number,
  ) => Promise<UnscaledEstimates[]>
  getOperationCostEstimates: (
    plantCode: string,
    unitCode: string | null,
    granularity: "annual" | "monthly" | "weekly" | "daily",
    start: DateTime,
    length: number,
  ) => Promise<UnscaledEstimates[]>
  getMaintenanceCostEstimates: (
    plantCode: string,
    unitCode: string | null,
    granularity: "annual" | "monthly" | "weekly" | "daily",
    start: DateTime,
    length: number,
  ) => Promise<UnscaledEstimates[]>
  getBasicProfitCostEstimates: (
    plantCode: string,
    unitCode: string | null,
    granularity: "annual" | "monthly" | "weekly" | "daily",
    start: DateTime,
    length: number,
  ) => Promise<UnscaledEstimates[]>
  getThermalEfficiencyEstimates: (
    plantCode: string,
    unitCode: string | null,
    granularity: "annual" | "monthly" | "weekly" | "daily",
    start: DateTime,
    length: number,
  ) => Promise<UnscaledEstimates[]>
  getHeatRateEstimates: (
    plantCode: string,
    unitCode: string | null,
    granularity: "annual" | "monthly" | "weekly" | "daily",
    start: DateTime,
    length: number,
  ) => Promise<UnscaledEstimates[]>
  getSpreadEstimates: (
    plantCode: string,
    unitCode: string | null,
    granularity: "annual" | "monthly" | "weekly" | "daily",
    start: DateTime,
    length: number,
  ) => Promise<UnscaledEstimates[]>
  getSpreadMarketEstimates: (
    plantCode: string,
    unitCode: string | null,
    granularity: "annual" | "monthly" | "weekly" | "daily",
    start: DateTime,
    length: number,
  ) => Promise<UnscaledEstimates[]>
  getSpreadPPAEstimates: (
    plantCode: string,
    unitCode: string | null,
    granularity: "annual" | "monthly" | "weekly" | "daily",
    start: DateTime,
    length: number,
  ) => Promise<UnscaledEstimates[]>
  getGrossMarginEstimates: (
    plantCode: string,
    unitCode: string | null,
    granularity: "annual" | "monthly" | "weekly" | "daily",
    start: DateTime,
    length: number,
  ) => Promise<UnscaledEstimates[]>
  getGrossMarginMarketEstimates: (
    plantCode: string,
    unitCode: string | null,
    granularity: "annual" | "monthly" | "weekly" | "daily",
    start: DateTime,
    length: number,
  ) => Promise<UnscaledEstimates[]>
  getGrossMarginPPAEstimates: (
    plantCode: string,
    unitCode: string | null,
    granularity: "annual" | "monthly" | "weekly" | "daily",
    start: DateTime,
    length: number,
  ) => Promise<UnscaledEstimates[]>
  getGenerationOutputEstimates: (
    plantCode: string,
    unitCode: string | null,
    granularity: "annual" | "monthly" | "weekly" | "daily",
    start: DateTime,
    length: number,
  ) => Promise<UnscaledEstimates[]>
  getKpi003UnitWiseYearEndActualOrForecastValue: (
    unitCode: string,
    measure: string,
    fiscalYear: number,
  ) => Promise<{
    FORECAST_CATEGORY: "Actual" | "Forecast"
    value: number
  }>
  getKpi003PlantWiseYearEndActualOrForecastValue: (
    plantCode: string,
    measure: string,
    fiscalYear: number,
  ) => Promise<{
    FORECAST_CATEGORY: "Actual" | "Forecast"
    value: number
  }>
  getSalesUnitPriceEstimates: (
    plantCode: string,
    unitCode: string | null,
    granularity: "annual" | "monthly" | "weekly" | "daily",
    start: DateTime,
    length: number,
  ) => Promise<UnscaledEstimates[]>
}
