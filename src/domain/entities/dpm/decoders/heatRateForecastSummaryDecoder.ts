import { pipe } from "fp-ts/lib/function.js"
import * as t from "io-ts/lib/Decoder.js"

const getHeatRateForecastSummaryRequiredRequestDecoder = t.struct({
  "plant-id": t.string,
})

const getHeatRateForecastSummaryOptionalRequestDecoder = t.partial({
  "start-fiscal-year": t.number,
  "end-fiscal-year": t.number,
})

export const getHeatRateForecastSummaryRequestDecoder = pipe(
  getHeatRateForecastSummaryRequiredRequestDecoder,
  t.intersect(getHeatRateForecastSummaryOptionalRequestDecoder),
)
