import { Transaction } from "sequelize"
import {
  stoppageDb,
  stoppageType,
  recoveryType,
  decreaseType,
  getThermalEfficiencyForecastRequest,
  getThermalEfficiencyForecastResponse,
  thermalEfficiencyForecastDatabaseType,
  thermalEfficiencyForecastSnowflakeType,
  calculatedValueType,
} from "../../../../../../domain/entities/dpm/thermalEfficiencyForecast.js"
import { wrapInSnowflakeTransaction } from "../../../../../../infrastructure/orm/snowflake/index.js"
import { currentFiscalYear, fixedNumber, getFiscalYear, toInt } from "./businessPlanHelper.js"
import {
  getRecoveryMaster,
  getStoppageList,
  getThermalEfficiencyDecreaseMaster,
  getThermalEfficiencyForecastData,
  getThermalEfficiencyForecastSfData,
  getUnitList,
} from "./thermalEfficiencyDbHelper.js"
import { wrapInTransaction, wrapInTransactionCmn } from "../../../../../../infrastructure/orm/sqlize/index.js"

const CALC_DOT_POSITION = 3
const RES_DOT_POSITION = 2
const PERCENTAGE_DOT_POSITION = 2

type requestType = getThermalEfficiencyForecastRequest & { "unit-id"?: string }
type responseData = getThermalEfficiencyForecastResponse
type database = thermalEfficiencyForecastDatabaseType
type snowflake = thermalEfficiencyForecastSnowflakeType

type unitId = string
type unitIdAndFiscalYear = string
type unitIdAndStoppageCode = string

const getThermalEfficiencyMySQLRecord = (thermalEfficiencyMySQLdata: database[]) =>
  thermalEfficiencyMySQLdata.reduce(
    (acc, cur) => {
      acc[`${cur.UNIT_CODE}:${cur.FISCAL_YEAR}`] = cur
      return acc
    },
    {} as Record<unitIdAndFiscalYear, database>,
  )

const transformSf = (thermalEfficiency: snowflake[]) =>
  thermalEfficiency.map<responseData>((x) => ({
    "plant-id": x.PLANT_CODE,
    "unit-id": x.UNIT_CODE,
    "fiscal-year": x.FISCAL_YEAR,
    value: null,
    "correction-value": null,
    sum: fixedNumber(x.VALUE * Math.pow(10, PERCENTAGE_DOT_POSITION)),
  }))

const transformUnitList = (unitList: { "unit-id": string }[]) => unitList.map((x) => x["unit-id"])

const getTargetAndCurrentSfData = (input: requestType, snowflakeData: responseData[]) => {
  const currentData = snowflakeData
    .filter((x) => x["fiscal-year"] === currentFiscalYear())
    .reduce(
      (acc, cur) => {
        acc[cur["unit-id"]] = cur
        return acc
      },
      {} as Record<unitId, responseData>,
    )
  const targetData = snowflakeData.filter(
    (x) =>
      x["fiscal-year"] <= currentFiscalYear() &&
      (input["start-fiscal-year"] === undefined ||
        (input["start-fiscal-year"] !== undefined && x["fiscal-year"] >= input["start-fiscal-year"])) &&
      (input["end-fiscal-year"] === undefined ||
        (input["end-fiscal-year"] !== undefined && x["fiscal-year"] <= input["end-fiscal-year"])),
  )
  return { currentData, targetData }
}

const getStoppageListFn = async (unitList: string[], endFiscalYear: number, transactionCmn: Transaction) =>
  unitList.length === 0
    ? {}
    : await getStoppageList(unitList, endFiscalYear, transactionCmn).then((res) => transformStoppage(res))

const transformStoppage = (stoppageDbData: stoppageDb[]) =>
  stoppageDbData
    .map((x) => ({
      "unit-id": x["unit-id"],
      "type-of-stoppage-text": x["type-of-stoppage-text"],
      "fiscal-year": getFiscalYear(new Date(x.date)),
    }))
    .reduce(
      (acc, cur) => {
        if (acc[`${cur["unit-id"]}:${cur["fiscal-year"]}`] === undefined) {
          acc[`${cur["unit-id"]}:${cur["fiscal-year"]}`] = []
        }
        acc[`${cur["unit-id"]}:${cur["fiscal-year"]}`].push(cur)
        return acc
      },
      {} as Record<unitIdAndFiscalYear, stoppageType[]>,
    )

