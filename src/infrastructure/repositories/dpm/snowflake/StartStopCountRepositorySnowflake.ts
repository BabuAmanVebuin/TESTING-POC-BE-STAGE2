// Imported from DPM-BE, commit d0e2f45544cc9890762f93cf3e8f224f15efd619
import { StartStopCountRepositoryPort } from "../../../../application/port/repositories/dpm/StartStopCountRepositoryPort.js"
import { SnowflakeTransaction, snowflakeSelectWrapper } from "../../../orm/snowflake/index.js"

const SELECT_UNIT_START_STOP_COUNTS = `select FORECAST_CATEGORY,START_COUNT  from  rfz_ope_and_mte.t_kpi_start_stop_count tkssc where FISCAL_YEAR = :1 and PLANT_CODE = :2 and UNIT_CODE = :3`
const SELECT_PLANT_START_STOP_COUNTS = `select FORECAST_CATEGORY,SUM(START_COUNT) as START_COUNT   from  rfz_ope_and_mte.t_kpi_start_stop_count tkssc where FISCAL_YEAR = :1 and PLANT_CODE = :2
  group by FORECAST_CATEGORY `

/**
 * Repository  start stop count
 * @param sequelize
 * @returns
 */
export const StartStopCountRepository = async (
  snowflakeTransaction: SnowflakeTransaction,
): Promise<StartStopCountRepositoryPort> => ({
  /**
   * Function for get unit's start stop counts from caching
   * @param fiscalYear year formate YYYY
   * @param plantCode
   * @param unitCode
   * @returns
   */
  getUnitStartStopCounts: async (fiscalYear, plantCode, unitCode) => {
    return await snowflakeSelectWrapper(snowflakeTransaction, {
      sqlText: SELECT_UNIT_START_STOP_COUNTS,
      binds: [fiscalYear, plantCode, unitCode || ""],
    })
  },
  /**
   * Function to get plant's start stop counts of all unit from caching
   * @param fiscalYear year formate YYYY
   * @param plantCode
   * @returns
   */
  getPlantStartStopCounts: async (fiscalYear, plantCode) => {
    return await snowflakeSelectWrapper(snowflakeTransaction, {
      sqlText: SELECT_PLANT_START_STOP_COUNTS,
      binds: [fiscalYear, plantCode],
    })
  },
})
