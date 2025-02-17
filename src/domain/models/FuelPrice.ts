/**
 * Fuel Price Forecast Type
 */
export type FuelPriceForecast = {
  plantCode: string
  fiscalYear: number
  value: number | null
  userId: string
}

/**
 * Fuel Price Plan Type
 */
export type FuelPricePlan = {
  plantCode: string
  fiscalYear: number
  value: number | null
  userId: string
}
