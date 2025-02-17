import * as t from "io-ts/lib/Decoder.js"
import { getGenerationOutputForecastSummaryRequestDecoder } from "./decoders/generationOutputForecastSummaryDecoder.js"

export type getGenetationOutputForecastSummaryRequest = t.TypeOf<
  typeof getGenerationOutputForecastSummaryRequestDecoder
>

export type generationOutputForecastSummarySnowflakeType = {
  PLANT_CODE: string
  FISCAL_YEAR: number
  VALUE: number
}

export type generationOutputForecastSummaryDbType = {
  PLANT_CODE: string
  FISCAL_YEAR: number
  VALUE: number
}

export type getGenerationOutputForecastSummaryResponse = {
  "plant-id": string
  "fiscal-year": number
  value: number
}

export type getGenetationOutputForecastSummaryAPIResponse = {
  code: number
  body: getGenerationOutputForecastSummaryResponse[] | string
}
