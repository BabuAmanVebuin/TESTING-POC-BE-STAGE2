import { TypeOf } from "io-ts/lib/Decoder.js"
import { getGenerationOutputSummaryRequestDecoder } from "./decoders/generationOutputSummaryDecoder.js"

export type GenerationOutputSummaryFromSqlDB = {
  sum: number
}
export type GenerationOutputSummaryForForecastFromSF = {
  PLANT_CODE: string
  UNIT_CODE: string
  VALUE: number
}

export type GenerationOutputSummaryData = {
  plan: number | null
  forecast: number | null
}

export type getGenerationOutputSummaryRequest = TypeOf<typeof getGenerationOutputSummaryRequestDecoder>

export type getGenerationOutputSummaryResponse = {
  code: number
  body: GenerationOutputSummaryData
}
