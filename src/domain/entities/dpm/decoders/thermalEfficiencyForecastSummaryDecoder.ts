import { pipe } from "fp-ts/lib/function.js"
import * as t from "io-ts/lib/Decoder.js"

const getThermalEfficiencyForecastSummaryRequiredRequest = t.struct({
  "plant-id": t.string,
})

const getThermalEfficiencyForecastSummaryOptionalRequest = t.partial({
  "start-fiscal-year": t.number,
  "end-fiscal-year": t.number,
})

export const getThermalEfficiencyForecastSummaryRequestDecoder = pipe(
  getThermalEfficiencyForecastSummaryRequiredRequest,
  t.intersect(getThermalEfficiencyForecastSummaryOptionalRequest),
)
