import { pipe } from "fp-ts/lib/function.js"
import * as t from "io-ts/lib/Decoder.js"

const getOpexPlanRequiredRequestDecoder = t.struct({
  "plant-id": t.string,
})

const getOpexPlanOptionalRequestDecoder = t.partial({
  "unit-id": t.string,
  "start-fiscal-year": t.number,
  "end-fiscal-year": t.number,
})

export const getOpexPlanRequestDecoder = pipe(
  getOpexPlanRequiredRequestDecoder,
  t.intersect(getOpexPlanOptionalRequestDecoder),
)

export const upsertOpexPlanRequestDecoder = t.array(
  t.struct({
    "plant-id": t.string,
    "unit-id": t.string,
    "fiscal-year": t.number,
    "operation-cost": t.nullable(t.number),
    "maintenance-cost": t.nullable(t.number),
    "user-id": t.string,
  }),
)
