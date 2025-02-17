import { pipe } from "fp-ts/lib/function.js"
import * as t from "io-ts/lib/Decoder.js"

const getHeatRatePlanSummaryRequiredRequestDecoder = t.struct({
  "plant-id": t.string,
})

const getHeatRatePlanSummaryOptionalRequestDecoder = t.partial({
  "start-fiscal-year": t.number,
  "end-fiscal-year": t.number,
})

export const getHeatRatePlanSummaryRequestDecoder = pipe(
  getHeatRatePlanSummaryRequiredRequestDecoder,
  t.intersect(getHeatRatePlanSummaryOptionalRequestDecoder),
)
