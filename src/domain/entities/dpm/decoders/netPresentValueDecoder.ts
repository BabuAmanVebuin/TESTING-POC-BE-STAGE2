import { pipe } from "fp-ts/lib/function.js"
import * as t from "io-ts/lib/Decoder.js"

const getNetPresentValueRequiredRequestDecoder = t.struct({
  "plant-id": t.string,
})

const getNetPresentValueOptionalRequestDecoder = t.partial({
  "unit-id": t.string,
  "start-fiscal-year": t.number,
  "end-fiscal-year": t.number,
})

export const getNetPresentValueRequestDecoder = pipe(
  getNetPresentValueRequiredRequestDecoder,
  t.intersect(getNetPresentValueOptionalRequestDecoder),
)
