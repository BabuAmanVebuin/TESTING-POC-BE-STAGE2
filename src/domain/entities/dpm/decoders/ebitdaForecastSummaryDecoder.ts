import { pipe } from "fp-ts/lib/function.js"
import * as t from "io-ts/lib/Decoder.js"

const getEbitdaForecastSummaryRequiredRequestDecoder = t.struct({
  "plant-id": t.string,
})

const getEbitdaForecastSummaryOptionalRequestDecoder = t.partial({
  "start-fiscal-year": t.number,
  "end-fiscal-year": t.number,
})

export const getEbitdaForecastSummaryRequestDecoder = pipe(
  getEbitdaForecastSummaryRequiredRequestDecoder,
  t.intersect(getEbitdaForecastSummaryOptionalRequestDecoder),
)
