import { pipe } from "fp-ts/lib/function.js"
import * as t from "io-ts/lib/Decoder.js"

const getHeatRateSummaryRequiredRequestDecoder = t.struct({
  "plant-id": t.string,
})

const getHeatRateSummaryOptionalRequestDecoder = t.partial({
  "unit-id": t.string,
  "start-fiscal-year": t.number,
  "end-fiscal-year": t.number,
})

export const getHeatRateSummaryRequestDecoder = pipe(
  getHeatRateSummaryRequiredRequestDecoder,
  t.intersect(getHeatRateSummaryOptionalRequestDecoder),
)
