import { pipe } from "fp-ts/lib/function.js"
import * as t from "io-ts/lib/Decoder.js"

const getGrossMarginSummaryRequiredRequestDecoder = t.struct({
  "plant-id": t.string,
})

const getGrossMarginSummaryOptionalRequestDecoder = t.partial({
  "unit-id": t.string,
  "start-fiscal-year": t.number,
  "end-fiscal-year": t.number,
})

export const getGrossMarginSummaryRequestDecoder = pipe(
  getGrossMarginSummaryRequiredRequestDecoder,
  t.intersect(getGrossMarginSummaryOptionalRequestDecoder),
)
