import { QueryTypes, Transaction } from "sequelize"
import { sequelize, wrapInTransaction } from "../../orm/sqlize/index.js"
import { OpexRepositoryPort } from "../../../application/port/OpexRepositoryPort.js"
import { opexPlanDataFromDB, opexPlanOptionalFilters } from "../../../domain/entities/dpm/opexPlan.js"
import { OpexPlan } from "../../../domain/models/Opex.js"
import { opexPlanSummaryDataFromDB } from "../../../domain/entities/dpm/opexPlanSummary.js"

const transfomOptionalQuery = (query: string, inputs: opexPlanOptionalFilters) => {
  let ret = query
  ret =
    inputs["unitCode"] === undefined
      ? ret.replace("%unitCodeFilter%", "TRUE")
      : ret.replace("%unitCodeFilter%", "UNIT_CODE = :unitCode")

  return ret
}

const generateFiscalYearFilter = (startFiscalYear: number | undefined, endFiscalYear: number | undefined) => {
  let fiscalYearFilter = ""

  if (startFiscalYear !== undefined || endFiscalYear !== undefined) {
    fiscalYearFilter = "AND"

    if (startFiscalYear !== undefined) {
      fiscalYearFilter += ` FISCAL_YEAR >= :startFiscalYear`
    }

    if (endFiscalYear !== undefined) {
      fiscalYearFilter += (startFiscalYear !== undefined ? " AND" : "") + ` FISCAL_YEAR <= :endFiscalYear`
    }
  }

  return fiscalYearFilter
}

export const OpexRepositorySequelizeMysql: OpexRepositoryPort<Transaction> = {
  wrapInWorkUnitCtx: wrapInTransaction,
  getOpexPlan: async (transaction, plantCode, unitCode, startFiscalYear, endFiscalYear) => {
    const fiscalYearFilter = generateFiscalYearFilter(startFiscalYear, endFiscalYear)

    const query = `SELECT 
    PLANT_CODE,
    UNIT_CODE,
    FISCAL_YEAR,
    OPERATION_COST,
    MAINTENANCE_COST,
    (IFNULL(OPERATION_COST, 0) + IFNULL(MAINTENANCE_COST, 0)) AS SUM
    FROM t_opex_plan
    WHERE (OPERATION_COST IS NOT NULL OR
    MAINTENANCE_COST IS NOT NULL) AND
    PLANT_CODE =:plantCode AND
    %unitCodeFilter%
    %fiscalYearFilter%`

    return await sequelize.query<opexPlanDataFromDB>(
      transfomOptionalQuery(query, {
        unitCode,
      }).replace("%fiscalYearFilter%", fiscalYearFilter),
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
  getOpexPlanSummary: async (transaction, plantCode, startFiscalYear, endFiscalYear) => {
    const fiscalYearFilter = generateFiscalYearFilter(startFiscalYear, endFiscalYear)

    const query = `SELECT 
    PLANT_CODE,
    FISCAL_YEAR,
    SUM(OPERATION_COST) AS OPERATION_COST,
    SUM(MAINTENANCE_COST) AS MAINTENANCE_COST,
    (IFNULL(SUM(OPERATION_COST), 0) + (IFNULL(SUM(MAINTENANCE_COST), 0))) AS SUM
    FROM t_opex_plan
    WHERE (OPERATION_COST IS NOT NULL OR
    MAINTENANCE_COST IS NOT NULL) AND
    PLANT_CODE =:plantCode
    %fiscalYearFilter%
    GROUP BY PLANT_CODE, FISCAL_YEAR
    `

    return await sequelize.query<opexPlanSummaryDataFromDB>(query.replace("%fiscalYearFilter%", fiscalYearFilter), {
      replacements: {
        plantCode,
        startFiscalYear,
        endFiscalYear,
      },
      type: QueryTypes.SELECT,
      transaction,
    })
  },
  upsertOpexPlan: async (transaction, opexPlans, currentDateTime) => {
    const query = `INSERT INTO t_opex_plan
    (
      PLANT_CODE,
      UNIT_CODE,
      FISCAL_YEAR,
      OPERATION_COST,
      MAINTENANCE_COST,
      CREATED_DATETIME,
      UPDATED_DATETIME,
      CREATE_BY,
      UPDATE_BY
    )
    VALUES
    :values
    ON DUPLICATE KEY UPDATE
      OPERATION_COST = VALUES(OPERATION_COST),
      MAINTENANCE_COST = VALUES(MAINTENANCE_COST),
      UPDATED_DATETIME = VALUES(UPDATED_DATETIME),
      UPDATE_BY = VALUES(UPDATE_BY)`
    await sequelize.query(query, {
      replacements: {
        values: opexPlans.map((x: OpexPlan) => [
          x.plantCode,
          x.unitCode,
          x.fiscalYear,
          x.operationCost,
          x.maintenanceCost,
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
