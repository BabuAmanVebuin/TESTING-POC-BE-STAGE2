import { pipe } from "fp-ts/lib/function.js"
import * as t from "io-ts/lib/Decoder.js"

const getThermalEfficiencyPlanSummaryRequiredRequest = t.struct({
  "plant-id": t.string,
})

const getThermalEfficiencyPlanSummaryOptionalRequest = t.partial({
  "start-fiscal-year": t.number,
  "end-fiscal-year": t.number,
})

export const getThermalEfficiencyPlanSummaryRequestDecoder = pipe(
  getThermalEfficiencyPlanSummaryRequiredRequest,
  t.intersect(getThermalEfficiencyPlanSummaryOptionalRequest),
)
