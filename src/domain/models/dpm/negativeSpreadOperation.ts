// Imported from DPM-BE, commit d0e2f45544cc9890762f93cf3e8f224f15efd619
/**
 * get negative Spread Operation
 */

export interface negativeSpreadsResponse {
  PlantCode: string
  FiscalYear: number
  ForecastNegativeSpreads: NegativeSpreads[]
  ActualNegativeSpreads: NegativeSpreads[]
}
// NegativeSpreads api object type
export interface NegativeSpreads {
  Duration: number
  StartTime: string
  EndTime: string
  AverageGeneratorOutput: number
  AverageSpread: number
  TotalGrossMargin: number
  GeneratorName: string
}

/**
 * Database kpi negative Spread recorded
 */
export interface kpiNegativeSpreadRecord {
  PLANT_CODE: string
  UNIT_CODE: string
  UNIT_NAME: string
  HOURS: number
  START_TIME: Date
  END_TIME: Date
  AVG_GENERATION_OUTPUT: number
  AVG_SPREAD: number
  GROSS_MARGIN: number
}

/**
 * Negative spread hours api
 */

// repository select record count data of hours
export interface kpiNegativeSpreadCountsRecord {
  hours: number
  forecastCategory: number
  recordCount: number
}

// CasesByHours of getNegativeSpreadHoursResponse
export interface CasesByHours {
  OneHour: number
  TwoHours: number
  ThreeHours: number
  FourHours: number
  FiveHours: number
  SixHours: number
  SevenHours: number
  EightHours: number
  NineHours: number
  TenHours: number
  ElevenHours: number
  TwelveOrMoreHours: number
}

// negative spread hours of getNegativeSpreadHoursResponse
export interface getNegativeSpreadHours {
  CasesByHours: CasesByHours
}
export interface getNegativeSpreadHoursResponse {
  PlantCode: string
  UnitCode: string | null
  ActualNegativeSpreadHours: getNegativeSpreadHours
  ForecastNegativeSpreadHours: getNegativeSpreadHours
}
