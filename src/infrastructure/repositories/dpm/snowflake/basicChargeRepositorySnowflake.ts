// Imported from DPM-BE, commit d0e2f45544cc9890762f93cf3e8f224f15efd619
import { BasicChargeRepositoryPort } from "../../../../application/port/repositories/dpm/BasicChargeRepositoryPort.js"
import { SnowflakeTransaction, snowflakeSelectWrapper } from "../../../orm/snowflake/index.js"

const getScopeAndScopeFilter = (unitCode: string | null) => {
  const scope = unitCode === null ? "plant" : "unit"
  const scopeFilter = unitCode === null ? "m.PLANT_CODE=:1 AND t.profit_start_date IS NOT NULL" : "m.UNIT_CODE=:2"
  return [scope, scopeFilter]
}

export const basicChargeRepositorySnowflake = async (
  snowflakeTransaction: SnowflakeTransaction,
): Promise<BasicChargeRepositoryPort> => {
  return {
    getBasicCharge: async (plantCode, unitCode, start, length) => {
      const [scope, scopeFilter] = getScopeAndScopeFilter(unitCode)
      const firstFiscalYear = start.year
      const lastFiscalYear = firstFiscalYear + length
      const query = `
            SELECT 
                m.FISCAL_YEAR AS "FiscalYear", 
                SUM(CASE WHEN (m.fiscal_year < YEAR(t.profit_start_date) AND MONTH(t.profit_start_date) >= 4) THEN null ELSE IFNULL(m.MAINTENANCE_AMOUNT, 0) + IFNULL(m.OPERATION_AMOUNT, 0) END) AS "Annual" ,
                SUM(
                  CASE WHEN (t.profit_start_date is null) THEN null
                   ELSE 
                      CASE WHEN (m.fiscal_year < YEAR(t.profit_start_date) AND MONTH(t.profit_start_date) >= 4) THEN null
                        ELSE ((IFNULL(m.MAINTENANCE_AMOUNT, 0) + IFNULL(m.OPERATION_AMOUNT, 0)) /
                          CASE WHEN((m.fiscal_year = YEAR(t.profit_start_date) AND MONTH(t.profit_start_date) >= 4) OR (m.fiscal_year = YEAR(t.profit_start_date) - 1 AND MONTH(t.profit_start_date) < 4))
                              THEN MONTHS_BETWEEN(TIMESTAMP_LTZ_FROM_PARTS(IFF(MONTH(t.profit_start_date) <= 3, YEAR(t.profit_start_date), YEAR(t.profit_start_date)+1),3, 31, 23, 59, 59),t.profit_start_date)
                            ELSE 12
                          END)
                      END
                  END) AS "Monthly"
                FROM rfz_ope_and_mte.dm_v_basic_charge_forecast m 
                JOIN rfz_ope_and_mte.m_unitmaster t ON m.unit_code = t.unit_code
              WHERE 
                ${scopeFilter}
                AND m.FISCAL_YEAR >= :3
                AND m.FISCAL_YEAR < :4 
                AND (m.MAINTENANCE_AMOUNT IS NOT NULL OR m.OPERATION_AMOUNT IS NOT NULL)
              GROUP BY m.${scope}_CODE, m.FISCAL_YEAR
              ORDER BY m.FISCAL_YEAR ASC`
      return await snowflakeSelectWrapper(snowflakeTransaction, {
        sqlText: query,
        binds: [plantCode, unitCode || "", firstFiscalYear, lastFiscalYear],
      })
    },
  }
}
export { BasicChargeRepositoryPort }
