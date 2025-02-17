import { pipe } from "fp-ts/lib/function.js"
import * as t from "io-ts/lib/Decoder.js"

const getOpexSummaryRequiredRequestDecoder = t.struct({
  "plant-id": t.string,
})

const getOpexSummaryOptionalRequestDecoder = t.partial({
  "unit-id": t.string,
  "start-fiscal-year": t.number,
  "end-fiscal-year": t.number,
})

export const getOpexSummaryRequestDecoder = pipe(
  getOpexSummaryRequiredRequestDecoder,
  t.intersect(getOpexSummaryOptionalRequestDecoder),
)
