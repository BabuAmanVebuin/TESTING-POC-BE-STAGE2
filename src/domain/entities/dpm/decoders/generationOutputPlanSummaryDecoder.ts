import { pipe } from "fp-ts/lib/function.js"
import * as t from "io-ts/lib/Decoder.js"

const getGenerationOutputPlanSummaryRequiredRequestDecoder = t.struct({
  "plant-id": t.string,
})

const getGenerationOutputPlanSummaryOptionalRequestDecoder = t.partial({
  "start-fiscal-year": t.number,
  "end-fiscal-year": t.number,
})

export const getGenerationOutputPlanSummaryRequestDecoder = pipe(
  getGenerationOutputPlanSummaryRequiredRequestDecoder,
  t.intersect(getGenerationOutputPlanSummaryOptionalRequestDecoder),
)
