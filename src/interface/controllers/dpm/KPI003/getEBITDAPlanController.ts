import { Request } from "express"
import { jsonResponseWithErrorHandler } from "../../../decorators.js"
import { OptionalNumber } from "../../tot/v1/utils.js"
import {
  ebitdaPlanDatabaseType,
  getEbitdaPlanAPIResponse,
  getEbitdaPlanRequest,
  getEbitdaPlanResponse,
} from "../../../../domain/entities/dpm/ebitdaPlan.js"
import { readSqlFile } from "./utils.js"
import { QueryTypes, Transaction } from "sequelize"
import { sequelize, wrapInTransaction } from "../../../../infrastructure/orm/sqlize/index.js"

type requestType = getEbitdaPlanRequest
type unitUndefinedRequestType = {
  "plant-id": string
  "unit-id"?: string
  "start-fiscal-year"?: number
  "end-fiscal-year"?: number
}
type responseDataType = getEbitdaPlanResponse
type responseType = getEbitdaPlanAPIResponse
type databaseType = ebitdaPlanDatabaseType

const QUERY = readSqlFile("getEbitdaPlan")

const query = (input: requestType | unitUndefinedRequestType) => {
  let ret = QUERY

  ret =
    input["unit-id"] === undefined
      ? ret.replace("%unitIdFilter%", "TRUE")
      : ret.replace("%unitIdFilter%", "bc.UNIT_CODE = :unitId")

  ret =
    input["start-fiscal-year"] === undefined
      ? ret.replace("%startFiscalYearFilter%", "TRUE")
      : ret.replace("%startFiscalYearFilter%", "bc.FISCAL_YEAR >= :startFiscalYear")

  ret =
    input["end-fiscal-year"] === undefined
      ? ret.replace("%endFiscalYearFilter%", "TRUE")
      : ret.replace("%endFiscalYearFilter%", "bc.FISCAL_YEAR <= :endFiscalYear")

  return ret
}

const dbData = (input: requestType | unitUndefinedRequestType, transaction: Transaction) =>
  sequelize.query<databaseType>(query(input), {
    replacements: {
      plantId: input["plant-id"],
      unitId: input["unit-id"],
      startFiscalYear: input["start-fiscal-year"],
      endFiscalYear: input["end-fiscal-year"],
    },
    transaction,
    type: QueryTypes.SELECT,
    raw: true,
  })

const transform = (dbData: databaseType[]) =>
  dbData.map((x) => ({
    "plant-id": x.PLANT_CODE,
    "unit-id": x.UNIT_CODE,
    "fiscal-year": x.FISCAL_YEAR,
    value: Number(x.VALUE),
  }))

const data = async (input: requestType | unitUndefinedRequestType): Promise<responseDataType[]> =>
  wrapInTransaction((transaction) => dbData(input, transaction)).then(transform)

const controller = async (input: requestType, dataFn = data): Promise<responseType> => {
  return {
    code: 200,
    body: await dataFn(input),
  }
}

const consolidate = (request: Request): requestType => ({
  "plant-id": request.query["plant-id"] as string,
  "unit-id": request.query["unit-id"] as string,
  "start-fiscal-year": OptionalNumber(request.query["start-fiscal-year"]),
  "end-fiscal-year": OptionalNumber(request.query["end-fiscal-year"]),
})

export const consolidateGetEbitdaPlanRequest = consolidate
export const getEbitdaPlan = controller
export const getEbitdaPlanController = jsonResponseWithErrorHandler((x) => controller(consolidate(x) as requestType))
export const getEbitdaPlanFn = data
