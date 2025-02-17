import * as t from "io-ts/lib/Decoder.js"

import { getThermalEfficiencyForecastSummaryRequestDecoder } from "./decoders/thermalEfficiencyForecastSummaryDecoder.js"

export type getThermalEfficiencyForecastSummaryRequest = t.TypeOf<
  typeof getThermalEfficiencyForecastSummaryRequestDecoder
>

export type getThermalEfficiencyForecastSummaryResponse = {
  "plant-id": string
  "fiscal-year": number
  value: number
}

export type thermalEfficiencyForecastSummarySnowflakeType = {
  PLANT_CODE: string
  FISCAL_YEAR: number
  VALUE: number
}

export type getThermalEfficiencySummaryAPIResponse = {
  code: number
  body: getThermalEfficiencyForecastSummaryResponse[] | string
}
