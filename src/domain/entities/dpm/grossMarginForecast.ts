import * as t from "io-ts/lib/Decoder.js"

import { getGrossMarginForecastRequestDecoder } from "./decoders/grossMarginForecast.js"

export type getGrossMarginForecastRequest = t.TypeOf<typeof getGrossMarginForecastRequestDecoder>

export type grossMarginForecastSnowflakeType = {
  PLANT_CODE: string
  UNIT_CODE: string
  FISCAL_YEAR: number
  VALUE: number
}

export type getGrossMarginForecastResponse = {
  "plant-id": string
  "unit-id": string
  "fiscal-year": number
  value: number
}

export type getGrossMarginForecastAPIResponse = {
  code: number
  body: getGrossMarginForecastResponse[] | string
}

export type ppaThermalEfficiencyType = {
  "unit-id": string
  "ppa-thermal-efficiency": number
}

export type fuelUnitCalorificValueType = {
  "unit-id": string
  "fuel-unit-calorific-value": number
}
