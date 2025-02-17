import * as t from "io-ts/lib/Decoder.js"

import {
  getThermalEfficiencyForecastRequestDecoder,
  putThermalEfficiencyForecastRequestDecoder,
} from "./decoders/thermalEfficiencyForecastDecoder.js"

export type getThermalEfficiencyForecastRequest = t.TypeOf<typeof getThermalEfficiencyForecastRequestDecoder>

export type putThermalEfficiencyForecastRequest = t.TypeOf<typeof putThermalEfficiencyForecastRequestDecoder>

export type thermalEfficiencyForecastDatabaseType = {
  PLANT_CODE: string
  UNIT_CODE: string
  FISCAL_YEAR: number
  CORRECTION_VALUE: number
}

export type thermalEfficiencyForecastSnowflakeType = {
  PLANT_CODE: string
  UNIT_CODE: string
  FISCAL_YEAR: number
  VALUE: number
}

export type getThermalEfficiencyForecastResponse = {
  "plant-id": string
  "unit-id": string
  "fiscal-year": number
  value: number | null
  "correction-value": number | null
  sum: number
}

export type getThermalEfficiencyForecastAPIResponse = {
  code: number
  body: getThermalEfficiencyForecastResponse[] | string
}

export type putThermalEfficiencyForecastAPIResponse = {
  code: number
  body: string
}

export type unitListDb = {
  "unit-id": string
}

export type stoppageDb = {
  "unit-id": string
  "type-of-stoppage-text": string
  date: Date
}

export type stoppageType = {
  "unit-id": string
  "type-of-stoppage-text": string
  "fiscal-year": number
}

export type recoveryType = {
  "unit-id": string
  "type-of-stoppage-text": string
  "thermal-efficiency-recovery": number
}

export type decreaseType = {
  "unit-id": string
  "thermal-efficiency-decrease": number
}

export type calculatedValueType = {
  "plant-id": string
  "unit-id": string
  "fiscal-year": number
  value: number
  "correction-value": number | null
}
