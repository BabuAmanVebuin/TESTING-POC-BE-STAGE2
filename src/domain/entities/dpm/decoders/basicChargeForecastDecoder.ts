import { pipe } from "fp-ts/lib/function.js"
import * as t from "io-ts/lib/Decoder.js"

/**
 * Decoder for the required fields of the request to
 * retrieve a basic charge forecast from the API.
 */
const getBasicChargeForecastRequiredRequestDecoder = t.struct({
  "plant-id": t.string,
})

/**
 * Decoder for the optional fields of the request to
 * retrieve a basic charge forecast from the API.
 */
const getBasicChargeForecastOptionalRequestDecoder = t.partial({
  "unit-id": t.string,
  "start-fiscal-year": t.number,
  "end-fiscal-year": t.number,
})

/**
 * Decoder for the complete request to retrieve a basic charge forecast
 * from the API, including both required and optional fields.
 */
export const getBasicChargeForecastRequestDecoder = pipe(
  getBasicChargeForecastRequiredRequestDecoder,
  t.intersect(getBasicChargeForecastOptionalRequestDecoder),
)

/**
 * Decoder for the request to upsert (create or update) a basic charge forecast.
 * It expects an array of objects with specific fields.
 */
export const upsertBasicChargeForecastRequestDecoder = t.array(
  t.struct({
    "plant-id": t.string,
    "unit-id": t.string,
    "fiscal-year": t.number,
    "operation-input": t.nullable(t.number),
    "maintenance-input": t.nullable(t.number),
    "user-id": t.string,
  }),
)
