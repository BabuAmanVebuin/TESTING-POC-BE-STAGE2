import { QueryTypes, Transaction } from "sequelize"
import { readSqlFile } from "../../sequelize/index.js"
import { sequelize } from "../../../../src/infrastructure/orm/sqlize/index.js"

const insertHeatRateQuery = readSqlFile("inserts", "insertHeatRateForecast.sql")
const insertGenerationOutputForecastQuery = readSqlFile(
  "inserts",
  "insertGenerationOutputForecastForHeatRateForecastSummary.sql",
)

export const insertHeatRateForecastData = async (
  fiscalYears: [number, number, number],
  transaction: Transaction,
): Promise<[number, number]> =>
  sequelize.query(await insertHeatRateQuery, {
    replacements: {
      fiscalYear1: fiscalYears[0],
      fiscalYear2: fiscalYears[1],
      fiscalYear3: fiscalYears[2],
    },
    type: QueryTypes.INSERT,
    transaction,
  })

export const insertGenerationOutputForecastDataForHeatRate = async (
  fiscalYears: [number, number, number],
  transaction: Transaction,
): Promise<[number, number]> =>
  sequelize.query(await insertGenerationOutputForecastQuery, {
    replacements: {
      fiscalYear1: fiscalYears[0],
      fiscalYear2: fiscalYears[1],
      fiscalYear3: fiscalYears[2],
    },
    type: QueryTypes.INSERT,
    transaction,
  })
