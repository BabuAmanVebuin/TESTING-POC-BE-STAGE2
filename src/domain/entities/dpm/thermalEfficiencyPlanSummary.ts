import * as t from "io-ts/lib/Decoder.js"

import { getThermalEfficiencyPlanSummaryRequestDecoder } from "./decoders/thermalEfficiencyPlanSummaryDecoder.js"

export type getThermalEfficiencyPlanSummaryRequest = t.TypeOf<typeof getThermalEfficiencyPlanSummaryRequestDecoder>

export type getThermalEfficiencyPlanSummaryResponse = {
  "plant-id": string
  "fiscal-year": number
  value: number
}

export type thermalEfficiencyPlanSummarySnowflakeType = {
  PLANT_CODE: string
  FISCAL_YEAR: number
  VALUE: number
}

export type getThermalEfficiencyPlanSummaryAPIResponse = {
  code: number
  body: getThermalEfficiencyPlanSummaryResponse[] | string
}
