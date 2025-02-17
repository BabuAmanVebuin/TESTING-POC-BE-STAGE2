import { pipe } from "fp-ts/lib/function.js"
import * as t from "io-ts/lib/Decoder.js"

const getOpexPlanSummaryRequiredRequestDecoder = t.struct({
  "plant-id": t.string,
})

const getOpexPlanSummaryOptionalRequestDecoder = t.partial({
  "start-fiscal-year": t.number,
  "end-fiscal-year": t.number,
})

export const getOpexPlanSummaryRequestDecoder = pipe(
  getOpexPlanSummaryRequiredRequestDecoder,
  t.intersect(getOpexPlanSummaryOptionalRequestDecoder),
)
