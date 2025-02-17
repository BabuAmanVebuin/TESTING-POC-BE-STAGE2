import { TypeOf } from "io-ts/lib/Decoder.js"
import { getHeatRateSummaryRequestDecoder } from "./decoders/heatRateSummaryDecoder.js"

export type ppaThermalEfficiencyFromDB = {
  "unit-id": string
  "ppa-thermal-efficiency": number
}

export type heatRateSummarySf = {
  PLANT_CODE: string
  UNIT_CODE: string
  FISCAL_YEAR: number
  VALUE: number
}

export type transofrmedHeatRateSummarySf = {
  "plant-id": string
  "unit-id"?: string
  "fiscal-year": number
  value: number
}

export type heatInput = {
  "plant-id": string
  "fiscal-year": number
  value: number
}

export type generationOutputData = {
  "plant-id": string
  "unit-id": string
  "fiscal-year": number
  value: number | null
  "correction-value": number | null
  sum: number
}

export type heatRateSummaryData = {
  plan: number | null
  forecast: number | null
}

export type ppaThermalEfficiencies = generationOutputData

export type getHeatRateSummaryRequest = TypeOf<typeof getHeatRateSummaryRequestDecoder>

export type getHeatRateSummaryResponse = {
  code: number
  body: heatRateSummaryData
}
