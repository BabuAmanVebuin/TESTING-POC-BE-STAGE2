import { TypeOf } from "io-ts/lib/Decoder.js"
import { getNetPresentValueRequestDecoder } from "./decoders/netPresentValueDecoder.js"

export type discountRateDbMaster = {
  UNIT_CODE: string
  DISCOUNT_RATE: string
}

export type discountRateMaster = {
  "unit-id": string
  "discount-rate": number
}

export type netPresentValueData = {
  plan: number | null
  forecast: number | null
}

export type getNetPresentValueRequest = TypeOf<typeof getNetPresentValueRequestDecoder>

export type getNetPresentValueResponse = {
  code: number
  body: netPresentValueData
}
