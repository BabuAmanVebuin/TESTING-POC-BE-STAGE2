import { Request } from "express"
import { jsonResponseWithErrorHandler } from "../../../decorators.js"
import { OptionalNumber } from "../../tot/v1/utils.js"
import {
  generationOutputForecastDbType,
  generationOutputForecastSnowflakeType,
  getGenerationOutputForecastAPIResponse,
  getGenerationOutputForecastRequest,
  getGenerationOutputForecastResponse,
} from "../../../../domain/entities/dpm/generationOutputForecast.js"
import { QueryTypes, Transaction } from "sequelize"
import { sequelize, wrapInTransaction } from "../../../../infrastructure/orm/sqlize/index.js"
import { readSqlFile } from "./utils.js"
import {
  SnowflakeTransaction,
  snowflakeSelectWrapper,
  wrapInSnowflakeTransaction,
} from "../../../../infrastructure/orm/snowflake/index.js"
import { currentFiscalYear } from "./helper/businessPlan/businessPlanHelper.js"

const QUERY = readSqlFile("getGenerationOuputForecast")
const SF_QUERY = readSqlFile("getSfGenerationOutputForecast")

type requestType = getGenerationOutputForecastRequest
type responseType = getGenerationOutputForecastAPIResponse
type responseDataType = getGenerationOutputForecastResponse

// type responseDataType = getGenetationOutputForecastRespons
type databaseType = generationOutputForecastDbType
type snowflakeType = generationOutputForecastSnowflakeType

const query = (input: requestType) => {
  let ret = QUERY
  ret =
    input["unit-id"] === undefined
      ? ret.replace("%unitIdFilter%", "TRUE")
      : ret.replace("%unitIdFilter%", "UNIT_CODE = :unitId")

  ret =
    input["start-fiscal-year"] === undefined
      ? ret.replace("%startFiscalYearFilter%", "TRUE")
      : ret.replace("%startFiscalYearFilter%", "FISCAL_YEAR >= :startFiscalYear")

  ret =
    input["end-fiscal-year"] === undefined
      ? ret.replace("%endFiscalYearFilter%", "TRUE")
      : ret.replace("%endFiscalYearFilter%", "FISCAL_YEAR <= :endFiscalYear")

  return ret
}

const getGenerationOutputForecastData = (input: requestType, transaction: Transaction) =>
  sequelize.query<databaseType>(query(input), {
    replacements: {
      plantId: input["plant-id"],
      unitId: input["unit-id"],
      startFiscalYear: input["start-fiscal-year"],
      endFiscalYear: input["end-fiscal-year"],
      currentFiscalYear: currentFiscalYear(),
    },
    transaction,
    type: QueryTypes.SELECT,
    raw: true,
  })

const transform = (data: databaseType[]) =>
  data.map((x) => ({
    "plant-id": x.PLANT_CODE,
    "unit-id": x.UNIT_CODE,
    "fiscal-year": x.FISCAL_YEAR,
    value: x.VALUE !== null ? Number(x.VALUE) : null,
    "correction-value": x.CORRECTION_VALUE !== null ? Number(x.CORRECTION_VALUE) : null,
    sum: Number(x.SUM),
  }))

const sfQuery = (input: requestType) => {
  let ret = SF_QUERY
  ret =
    input["unit-id"] === undefined
      ? ret.replace("%unitIdFilter%", "TRUE")
      : ret.replace("%unitIdFilter%", "cr.UNIT_CODE = :3")

  ret =
    input["start-fiscal-year"] === undefined
      ? ret.replace("%startFiscalYearFilter%", "TRUE")
      : ret.replace("%startFiscalYearFilter%", "cr.FISCAL_YEAR >= :4")

  ret =
    input["end-fiscal-year"] === undefined
      ? ret.replace("%endFiscalYearFilter%", "TRUE")
      : ret.replace("%endFiscalYearFilter%", "cr.FISCAL_YEAR <= :5")

  return ret
}

const getGenerationOutputForecastSfData = (
  input: requestType,
  snowflakeTransaction: SnowflakeTransaction,
): Promise<snowflakeType[]> =>
  snowflakeSelectWrapper<snowflakeType>(snowflakeTransaction, {
    sqlText: sfQuery(input),
    binds: [
      currentFiscalYear(),
      input["plant-id"],
      input["unit-id"] || "",
      input["start-fiscal-year"] || "",
      input["end-fiscal-year"] || "",
    ],
  })

const transformSf = (data: snowflakeType[]) =>
  data.map((x) => ({
    "plant-id": x.PLANT_CODE,
    "unit-id": x.UNIT_CODE,
    "fiscal-year": x.FISCAL_YEAR,
    value: null,
    "correction-value": null,
    sum: Math.trunc(x.VALUE / 10) / 100, // convert value into GWh from MWh & trunc the value to two decimal place
  }))

const data = async (input: requestType): Promise<responseDataType[]> => {
  const [databaseData, snowflakeData] = await Promise.all([
    wrapInTransaction((transaction) => getGenerationOutputForecastData(input, transaction).then(transform)),
    wrapInSnowflakeTransaction((snowflakeTransaction) =>
      getGenerationOutputForecastSfData(input, snowflakeTransaction).then(transformSf),
    ),
  ])
  return [databaseData, snowflakeData].flat()
}

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

export const consolidateGetGenerationOutputForecastRequest = consolidate
export const getGenerationOutputForecast = controller
export const getGenerationOutputForecastController = jsonResponseWithErrorHandler((x) =>
  controller(consolidate(x) as requestType),
)
export const getGenerationOutputForecastFn = data
