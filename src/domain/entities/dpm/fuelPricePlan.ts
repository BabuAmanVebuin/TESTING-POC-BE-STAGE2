import * as t from "io-ts/lib/Decoder.js"
import { getFuelPricePlanRequestDecoder, upsertFuelPricePlanRequestDecoder } from "./decoders/fuelPricePlanDecoder.js"
import { TypeOf } from "io-ts/lib/Decoder.js"

/**
 * Represents the request payload structure for retrieving fuel Price plan.
 */
export type getFuelPricePlanRequest = t.TypeOf<typeof getFuelPricePlanRequestDecoder>

/**
 * Represents the request payload structure for retrieving fuel Price plan.
 */
export type upsertFuelPricePlanRequest = TypeOf<typeof upsertFuelPricePlanRequestDecoder>

/**
 * Represents the structure of fuel price plan data as retrieved from the database.
 */
export type fuelPricePlanDbType = {
  PLANT_CODE: string
  FISCAL_YEAR: number
  VALUE: number
}

export type FuelPricePlanFilters = {
  startFiscalYear?: number
  endFiscalYear?: number
}

/**
 * Represents the structure of fuel price plan data.
 */
export type FuelPricePlanResponse = {
  "plant-id": string
  "fiscal-year": number
  value: number
}

/**
 * Represents the response structure for retrieving fuel price plan.
 */
export type getFuelPricePlanAPIResponse = {
  code: number
  body: FuelPricePlanResponse[]
}

/**
 * Represents the response structure for retrieving fuel price plan.
 */
export type upsertFuelPricePlanAPIResponse = {
  code: number
  body: string
}
