import * as t from "io-ts/lib/Decoder.js"

import { getEbitdaForecastRequestDecoder } from "./decoders/ebitdaForecastDecoder.js"

export type getEbitdaForecastRequest = t.TypeOf<typeof getEbitdaForecastRequestDecoder>

export type ebitdaForecastSnowflakeType = {
  PLANT_CODE: string
  UNIT_CODE: string
  FISCAL_YEAR: number
  VALUE: number
}

export type basicChargeForecastDbType = {
  PLANT_CODE: string
  UNIT_CODE: string
  FISCAL_YEAR: number
  OPERATION_INPUT: number | null
  MAINTENANCE_INPUT: number | null
  SUM: number
}

export type basicChargeForecastType = {
  "plant-id": string
  "unit-id": string
  "fiscal-year": number
  "operation-input": number | null
  "maintenance-input": number | null
  sum: number
}

export type getEbitdaForecastResponse = {
  "plant-id": string
  "unit-id": string
  "fiscal-year": number
  value: number
}

export type getEbitdaForecastAPIResponse = {
  code: number
  body: getEbitdaForecastResponse[] | string
}
