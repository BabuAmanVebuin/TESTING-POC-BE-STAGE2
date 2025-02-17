import { QueryTypes, Transaction } from "sequelize"
import { sequelize } from "../../../src/infrastructure/orm/sqlize/index.js"
import { readSqlFile } from "../sequelize/index.js"

const insertBasicChargeQuery = readSqlFile("inserts", "insertBasicChargeForecast.sql")
const insertOpexQuery = readSqlFile("inserts", "insertOpexForecastForEBIDTA.sql")

export const insertBasicChargeForecastData = async (
  fiscalYears: [number, number, number],
  transaction: Transaction,
): Promise<[number, number]> =>
  sequelize.query(await insertBasicChargeQuery, {
    replacements: {
      fiscalYear1: fiscalYears[0],
      fiscalYear2: fiscalYears[1],
      fiscalYear3: fiscalYears[2],
    },
    type: QueryTypes.INSERT,
    transaction,
  })

export const insertOpexForecastData = async (
  fiscalYears: [number, number, number],
  transaction: Transaction,
): Promise<[number, number]> =>
  sequelize.query(await insertOpexQuery, {
    replacements: {
      fiscalYear1: fiscalYears[0],
      fiscalYear2: fiscalYears[1],
      fiscalYear3: fiscalYears[2],
    },
    type: QueryTypes.INSERT,
    transaction,
  })
