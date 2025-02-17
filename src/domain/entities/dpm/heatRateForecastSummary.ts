import { TypeOf } from "io-ts/lib/Decoder.js"
import { getHeatRateForecastSummaryRequestDecoder } from "./decoders/heatRateForecastSummaryDecoder.js"

export type ppaThermalEfficiencyFromDB = {
  PPA_THERMAL_EFFICIENCY: number
}

export type heatRateForecastSummarySfFromDB = {
  PLANT_CODE: string
  FISCAL_YEAR: number
  VALUE: number
}

export type generationOutputForecastSummaryData = {
  "plant-id": string
  "fiscal-year": number
  value: number
}

export type generationOutputForecastData = {
  "plant-id": string
  "unit-id": string
  "fiscal-year": number
  value: number | null
  "correction-value": number | null
  sum: number
}

export type thermalEfficiencyForecastData = generationOutputForecastData

export type heatRateForecastSummaryData = generationOutputForecastSummaryData

export type getHeatRateForecastSummaryRequest = TypeOf<typeof getHeatRateForecastSummaryRequestDecoder>

export type getHeatRateForecastSummaryResponse = {
  code: number
  body: heatRateForecastSummaryData[]
}
