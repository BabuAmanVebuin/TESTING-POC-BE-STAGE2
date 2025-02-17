import { pipe } from "fp-ts/lib/function.js"
import * as t from "io-ts/lib/Decoder.js"

const getEbitdaSummaryRequiredRequestDecoder = t.struct({
  "plant-id": t.string,
})

const getEbitdaSummaryOptionalRequestDecoder = t.partial({
  "unit-id": t.string,
  "start-fiscal-year": t.number,
  "end-fiscal-year": t.number,
})

export const getEbitdaSummaryRequestDecoder = pipe(
  getEbitdaSummaryRequiredRequestDecoder,
  t.intersect(getEbitdaSummaryOptionalRequestDecoder),
)
