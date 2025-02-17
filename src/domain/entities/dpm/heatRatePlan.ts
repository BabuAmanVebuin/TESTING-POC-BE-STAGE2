import { TypeOf } from "io-ts/lib/Decoder.js"
import { getHeatRatePlanRequestDecoder } from "./decoders/heatRatePlanDecoder.js"

export type ppaThermalEfficiencyFromDB = {
  PPA_THERMAL_EFFICIENCY: number
}

export type generationOutputPlanData = {
  "plant-id": string
  "unit-id": string
  "fiscal-year": number
  value: number | null
  "correction-value": number | null
  sum: number
}
export type heatRatePlanData = {
  "plant-id": string
  "unit-id": string
  "fiscal-year": number
  value: number | null
}

export type getHeatRatePlanRequest = TypeOf<typeof getHeatRatePlanRequestDecoder>

export type getHeatRatePlanResponse = {
  code: number
  body: heatRatePlanData[]
}