const getRecoveryMasterFn = async (unitList: string[], transactionCmn: Transaction) =>
  unitList.length === 0
    ? {}
    : await getRecoveryMaster(unitList, transactionCmn).then((res) => transformRecoveryMaster(res))

const transformRecoveryMaster = (recoveryMaster: recoveryType[]) =>
  recoveryMaster.reduce(
    (acc, cur) => {
      acc[`${cur["unit-id"]}:${cur["type-of-stoppage-text"]}`] = {
        "unit-id": cur["unit-id"],
        "type-of-stoppage-text": cur["type-of-stoppage-text"],
        "thermal-efficiency-recovery": Number(cur["thermal-efficiency-recovery"]),
      }
      return acc
    },
    {} as Record<unitIdAndStoppageCode, recoveryType>,
  )

const getDecreaseMasterFn = async (unitList: string[], transactionCmn: Transaction) =>
  unitList.length === 0
    ? {}
    : await getThermalEfficiencyDecreaseMaster(unitList, transactionCmn).then((res) => transformDecreaseMaster(res))

const transformDecreaseMaster = (decreaseMaster: decreaseType[]) =>
  decreaseMaster.reduce(
    (acc, cur) => {
      acc[`${cur["unit-id"]}`] = {
        "unit-id": cur["unit-id"],
        "thermal-efficiency-decrease": Number(cur["thermal-efficiency-decrease"]),
      }
      return acc
    },
    {} as Record<unitId, decreaseType>,
  )

const getMaxFiscalYear = (input: requestType, thermalEfficiencyMySQLData: database[]) => {
  const maxDatabase = Math.max(0, ...thermalEfficiencyMySQLData.map((x) => x.FISCAL_YEAR))
  return input["end-fiscal-year"] === undefined || input["end-fiscal-year"] <= maxDatabase
    ? maxDatabase
    : input["end-fiscal-year"]
}

const getAssumedDecrease = (
  currentFiscalYearValue: number,
  halfOfTargetFiscalYearRecoveryValue: number,
  curToLastFiscalYearRecoveryValue: number,
  decreaseAmount: number,
) => {
  const sum =
    toInt(currentFiscalYearValue, CALC_DOT_POSITION) +
    toInt(halfOfTargetFiscalYearRecoveryValue, CALC_DOT_POSITION) +
    (toInt(curToLastFiscalYearRecoveryValue, CALC_DOT_POSITION) + toInt(decreaseAmount, CALC_DOT_POSITION))

  const ret = sum / Math.pow(10, CALC_DOT_POSITION)
  return ret
}

const getFiscalYearRecoveryValue = (
  unitId: string,
  targetYearStoppages: string[],
  recoveryMaster: Record<string, recoveryType>,
) =>
  targetYearStoppages
    .map((x) =>
      recoveryMaster[`${unitId}:${x}`] === undefined
        ? 0
        : recoveryMaster[`${unitId}:${x}`]["thermal-efficiency-recovery"],
    )
    .reduce((acc, cur) => acc + toInt(cur, CALC_DOT_POSITION), 0) / Math.pow(10, CALC_DOT_POSITION)

const getHalfOfFiscalYearRecoveryValue = (
  unitId: string,
  targetYearStoppages: string[],
  recoveryMaster: Record<string, recoveryType>,
) => {
  const sumOfRevoveryValues = toInt(
    getFiscalYearRecoveryValue(unitId, targetYearStoppages, recoveryMaster),
    CALC_DOT_POSITION,
  )
  return sumOfRevoveryValues / 2 / Math.pow(10, CALC_DOT_POSITION)
}

const getRecoverySum = (originalSum: number, addedValue: number) => {
  const intValue = toInt(originalSum, CALC_DOT_POSITION) + toInt(addedValue, CALC_DOT_POSITION)
  return intValue / Math.pow(10, CALC_DOT_POSITION)
}

const getTargetStoppage = (stoppageList: Record<unitIdAndFiscalYear, stoppageType[]>, key: unitIdAndFiscalYear) =>
  stoppageList[key] === undefined ? [] : stoppageList[key].map((y) => y["type-of-stoppage-text"])

const getDecreaseValueInt = (
  decreaseMaster: Record<unitId, decreaseType>,
  key: unitId,
  targetFiscalYear: number,
  startFiscalYear: number,
) =>
  decreaseMaster[key] === undefined
    ? 0
    : toInt(decreaseMaster[key]["thermal-efficiency-decrease"], CALC_DOT_POSITION) *
      (targetFiscalYear - startFiscalYear + 1)

