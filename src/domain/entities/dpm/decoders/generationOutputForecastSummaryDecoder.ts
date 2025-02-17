import { pipe } from "fp-ts/lib/function.js"
import * as t from "io-ts/lib/Decoder.js"

const getGenerationOutputForecastSummaryRequiredRequestDecoder = t.struct({
  "plant-id": t.string,
})

const getGenerationOutputForecastSummaryOptionalRequestDecoder = t.partial({
  "start-fiscal-year": t.number,
  "end-fiscal-year": t.number,
})

export const getGenerationOutputForecastSummaryRequestDecoder = pipe(
  getGenerationOutputForecastSummaryRequiredRequestDecoder,
  t.intersect(getGenerationOutputForecastSummaryOptionalRequestDecoder),
)
