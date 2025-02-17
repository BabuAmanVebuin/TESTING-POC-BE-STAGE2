import { TypeOf } from "io-ts/lib/Decoder.js"
import { getHeatRatePlanSummaryRequestDecoder } from "./decoders/heatRatePlanSummaryDecoder.js"

export type ppaThermalEfficienciesFromDB = {
  UNIT_CODE: string
  PPA_THERMAL_EFFICIENCY: number
}

export type ppaThermalEfficienciesData = {
  "unit-id": string
  "ppa-thermal-efficiency": number
}

export type generationOutputPlanData = {
  "plant-id": string
  "unit-id": string
  "fiscal-year": number
  value: number | null
  "correction-value": number | null
  sum: number
}

export type generationOutputPlanSummaryData = {
  "plant-id": string
  "fiscal-year": number
  value: number
}

export type heatRatePlanSummaryData = {
  "plant-id": string
  "fiscal-year": number
  value: number
}

export type getHeatRatePlanSummaryRequest = TypeOf<typeof getHeatRatePlanSummaryRequestDecoder>

export type getHeatRatePlanSummaryResponse = {
  code: number
  body: heatRatePlanSummaryData[]
}
