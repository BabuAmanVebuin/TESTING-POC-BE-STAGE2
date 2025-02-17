import * as t from "io-ts/lib/Decoder.js"

export const getSalesPriceRequestRequiredDecoder = t.struct({
  plantId: t.string,
  unitId: t.string,
  fiscalYear: t.string,
})
