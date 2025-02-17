import { pipe } from "fp-ts/lib/function.js"
import * as t from "io-ts/lib/Decoder.js"

/**
 * Decoder for the required fields of the request to
 * retrieve a basic charge forecast summary from the API.
 */
const getBasicChargeForecastSummaryRequiredRequestDecoder = t.struct({
  "plant-id": t.string,
})

/**
 * Decoder for the optional fields of the request to
 * retrieve a basic charge forecast summary from the API.
 */
const getBasicChargeForecastSummaryOptionalRequestDecoder = t.partial({
  "start-fiscal-year": t.number,
  "end-fiscal-year": t.number,
})

/**
 * Decoder for the complete request to retrieve a basic charge forecast summary
 * from the API, including both required and optional fields.
 */
export const getBasicChargeForecastSummaryRequestDecoder = pipe(
  getBasicChargeForecastSummaryRequiredRequestDecoder,
  t.intersect(getBasicChargeForecastSummaryOptionalRequestDecoder),
)
