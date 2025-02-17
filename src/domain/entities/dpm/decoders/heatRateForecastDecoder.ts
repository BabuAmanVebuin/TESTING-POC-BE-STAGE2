import { pipe } from "fp-ts/lib/function.js"
import * as t from "io-ts/lib/Decoder.js"

const getHeatRateForecastRequiredRequestDecoder = t.struct({
  "plant-id": t.string,
  "unit-id": t.string,
})

const getHeatRateForecastOptionalRequestDecoder = t.partial({
  "start-fiscal-year": t.number,
  "end-fiscal-year": t.number,
})

export const getHeatRateForecastRequestDecoder = pipe(
  getHeatRateForecastRequiredRequestDecoder,
  t.intersect(getHeatRateForecastOptionalRequestDecoder),
)
