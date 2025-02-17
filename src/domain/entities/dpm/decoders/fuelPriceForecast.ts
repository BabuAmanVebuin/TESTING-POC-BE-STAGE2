import { pipe } from "fp-ts/lib/function.js"
import * as t from "io-ts/lib/Decoder.js"

/**
 * Decoder for the required fields of the request to
 * retrieve a fuel price forecast from the API.
 */
const getFuelPriceForecastRequiredRequest = t.struct({
  "plant-id": t.string,
})

/**
 * Decoder for the optional fields of the request to
 * retrieve a fuel price forecast from the API.
 */
const getFuelPriceForecastOptionalRequest = t.partial({
  "start-fiscal-year": t.number,
  "end-fiscal-year": t.number,
  limit: t.number,
  offset: t.number,
})

/**
 * Decoder for the complete request to retrieve a fuel price forecast
 * from the API, including both required and optional fields.
 */
export const getFuelPriceForecastRequestDecoder = pipe(
  getFuelPriceForecastRequiredRequest,
  t.intersect(getFuelPriceForecastOptionalRequest),
)

/**
 * Decoder for the request to upsert (create or update) a fuel price forecast.
 * It expects an array of objects with specific fields.
 */
export const upsertFuelPriceForecastRequestDecoder = t.array(
  t.struct({
    "plant-id": t.string,
    "fiscal-year": t.number,
    value: t.nullable(t.number),
    "user-id": t.string,
  }),
)
