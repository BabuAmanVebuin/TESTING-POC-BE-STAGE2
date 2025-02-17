import * as t from "io-ts/lib/Decoder.js"
import { getHeatRateForecastRequestDecoder } from "./decoders/heatRateForecastDecoder.js"

export type getHeatRateForecastRequest = t.TypeOf<typeof getHeatRateForecastRequestDecoder>

export type heatRateForecastSnowflakeType = {
  FISCAL_YEAR: number
  PLANT_CODE: string
  UNIT_CODE: string
  VALUE: number
}

export type getHeatRateForecastResponse = {
  "plant-id": string
  "unit-id": string
  "fiscal-year": number
  value: number | null
}

export type getHeatRateForecastAPIResponse = {
  code: number
  body: getHeatRateForecastResponse[] | string
}
