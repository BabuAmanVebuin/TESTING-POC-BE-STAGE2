/**
 * Basic Charge Plan Type
 */
export type BasicChargePlan = {
  plantCode: string
  unitCode: string
  fiscalYear: number
  operationInput: number | null
  maintenanceInput: number | null
  userId: string
}
/**
 * Basic Charge Forecast Type
 */
export type BasicChargeForecast = {
  plantCode: string
  unitCode: string
  fiscalYear: number
  operationInput: number | null
  maintenanceInput: number | null
  userId: string
}
