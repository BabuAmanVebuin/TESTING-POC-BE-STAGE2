import { QueryTypes, Transaction } from "sequelize"
import {
  getThermalEfficiencyForecastRequest,
  thermalEfficiencyForecastDatabaseType,
  thermalEfficiencyForecastSnowflakeType,
  unitListDb,
  stoppageDb,
  recoveryType,
  decreaseType,
} from "../../../../../../domain/entities/dpm/thermalEfficiencyForecast.js"
import { cmnSequelize, sequelize } from "../../../../../../infrastructure/orm/sqlize/index.js"
import { readSqlFile } from "../../utils.js"
import { currentFiscalYear } from "./businessPlanHelper.js"
import { SnowflakeTransaction, snowflakeSelectWrapper } from "../../../../../../infrastructure/orm/snowflake/index.js"

const QUERY = readSqlFile("getThermalEfficiencyForecast")
const SF_QUERY = readSqlFile("getSfThermalEfficiencyForecast")
const STOPPAGE_QUERY = readSqlFile("getStoppage")
const RECOVERY_QUERY = readSqlFile("getThermalEfficiencyRecoveryMaster")
const DECREASE_QUERY = readSqlFile("getThermalEfficiencyDecreaseMaster")

const UNIT_QUERY = "SELECT unit_code as `unit-id` FROM m_unitmaster WHERE plant_code = :plantId"

type requestType = getThermalEfficiencyForecastRequest & { "unit-id"?: string }
type database = thermalEfficiencyForecastDatabaseType
type snowflake = thermalEfficiencyForecastSnowflakeType

const query = (input: requestType) => {
  let ret = QUERY
  ret =
    input["end-fiscal-year"] === undefined
      ? ret.replace("%endFiscalYearFilter%", "TRUE")
      : ret.replace("%endFiscalYearFilter%", "fiscal_year <= :endFiscalYear")
  ret =
    input["start-fiscal-year"] === undefined
      ? ret.replace("%startFiscalYearFilter%", "TRUE")
      : ret.replace("%startFiscalYearFilter%", "fiscal_year >= :startFiscalYear")
  ret =
    input["unit-id"] === undefined
      ? ret.replace("%unitIdFilter%", "TRUE")
      : ret.replace("%unitIdFilter%", "UNIT_CODE = :unitId")
  return ret
}

export const getThermalEfficiencyForecastData = (input: requestType, transaction: Transaction): Promise<database[]> =>
  sequelize.query<database>(query(input), {
    replacements: {
      plantId: input["plant-id"],
      unitId: input["unit-id"],
      startFiscalYear: input["start-fiscal-year"],
      endFiscalYear: input["end-fiscal-year"],
      // 当年度以前のデータはsnowflakeのデータを参照するので取得しない
      currentFiscalYear: currentFiscalYear(),
    },
    type: QueryTypes.SELECT,
    raw: true,
    transaction,
  })

const sfQuery = (input: requestType) => {
  let ret = SF_QUERY
  ret =
    input["unit-id"] === undefined
      ? ret.replace("%unitIdFilter%", "TRUE")
      : ret.replace("%unitIdFilter%", "cr.UNIT_CODE = :3")
  return ret
}

export const getThermalEfficiencyForecastSfData = (
  input: requestType,
  snowflakeTransaction: SnowflakeTransaction,
): Promise<snowflake[]> =>
  snowflakeSelectWrapper<snowflake>(snowflakeTransaction, {
    sqlText: sfQuery(input),
    binds: [currentFiscalYear(), input["plant-id"], input["unit-id"] || ""],
  })

export const getUnitList = (input: requestType, transaction: Transaction): Promise<unitListDb[]> =>
  cmnSequelize.query<unitListDb>(UNIT_QUERY, {
    replacements: {
      plantId: input["plant-id"],
    },
    type: QueryTypes.SELECT,
    raw: true,
    transaction,
  })

export const getStoppageList = (
  unitList: string[],
  endFiscalYear: number,
  transaction: Transaction,
): Promise<stoppageDb[]> =>
  cmnSequelize.query<stoppageDb>(STOPPAGE_QUERY, {
    replacements: {
      unitList,
      startDate: new Date(currentFiscalYear() + 1, 3, 1),
      endDate: new Date(endFiscalYear + 1, 3, 1),
    },
    type: QueryTypes.SELECT,
    raw: true,
    transaction,
  })

export const getRecoveryMaster = (unitList: string[], transaction: Transaction): Promise<recoveryType[]> =>
  cmnSequelize.query<recoveryType>(RECOVERY_QUERY, {
    replacements: {
      unitList,
    },
    type: QueryTypes.SELECT,
    raw: true,
    transaction,
  })

export const getThermalEfficiencyDecreaseMaster = (
  unitList: string[],
  transaction: Transaction,
): Promise<decreaseType[]> =>
  cmnSequelize.query<decreaseType>(DECREASE_QUERY, {
    replacements: {
      unitList,
    },
    type: QueryTypes.SELECT,
    raw: true,
    transaction,
  })
