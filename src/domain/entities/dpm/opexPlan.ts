import { TypeOf } from "io-ts/lib/Decoder.js"
import { getOpexPlanRequestDecoder } from "./decoders/opexPlanDecoder.js"
import { upsertOpexPlanRequestDecoder } from "./decoders/opexPlanDecoder.js"

export type opexPlanDataFromDB = {
  PLANT_CODE: string
  UNIT_CODE: string
  FISCAL_YEAR: number
  OPERATION_COST: number
  MAINTENANCE_COST: number
  SUM: number
}

export type opexPlanOptionalFilters = {
  unitCode?: string
}

export type opexPlanData = {
  "plant-id": string
  "unit-id": string
  "fiscal-year": number
  "operation-cost": number | null
  "maintenance-cost": number | null
  sum: number
}

export type getOpexPlanRequest = TypeOf<typeof getOpexPlanRequestDecoder>

export type getOpexPlanResponse = {
  code: number
  body: opexPlanData[]
}

export type upsertOpexPlanRequest = TypeOf<typeof upsertOpexPlanRequestDecoder>

export type upsertOpexPlanResponse = {
  code: number
  body: string
}
