import { QueryTypes, Transaction } from "sequelize"
import { sequelize, wrapInTransaction } from "../../orm/sqlize/index.js"
import { FuelPriceRepositoryPort } from "../../../application/port/FuelPriceRepositoryPort.js"
import { FuelPriceForecast, FuelPricePlan } from "../../../domain/models/FuelPrice.js"
import { fuelPricePlanDbType } from "../../../domain/entities/dpm/fuelPricePlan.js"
import { FuelPricePlanFilters } from "../../../domain/entities/dpm/fuelPricePlan.js"

/**
 * Generates a fiscal year filter string for a query based on optional start and end fiscal years.
 *
 * @param startFiscalYear - Optional start fiscal year for filtering.
 * @param endFiscalYear - Optional end fiscal year for filtering.
 * @returns The fiscal year filter string to be used in a query.
 */
const generateFiscalYearFilter = (startFiscalYear?: number, endFiscalYear?: number) => {
  let fiscalYearFilter = ""

  // Check if either start or end fiscal year is provided
  if (startFiscalYear !== undefined || endFiscalYear !== undefined) {
    fiscalYearFilter = "AND"

    // Add condition for start fiscal year if provided
    if (startFiscalYear !== undefined) {
      fiscalYearFilter += ` FISCAL_YEAR >= :startFiscalYear`
    }

    // Add condition for end fiscal year if provided
    if (endFiscalYear !== undefined) {
      fiscalYearFilter += (startFiscalYear !== undefined ? " AND" : "") + ` FISCAL_YEAR <= :endFiscalYear`
    }
  }

  return fiscalYearFilter
}

const transfomOptionalQuery = (query: string, inputs: FuelPricePlanFilters) => {
  // Initialize the result variable with the original query.
  let ret = query

  ret = ret.replace("%fiscalYearFilter%", generateFiscalYearFilter(inputs.startFiscalYear, inputs.endFiscalYear))

  return ret
}

/**
 * Sequelize MySQL implementation of the Fuel Price Repository.
 */
export const FuelPriceRepositorySequelizeMySQL: FuelPriceRepositoryPort<Transaction> = {
  wrapInWorkUnitCtx: wrapInTransaction,
  upsertFuelPriceForecast: async (transaction, fuelPriceForecast, currentDateTime) => {
    const query = `INSERT INTO t_fuel_price_forecast
    (
      PLANT_CODE,
      FISCAL_YEAR,
      VALUE,
      CREATED_DATETIME,
      UPDATED_DATETIME,
      CREATE_BY,
      UPDATE_BY
    )
    VALUES
    :values
    ON DUPLICATE KEY UPDATE
      VALUE = VALUES(VALUE),
      UPDATED_DATETIME = VALUES(UPDATED_DATETIME),
      UPDATE_BY = VALUES(UPDATE_BY)`
    await sequelize.query(query, {
      replacements: {
        values: fuelPriceForecast.map((x: FuelPriceForecast) => [
          x.plantCode,
          x.fiscalYear,
          x.value,
          currentDateTime,
          currentDateTime,
          x.userId,
          x.userId,
        ]),
      },
      transaction,
    })
  },
  getFuelPricePlan: async (transaction, plantCode, startFiscalYear, endFiscalYear) => {
    const query = `SELECT
      PLANT_CODE,
      FISCAL_YEAR,
      VALUE
    FROM
      t_fuel_price_plan
    WHERE
      PLANT_CODE = :plantCode AND
      VALUE IS NOT NULL
      %fiscalYearFilter%
    ;`

    return await sequelize.query<fuelPricePlanDbType>(
      transfomOptionalQuery(query, {
        startFiscalYear,
        endFiscalYear,
      }),
      {
        replacements: {
          plantCode,
          startFiscalYear,
          endFiscalYear,
        },
        type: QueryTypes.SELECT,
        transaction,
      },
    )
  },
  upsertFuelPricePlan: async (transaction, fuelPricePlan, currentDateTime) => {
    const query = `INSERT INTO t_fuel_price_plan
    (
      PLANT_CODE,
      FISCAL_YEAR,
      VALUE,
      CREATED_DATETIME,
      UPDATED_DATETIME,
      CREATE_BY,
      UPDATE_BY
    )
    VALUES
    :values
    ON DUPLICATE KEY UPDATE
      VALUE = VALUES(VALUE),
      UPDATED_DATETIME = VALUES(UPDATED_DATETIME),
      UPDATE_BY = VALUES(UPDATE_BY)`
    await sequelize.query(query, {
      replacements: {
        values: fuelPricePlan.map((x: FuelPricePlan) => [
          x.plantCode,
          x.fiscalYear,
          x.value,
          currentDateTime,
          currentDateTime,
          x.userId,
          x.userId,
        ]),
      },
      transaction,
    })
  },
}
