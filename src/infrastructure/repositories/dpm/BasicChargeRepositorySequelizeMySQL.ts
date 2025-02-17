import { QueryTypes, Transaction } from "sequelize"
import { sequelize, wrapInTransaction } from "../../orm/sqlize/index.js"
import { BasicChargeRepositoryPort } from "../../../application/port/BasicChargeRepositoryPort.js"
import { BasicChargePlanDataFromDB, BasicChargePlanFilters } from "../../../domain/entities/dpm/basicChargePlan.js"
import { BasicChargePlan } from "../../../domain/models/BasicCharge.js"
import { BasicChargeForecastDataFromDB } from "../../../domain/entities/dpm/basicChargeForecast.js"
import { BasicChargePlanSummaryDataFromDB } from "../../../domain/entities/dpm/basicChargePlanSummary.js"
import { BasicChargeForecast } from "../../../domain/models/BasicCharge.js"
import { basicChargeForecastSummaryDataFromDB } from "../../../domain/entities/dpm/basicChargeForecastSummary.js"

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

/**
 * Transforms the given SQL-like query by replacing a placeholder with a filter condition based on optional inputs.
 * @param query The SQL-like query string with a placeholder to be replaced.
 * @param inputs An object containing optional filters.
 * @returns The transformed query with the appropriate filter condition applied or a default condition if the filter is not provided.
 */
const transfomOptionalQuery = (query: string, inputs: BasicChargePlanFilters) => {
  // Initialize the result variable with the original query.
  let ret = query

  // Check if 'unitCode' filter is provided in the inputs.
  ret =
    inputs["unitCode"] === undefined
      ? ret.replace("%unitCodeFilter%", "TRUE")
      : ret.replace("%unitCodeFilter%", "UNIT_CODE = :unitCode")

  ret = ret.replace("%fiscalYearFilter%", generateFiscalYearFilter(inputs.startFiscalYear, inputs.endFiscalYear))

  ret =
    inputs.currentFiscalYear === undefined
      ? ret.replace("%currentFiscalYear%", "")
      : ret.replace("%currentFiscalYear%", " AND fiscal_year > :currentFiscalYear ")

  return ret
}

/**
 * Sequelize MySQL implementation of the Basic Charge Repository.
 */
