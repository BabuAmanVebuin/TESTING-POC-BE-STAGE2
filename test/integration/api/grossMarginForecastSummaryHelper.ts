import { QueryTypes, Transaction } from "sequelize"
import { sequelize } from "../../../src/infrastructure/orm/sqlize/index.js"
import { readSqlFile } from "../sequelize/index.js"

const insertGenerationOutputQuery = readSqlFile("inserts", "insertGenerationOutputForecastForGrossMargin.sql")
const insertFuelPriceQuery = readSqlFile("inserts", "insertFuelPriceForecast.sql")

export const insertGenerationOutputForecastData = async (
  fiscalYears: [number, number, number],
  transaction: Transaction,
): Promise<[number, number]> =>
  sequelize.query(await insertGenerationOutputQuery, {
    replacements: {
      fiscalYear1: fiscalYears[0],
      fiscalYear2: fiscalYears[1],
      fiscalYear3: fiscalYears[2],
    },
    type: QueryTypes.INSERT,
    transaction,
  })

export const insertFuelPriceForecastData = async (
  fiscalYears: [number, number, number],
  transaction: Transaction,
): Promise<[number, number]> =>
  sequelize.query(await insertFuelPriceQuery, {
    replacements: {
      fiscalYear1: fiscalYears[0],
      fiscalYear2: fiscalYears[1],
      fiscalYear3: fiscalYears[2],
    },
    type: QueryTypes.INSERT,
    transaction,
  })
