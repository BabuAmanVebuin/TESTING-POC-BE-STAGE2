// Imported from DPM-BE, commit d0e2f45544cc9890762f93cf3e8f224f15efd619
export type Stoppage = {
  PlantCode: string
  UnitCode: string
  Name: string
  PlanStart: Date | null
  PlanEnd: Date | null
  ForecastStart: Date | null
  ForecastEnd: Date | null
  ActualStart: Date | null
  ActualEnd: Date | null
  CoarseStoppageType: string
  Cancelled: string
}

export type StoppageResponceRecord = {
  PlantCode: string
  UnitCode: string
  Name: string
  PlanStart: string | null
  PlanEnd: string | null
  ForecastStart: string | null
  ForecastEnd: string | null
  ActualStart: string | null
  ActualEnd: string | null
  CoarseStoppageType: string
  Cancelled: string
}
