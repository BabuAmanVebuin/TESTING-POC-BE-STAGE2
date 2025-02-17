import { pipe } from "fp-ts/lib/function.js"
import * as t from "io-ts/lib/Decoder.js"

/**
 * Decoder for required request parameters of the basic charge plan summary API
 */
const getBasicChargePlanPlanSummaryRequiredRequestDecoder = t.struct({
  "plant-id": t.string,
})

/**
 * Decoder for optional request parameters of the basic charge plan summary API
 */
const getBasicChargePlanPlanSummaryOptionalRequestDecoder = t.partial({
  "start-fiscal-year": t.number,
  "end-fiscal-year": t.number,
})

/**
 * Combined decoder for the complete request parameters of the basic charge plan summary API
 * It includes both required and optional parameters
 */
export const getBasicChargePlanPlanSummaryRequestDecoder = pipe(
  getBasicChargePlanPlanSummaryRequiredRequestDecoder,
  t.intersect(getBasicChargePlanPlanSummaryOptionalRequestDecoder),
)
