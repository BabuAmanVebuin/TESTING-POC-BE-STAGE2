import { pipe } from "fp-ts/lib/function.js"
import * as t from "io-ts/lib/Decoder.js"

const getEbitdaForecastRequiredRequestDecoder = t.struct({
  "plant-id": t.string,
  "unit-id": t.string,
})

const getEbitdaForecastOptionalRequestDecoder = t.partial({
  "start-fiscal-year": t.number,
  "end-fiscal-year": t.number,
})

export const getEbitdaForecastRequestDecoder = pipe(
  getEbitdaForecastRequiredRequestDecoder,
  t.intersect(getEbitdaForecastOptionalRequestDecoder),
)
