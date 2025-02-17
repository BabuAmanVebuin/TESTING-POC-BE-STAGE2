// Initially copied from DPM-BE, commit d0e2f45544cc9890762f93cf3e8f224f15efd619
/**
 * Database Record for start stop cost
 */
export type StartUpCostRecord = {
  SCHEDULED_START_DATE: Date
  SCHEDULED_END_DATE: Date
  VALUE: number
}

/**
 * API response of get start stop API
 */
export interface GetStartStopCostResponse {
  PlantCode: string
  UnitCode: string
  StartupMode: string
  FiscalYear: number
  MonthlyCost: CostWithPeriod
  AnnualCost: CostWithPeriod
}

export interface CostWithPeriod {
  Period: string[]
  Cost: number[]
}
