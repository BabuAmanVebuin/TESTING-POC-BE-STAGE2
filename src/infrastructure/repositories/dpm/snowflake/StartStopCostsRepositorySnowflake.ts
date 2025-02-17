// Imported from DPM-BE, commit d0e2f45544cc9890762f93cf3e8f224f15efd619
import { StartStopCostsRepositoryPort } from "../../../../application/port/repositories/dpm/StartStopCostsRepositoryPort.js"
import { SnowflakeTransaction, snowflakeSelectWrapper } from "../../../orm/snowflake/index.js"

/**
 * Start stop cost repository
 */
export const StartStopCostsRepositorSnowflake = async (
  snowflakeTransaction: SnowflakeTransaction,
): Promise<StartStopCostsRepositoryPort> => {
  return {
    getStartStopCost: async (
      plantCode: string,
      unitCode: string,
      startupCode: string,
      fiscalYearStartDate: string,
      fiscalYearEndDate: string,
    ) => {
      const SELECT_STARTUP_COST = `SELECT tssc.SCHEDULED_START_DATE, tssc.SCHEDULED_END_DATE, tssc.VALUE
            FROM RFZ_OPE_AND_MTE.t_start_stop_cost tssc 
            JOIN RFZ_OPE_AND_MTE.m_startup_mode msm ON tssc.STARTUP_MODE_ID = msm.ID 
            WHERE tssc.PLANT_CODE = :1 
              AND tssc.UNIT_CODE = :2
              AND msm.STARTUP_MODE_CODE = :3
              AND (tssc.SCHEDULED_START_DATE BETWEEN :4 AND :5 OR tssc.SCHEDULED_END_DATE BETWEEN :4 AND :5)
            ORDER BY tssc.SCHEDULED_START_DATE;
            `
      return await snowflakeSelectWrapper(snowflakeTransaction, {
        sqlText: SELECT_STARTUP_COST,
        binds: [plantCode, unitCode, startupCode, fiscalYearStartDate, fiscalYearEndDate],
      })
    },
  }
}
