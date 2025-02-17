import { pipe } from "fp-ts/lib/function.js"
import * as t from "io-ts/lib/Decoder.js"

const getGrossMarginForecastRequiredRequest = t.struct({
  "plant-id": t.string,
  "unit-id": t.string,
})

const getGrossMarginForecastOptionalRequest = t.partial({
  "start-fiscal-year": t.number,
  "end-fiscal-year": t.number,
})

export const getGrossMarginForecastRequestDecoder = pipe(
  getGrossMarginForecastRequiredRequest,
  t.intersect(getGrossMarginForecastOptionalRequest),
)
