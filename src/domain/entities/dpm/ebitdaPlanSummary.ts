import * as t from "io-ts/lib/Decoder.js"

import { getEbitdaPlanSummaryRequestDecoder } from "./decoders/ebitdaPlanDecoderSummary.js"

export type getEbitdaPlanSummaryRequest = t.TypeOf<typeof getEbitdaPlanSummaryRequestDecoder>

export type ebitdaPlanSummaryDatabaseType = {
  PLANT_CODE: string
  FISCAL_YEAR: number
  VALUE: string
}

export type getEbitdaPlanSummaryResponse = {
  "plant-id": string
  "fiscal-year": number
  value: number
}

export type getEbitdaPlanSummaryAPIResponse = {
  code: number
  body: getEbitdaPlanSummaryResponse[] | string
}
