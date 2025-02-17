import { pipe } from "fp-ts/lib/function.js"
import * as t from "io-ts/lib/Decoder.js"

const getGenerationOutputForecastRequiredRequestDecoder = t.struct({
  "plant-id": t.string,
})

const getGenerationOutputForecastOptionalRequestDecoder = t.partial({
  "unit-id": t.string,
  "start-fiscal-year": t.number,
  "end-fiscal-year": t.number,
})

export const getGenerationOutputForecastRequestDecoder = pipe(
  getGenerationOutputForecastRequiredRequestDecoder,
  t.intersect(getGenerationOutputForecastOptionalRequestDecoder),
)

export const upsertGenerationOutputForecastRequestDecoder = t.array(
  t.struct({
    "plant-id": t.string,
    "unit-id": t.string,
    "fiscal-year": t.number,
    value: t.nullable(t.number),
    "correction-value": t.nullable(t.number),
    "user-id": t.string,
  }),
)
