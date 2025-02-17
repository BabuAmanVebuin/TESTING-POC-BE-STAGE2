import { TypeOf } from "io-ts/lib/Decoder.js"
import {
  getBasicChargePlanRequestDecoder,
  upsertBasicChargePlanRequestDecoder,
} from "./decoders/basicChargePlanDecoder.js"

/**
 * Represents the structure of Basic Charge Plan data as retrieved from the database.
 */
export type BasicChargePlanDataFromDB = {
  PLANT_CODE: string
  UNIT_CODE: string
  FISCAL_YEAR: number
  OPERATION_INPUT: number
  MAINTENANCE_INPUT: number
  SUM: number
}

export type BasicChargePlanFilters = {
  unitCode?: string
  startFiscalYear?: number
  endFiscalYear?: number
  currentFiscalYear?: number
}

/**
 * Represents the structure of Basic Charge Plan data.
 */
export type BasicChargePlanData = {
  "plant-id": string
  "unit-id": string
  "fiscal-year": number
  "operation-input": number | null
  "maintenance-input": number | null
  sum: number
}

/**
 * Represents the request payload structure for retrieving basic charge plans.
 */
export type getBasicChargePlanRequest = TypeOf<typeof getBasicChargePlanRequestDecoder>

/**
 * Represents the request payload structure for upserting basic charge plans.
 */
export type upsertBasicChargePlanRequest = TypeOf<typeof upsertBasicChargePlanRequestDecoder>

/**
 * Represents the response structure for retrieving basic charge plans.
 */
export type getBasicChargePlanResponse = {
  code: number
  body: BasicChargePlanData[]
}

/**
 * Represents the response structure for upserting basic charge plans.
 */
export type upsertBasicChargePlanResponse = {
  code: number
  body: string
}
