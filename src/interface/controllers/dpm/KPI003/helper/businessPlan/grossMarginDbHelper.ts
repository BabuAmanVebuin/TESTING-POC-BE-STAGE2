import { QueryTypes, Transaction } from "sequelize"
import { cmnSequelize } from "../../../../../../infrastructure/orm/sqlize/index.js"
import { readSqlFile } from "../../utils.js"
import {
  fuelUnitCalorificValueType,
  grossMarginForecastSnowflakeType,
  ppaThermalEfficiencyType,
} from "../../../../../../domain/entities/dpm/grossMarginForecast.js"
import { SnowflakeTransaction, snowflakeSelectWrapper } from "../../../../../../infrastructure/orm/snowflake/index.js"
import { currentFiscalYear } from "./businessPlanHelper.js"
import {
  getGrossMarginForecastSummaryRequest,
  grossMarginForecastSummarySnowflakeType,
} from "../../../../../../domain/entities/dpm/grossMarginForecastSummary.js"
import { grossMarginSummaryFromSF } from "../../../../../../domain/entities/dpm/grossMarginSummary.js"

const PPA_THERMAL_EFFICIENCY_QUERY = readSqlFile("getPPAThermalEfficiencyMaster")
const FUEL_UNIT_CALORIFIC_VALUE_QUERY = readSqlFile("getFuelUnitCalorificValueMaster")

const SF_QUERY = readSqlFile("getSfGrossMarginForecast")
const SUMMARY_SF_QUERY = readSqlFile("getSfGrossMarginForecastSummary")
const PLANT_SUMMARY_SF_QUERY = readSqlFile("getSfGrossMarginForecastPlantSummary")
const UNIT_SUMMARY_SF_QUERY = readSqlFile("getSfGrossMarginForecastUnitSummary")

type requestType = {
  "plant-id": string
  "unit-id"?: string
  "start-fiscal-year"?: number
  "end-fiscal-year"?: number
}
type summaryRequestType = getGrossMarginForecastSummaryRequest
type snowflake = grossMarginForecastSnowflakeType
type forecastSummarySnowflake = grossMarginForecastSummarySnowflakeType
type summarySnowflake = grossMarginSummaryFromSF

type ppaThermalEfficiencyInput = {
  plantId: string
  unitList?: string[]
}

type fuelUnitCalorificValueInput = {
  plantId: string
  unitId?: string
}

const ppaThermaEfficiencyQuery = (input: ppaThermalEfficiencyInput) => {
  let ret = PPA_THERMAL_EFFICIENCY_QUERY
  ret =
    input.unitList === undefined
      ? ret.replace("%unitIdFilter%", "TRUE")
      : ret.replace("%unitIdFilter%", "UNIT_CODE IN (:unitList)")

  return ret
}

export const getPPAThermalEfficiencyMaster = (
  input: ppaThermalEfficiencyInput,
  transaction: Transaction,
): Promise<ppaThermalEfficiencyType[]> =>
  cmnSequelize.query<ppaThermalEfficiencyType>(ppaThermaEfficiencyQuery(input), {
    replacements: {
      plantId: input.plantId,
      unitList: input.unitList,
    },
    type: QueryTypes.SELECT,
    raw: true,
    transaction,
  })

const fuelUnitCalorificValueQuery = (input: fuelUnitCalorificValueInput) => {
  let ret = FUEL_UNIT_CALORIFIC_VALUE_QUERY
  ret =
    input.unitId === undefined
      ? ret.replace("%unitIdFilter%", "TRUE")
      : ret.replace("%unitIdFilter%", "UNIT_CODE = :unitId")

  return ret
}

export const getFuelUnitCalorificValueMaster = (
  input: fuelUnitCalorificValueInput,
  transaction: Transaction,
): Promise<fuelUnitCalorificValueType[]> =>
  cmnSequelize.query<fuelUnitCalorificValueType>(fuelUnitCalorificValueQuery(input), {
    replacements: {
      plantId: input.plantId,
      unitId: input.unitId,
    },
    type: QueryTypes.SELECT,
    raw: true,
    transaction,
  })

const sfUnitAndFiscalYearQuery = (input: requestType, targetQuery: string) => {
  let ret = targetQuery
  ret =
    input["unit-id"] === undefined
      ? ret.replace("%unitIdFilter%", "TRUE")
      : ret.replace("%unitIdFilter%", "cr.UNIT_CODE = :3")
  ret =
    input["start-fiscal-year"] === undefined
      ? ret.replace("%startFiscalYearFilter%", "TRUE")
      : ret.replace("%startFiscalYearFilter%", "cr.FISCAL_YEAR >= :4")
  ret =
    input["end-fiscal-year"] === undefined
      ? ret.replace("%endFiscalYearFilter%", "TRUE")
      : ret.replace("%endFiscalYearFilter%", "cr.FISCAL_YEAR <= :5")

  return ret
}

const sfFiscalYearQuery = (input: summaryRequestType, targetQuery: string) => {
  let ret = targetQuery
  ret =
    input["start-fiscal-year"] === undefined
      ? ret.replace("%startFiscalYearFilter%", "TRUE")
      : ret.replace("%startFiscalYearFilter%", "cr.FISCAL_YEAR >= :3")
  ret =
    input["end-fiscal-year"] === undefined
      ? ret.replace("%endFiscalYearFilter%", "TRUE")
      : ret.replace("%endFiscalYearFilter%", "cr.FISCAL_YEAR <= :4")

  return ret
}

export const getGrossMarginForecastSfData = (
  input: requestType,
  snowflakeTransaction: SnowflakeTransaction,
): Promise<snowflake[]> =>
  snowflakeSelectWrapper<snowflake>(snowflakeTransaction, {
    sqlText: sfUnitAndFiscalYearQuery(input, SF_QUERY),
    binds: [
      currentFiscalYear(),
      input["plant-id"],
      input["unit-id"] || "",
      input["start-fiscal-year"] || 0,
      input["end-fiscal-year"] || 0,
    ],
  })

export const getGrossMarginForecastSummarySfData = (
  input: summaryRequestType,
  snowflakeTransaction: SnowflakeTransaction,
): Promise<forecastSummarySnowflake[]> =>
  snowflakeSelectWrapper<forecastSummarySnowflake>(snowflakeTransaction, {
    sqlText: sfFiscalYearQuery(input, SUMMARY_SF_QUERY),
    binds: [currentFiscalYear(), input["plant-id"], input["start-fiscal-year"] || 0, input["end-fiscal-year"] || 0],
  })

export const getGrossMarginForecastPlantSummarySfData = (
  input: summaryRequestType,
  snowflakeTransaction: SnowflakeTransaction,
): Promise<summarySnowflake[]> =>
  snowflakeSelectWrapper<summarySnowflake>(snowflakeTransaction, {
    sqlText: sfFiscalYearQuery(input, PLANT_SUMMARY_SF_QUERY),
    binds: [currentFiscalYear(), input["plant-id"], input["start-fiscal-year"] || 0, input["end-fiscal-year"] || 0],
  })

export const getGrossMarginForecastUnitSummarySfData = (
  input: requestType,
  snowflakeTransaction: SnowflakeTransaction,
): Promise<summarySnowflake[]> =>
  snowflakeSelectWrapper<summarySnowflake>(snowflakeTransaction, {
    sqlText: sfUnitAndFiscalYearQuery(input, UNIT_SUMMARY_SF_QUERY),
    binds: [
      currentFiscalYear(),
      input["plant-id"],
      input["unit-id"] || "",
      input["start-fiscal-year"] || 0,
      input["end-fiscal-year"] || 0,
    ],
  })
