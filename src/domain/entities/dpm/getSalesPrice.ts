import * as t from "io-ts/lib/Decoder.js"

import { getSalesPriceRequestRequiredDecoder } from "./decoders/getSalesPriceDecoder.js"

export type getSalesPriceRequest = t.TypeOf<typeof getSalesPriceRequestRequiredDecoder>

export type salesUnitPrice = {
  DAY: string
  FORECAST_CATEGORY: string
  AVG_SALES_UNITPRICE: number
}

export type salesPriceAPIResponse = {
  code: number
  body: salesPriceResponse | string
}

export type salesPriceResponse = {
  PLANT_CODE: string
  UNIT_CODE: string
  SUFFIX: string
  SALES: salesUnitPrice[]
}
