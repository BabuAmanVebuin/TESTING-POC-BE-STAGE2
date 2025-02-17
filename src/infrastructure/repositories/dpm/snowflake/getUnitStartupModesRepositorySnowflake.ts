// Imported from DPM-BE, commit d0e2f45544cc9890762f93cf3e8f224f15efd619
import { SnowflakeTransaction, snowflakeSelectWrapper } from "../../../orm/snowflake/index.js"
import { UnitStartupModesRepositoryPort } from "../../../../application/port/repositories/dpm/UnitStartupModesRepositoryPort.js"

/**
 * Units startup repository
 * @param connection Snowflake Connection object
 * @returns UnitStartupModesRepositoryPort object
 */
export const getUnitStartupModesRepositorySnowflake = async (
  snowflakeTransaction: SnowflakeTransaction,
): Promise<UnitStartupModesRepositoryPort> => {
  return {
    findUnitStartupModes: (plantCode: string, unitCode?: string | undefined) => {
      const SELECT_UNIT_STARTUP_MODES = `SELECT usm.UNIT_CODE AS "unitCode", sm.STARTUP_MODE_CODE AS "sartupModeCode" 
        FROM RFZ_OPE_AND_MTE.m_unit_startup_mode usm 
        JOIN RFZ_OPE_AND_MTE.m_startup_mode sm ON usm.STARTUP_MODE_ID = sm.ID 
        WHERE usm.PLANT_CODE = :1 
        ${unitCode ? "AND usm.UNIT_CODE = :2" : ""}`

      return snowflakeSelectWrapper(snowflakeTransaction, {
        sqlText: SELECT_UNIT_STARTUP_MODES,
        binds: [plantCode, unitCode || ""],
      })
    },
  }
}