const calculateAssumedDecrease = (
  plantId: string,
  startFiscalYear: number,
  endFiscalYear: number,
  currentFiscalYearSfData: Record<unitId, responseData>,
  thermalEfficiencyMySQLRecord: Record<unitIdAndFiscalYear, database>,
  unitList: string[],
  stoppageList: Record<unitIdAndFiscalYear, stoppageType[]>,
  recoveryMaster: Record<unitIdAndStoppageCode, recoveryType>,
  decreaseMaster: Record<unitId, decreaseType>,
): calculatedValueType[] => {
  const recoveryValueSum: Record<unitId, number> = unitList.reduce(
    (acc, cur) => {
      acc[cur] = 0
      return acc
    },
    {} as Record<unitId, number>,
  )
  const ret: calculatedValueType[] = []
  for (let targetFiscalYear = startFiscalYear; targetFiscalYear <= endFiscalYear; targetFiscalYear++) {
    const fiscalData = unitList.map((targetUnitId) => {
      const targetStoppages = getTargetStoppage(stoppageList, `${targetUnitId}:${targetFiscalYear}`)
      const halfOfFiscalYearRecoberyValue = getHalfOfFiscalYearRecoveryValue(
        targetUnitId,
        targetStoppages,
        recoveryMaster,
      )
      const decreaseValueInt = getDecreaseValueInt(decreaseMaster, targetUnitId, targetFiscalYear, startFiscalYear)
      const decreaseValue = decreaseValueInt / Math.pow(10, CALC_DOT_POSITION)
      const ret =
        currentFiscalYearSfData[targetUnitId] === undefined
          ? undefined
          : {
              "plant-id": plantId,
              "unit-id": targetUnitId,
              "fiscal-year": targetFiscalYear,
              "correction-value":
                thermalEfficiencyMySQLRecord[`${targetUnitId}:${targetFiscalYear}`] === undefined
                  ? null
                  : thermalEfficiencyMySQLRecord[`${targetUnitId}:${targetFiscalYear}`].CORRECTION_VALUE,
              value: getAssumedDecrease(
                currentFiscalYearSfData[targetUnitId].sum,
                halfOfFiscalYearRecoberyValue,
                recoveryValueSum[targetUnitId],
                Number(decreaseValue.toFixed(CALC_DOT_POSITION)),
              ),
            }
      recoveryValueSum[targetUnitId] = getRecoverySum(
        recoveryValueSum[targetUnitId],
        getFiscalYearRecoveryValue(targetUnitId, targetStoppages, recoveryMaster),
      )

      return ret
    })
    ret.push(...fiscalData.filter((x): x is Exclude<typeof x, undefined> => x !== undefined))
  }

  return ret
}

const calculateSumValue = (calculatedAssumeDecrease: calculatedValueType[]) =>
  calculatedAssumeDecrease.map((x) => {
    const sum =
      toInt(x.value, CALC_DOT_POSITION) +
      (x["correction-value"] === null ? 0 : toInt(x["correction-value"], CALC_DOT_POSITION))

    return {
      "plant-id": x["plant-id"],
      "unit-id": x["unit-id"],
      "fiscal-year": x["fiscal-year"],
      value: x.value,
      "correction-value": x["correction-value"],
      sum: sum / Math.pow(10, CALC_DOT_POSITION),
    }
  })

const getResValue = (value: number | null) =>
  value === null
    ? null
    : Math.round(fixedNumber(value * Math.pow(10, RES_DOT_POSITION))) / Math.pow(10, RES_DOT_POSITION)

const getResDotPosition = (response: responseData[]): responseData[] =>
  response.map((x) => ({
    ...x,
    "correction-value": getResValue(x["correction-value"]),
    value: getResValue(x.value),
    sum: getResValue(x.sum) || 0,
  }))

const calculateValues = (
  plantId: string,
  startFiscalYear: number,
  endFiscalYear: number,
  currentFiscalYearSfData: Record<unitId, responseData>,
  thermalEfficiencyMySQLRecord: Record<unitIdAndFiscalYear, database>,
  unitList: string[],
  stoppageList: Record<unitIdAndFiscalYear, stoppageType[]>,
  recoveryMaster: Record<unitIdAndStoppageCode, recoveryType>,
  decreaseMaster: Record<unitId, decreaseType>,
): responseData[] =>
  calculateSumValue(
    calculateAssumedDecrease(
      plantId,
      startFiscalYear,
      endFiscalYear,
      currentFiscalYearSfData,
      thermalEfficiencyMySQLRecord,
      unitList,
      stoppageList,
      recoveryMaster,
      decreaseMaster,
    ),
  )

