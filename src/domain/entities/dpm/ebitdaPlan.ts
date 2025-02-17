import * as t from "io-ts/lib/Decoder.js"

import { getEbitdaPlanRequestDecoder } from "./decoders/ebitdaPlanDecoder.js"

export type getEbitdaPlanRequest = t.TypeOf<typeof getEbitdaPlanRequestDecoder>

export type ebitdaPlanDatabaseType = {
  PLANT_CODE: string
  UNIT_CODE: string
  FISCAL_YEAR: number
  VALUE: string
}

export type getEbitdaPlanResponse = {
  "plant-id": string
  "unit-id": string
  "fiscal-year": number
  value: number
}

export type getEbitdaPlanAPIResponse = {
  code: number
  body: getEbitdaPlanResponse[] | string
}
