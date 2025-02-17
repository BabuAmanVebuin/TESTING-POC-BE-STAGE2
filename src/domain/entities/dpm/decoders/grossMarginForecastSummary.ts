import { pipe } from "fp-ts/lib/function.js"
import * as t from "io-ts/lib/Decoder.js"

const getGrossMarginForecastSummaryRequiredRequest = t.struct({
  "plant-id": t.string,
})

const getGrossMarginForecastSummaryOptionalRequest = t.partial({
  "start-fiscal-year": t.number,
  "end-fiscal-year": t.number,
})

export const getGrossMarginForecastSummaryRequestDecoder = pipe(
  getGrossMarginForecastSummaryRequiredRequest,
  t.intersect(getGrossMarginForecastSummaryOptionalRequest),
)
