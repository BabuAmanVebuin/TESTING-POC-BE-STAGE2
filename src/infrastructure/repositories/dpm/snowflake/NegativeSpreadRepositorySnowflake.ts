// Imported from DPM-BE, commit d0e2f45544cc9890762f93cf3e8f224f15efd619
import { NegativeSpreadRepositoryPort } from "../../../../application/port/repositories/dpm/NegativeSpreadRepositoryPort.js"
import { kpiNegativeSpreadRecord } from "../../../../domain/models/dpm/negativeSpreadOperation.js"
import { SnowflakeTransaction, snowflakeSelectWrapper } from "../../../orm/snowflake/index.js"

export const negativeSpreadRepository = async (
  snowflakeTransaction: SnowflakeTransaction,
): Promise<NegativeSpreadRepositoryPort> => ({
  /**
   * Function to calculate actual and forecast negative spread subcache for today
   * @param t Transaction
   * @param arrUniqPlantUnitCode units array
   */
  getTop20NegativeSpreadOperation: async (
    plantCode,
    forecastCategory,
    fiscalYear,
    unitCode,
  ): Promise<kpiNegativeSpreadRecord[]> => {
    return await snowflakeSelectWrapper(snowflakeTransaction, {
      sqlText: `select tkns.PLANT_CODE , tkns.UNIT_CODE ,mu.UNIT_NAME, tkns.HOURS, tkns.START_TIME, 
      tkns.END_TIME, tkns.AVG_GENERATION_OUTPUT, tkns.AVG_SPREAD, tkns.GROSS_MARGIN 
      from rfz_ope_and_mte.t_kpi_negative_spread tkns join rfz_ope_and_mte.m_unitmaster mu 
      on mu.PLANT_CODE = tkns.PLANT_CODE and mu.UNIT_CODE = tkns.UNIT_CODE where tkns.PLANT_CODE = :1 ${
        unitCode ? `and tkns.UNIT_CODE = :4` : ""
      } and tkns.FORECAST_CATEGORY = :2 and tkns.FISCAL_YEAR = :3 order by tkns.HOURS desc, tkns.GROSS_MARGIN, tkns.AVG_SPREAD, tkns.AVG_GENERATION_OUTPUT desc LIMIT 20`,
      binds: [plantCode, forecastCategory, fiscalYear, unitCode || ""],
    })
  },
  getNegativeSpreadHours: async (plantCode, fiscalYear, unitCode) => {
    return await snowflakeSelectWrapper(snowflakeTransaction, {
      sqlText: `select FORECAST_CATEGORY as "forecastCategory", HOURS  as "hours", 
      count(*) as "recordCount" from rfz_ope_and_mte.t_kpi_negative_spread 
      where PLANT_CODE = :1 ${
        unitCode ? `and UNIT_CODE = :3` : ""
      }  and FISCAL_YEAR = :2 group by FORECAST_CATEGORY, HOURS`,
      binds: [plantCode, fiscalYear, unitCode || ""],
    })
  },
})
