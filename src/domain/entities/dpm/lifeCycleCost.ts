import { TypeOf } from "io-ts/lib/Decoder.js"
import { getLifeCycleCostRequestDecoder } from "./decoders/lifeCycleCost.js"

export type snowflakeData = {
  PLANT_CODE: string
  UNIT_CODE: string
  FISCAL_YEAR: number
  VALUE: number
}

export type dataTypeFromSnowflake = {
  "fiscal-year": number
  value: number
}

export type basicDataType = {
  "plant-id": string
  "unit-id": string
  "fiscal-year": number
  value: number | null
}

export type basicDatabaseType = {
  PLANT_ID: string
  UNIT_ID: string
  FISCAL_YEAR: number
  VALUE: number
}

export type fuelPriceDatabaseType = {
  PLANT_CODE: string
  FISCAL_YEAR: number
  VALUE: number
}

export type lifeCycleCostData = {
  plan: number | null
  forecast: number | null
}

export type getLifeCycleCostRequest = TypeOf<typeof getLifeCycleCostRequestDecoder>

export type getLifeCycleCostResponse = {
  code: number
  body: lifeCycleCostData
}
