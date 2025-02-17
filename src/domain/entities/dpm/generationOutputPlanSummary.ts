import { TypeOf } from "io-ts/lib/Decoder.js"
import { getGenerationOutputPlanRequestDecoder } from "./decoders/generationOutputPlanDecoder.js"

export type GenerationOutputPlanSummaryDataFromDB = {
  PLANT_CODE: string
  FISCAL_YEAR: number
  VALUE: number
}

export type GenerationOutputPlanSummaryData = {
  "plant-id": string
  "fiscal-year": number
  value: number
}

export type getGenerationOutputPlanSummaryRequest = TypeOf<typeof getGenerationOutputPlanRequestDecoder>

export type getGenerationOutputPlanSummaryResponse = {
  code: number
  body: GenerationOutputPlanSummaryData[]
}