export const getThermalEfficiencyForecastFn = async (input: requestType): Promise<responseData[]> => {
  const thermalEfficiencyMySQLData = await wrapInTransaction((transaction) =>
    getThermalEfficiencyForecastData(input, transaction),
  )
  const { currentData: currentThermalEfficiencySfData, targetData: thermalEfficiencySfData } =
    await wrapInSnowflakeTransaction((snowflakeTransaction) =>
      getThermalEfficiencyForecastSfData(input, snowflakeTransaction),
    )
      .then((res) => transformSf(res))
      .then((res) => getTargetAndCurrentSfData(input, res))

  if (thermalEfficiencyMySQLData.length === 0 && input["end-fiscal-year"] === undefined) {
    return thermalEfficiencySfData
  }

  const [unitList, stoppageList, recoveryMaster, decreaseMaster] = await wrapInTransactionCmn<
    [
      string[],
      Record<unitIdAndFiscalYear, stoppageType[]>,
      Record<unitIdAndStoppageCode, recoveryType>,
      Record<unitId, decreaseType>,
    ]
  >(async (transactionCmn) => {
    const unitList =
      input["unit-id"] === undefined
        ? await getUnitList(input, transactionCmn).then((res) => transformUnitList(res))
        : [input["unit-id"]]

    return await Promise.all([
      unitList,
      getStoppageListFn(unitList, getMaxFiscalYear(input, thermalEfficiencyMySQLData), transactionCmn),
      getRecoveryMasterFn(unitList, transactionCmn),
      getDecreaseMasterFn(unitList, transactionCmn),
    ])
  })

  const thermalEfficiencyRecord = getThermalEfficiencyMySQLRecord(thermalEfficiencyMySQLData)
  const startFiscalYear =
    input["start-fiscal-year"] === undefined || input["start-fiscal-year"] <= currentFiscalYear()
      ? currentFiscalYear() + 1
      : input["start-fiscal-year"]
  const endFiscalYear =
    input["end-fiscal-year"] === undefined
      ? Math.max(...thermalEfficiencyMySQLData.map((x) => x.FISCAL_YEAR))
      : input["end-fiscal-year"]

  const mySQLCalculatedData = calculateValues(
    input["plant-id"],
    startFiscalYear,
    endFiscalYear,
    currentThermalEfficiencySfData,
    thermalEfficiencyRecord,
    unitList,
    stoppageList,
    recoveryMaster,
    decreaseMaster,
  )

  return [thermalEfficiencySfData, mySQLCalculatedData].flat()
}

export const getThermalEfficiencyResDotPosition = getResDotPosition

export const calcAndResTestFn = (
  plantId: string,
  startFiscalYear: number,
  endFiscalYear: number,
  currentFiscalYearSfData: Record<unitId, responseData>,
  thermalEfficiencyMySQLRecord: Record<unitIdAndFiscalYear, database>,
  unitList: string[],
  stoppageList: Record<unitIdAndFiscalYear, stoppageType[]>,
  recoveryMaster: Record<unitIdAndStoppageCode, recoveryType>,
  decreaseMaster: Record<unitId, decreaseType>,
): getThermalEfficiencyForecastResponse[] =>
  getResDotPosition(
    calculateValues(
      plantId,
      startFiscalYear,
      endFiscalYear,
      currentFiscalYearSfData,
      thermalEfficiencyMySQLRecord,
      unitList,
      stoppageList,
      recoveryMaster,
      decreaseMaster,
    ),
  )

export const calcTestFn = calculateValues

export const getRecoveryMasterTestFn = (
  unitList: string[],
  transactionCmn: Transaction,
): Promise<Record<unitIdAndStoppageCode, recoveryType>> =>
  getRecoveryMaster(unitList, transactionCmn).then((res) => transformRecoveryMaster(res))

export const getDecreaseMasterTestFn = (
  unitList: string[],
  transactionCmn: Transaction,
): Promise<Record<unitId, decreaseType>> =>
  getThermalEfficiencyDecreaseMaster(unitList, transactionCmn).then((res) => transformDecreaseMaster(res))
