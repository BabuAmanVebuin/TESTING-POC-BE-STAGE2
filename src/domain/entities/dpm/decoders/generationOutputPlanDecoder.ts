import { pipe } from "fp-ts/lib/function.js"
import * as t from "io-ts/lib/Decoder.js"

const getGenerationOutputPlanRequiredRequestDecoder = t.struct({
  "plant-id": t.string,
})

const getGenerationOutputPlanOptionalRequestDecoder = t.partial({
  "unit-id": t.string,
  "start-fiscal-year": t.number,
  "end-fiscal-year": t.number,
  limit: t.number,
  offset: t.number,
})

export const getGenerationOutputPlanRequestDecoder = pipe(
  getGenerationOutputPlanRequiredRequestDecoder,
  t.intersect(getGenerationOutputPlanOptionalRequestDecoder),
)

export const upsertGenerationOutputPlanRequestDecoder = t.array(
  t.struct({
    "plant-id": t.string,
    "unit-id": t.string,
    "user-id": t.string,
    "fiscal-year": t.number,
    value: t.nullable(t.number),
    "correction-value": t.nullable(t.number),
  }),
)
