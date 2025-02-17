import { TypeOf } from "io-ts/lib/Decoder.js"
import { getOpexPlanSummaryRequestDecoder } from "./decoders/opexPlanSummaryDecoder.js"

export type opexPlanSummaryDataFromDB = {
  PLANT_CODE: string
  FISCAL_YEAR: number
  OPERATION_COST: number
  MAINTENANCE_COST: number
  SUM: number
}

export type opexPlanSummaryData = {
  "plant-id": string
  "fiscal-year": number
  "operation-cost": number | null
  "maintenance-cost": number | null
  sum: number
}

export type getOpexPlanSummaryRequest = TypeOf<typeof getOpexPlanSummaryRequestDecoder>

export type getOpexPlanSummaryResponse = {
  code: number
  body: opexPlanSummaryData[]
}
