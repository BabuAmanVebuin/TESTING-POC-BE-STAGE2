import { TypeOf } from "io-ts/lib/Decoder.js"
import { getEbitdaSummaryRequestDecoder } from "./decoders/getEbitdaSummaryDecoder.js"

export type EbitdaSummaryForForecastFromSF = {
  PLANT_CODE: string
  UNIT_CODE: number
  VALUE: number
}

export type EbitdaSummaryForForecastFromMySQL = {
  PLANT_CODE: string
  VALUE: number
}

export type EbitdaSummaryData = {
  plan: number | null
  forecast: number | null
}

export type getEbitdaSummaryRequest = TypeOf<typeof getEbitdaSummaryRequestDecoder>

export type getEbitdaSummaryResponse = {
  code: number
  body: EbitdaSummaryData
}
