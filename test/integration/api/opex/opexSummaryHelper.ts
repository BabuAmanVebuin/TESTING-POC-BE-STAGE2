import { QueryTypes, Transaction } from "sequelize"
import { readSqlFile } from "../../sequelize/index.js"
import { sequelize } from "../../../../src/infrastructure/orm/sqlize/index.js"

const insertOpexQuery = readSqlFile("inserts", "beforeGetOpexSummary.sql")

export const beforeOpexSummaryTest = async (
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
