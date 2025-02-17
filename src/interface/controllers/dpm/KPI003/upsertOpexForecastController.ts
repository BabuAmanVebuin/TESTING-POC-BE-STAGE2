import { Request } from "express"
import { jsonResponseWithErrorHandler } from "../../../decorators.js"
import { QueryTypes, Transaction } from "sequelize"
import { sequelize, wrapInTransaction } from "../../../../infrastructure/orm/sqlize/index.js"
import { readSqlFile } from "./utils.js"
import { upsertOpexForecastRequest, upsertOpexForecastResponse } from "../../../../domain/entities/dpm/opexForecast.js"
import { OpexForecast } from "../../../../domain/models/Opex.js"

const QUERY = readSqlFile("upsertOpexForecast")

type requestType = upsertOpexForecastRequest
type responseType = upsertOpexForecastResponse

const upsertOpexForecastData = (opexForecasts: OpexForecast[], currentDateTime: Date, transaction: Transaction) =>
  sequelize.query(QUERY, {
    replacements: {
      values: opexForecasts.map((x: OpexForecast) => [
        x.plantCode,
        x.unitCode,
        x.fiscalYear,
        x.operationCost,
        x.maintenanceCost,
        currentDateTime,
        currentDateTime,
        x.userId,
        x.userId,
      ]),
    },
    transaction,
    type: QueryTypes.UPSERT,
  })

const transform = (data: requestType): OpexForecast[] =>
  data.map((elt) => {
    return {
      plantCode: elt["plant-id"],
      unitCode: elt["unit-id"],
      fiscalYear: elt["fiscal-year"],
      operationCost: elt["operation-cost"],
      maintenanceCost: elt["maintenance-cost"],
      userId: elt["user-id"],
    }
  })

const data = async (input: requestType): Promise<void> => {
  const currentDateTime = new Date()
  await wrapInTransaction((transaction) => upsertOpexForecastData(transform(input), currentDateTime, transaction))
}

const controller = async (input: requestType, dataFn = data): Promise<responseType> => {
  await dataFn(input)
  return {
    code: 200,
    body: "OK",
  }
}

const consolidate = (request: Request): upsertOpexForecastRequest => {
  if (Array.isArray(request.body)) {
    return request.body.map((x: Record<string, unknown>) => ({
      "plant-id": x["plant-id"] as string,
      "unit-id": x["unit-id"] as string,
      "fiscal-year": Number(x["fiscal-year"]),
      "operation-cost": x["operation-cost"] === null ? null : Number(x["operation-cost"]),
      "maintenance-cost": x["maintenance-cost"] === null ? null : Number(x["maintenance-cost"]),
      "user-id": x["user-id"] as string,
    })) as upsertOpexForecastRequest
  }
  return null as unknown as upsertOpexForecastRequest
}

export const consolidateUpsertOpexForecastRequest = consolidate
export const upsertOpexForecast = controller
export const upsertOpexForecastController = jsonResponseWithErrorHandler((x) =>
  controller(consolidate(x) as requestType),
)
export const upsertOpexForecastFn = data
