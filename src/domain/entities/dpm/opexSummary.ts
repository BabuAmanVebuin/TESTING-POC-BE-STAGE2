import { TypeOf } from "io-ts/lib/Decoder.js"
import { getOpexSummaryRequestDecoder } from "./decoders/opexSummaryDecoder.js"

export type OpexSummaryFromSqlDB = {
  PLANT_CODE: string
  FISCAL_YEAR: number
  OPERATION_COST: number
  MAINTENANCE_COST: number
  SUM: number
}
export type OpexSummaryForForecastFromSF = {
  PLANT_CODE: string
  FISCAL_YEAR: number
  VALUE: number
}
export type opexSummaryTransformedSqlData = {
  "operation-cost": number | null
  "maintenance-cost": number | null
  sum: number
}
export type OpexSummaryData = {
  sum: {
    plan: number | null
    forecast: number | null
  }
  "operation-cost": {
    plan: number | null
    forecast: number | null
  }
  "maintenance-cost": {
    plan: number | null
    forecast: number | null
  }
}

export type getOpexSummaryRequest = TypeOf<typeof getOpexSummaryRequestDecoder>

export type getOpexSummaryResponse = {
  code: number
  body: OpexSummaryData
}
