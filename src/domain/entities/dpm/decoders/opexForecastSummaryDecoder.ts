import { pipe } from "fp-ts/lib/function.js"
import * as t from "io-ts/lib/Decoder.js"

const getOpexForecastSummaryRequiredRequestDecoder = t.struct({
  "plant-id": t.string,
})

const getOpexForecastSummaryOptionalRequestDecoder = t.partial({
  "start-fiscal-year": t.number,
  "end-fiscal-year": t.number,
})

export const getOpexForecastSummaryRequestDecoder = pipe(
  getOpexForecastSummaryRequiredRequestDecoder,
  t.intersect(getOpexForecastSummaryOptionalRequestDecoder),
)
