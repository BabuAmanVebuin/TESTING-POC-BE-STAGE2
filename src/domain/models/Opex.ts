export type OpexPlan = {
  plantCode: string
  unitCode: string
  fiscalYear: number
  operationCost: number | null
  maintenanceCost: number | null
  userId: string
}

export type OpexForecast = {
  plantCode: string
  unitCode: string
  fiscalYear: number
  operationCost: number | null
  maintenanceCost: number | null
  userId: string
}
