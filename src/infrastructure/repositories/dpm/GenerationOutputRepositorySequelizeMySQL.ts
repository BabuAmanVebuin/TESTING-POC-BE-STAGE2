import { QueryTypes, Transaction } from "sequelize"
import { GenerationOutputRepositoryPort } from "../../../application/port/GenerationOutputRepositoryPort.js"
import { sequelize, wrapInTransaction } from "../../orm/sqlize/index.js"
import { GenerationOutputPlan, GenerationOutputPlanOptionalFilters } from "../../../domain/models/GenerationOutput.js"
import { setLimitAndOffset } from "../../orm/sqlize/utils.js"
import { GenerationOutputPlanDataFromDB } from "../../../domain/entities/dpm/generationOutputPlan.js"
import { GenerationOutputPlanSummaryDataFromDB } from "../../../domain/entities/dpm/generationOutputPlanSummary.js"

const transfomOptionalQuery = (query: string, inputs: GenerationOutputPlanOptionalFilters) => {
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

export const GenerationOutputRepositorySequelizeMysql: GenerationOutputRepositoryPort<Transaction> = {
  wrapInWorkUnitCtx: wrapInTransaction,
  upsertGenerationOutputPlan: async (transaction, generationOutputPlans, currentDateTime) => {
    const query = `INSERT INTO t_generation_output_plan
    (
      PLANT_CODE,
      UNIT_CODE,
      FISCAL_YEAR,
      VALUE,
      CORRECTION_VALUE,
      CREATED_DATETIME,
      UPDATED_DATETIME,
      CREATE_BY,
      UPDATE_BY
    )
    VALUES
    :values
    ON DUPLICATE KEY UPDATE
      VALUE = VALUES(VALUE),
      CORRECTION_VALUE = VALUES(CORRECTION_VALUE),
      UPDATED_DATETIME = VALUES(UPDATED_DATETIME),
      UPDATE_BY = VALUES(UPDATE_BY)`
    await sequelize.query(query, {
      replacements: {
        values: generationOutputPlans.map((x: GenerationOutputPlan) => [
          x.plantCode,
          x.unitCode,
          x.fiscalYear,
          x.value,
          x.correctionValue,
          currentDateTime,
          currentDateTime,
          x.userId,
          x.userId,
        ]),
      },
      transaction,
    })
  },
  getGenerationOutputPlan: async (transaction, plantCode, unitCode, startFiscalYear, endFiscalYear, limit, offset) => {
    const fiscalYearFilter = generateFiscalYearFilter(startFiscalYear, endFiscalYear)

    const query = `SELECT 
    PLANT_CODE,
    UNIT_CODE,
    FISCAL_YEAR,
    VALUE,
    CORRECTION_VALUE,
    (IFNULL(VALUE, 0) + IFNULL(CORRECTION_VALUE, 0)) as sum
    FROM t_generation_output_plan
    WHERE PLANT_CODE =:plantCode AND
    %unitCodeFilter%
    %fiscalYearFilter% AND
    (VALUE is not null || CORRECTION_VALUE is not null)`

    return await sequelize.query<GenerationOutputPlanDataFromDB>(
      setLimitAndOffset(
        transfomOptionalQuery(query, {
          unitCode,
        }),
        { limit, offset },
      ).replace("%fiscalYearFilter%", fiscalYearFilter),
      {
        replacements: {
          plantCode,
          unitCode,
          startFiscalYear,
          endFiscalYear,
          limit,
          offset,
        },
        type: QueryTypes.SELECT,
        transaction,
      },
    )
  },
  getGenerationOutputPlanSummary: async (transaction, plantCode, startFiscalYear, endFiscalYear) => {
    const fiscalYearFilter = generateFiscalYearFilter(startFiscalYear, endFiscalYear)

    const query = `SELECT 
    PLANT_CODE,
    FISCAL_YEAR,
    SUM((IFNULL(VALUE, 0) + IFNULL(CORRECTION_VALUE, 0))) AS VALUE
    FROM
      t_generation_output_plan
    WHERE    
      PLANT_CODE = :plantCode
      %fiscalYearFilter% AND
      (VALUE is not null || CORRECTION_VALUE is not null)
      GROUP BY PLANT_CODE, FISCAL_YEAR
      `

    return await sequelize.query<GenerationOutputPlanSummaryDataFromDB>(
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
}
