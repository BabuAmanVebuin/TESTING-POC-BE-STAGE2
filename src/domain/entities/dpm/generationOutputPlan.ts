import { TypeOf } from "io-ts/lib/Decoder.js"
import {
  getGenerationOutputPlanRequestDecoder,
  upsertGenerationOutputPlanRequestDecoder,
} from "./decoders/generationOutputPlanDecoder.js"

export type GenerationOutputPlanDataFromDB = {
  PLANT_CODE: string
  UNIT_CODE: string
  FISCAL_YEAR: number
  VALUE: number | null
  CORRECTION_VALUE: number | null
  sum: number
}

export type GenerationOutputPlanData = {
  "plant-id": string
  "unit-id": string
  "fiscal-year": number
  value: number | null
  "correction-value": number | null
  sum: number
}

export type getGenerationOutputPlanRequest = TypeOf<typeof getGenerationOutputPlanRequestDecoder>

export type upsertGenerationOutputPlanRequest = TypeOf<typeof upsertGenerationOutputPlanRequestDecoder>

export type getGenerationOutputPlanResponse = {
  code: number
  body: GenerationOutputPlanData[]
}

export type upsertGenerationOutputPlanResponse = {
  code: number
  body: string
}
