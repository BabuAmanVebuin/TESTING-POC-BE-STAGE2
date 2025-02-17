// Imported from DPM-BE, commit d0e2f45544cc9890762f93cf3e8f224f15efd619
import { Transaction } from "sequelize"
import { Kpi003EstimationRepositoryPort } from "../../../../application/port/repositories/dpm/Kpi003EstimationRepositoryPort.js"
import { CONST_FORECAST_CATEGORY } from "../../../../config/dpm/constant.js"
import { SnowflakeTransaction, snowflakeSelectWrapper } from "../../../orm/snowflake/index.js"
/**
 * Function to build sql from get estimates records
 * @param scope - plant or unit
 * @param measure -
 * @param granularity
 * @param forecastCategory
 * @returns
 */
const buildGetEstimatesQuery = (
  scope: string | null,
  measure: string,
  granularity: "annual",
  forecastCategory: string,
) => {
  let forecastColum = "c.ACTUAL"
  let scopeFilter = "c.PLANT_CODE=:1"
  if (scope == "unit") {
    scopeFilter = "c.UNIT_CODE=:2"
  }
  if (Number(forecastCategory) == CONST_FORECAST_CATEGORY.FORCAST) {
    forecastColum = "c.FORECAST"
  } else if (Number(forecastCategory) == CONST_FORECAST_CATEGORY.PLANED) {
    forecastColum = "c.PLANNED"
  }
  return `
      select
       c.FISCAL_YEAR,${forecastColum} as VALUE
      from
      rfz_ope_and_mte.t_kpi003_${scope}_wise_${measure}_${granularity}_estimates c
      where
        ${scopeFilter} order by c.FISCAL_YEAR`
}

/**
 * Kpi003 Estimations repository
 * @param sequelize
 * @returns repository
 */
export const KPI003EstimationRepositorySnowflake = async (
  snowflakeTransaction: SnowflakeTransaction,
): Promise<Kpi003EstimationRepositoryPort<Transaction | null>> => ({
  /**
   * Function to get EBITDA Estimates record form db
   * @param plantCode - example HE
   * @param unitCode - example HE_A100
   * @param scope - unit / plant
   * @param granularity  annual
   * @param forecastCategory 1, 2, 3
   * @param transaction transaction
   * @returns
   */
  getEBITDAEstimates: async (plantCode, unitCode, scope, granularity, forecastCategory) => {
    // get SQL query
    const query = buildGetEstimatesQuery(scope, "ebitda", granularity, forecastCategory)
    return await snowflakeSelectWrapper(snowflakeTransaction, {
      sqlText: query,
      binds: [plantCode, unitCode || ""],
    })
  },
  /**
   * Function to get EBITDA Estimates record form db
   * @param plantCode - example HE
   * @param unitCode - example HE_A100
   * @param scope - unit / plant
   * @param granularity  annual
   * @param forecastCategory 1, 2, 3
   * @param transaction transaction
   * @returns
   */
  getGenerationOutputEstimates: async (plantCode, unitCode, scope, granularity, forecastCategory) => {
    // get SQL query
    const query = buildGetEstimatesQuery(scope, "generationoutput", granularity, forecastCategory)
    return await snowflakeSelectWrapper(snowflakeTransaction, {
      sqlText: query,
      binds: [plantCode, unitCode || ""],
    })
  },
})
