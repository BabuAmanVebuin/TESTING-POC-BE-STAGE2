import * as t from "io-ts/lib/Decoder.js"
import { getBasicChargeForecastSummaryRequestDecoder } from "./decoders/basicChargeForecastSummaryDecoder.js"

/**
 * Represents the structure of Basic Charge forecast summary data as retrieved from the database.
 */
export type basicChargeForecastSummaryDataFromDB = {
  PLANT_CODE: string
  FISCAL_YEAR: number
  VALUE: number
}

/**
 * Represents the structure of Basic Charge forecast summary data.
 */
export type getBasicChargeForecastSummaryData = {
  "plant-id": string
  "fiscal-year": number
  value: number
}

/**
 * Represents the request payload structure for retrieving basic charge forecast summary.
 */
export type getBasicChargeForecastSummaryRequest = t.TypeOf<typeof getBasicChargeForecastSummaryRequestDecoder>

/**
 * Represents the response structure for retrieving basic charge forecast summary.
 */
export type getBasicChargeForecastSummaryResponse = {
  code: number
  body: getBasicChargeForecastSummaryData[]
}
