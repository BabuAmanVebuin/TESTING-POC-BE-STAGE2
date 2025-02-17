import { TypeOf } from "io-ts/lib/Decoder.js"
import { getGrossMarginSummaryRequestDecoder } from "./decoders/grossMarginSummary.js"
import { GenerationOutputSummaryData } from "./generationOutputSummary.js"

export type grossMarginSummaryFromSF = {
  VALUE: number
}

export type grossMarginSummaryData = GenerationOutputSummaryData

export type getGrossMarginSummaryRequest = TypeOf<typeof getGrossMarginSummaryRequestDecoder>

export type getGrossMarginSummaryResponse = {
  code: number
  body: grossMarginSummaryData
}
