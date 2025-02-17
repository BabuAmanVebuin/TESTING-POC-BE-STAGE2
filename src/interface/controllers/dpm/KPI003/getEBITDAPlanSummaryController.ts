import { Request } from "express"
import { jsonResponseWithErrorHandler } from "../../../decorators.js"
import { OptionalNumber } from "../../tot/v1/utils.js"
import { readSqlFile } from "./utils.js"
import { QueryTypes, Transaction } from "sequelize"
import { sequelize, wrapInTransaction } from "../../../../infrastructure/orm/sqlize/index.js"
import {
  getEbitdaPlanSummaryRequest,
  getEbitdaPlanSummaryResponse,
  getEbitdaPlanSummaryAPIResponse,
  ebitdaPlanSummaryDatabaseType,
} from "../../../../domain/entities/dpm/ebitdaPlanSummary.js"

type requestType = getEbitdaPlanSummaryRequest
type responseDataType = getEbitdaPlanSummaryResponse
type responseType = getEbitdaPlanSummaryAPIResponse
type databaseType = ebitdaPlanSummaryDatabaseType

const QUERY = readSqlFile("getEbitdaPlanSummary")

const query = (input: requestType) => {
  let ret = QUERY
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

const dbData = (input: requestType, transaction: Transaction) =>
  sequelize.query<databaseType>(query(input), {
    replacements: {
      plantId: input["plant-id"],
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
    "fiscal-year": x.FISCAL_YEAR,
    value: Number(x.VALUE),
  }))

const data = async (input: requestType): Promise<responseDataType[]> =>
  wrapInTransaction((transaction) => dbData(input, transaction)).then(transform)

const controller = async (input: requestType, dataFn = data): Promise<responseType> => {
  return {
    code: 200,
    body: await dataFn(input),
  }
}

const consolidate = (request: Request): requestType => ({
  "plant-id": request.query["plant-id"] as string,
  "start-fiscal-year": OptionalNumber(request.query["start-fiscal-year"]),
  "end-fiscal-year": OptionalNumber(request.query["end-fiscal-year"]),
})

export const consolidateGetEbitdaPlanSummaryRequest = consolidate
export const getEbitdaPlanSummary = controller
export const getEbitdaPlanSummaryController = jsonResponseWithErrorHandler((x) =>
  controller(consolidate(x) as requestType),
)