export const BasicChargeRepositorySequelizeMySQL: BasicChargeRepositoryPort<Transaction> = {
  wrapInWorkUnitCtx: wrapInTransaction,
  getBasicChargePlan: async (transaction, plantCode, unitCode, startFiscalYear, endFiscalYear) => {
    const query = `SELECT
        PLANT_CODE,
        UNIT_CODE,
        FISCAL_YEAR,
        OPERATION_INPUT,
        MAINTENANCE_INPUT,
        (IFNULL(OPERATION_INPUT, 0) + IFNULL(MAINTENANCE_INPUT, 0)) AS SUM
    FROM
        t_basic_charge_plan
    WHERE
        PLANT_CODE = :plantCode
        AND 
        (OPERATION_INPUT IS NOT NULL OR MAINTENANCE_INPUT IS NOT NULL) AND
        %unitCodeFilter%
        %fiscalYearFilter%
    ;`

    return await sequelize.query<BasicChargePlanDataFromDB>(
      transfomOptionalQuery(query, {
        unitCode,
        startFiscalYear,
        endFiscalYear,
      }),
      {
        replacements: {
          plantCode,
          unitCode,
          startFiscalYear,
          endFiscalYear,
        },
        type: QueryTypes.SELECT,
        transaction,
      },
    )
  },
  upsertBasicChargePlan: async (transaction, generationOutputPlans, currentDateTime) => {
    const query = `INSERT INTO
      t_basic_charge_plan (
        PLANT_CODE,
        UNIT_CODE,
        FISCAL_YEAR,
        OPERATION_INPUT,
        MAINTENANCE_INPUT,
        CREATED_DATETIME,
        UPDATED_DATETIME,
        CREATE_BY,
        UPDATE_BY
      )
    VALUES
      :values ON DUPLICATE KEY
    UPDATE
      OPERATION_INPUT =
    VALUES
    (OPERATION_INPUT),
      MAINTENANCE_INPUT =
    VALUES
    (MAINTENANCE_INPUT),
      UPDATED_DATETIME =
    VALUES
    (UPDATED_DATETIME),
      UPDATE_BY =
    VALUES
    (UPDATE_BY);`

    await sequelize.query(query, {
      replacements: {
        values: generationOutputPlans.map((x: BasicChargePlan) => [
          x.plantCode,
          x.unitCode,
          x.fiscalYear,
          x.operationInput,
          x.maintenanceInput,
          currentDateTime,
          currentDateTime,
          x.userId,
          x.userId,
        ]),
      },
      transaction,
    })
  },
  getBasicChargeForecast: async (transaction, plantCode, unitCode, startFiscalYear, endFiscalYear) => {
    const query = `SELECT
      PLANT_CODE,
      UNIT_CODE,
      FISCAL_YEAR,
      OPERATION_INPUT,
      MAINTENANCE_INPUT,
      (IFNULL(OPERATION_INPUT, 0) + IFNULL(MAINTENANCE_INPUT, 0)) AS SUM
    FROM
      t_basic_charge_forecast
    WHERE
      PLANT_CODE = :plantCode AND
      (OPERATION_INPUT is not null || MAINTENANCE_INPUT is not null) AND
      %unitCodeFilter%
      %fiscalYearFilter%
  ;`

    return await sequelize.query<BasicChargeForecastDataFromDB>(
      transfomOptionalQuery(query, {
        unitCode,
        startFiscalYear,
        endFiscalYear,
      }),
      {
        replacements: {
          plantCode,
          unitCode,
          startFiscalYear,
          endFiscalYear,
        },
        type: QueryTypes.SELECT,
        transaction,
      },
    )
  },
  getBasicChargePlanSummary: async (transaction, plantCode, startFiscalYear, endFiscalYear) => {
    const fiscalYearFilter = generateFiscalYearFilter(startFiscalYear, endFiscalYear)

    const query = `SELECT
      PLANT_CODE,
      FISCAL_YEAR,
      SUM(IFNULL(OPERATION_INPUT, 0) + IFNULL(MAINTENANCE_INPUT, 0)) AS VALUE
    FROM
      t_basic_charge_plan
    WHERE
      PLANT_CODE = :plantCode
      AND (OPERATION_INPUT IS NOT NULL OR MAINTENANCE_INPUT IS NOT NULL)
      %fiscalYearFilter%
    GROUP BY
      PLANT_CODE,
      FISCAL_YEAR;
      `

    return await sequelize.query<BasicChargePlanSummaryDataFromDB>(
      query.replace("%fiscalYearFilter%", fiscalYearFilter),
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
  upsertBasicChargeForecast: async (transaction, basicChargeForecast, currentDateTime) => {
    const query = `INSERT INTO t_basic_charge_forecast
    (
      PLANT_CODE,
      UNIT_CODE,
      FISCAL_YEAR,
      OPERATION_INPUT,
      MAINTENANCE_INPUT,
      CREATED_DATETIME,
      UPDATED_DATETIME,
      CREATE_BY,
      UPDATE_BY
    )
    VALUES
    :values
    ON DUPLICATE KEY UPDATE
      OPERATION_INPUT = VALUES(OPERATION_INPUT),
      MAINTENANCE_INPUT = VALUES(MAINTENANCE_INPUT),
      UPDATED_DATETIME = VALUES(UPDATED_DATETIME),
      UPDATE_BY = VALUES(UPDATE_BY)`
    await sequelize.query(query, {
      replacements: {
        values: basicChargeForecast.map((x: BasicChargeForecast) => [
          x.plantCode,
          x.unitCode,
          x.fiscalYear,
          x.operationInput,
          x.maintenanceInput,
          currentDateTime,
          currentDateTime,
          x.userId,
          x.userId,
        ]),
      },
      transaction,
    })
  },
  getBasicChargeForecastSummary: async (transaction, currentFiscalYear, plantCode, startFiscalYear, endFiscalYear) => {
    const query = `SELECT
      PLANT_CODE,
      FISCAL_YEAR,
      SUM(IFNULL(OPERATION_INPUT, 0) + IFNULL(MAINTENANCE_INPUT, 0)) AS VALUE
      FROM
        t_basic_charge_forecast
      WHERE
        PLANT_CODE = :plantCode AND
        (OPERATION_INPUT IS NOT NULL OR MAINTENANCE_INPUT IS NOT NULL) 
        %currentFiscalYear%
        %fiscalYearFilter%
      GROUP BY 
        PLANT_CODE, 
        FISCAL_YEAR;
      `

    return await sequelize.query<basicChargeForecastSummaryDataFromDB>(
      transfomOptionalQuery(query, {
        currentFiscalYear,
        startFiscalYear,
        endFiscalYear,
      }),
      {
        replacements: {
          currentFiscalYear,
          plantCode,
          startFiscalYear,
          endFiscalYear,
        },
        type: QueryTypes.SELECT,
        transaction,
      },
    )
  },
}
