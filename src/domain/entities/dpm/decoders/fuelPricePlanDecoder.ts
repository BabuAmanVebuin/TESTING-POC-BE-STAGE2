import { pipe } from "fp-ts/lib/function.js"
import * as t from "io-ts/lib/Decoder.js"

/**
 * Decoder for the required fields of the request to
 * retrieve a fuel price plan from the API.
 */
const getFuelPricePlanRequiredRequest = t.struct({
  "plant-id": t.string,
})

/**
 * Decoder for the optional fields of the request to
 * retrieve a fuel price plan from the API.
 */
const getFuelPricePlanOptionalRequest = t.partial({
  "start-fiscal-year": t.number,
  "end-fiscal-year": t.number,
})

/**
 * Decoder for the complete request to retrieve a fuel price plan
 * from the API, including both required and optional fields.
 */
export const getFuelPricePlanRequestDecoder = pipe(
  getFuelPricePlanRequiredRequest,
  t.intersect(getFuelPricePlanOptionalRequest),
)

/**
 * Decoder for the request to upsert (create or update) a fuel price plan.
 * It expects an array of objects with specific fields.
 */
export const upsertFuelPricePlanRequestDecoder = t.array(
  t.struct({
    "plant-id": t.string,
    "fiscal-year": t.number,
    value: t.nullable(t.number),
    "user-id": t.string,
  }),
)
