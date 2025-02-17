import { pipe } from "fp-ts/lib/function.js"
import * as t from "io-ts/lib/Decoder.js"

const getThermalEfficiencyForecastRequiredRequest = t.struct({
  "plant-id": t.string,
})

const putThermalEfficiencyForecastRequiredRequest = t.struct({
  "plant-id": t.string,
  "unit-id": t.string,
  "fiscal-year": t.number,
  "correction-value": t.nullable(t.number),
  "user-id": t.string,
})

const getThermalEfficiencyForecastOptionalRequest = t.partial({
  "start-fiscal-year": t.number,
  "end-fiscal-year": t.number,
})

export const getThermalEfficiencyForecastRequestDecoder = pipe(
  getThermalEfficiencyForecastRequiredRequest,
  t.intersect(getThermalEfficiencyForecastOptionalRequest),
)

export const putThermalEfficiencyForecastRequestDecoder = t.array(putThermalEfficiencyForecastRequiredRequest)
