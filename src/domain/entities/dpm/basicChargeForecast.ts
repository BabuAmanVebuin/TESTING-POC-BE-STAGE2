import {
  getBasicChargeForecastRequestDecoder,
  upsertBasicChargeForecastRequestDecoder,
} from "./decoders/basicChargeForecastDecoder.js"
import { TypeOf } from "io-ts/lib/Decoder.js"

/**
 * Represents the structure of Basic Charge forecast data as retrieved from the database.
 */
export type BasicChargeForecastDataFromDB = {
  PLANT_CODE: string
  UNIT_CODE: string
  FISCAL_YEAR: number
  OPERATION_INPUT: number | null
  MAINTENANCE_INPUT: number | null
  SUM: number
}

/**
 * Represents the structure of Basic Charge forecast data.
 */
export type BasicChargeForecastData = {
  "plant-id": string
  "unit-id": string
  "fiscal-year": number
  "operation-input": number | null
  "maintenance-input": number | null
  sum: number
}

// *get*

/**
 * Represents the request payload structure for retrieving basic charge forecast.
 */
export type getBasicChargeForecastRequest = TypeOf<typeof getBasicChargeForecastRequestDecoder>

/**
 * Represents the response structure for retrieving basic charge forecast.
 */
export type getBasicChargeForecastResponse = {
  code: number
  body: BasicChargeForecastData[]
}

// *upsert*

/**
 * Represents the request payload structure for retrieving basic charge forecast.
 */
export type upsertBasicChargeForecastRequest = TypeOf<typeof upsertBasicChargeForecastRequestDecoder>

/**
 * Represents the response structure for retrieving basic charge forecast.
 */
export type upsertBasicChargeForecastAPIResponse = {
  code: number
  body: string
}
