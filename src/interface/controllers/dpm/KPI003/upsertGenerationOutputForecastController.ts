import { Request } from "express"
import { jsonResponseWithErrorHandler } from "../../../decorators.js"
import {
  upsertGenerationOutputForecastAPIResponse,
  upsertGenerationOutputForecastRequest,
} from "../../../../domain/entities/dpm/generationOutputForecast.js"
import { QueryTypes, Transaction } from "sequelize"
import { sequelize, wrapInTransaction } from "../../../../infrastructure/orm/sqlize/index.js"
import { readSqlFile } from "./utils.js"
import { GenerationOutputForecast } from "../../../../domain/models/GenerationOutput.js"
const QUERY = readSqlFile("upsertGenerationOutputForecast")
type requestType = upsertGenerationOutputForecastRequest
type responseType = upsertGenerationOutputForecastAPIResponse
const upsertGenerationOutputForecastData = (
  generationOutputForecasts: GenerationOutputForecast[],
  currentDateTime: Date,
  transaction: Transaction,
) =>
  sequelize.query(QUERY, {
    replacements: {
      values: generationOutputForecasts.map((x: GenerationOutputForecast) => [
        x.plantCode,
        x.unitCode,
        x.fiscalYear,
        x.value,
        x.correctionValue,
        currentDateTime,
        currentDateTime,
        x.userId,
        x.userId,
      ]),
    },
    transaction,
    type: QueryTypes.INSERT,
  })

const transform = (data: requestType): GenerationOutputForecast[] =>
  data.map((elt) => {
    return {
      plantCode: elt["plant-id"],
      unitCode: elt["unit-id"],
      fiscalYear: elt["fiscal-year"],
      value: elt.value,
      correctionValue: elt["correction-value"],
      userId: elt["user-id"],
    }
  })

const data = async (input: requestType): Promise<void> => {
  const currentDateTime = new Date()
  await wrapInTransaction((transaction) =>
    upsertGenerationOutputForecastData(transform(input), currentDateTime, transaction),
  )
}

const controller = async (input: requestType, dataFn = data): Promise<responseType> => {
  await dataFn(input)
  return {
    code: 200,
    body: "OK",
  }
}

const consolidate = (request: Request): requestType => {
  if (Array.isArray(request.body)) {
    return request.body.map((x: Record<string, unknown>) => ({
      "plant-id": x["plant-id"] as string,
      "unit-id": x["unit-id"] as string,
      "fiscal-year": Number(x["fiscal-year"]),
      value: x.value === null ? null : Number(x.value),
      "correction-value": x["correction-value"] === null ? null : Number(x["correction-value"]),
      "user-id": x["user-id"] as string,
    })) as requestType
  }
  return null as unknown as requestType
}

export const consolidateUpsertGenerationOutputForecastRequest = consolidate
export const upsertGenerationOutputForecast = controller
export const upsertGenerationOutputForecastController = jsonResponseWithErrorHandler((x) =>
  controller(consolidate(x) as requestType),
)
export const upsertGenerationOutputForecastFn = data
