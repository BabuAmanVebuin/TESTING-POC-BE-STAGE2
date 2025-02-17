import { QueryTypes, Transaction } from "sequelize"
import { sequelize } from "../../../../src/infrastructure/orm/sqlize/index.js"

export const opexForecastTest = async (
  query: Promise<string>,
  fiscalYears: number[],
  transaction: Transaction,
): Promise<[number, number]> => {
  const replacements: any = {}
  fiscalYears.forEach((fiscalYear: number, idx) => {
    replacements[`fiscalYear${idx + 1}`] = fiscalYear
  })
  return sequelize.query(await query, {
    replacements: replacements,
    type: QueryTypes.INSERT,
    transaction,
  })
}
