export type GenerationOutputPlan = {
  plantCode: string
  unitCode: string
  fiscalYear: number
  value: number | null
  correctionValue: number | null
  userId: string
}

export type GenerationOutputPlanOptionalFilters = {
  unitCode?: string
}

export type GenerationOutputForecast = {
  plantCode: string
  unitCode: string
  fiscalYear: number
  value: number | null
  correctionValue: number | null
  userId: string
}
