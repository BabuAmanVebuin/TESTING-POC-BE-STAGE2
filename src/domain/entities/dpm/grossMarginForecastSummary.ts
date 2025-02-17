import * as t from "io-ts/lib/Decoder.js"

import { getGrossMarginForecastSummaryRequestDecoder } from "./decoders/grossMarginForecastSummary.js"

export type getGrossMarginForecastSummaryRequest = t.TypeOf<typeof getGrossMarginForecastSummaryRequestDecoder>

export type grossMarginForecastSummarySnowflakeType = {
  PLANT_CODE: string
  FISCAL_YEAR: number
  VALUE: number
}

export type getGrossMarginForecastSummaryResponse = {
  "plant-id": string
  "fiscal-year": number
  value: number
}

export type getGrossMarginForecastSummaryAPIResponse = {
  code: number
  body: getGrossMarginForecastSummaryResponse[] | string
}
