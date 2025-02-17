import { pipe } from "fp-ts/lib/function.js"
import * as t from "io-ts/lib/Decoder.js"

const getOpexForecastRequiredRequestDecoder = t.struct({
  "plant-id": t.string,
})

const getOpexForecastOptionalRequestDecoder = t.partial({
  "unit-id": t.string,
  "start-fiscal-year": t.number,
  "end-fiscal-year": t.number,
})

export const getOpexForecastRequestDecoder = pipe(
  getOpexForecastRequiredRequestDecoder,
  t.intersect(getOpexForecastOptionalRequestDecoder),
)

export const upsertOpexForecastRequestDecoder = t.array(
  t.struct({
    "plant-id": t.string,
    "unit-id": t.string,
    "fiscal-year": t.number,
    "operation-cost": t.nullable(t.number),
    "maintenance-cost": t.nullable(t.number),
    "user-id": t.string,
  }),
)
