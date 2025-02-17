import * as t from "io-ts/lib/Decoder.js"

import {
  getGenerationOutputForecastRequestDecoder,
  upsertGenerationOutputForecastRequestDecoder,
} from "./decoders/generationOutputForecastDecoder.js"

export type getGenerationOutputForecastRequest = t.TypeOf<typeof getGenerationOutputForecastRequestDecoder>

export type generationOutputForecastSnowflakeType = {
  PLANT_CODE: string
  UNIT_CODE: string
  FISCAL_YEAR: number
  VALUE: number
}

export type generationOutputForecastDbType = {
  PLANT_CODE: string
  UNIT_CODE: string
  FISCAL_YEAR: number
  VALUE: number | null
  CORRECTION_VALUE: number | null
  SUM: number
}

export type getGenerationOutputForecastResponse = {
  "plant-id": string
  "unit-id": string
  "fiscal-year": number
  value: number | null
  "correction-value": number | null
  sum: number
}

export type getGenerationOutputForecastAPIResponse = {
  code: number
  body: getGenerationOutputForecastResponse[] | string
}

// *upsert-region*

export type upsertGenerationOutputForecastRequest = t.TypeOf<typeof upsertGenerationOutputForecastRequestDecoder>

export type upsertGenerationOutputForecastAPIResponse = {
  code: number
  body: string
}
