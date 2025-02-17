import { pipe } from "fp-ts/lib/function.js"
import * as t from "io-ts/lib/Decoder.js"

const getEbitdaPlanSummaryRequiredRequestDecoder = t.struct({
  "plant-id": t.string,
})

const getEbitdaPlanSummaryOptionalRequestDecoder = t.partial({
  "start-fiscal-year": t.number,
  "end-fiscal-year": t.number,
})

export const getEbitdaPlanSummaryRequestDecoder = pipe(
  getEbitdaPlanSummaryRequiredRequestDecoder,
  t.intersect(getEbitdaPlanSummaryOptionalRequestDecoder),
)
