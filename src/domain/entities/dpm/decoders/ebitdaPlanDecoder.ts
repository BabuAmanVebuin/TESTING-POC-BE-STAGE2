import { pipe } from "fp-ts/lib/function.js"
import * as t from "io-ts/lib/Decoder.js"

const getEbitdaPlanRequiredRequestDecoder = t.struct({
  "plant-id": t.string,
  "unit-id": t.string,
})

const getEbitdaPlanOptionalRequestDecoder = t.partial({
  "start-fiscal-year": t.number,
  "end-fiscal-year": t.number,
})

export const getEbitdaPlanRequestDecoder = pipe(
  getEbitdaPlanRequiredRequestDecoder,
  t.intersect(getEbitdaPlanOptionalRequestDecoder),
)
