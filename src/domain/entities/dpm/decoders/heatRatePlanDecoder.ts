import { pipe } from "fp-ts/lib/function.js"
import * as t from "io-ts/lib/Decoder.js"

const getHeatRatePlanRequiredRequestDecoder = t.struct({
  "plant-id": t.string,
  "unit-id": t.string,
})

const getHeatRatePlanOptionalRequestDecoder = t.partial({
  "start-fiscal-year": t.number,
  "end-fiscal-year": t.number,
})

export const getHeatRatePlanRequestDecoder = pipe(
  getHeatRatePlanRequiredRequestDecoder,
  t.intersect(getHeatRatePlanOptionalRequestDecoder),
)
