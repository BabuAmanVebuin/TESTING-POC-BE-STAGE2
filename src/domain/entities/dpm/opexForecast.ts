import * as t from "io-ts/lib/Decoder.js"

import { getOpexForecastRequestDecoder, upsertOpexForecastRequestDecoder } from "./decoders/opexForecastDecoder.js"

export type getOpexForecastRequest = t.TypeOf<typeof getOpexForecastRequestDecoder>

export type globalSnowflakeType = {
  PLANT_CODE: string
  UNIT_CODE: string
  FISCAL_YEAR: number
  OPERATION_COST: number | null
  MAINTENANCE_COST: number | null
  VALUE: number
}

export type opexForecastDbType = {
  PLANT_CODE: string
  UNIT_CODE: string
  FISCAL_YEAR: number
  OPERATION_COST: number | null
  MAINTENANCE_COST: number | null
  SUM: number
}

export type opexForecastSnowflakeType = {
  FISCAL_YEAR: number
  PLANT_CODE: string
  UNIT_CODE: string
  VALUE: number
}

export type operationCostForecastSnowflakeType = {
  FISCAL_YEAR: number
  PLANT_CODE: string
  UNIT_CODE: string
  OPERATION_COST: number | null
}

export type maintenanceCostForecastSnowflakeType = {
  FISCAL_YEAR: number
  PLANT_CODE: string
  UNIT_CODE: string
  MAINTENANCE_COST: number | null
}

export type getOpexForecastResponse = {
  "plant-id": string
  "unit-id": string
  "fiscal-year": number
  "operation-cost": number | null
  "maintenance-cost": number | null
  sum: number
}

export type getOpexForecastAPIResponse = {
  code: number
  body: getOpexForecastResponse[] | string
}

export type upsertOpexForecastRequest = t.TypeOf<typeof upsertOpexForecastRequestDecoder>

export type upsertOpexForecastResponse = {
  code: number
  body: string
}
