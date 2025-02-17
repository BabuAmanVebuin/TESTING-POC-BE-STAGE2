import { Request } from "express"
import {
  putThermalEfficiencyForecastAPIResponse,
  putThermalEfficiencyForecastRequest,
} from "../../../../domain/entities/dpm/thermalEfficiencyForecast.js"
import { jsonResponseWithErrorHandler } from "../../../decorators.js"
import { sequelize, wrapInTransaction } from "../../../../infrastructure/orm/sqlize/index.js"
import { readSqlFile } from "./utils.js"
import { QueryTypes } from "sequelize"
import pkg from "lodash"
const { isArray } = pkg

type requestType = putThermalEfficiencyForecastRequest
type responseType = putThermalEfficiencyForecastAPIResponse

const QUERY = readSqlFile("upsertThermalEfficiencyForecast")

const data = (input: requestType) =>
  wrapInTransaction((transaction) =>
    sequelize.query(QUERY, {
      replacements: {
        values: input.map((x) => [
          x["plant-id"],
          x["unit-id"],
          x["fiscal-year"],
          x["correction-value"],
          x["user-id"],
          x["user-id"],
        ]),
      },
      raw: true,
      type: QueryTypes.UPSERT,
      transaction,
    }),
  )

const controller = async (input: requestType, dataFn = data): Promise<responseType> => {
  await dataFn(input)
  return {
    code: 200,
    body: "OK",
  }
}

const consolidate = (request: Request): requestType => {
  if (isArray(request.body)) {
    return request.body.map((x) => ({
      "plant-id": x["plant-id"],
      "unit-id": x["unit-id"],
      "fiscal-year": x["fiscal-year"],
      "correction-value": x["correction-value"] === null ? null : Number(x["correction-value"]),
      "user-id": x["user-id"],
    }))
  }
  return null as unknown as requestType
}

export const consolidatePutThermalEfficiencyForecastRequest = consolidate
export const putThermalEfficiencyForecast = controller
export const putThermalEfficiencyForecastController = jsonResponseWithErrorHandler((x) =>
  controller(consolidate(x) as requestType),
)
