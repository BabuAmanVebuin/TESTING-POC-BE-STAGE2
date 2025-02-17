// Initially copied from DPM-BE, commit d0e2f45544cc9890762f93cf3e8f224f15efd619
import { _annual } from "./Kpi003MeasureAnnualGranularity.js"
import { _daily } from "./Kpi003MeasureDailyGranularity.js"
import { _monthly } from "./Kpi003MeasureMonthlyGranularity.js"
import { _weekly } from "./Kpi003MeasureWeeklyGranularity.js"

// _measure is an object type with properties Annual, Daily, Weekly, Monthly, Cumulative, ForecastCurrentYear, and PlannedCurrentYear.
export type _measure<otherPrefix, otherSuffix, dailyPrefix, dailySuffix> = {
  Annual: _annual<otherPrefix, otherSuffix>
  Daily: _daily<dailyPrefix, dailySuffix>
  Weekly: _weekly<otherPrefix, otherSuffix>
  Monthly: _monthly<otherPrefix, otherSuffix>
  Cumulative: _annual<otherPrefix, otherSuffix>
  ForecastCurrentYear: number | null
  PlannedCurrentYear: number | null
}
// types of sections for measures
export type MoneySection = _measure<"¥", "Oku", "¥", "Man">
export type PercentageSection = _measure<null, "%", null, "%">
export type SpreadSection = _measure<null, "YEN/KWh", null, "YEN/KWh">
export type HeatRateSection = _measure<null, "KJ/KWh", null, "KJ/KWh">
export type GenerationOutputSection = _measure<null, "GWh", null, "MWh">
export type SalesUnitPriceSection = _measure<null, "YEN/KWh", null, "YEN/KWh">

//type for Spread Measure
export type SpreadJson = {
  PlantCode: string
  UnitCode: string | null
  Spread: SpreadSection
}

//type for SpreadMarket Measure
export type SpreadMarketJson = {
  PlantCode: string
  UnitCode: string | null
  SpreadMarket: SpreadSection
}

//type for SpreadPPA Measure
export type SpreadPPAJson = {
  PlantCode: string
  UnitCode: string | null
  SpreadPPA: SpreadSection
}

//type for GrossMargin Measure
export type GrossMarginJson = {
  PlantCode: string
  UnitCode: string | null
  GrossMargin: MoneySection
}
//type for GrossMarginMarket Measure
export type GrossMarginMarketJson = {
  PlantCode: string
  UnitCode: string | null
  GrossMarginMarket: MoneySection
}

//type for GrossMarginPPA Measure
export type GrossMarginPPAJson = {
  PlantCode: string
  UnitCode: string | null
  GrossMarginPPA: MoneySection
}

//type for GenerationOutput Measure
export type GenerationOutputJson = {
  PlantCode: string
  UnitCode: string | null
  GenerationOutput: GenerationOutputSection
}
//type for OperationCost Measure
export type OperationCostJson = {
  PlantCode: string
  UnitCode: string | null
  OperationCost: MoneySection
}

//type for EBITDA Measure
export type EBITDAJson = {
  PlantCode: string
  UnitCode: string | null
  EBITDA: MoneySection
}

//type for HeatRate Measure
export type HeatRateJson = {
  PlantCode: string
  UnitCode: string | null
  HeatRate: HeatRateSection
}
//type for MaintenanceCost Measure
export type MaintenanceCostJson = {
  PlantCode: string
  UnitCode: string | null
  MaintenanceCost: MoneySection
}

//type for BasicProfit Measure
export type BasicProfitJson = {
  PlantCode: string
  UnitCode: string | null
  BasicProfit: MoneySection
}

//type for Availability Measure
export type AvailabilityJson = {
  PlantCode: string
  UnitCode: string | null
  Availability: PercentageSection
}

//type for ThermalEfficiency Measure
export type ThermalEfficiencyJson = {
  PlantCode: string
  UnitCode: string | null
  ThermalEfficiency: PercentageSection
}

//type for GenerationOutputMarket Measure
export type GenerationOutputMarketJson = {
  PlantCode: string
  UnitCode: string | null
  GenerationOutputMarket: GenerationOutputSection
}

//type for GenerationOutputPPA Measure
export type GenerationOutputPPAJson = {
  PlantCode: string
  UnitCode: string | null
  GenerationOutputPPA: GenerationOutputSection
}

//type for SalesUnitPrice Measure
export type SalesUnitPriceJson = {
  PlantCode: string
  UnitCode: string | null
  SalesUnitPrice: SalesUnitPriceSection
}

//type for OPEX Measure
export type OPEXJson = {
  PlantCode: string
  UnitCode: string | null
  OPEX: MoneySection
}

//Common request params for all measures
export type KPI003APIRequestParams = {
  plantCode: string
  unitCode: string | null
  epochSeconds: number
}
