import * as t from "io-ts/lib/Decoder.js"
import {
  getFuelPriceForecastRequestDecoder,
  upsertFuelPriceForecastRequestDecoder,
} from "./decoders/fuelPriceForecast.js"
import { TypeOf } from "io-ts/lib/Decoder.js"

/**
 * Represents the request payload structure for retrieving fuel Price forecast.
 */
export type getFuelPriceForecastRequest = t.TypeOf<typeof getFuelPriceForecastRequestDecoder>

/**
 * Represents the request payload structure for retrieving fuel Price forecast.
 */
export type upsertFuelPriceForecastRequest = TypeOf<typeof upsertFuelPriceForecastRequestDecoder>

/**
 * Represents the structure of fuel price forecast data as retrieved from the database.
 */
export type fuelPriceForecastDbType = {
  PLANT_CODE: string
  FISCAL_YEAR: number
  VALUE: number | null
}

/**
 * Represents the structure of fuel unit calorific data as retrieved from the database.
 */
export type fuelUnitCalorificType = {
  "unit-id": string
  "fuel-unit-calorific-value": number
}

/**
 * Represents the structure of fuel price forecast data as retrieved from the snowflake database.
 */
export type fuelPriceForecastSfType = {
  PLANT_CODE: string
  UNIT_CODE: string
  FISCAL_YEAR: number
  VALUE: number
}

/**
 * Represents the structure of fuel cost data as retrieved from getFuelCostSf function.
 */
export type fuelCostDataType = {
  "plant-id": string
  "unit-id": string
  "fiscal-year": number
  value: number | null
}

/**
 * Represents the structure of fuel price forecast data as passed to calculation function.
 */
export type fuelPriceForecastDataType = {
  "plant-id": string
  "unit-id": string
  "fiscal-year": number
  value: number
}

/**
 * Represents the structure of fuel cost per unit forecast data.
 */
export type fuelCostPerUnitTotalType = {
  "plant-id": string
  "fiscal-year": number
  value: number
}

/**
 * Represents the structure of fuel price forecast data.
 */
export type getFuelPriceForecastResponse = {
  "plant-id": string
  "fiscal-year": number
  value: number | null
}

/**
 * Represents the response structure for retrieving fuel price forecast.
 */
export type getFuelPriceForecastAPIResponse = {
  code: number
  body: getFuelPriceForecastResponse[] | string
}

/**
 * Represents the response structure for retrieving fuel price forecast.
 */
export type upsertFuelPriceForecastAPIResponse = {
  code: number
  body: string
}
