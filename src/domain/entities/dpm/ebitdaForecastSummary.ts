import * as t from "io-ts/lib/Decoder.js"

import { getEbitdaForecastSummaryRequestDecoder } from "./decoders/ebitdaForecastSummaryDecoder.js"

export type getEbitdaForecastSummaryRequest = t.TypeOf<typeof getEbitdaForecastSummaryRequestDecoder>

export type ebitdaForecastSummarySnowflakeType = {
  PLANT_CODE: string
  FISCAL_YEAR: number
  VALUE: number
}

export type basicChargeForecastSummaryType = {
  "plant-id": string
  "unit-id": string
  "fiscal-year": number
  "operation-input": number | null
  "maintenance-input": number | null
  sum: number
}

export type getEbitdaForecastSummaryResponse = {
  "plant-id": string
  "fiscal-year": number
  value: number
}

export type getEbitdaForecastSummaryAPIResponse = {
  code: number
  body: getEbitdaForecastSummaryResponse[] | string
}
