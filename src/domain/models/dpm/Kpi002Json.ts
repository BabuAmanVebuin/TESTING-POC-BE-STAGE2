// Imported from DPM-BE, commit d0e2f45544cc9890762f93cf3e8f224f15efd619
type _Kpi002Measure<P, S, S2> = {
  Prefix: P
  Suffix: S
  Suffix2: S2
  Forecast: number
  Plan: number
  Actual: number
}
export type kpi = {
  OPEXOperation: _Kpi002Measure<"¥", "Oku", "Oku">
  OPEXMaintenance: _Kpi002Measure<"¥", "Oku", "Oku">
  OPEXTotal: _Kpi002Measure<"¥", "Oku", "Oku">
  BasicCharge: Pick<_Kpi002Measure<"¥", "Oku", "Oku">, "Prefix" | "Suffix" | "Suffix2"> & { Annual: number | null }
  BasicProfit: _Kpi002Measure<"¥", "Oku", "Oku">
  EBITDA: _Kpi002Measure<"¥", "Oku", "Oku">
  GrossMargin: _Kpi002Measure<"¥", "Oku", "Oku">
  GenerationOutput: _Kpi002Measure<null, "GWh", null>
  Availability: _Kpi002Measure<null, "%", null>
  Spread: _Kpi002Measure<null, "YEN/KWh", null>
  ThermalEfficiency: _Kpi002Measure<null, "%", null>
  AnnualTotalGrossMargin: {
    Prefix: "¥"
    Suffix: "Oku"
    Suffix2: "Oku"
    data: Record<string, number>
  }
}
export type Kpi002Json = {
  Type: "Plant" | "Generator"
  Name: string
  KPI: kpi
}
