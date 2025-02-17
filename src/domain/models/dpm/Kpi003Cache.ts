// Initially copied from DPM-BE, commit d0e2f45544cc9890762f93cf3e8f224f15efd619
export type Measures =
  | "EBITDA"
  | "GrossMargin"
  | "GrossMarginMarket"
  | "GrossMarginPPA"
  | "OPEX"
  | "GenerationOutput"
  | "GenerationOutputMarket"
  | "GenerationOutputPPA"
  | "Spread"
  | "SpreadMarket"
  | "SpreadPPA"
  | "Availability"
  | "ThermalEfficiency"
  | "HeatRate"
  | "OperationCost"
  | "MaintenanceCost"
  | "BasicProfit"
  | "SalesUnitPrice"

export type Scope = "unit" | "plant"

export type TableForecastType = "planned" | "actual_or_forecast"

export type RowForecastType = "Planned" | "Actual" | "Forecast"

export type Kpi003SubcacheMinimalRow = {
  START: Date
  FORECAST_CATEGORY: RowForecastType
  VALUE: number
}

export type Kpi003SubcacheFetchResult = {
  cumulativeMonthly: Kpi003SubcacheMinimalRow[]
  monthly: Kpi003SubcacheMinimalRow[]
  daily: Kpi003SubcacheMinimalRow[]
  hourly: Kpi003SubcacheMinimalRow[]
}

export type UnscaledEstimates = {
  actual: number | null
  forecast: number | null
  planned: number | null
}
