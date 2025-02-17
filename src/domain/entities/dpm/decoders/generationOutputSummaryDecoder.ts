import { pipe } from "fp-ts/lib/function.js"
import * as t from "io-ts/lib/Decoder.js"

const getGenerationOutputSummaryRequiredRequestDecoder = t.struct({
  "plant-id": t.string,
})

const getGenerationOutputSummaryOptionalRequestDecoder = t.partial({
  "unit-id": t.string,
  "start-fiscal-year": t.number,
  "end-fiscal-year": t.number,
})

export const getGenerationOutputSummaryRequestDecoder = pipe(
  getGenerationOutputSummaryRequiredRequestDecoder,
  t.intersect(getGenerationOutputSummaryOptionalRequestDecoder),
)
