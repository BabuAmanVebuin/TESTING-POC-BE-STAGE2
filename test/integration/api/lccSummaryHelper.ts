import { QueryTypes, Transaction } from "sequelize"
import { sequelize } from "../../../src/infrastructure/orm/sqlize/index.js"
import { readSqlFile } from "../sequelize/index.js"

const insertGenerationOutputForecastQuery = readSqlFile("inserts", "insertGenerationOutputForecastForLcc.sql")
const insertFuelPriceForecastQuery = readSqlFile("inserts", "insertFuelPriceForecastForLcc.sql")

const insertOpexForecastQuery = readSqlFile("inserts", "insertOpexForecastForLcc.sql")

const insertGenerationOutputPlanQuery = readSqlFile("inserts", "insertGenerationOutputPlanForLcc.sql")
const insertFuelPricePlanQuery = readSqlFile("inserts", "insertFuelPricePlanForLcc.sql")

const insertOpexPlanQuery = readSqlFile("inserts", "insertOpexPlanForLcc.sql")

export const insertGenerationOutputForecastData = async (
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

export const insertFuelPriceForecastData = async (
  fiscalYears: [number, number, number],
  transaction: Transaction,
): Promise<[number, number]> =>
  sequelize.query(await insertFuelPriceForecastQuery, {
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
  sequelize.query(await insertOpexForecastQuery, {
    replacements: {
      fiscalYear1: fiscalYears[0],
      fiscalYear2: fiscalYears[1],
      fiscalYear3: fiscalYears[2],
    },
    type: QueryTypes.INSERT,
    transaction,
  })

export const insertGenerationOutputPlanData = async (
  fiscalYears: [number, number, number],
  transaction: Transaction,
): Promise<[number, number]> =>
  sequelize.query(await insertGenerationOutputPlanQuery, {
    replacements: {
      fiscalYear1: fiscalYears[0],
      fiscalYear2: fiscalYears[1],
      fiscalYear3: fiscalYears[2],
    },
    type: QueryTypes.INSERT,
    transaction,
  })

export const insertFuelPricePlanData = async (
  fiscalYears: [number, number, number],
  transaction: Transaction,
): Promise<[number, number]> =>
  sequelize.query(await insertFuelPricePlanQuery, {
    replacements: {
      fiscalYear1: fiscalYears[0],
      fiscalYear2: fiscalYears[1],
      fiscalYear3: fiscalYears[2],
    },
    type: QueryTypes.INSERT,
    transaction,
  })

export const insertOpexPlanData = async (
  fiscalYears: [number, number, number],
  transaction: Transaction,
): Promise<[number, number]> =>
  sequelize.query(await insertOpexPlanQuery, {
    replacements: {
      fiscalYear1: fiscalYears[0],
      fiscalYear2: fiscalYears[1],
      fiscalYear3: fiscalYears[2],
    },
    type: QueryTypes.INSERT,
    transaction,
  })
