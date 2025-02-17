import { QueryTypes, Transaction } from "sequelize"
import { readSqlFile } from "../../utils.js"
import {
  basicChargeForecastDbType,
  ebitdaForecastSnowflakeType,
} from "../../../../../../domain/entities/dpm/ebitdaForecast.js"
import { SnowflakeTransaction, snowflakeSelectWrapper } from "../../../../../../infrastructure/orm/snowflake/index.js"
import { currentFiscalYear } from "./businessPlanHelper.js"
import { sequelize } from "../../../../../../infrastructure/orm/sqlize/index.js"
import { getEbitdaForecastSummaryRequest } from "../../../../../../domain/entities/dpm/ebitdaForecastSummary.js"

const QUERY = readSqlFile("getBasicChargeForecast")
const SF_QUERY = readSqlFile("getSfEbitdaForecast")
const SF_SUMMARY_QUERY = readSqlFile("getSfEbitdaForecastSummary")

type requestType = {
  "plant-id": string
  "unit-id"?: string
  "start-fiscal-year"?: number
  "end-fiscal-year"?: number
}
type requestSummaryType = getEbitdaForecastSummaryRequest

type basicChargeDbType = basicChargeForecastDbType
type snowflakeType = ebitdaForecastSnowflakeType

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

export const getBasicChargForecastData = (
  input: requestType,
  transaction: Transaction,
): Promise<basicChargeDbType[]> => {
  return sequelize.query<basicChargeDbType>(query(input), {
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
}

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

const sfPlantQuery = (input: requestSummaryType) => {
  let ret = SF_SUMMARY_QUERY
  ret =
    input["start-fiscal-year"] === undefined
      ? ret.replace("%startFiscalYearFilter%", "TRUE")
      : ret.replace("%startFiscalYearFilter%", "cr.FISCAL_YEAR >= :3")

  ret =
    input["end-fiscal-year"] === undefined
      ? ret.replace("%endFiscalYearFilter%", "TRUE")
      : ret.replace("%endFiscalYearFilter%", "cr.FISCAL_YEAR <= :4")

  return ret
}

export const getEbitdaForecastSfData = (
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

export const getEbitdaForecastSummarySfData = (
  input: requestSummaryType,
  snowflakeTransaction: SnowflakeTransaction,
): Promise<snowflakeType[]> =>
  snowflakeSelectWrapper<snowflakeType>(snowflakeTransaction, {
    sqlText: sfPlantQuery(input),
    binds: [currentFiscalYear(), input["plant-id"], input["start-fiscal-year"] || "", input["end-fiscal-year"] || ""],
  })
