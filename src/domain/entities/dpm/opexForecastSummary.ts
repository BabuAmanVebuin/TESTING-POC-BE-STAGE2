import * as t from "io-ts/lib/Decoder.js"
import { getOpexForecastSummaryRequestDecoder } from "./decoders/opexForecastSummaryDecoder.js"

export type getOpexForecastSummaryRequest = t.TypeOf<typeof getOpexForecastSummaryRequestDecoder>

export type opexForecastSummarySnowflakeType = {
  PLANT_CODE: string
  FISCAL_YEAR: number
  VALUE: number
}

export type opexForecastSummaryDbType = {
  PLANT_CODE: string
  FISCAL_YEAR: number
  OPERATION_COST: number | null
  MAINTENANCE_COST: number | null
  SUM: number
}

export type getOpexForecastSummaryResponse = {
  "plant-id": string
  "fiscal-year": number
  "operation-cost": number | null
  "maintenance-cost": number | null
  sum: number
}

export type getOpexForecastSummaryAPIResponse = {
  code: number
  body: getOpexForecastSummaryResponse[] | string
}
