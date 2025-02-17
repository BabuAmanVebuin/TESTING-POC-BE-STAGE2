import { QueryTypes, Transaction } from "sequelize"
import { readSqlFile } from "../../sequelize/index.js"
import { sequelize } from "../../../../src/infrastructure/orm/sqlize/index.js"

export type fiscalYearsArrayType = [number, number, number, number, number, number, number, number, number, number]

const insertFuelPriceForecastQuery = readSqlFile("inserts", "beforeUpsertFuelPriceForecast.sql")

export const insertFuelPriceForecast = async (
  fiscalYears: fiscalYearsArrayType,
  transaction: Transaction,
): Promise<[number, number]> =>
  sequelize.query(await insertFuelPriceForecastQuery, {
    replacements: {
      fiscalYear1: fiscalYears[0],
      fiscalYear2: fiscalYears[1],
      fiscalYear3: fiscalYears[2],
      fiscalYear4: fiscalYears[3],
      fiscalYear5: fiscalYears[4],
      fiscalYear6: fiscalYears[5],
      fiscalYear7: fiscalYears[6],
      fiscalYear8: fiscalYears[7],
      fiscalYear9: fiscalYears[8],
      fiscalYear10: fiscalYears[9],
    },
    type: QueryTypes.INSERT,
    transaction,
  })
