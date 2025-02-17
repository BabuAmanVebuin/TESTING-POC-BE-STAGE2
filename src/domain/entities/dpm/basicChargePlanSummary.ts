import { TypeOf } from "io-ts/lib/Decoder.js"
import { getBasicChargePlanRequestDecoder } from "./decoders/basicChargePlanDecoder.js"

/**
 * Definition of Basic Charge Plan summary data retrieved from the database
 */
export type BasicChargePlanSummaryDataFromDB = {
  PLANT_CODE: string
  FISCAL_YEAR: number
  VALUE: number
}

/**
 * Definition of Basic Charge Plan summary data for external use
 */
export type BasicChargePlanSummaryData = {
  "plant-id": string
  "fiscal-year": number
  value: number
}

/**
 * Definition of the request format for getting Basic Charge Plan summary
 */
export type getBasicChargePlanSummaryRequest = TypeOf<typeof getBasicChargePlanRequestDecoder>

/**
 * Definition of the response format for getting Basic Charge Plan summary
 */
export type getBasicChargePlanSummaryResponse = {
  code: number
  body: BasicChargePlanSummaryData[]
}
