import { pipe } from "fp-ts/lib/function.js"
import * as t from "io-ts/lib/Decoder.js"

const getLifeCycleCostRequiredRequestDecoder = t.struct({
  "plant-id": t.string,
})

const getLifeCycleCostOptionalRequestDecoder = t.partial({
  "unit-id": t.string,
  "start-fiscal-year": t.number,
  "end-fiscal-year": t.number,
})

export const getLifeCycleCostRequestDecoder = pipe(
  getLifeCycleCostRequiredRequestDecoder,
  t.intersect(getLifeCycleCostOptionalRequestDecoder),
)
