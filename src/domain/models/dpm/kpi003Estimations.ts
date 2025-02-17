// Imported from DPM-BE, commit d0e2f45544cc9890762f93cf3e8f224f15efd619
export type YearlyEstimation = {
  PLANT_CODE: string
  FISCAL_YEAR: number
  VALUE: number
}

export interface EBITDAResponseType {
  PlantCode: string
  UnitCode: string | null
  ForecastCategory: string
  UOM: string
  EBITDA: {
    FiscalYear: number
    Value: number
  }[]
}

export interface GenerationOutputResponseType {
  PlantCode: string
  UnitCode: string | null
  ForecastCategory: string
  UOM: string
  GenerationOutput: {
    FiscalYear: number
    Value: number
  }[]
}
