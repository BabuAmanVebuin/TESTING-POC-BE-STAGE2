import { QueryTypes, Transaction } from "sequelize"
import {
  fuelPriceDatabaseType,
  getLifeCycleCostRequest,
  snowflakeData,
} from "../../../../../../domain/entities/dpm/lifeCycleCost.js"
import { SnowflakeTransaction, snowflakeSelectWrapper } from "../../../../../../infrastructure/orm/snowflake/index.js"
import { readSqlFile } from "../../utils.js"
import { currentFiscalYear } from "./businessPlanHelper.js"
import { sequelize } from "../../../../../../infrastructure/orm/sqlize/index.js"

const GENERATION_OUTPUT_QUERY = readSqlFile("getSfGenerationOutputForecast")
const SALES_UNIT_PRICE_UNIT_QUERY = readSqlFile("getSfSalesUnitPrice")
const SPREAD_MARKET_UNIT_QUERY = readSqlFile("getSfSpreadMarket")

const FUEL_PRICE_PLAN_QUERY = readSqlFile("getFuelPricePlan")

type requestType = getLifeCycleCostRequest

const sfQuery = (query: string, input: requestType) => {
  let ret = query
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

const query = (input: requestType, query: string) => {
  let ret = query
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

export const getGenerationOutput = async (
  input: requestType,
  snowflakeTransaction: SnowflakeTransaction,
): Promise<snowflakeData[]> =>
  snowflakeSelectWrapper<snowflakeData>(snowflakeTransaction, {
    sqlText: sfQuery(GENERATION_OUTPUT_QUERY, input),
    binds: [
      currentFiscalYear(),
      input["plant-id"],
      input["unit-id"] || "",
      input["start-fiscal-year"] || 0,
      input["end-fiscal-year"] || 0,
    ],
  })

export const getSalesUnitPrice = async (
  input: requestType,
  snowflakeTransaction: SnowflakeTransaction,
): Promise<snowflakeData[]> =>
  snowflakeSelectWrapper<snowflakeData>(snowflakeTransaction, {
    sqlText: sfQuery(SALES_UNIT_PRICE_UNIT_QUERY, input),
    binds: [
      currentFiscalYear(),
      input["plant-id"],
      input["unit-id"] || "",
      input["start-fiscal-year"] || 0,
      input["end-fiscal-year"] || 0,
    ],
  })

export const getSpreadMarket = async (
  input: requestType,
  snowflakeTransaction: SnowflakeTransaction,
): Promise<snowflakeData[]> =>
  snowflakeSelectWrapper<snowflakeData>(snowflakeTransaction, {
    sqlText: sfQuery(SPREAD_MARKET_UNIT_QUERY, input),
    binds: [
      currentFiscalYear(),
      input["plant-id"],
      input["unit-id"] || "",
      input["start-fiscal-year"] || 0,
      input["end-fiscal-year"] || 0,
    ],
  })

export const getFuelPricePlan = async (
  input: requestType,
  transaction: Transaction,
): Promise<fuelPriceDatabaseType[]> =>
  sequelize.query(query(input, FUEL_PRICE_PLAN_QUERY), {
    replacements: {
      plantId: input["plant-id"],
      startFiscalYear: input["start-fiscal-year"],
      endFiscalYear: input["end-fiscal-year"],
    },
    type: QueryTypes.SELECT,
    raw: true,
    transaction,
  })
