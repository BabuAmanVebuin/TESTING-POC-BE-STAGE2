import { Transaction } from "sequelize"
import { getFuelPriceForecastResponse } from "../../../../../../domain/entities/dpm/fuelPriceForecast.js"
import { getGenerationOutputForecastResponse } from "../../../../../../domain/entities/dpm/generationOutputForecast.js"
import {
  getGrossMarginForecastResponse,
  ppaThermalEfficiencyType,
  fuelUnitCalorificValueType,
  grossMarginForecastSnowflakeType,
} from "../../../../../../domain/entities/dpm/grossMarginForecast.js"
import { getThermalEfficiencyForecastResponse } from "../../../../../../domain/entities/dpm/thermalEfficiencyForecast.js"
import { wrapInSnowflakeTransaction } from "../../../../../../infrastructure/orm/snowflake/index.js"
import { wrapInTransactionCmn } from "../../../../../../infrastructure/orm/sqlize/index.js"
import { getFuelPriceForecastFn } from "../../getFuelPriceForecastController.js"
import { getGenerationOutputForecastFn } from "../../getGenerationOutputForecastController.js"
import { ascSort, currentFiscalYear, fixedNumber } from "./businessPlanHelper.js"
import {
  getPPAThermalEfficiencyMaster,
  getFuelUnitCalorificValueMaster,
  getGrossMarginForecastSfData,
  getGrossMarginForecastSummarySfData,
} from "./grossMarginDbHelper.js"
import { getThermalEfficiencyForecastFn } from "./thermalEfficiencyHelper.js"
import {
  getGrossMarginForecastSummaryRequest,
  getGrossMarginForecastSummaryResponse,
  grossMarginForecastSummarySnowflakeType,
} from "../../../../../../domain/entities/dpm/grossMarginForecastSummary.js"
import { getUnitList } from "./thermalEfficiencyDbHelper.js"

type requestType = {
  "plant-id": string
  "unit-id": string | undefined
  "start-fiscal-year"?: number
  "end-fiscal-year"?: number
}
type requestSummaryType = getGrossMarginForecastSummaryRequest
type responseDataType = getGrossMarginForecastResponse
type responseSummaryDataType = getGrossMarginForecastSummaryResponse
type snowflake = grossMarginForecastSnowflakeType
type summarySnowflake = grossMarginForecastSummarySnowflakeType

type unitId = string
type unitIdAndFiscalYear = string
type plantIdAndFiscalYear = string

const ONE_HANDRED_MILLION = 100000000
const RES_DOT_POSITION = 2

const transformPpaThermalEfficiencyMaster = (master: ppaThermalEfficiencyType[]) =>
  master.reduce(
    (acc, cur) => {
      acc[cur["unit-id"]] = {
        "ppa-thermal-efficiency": Number(cur["ppa-thermal-efficiency"]),
        "unit-id": cur["unit-id"],
      }
      return acc
    },
    {} as Record<unitId, ppaThermalEfficiencyType>,
  )

const transformFuelUnitCalorificValueMaster = (master: fuelUnitCalorificValueType[]) =>
  master.reduce(
    (acc, cur) => {
      acc[cur["unit-id"]] = {
        "fuel-unit-calorific-value": Number(cur["fuel-unit-calorific-value"]),
        "unit-id": cur["unit-id"],
      }
      return acc
    },
    {} as Record<unitId, fuelUnitCalorificValueType>,
  )

const transformSf = (data: snowflake[]) =>
  data.map((x) => ({
    "plant-id": x.PLANT_CODE,
    "unit-id": x.UNIT_CODE,
    "fiscal-year": x.FISCAL_YEAR,
    value:
      Math.trunc(x.VALUE / (ONE_HANDRED_MILLION / Math.pow(10, RES_DOT_POSITION))) / Math.pow(10, RES_DOT_POSITION),
  }))

const transformSummarySf = (data: summarySnowflake[]) =>
  data.map((x) => ({
    "plant-id": x.PLANT_CODE,
    "fiscal-year": x.FISCAL_YEAR,
    value:
      Math.trunc(x.VALUE / (ONE_HANDRED_MILLION / Math.pow(10, RES_DOT_POSITION))) / Math.pow(10, RES_DOT_POSITION),
  }))

const transformGenerationOutputForecast = (data: getGenerationOutputForecastResponse[]) =>
  data.reduce(
    (acc, cur) => {
      acc[`${cur["unit-id"]}:${cur["fiscal-year"]}`] = cur
      return acc
    },
    {} as Record<unitIdAndFiscalYear, getGenerationOutputForecastResponse>,
  )

const transformFuelPriceForecast = (data: getFuelPriceForecastResponse[]) =>
  data.reduce(
    (acc, cur) => {
      acc[`${cur["plant-id"]}:${cur["fiscal-year"]}`] = cur
      return acc
    },
    {} as Record<plantIdAndFiscalYear, getFuelPriceForecastResponse>,
  )

const transformThermalEfficiencyForecast = (data: getThermalEfficiencyForecastResponse[]) =>
  data.reduce(
    (acc, cur) => {
      acc[`${cur["unit-id"]}:${cur["fiscal-year"]}`] = cur
      return acc
    },
    {} as Record<unitIdAndFiscalYear, getThermalEfficiencyForecastResponse>,
  )

const calculateValue = (
  generationOutput: number,
  fuelPrice: number,
  thermalEfficiency: number,
  ppaThermalEfficiency: number,
  fuelUnitCalorificValue: number,
) => {
  if (ppaThermalEfficiency === 0 || fuelUnitCalorificValue === 0) {
    return 0
  }
  const calculatedThermalEfficiency = 1 / ppaThermalEfficiency - 1 / thermalEfficiency
  const value = (((calculatedThermalEfficiency * 360 * fuelPrice) / fuelUnitCalorificValue) * generationOutput) / 100
  return fixedNumber(value)
}

const calculateGrossMargin = async (
  plantId: string,
  unitList: string[],
  generationOutputForecastRecord: Record<unitIdAndFiscalYear, getGenerationOutputForecastResponse>,
  fuelPriceRecord: Record<plantIdAndFiscalYear, getFuelPriceForecastResponse>,
  fiscalYearList: number[],
  thermalEfficiencyRecord: Record<unitIdAndFiscalYear, getThermalEfficiencyForecastResponse>,
  ppaThermalEfficiencyMater: Record<unitId, ppaThermalEfficiencyType>,
  fuelUnitCalorificValueMaster: Record<unitId, fuelUnitCalorificValueType>,
): Promise<getGrossMarginForecastResponse[]> =>
  unitList.flatMap((targetUnitId) => {
    const ret: responseDataType[] = []
    for (const targetFiscalYear of fiscalYearList) {
      const targetGenerationOutput = generationOutputForecastRecord[`${targetUnitId}:${targetFiscalYear}`]
      const targetFuelPrice = fuelPriceRecord[`${plantId}:${targetFiscalYear}`]
      const targetTharmalEfficiency = thermalEfficiencyRecord[`${targetUnitId}:${targetFiscalYear}`]
      if (
        targetGenerationOutput === undefined ||
        (targetGenerationOutput.sum === null && targetGenerationOutput["correction-value"] === null)
      ) {
        break
      }
      if (targetFuelPrice === undefined || targetFuelPrice.value === null) {
        break
      }
      if (targetTharmalEfficiency === undefined || targetTharmalEfficiency.sum === 0) {
        break
      }

      const targetGenerationOutputValue = targetGenerationOutput.sum
      const targetFuelPriceValue = targetFuelPrice.value
      const targetTharmalEfficiencyValue = thermalEfficiencyRecord[`${targetUnitId}:${targetFiscalYear}`].sum
      const targetPPAThermalEfficiency = ppaThermalEfficiencyMater[targetUnitId]["ppa-thermal-efficiency"]
      const targetFuelUnitCalorificValue = fuelUnitCalorificValueMaster[targetUnitId]["fuel-unit-calorific-value"]
      ret.push({
        "fiscal-year": targetFiscalYear,
        "plant-id": plantId,
        "unit-id": targetUnitId,
        value: calculateValue(
          targetGenerationOutputValue,
          targetFuelPriceValue,
          targetTharmalEfficiencyValue,
          targetPPAThermalEfficiency,
          targetFuelUnitCalorificValue,
        ),
      })
    }
    return ret
  })

const truncGrossMarginValue = (value: number) =>
  Math.trunc(fixedNumber(value * Math.pow(10, RES_DOT_POSITION), RES_DOT_POSITION)) / Math.pow(10, RES_DOT_POSITION)

export const truncGrossMarginSummary = (
  grossMarginList: getGrossMarginForecastSummaryResponse[],
): getGrossMarginForecastSummaryResponse[] =>
  grossMarginList.map((x) => ({
    "fiscal-year": x["fiscal-year"],
    "plant-id": x["plant-id"],
    value: truncGrossMarginValue(x.value),
  }))

const calculateTruncedGrossMargin = (
  plantId: string,
  unitList: string[],
  generationOutputForecastRecord: Record<unitIdAndFiscalYear, getGenerationOutputForecastResponse>,
  fuelPriceRecord: Record<plantIdAndFiscalYear, getFuelPriceForecastResponse>,
  fiscalYearList: number[],
  thermalEfficiencyRecord: Record<unitIdAndFiscalYear, getThermalEfficiencyForecastResponse>,
  ppaThermalEfficiencyMater: Record<unitId, ppaThermalEfficiencyType>,
  fuelUnitCalorificValueMaster: Record<unitId, fuelUnitCalorificValueType>,
): Promise<getGrossMarginForecastResponse[]> =>
  calculateGrossMargin(
    plantId,
    unitList,
    generationOutputForecastRecord,
    fuelPriceRecord,
    ascSort(fiscalYearList),
    thermalEfficiencyRecord,
    ppaThermalEfficiencyMater,
    fuelUnitCalorificValueMaster,
  ).then(truncGrossMargin)

const calculateGrossMarginSummary = (calculatedGrossMarginForecast: responseSummaryDataType[]) =>
  calculatedGrossMarginForecast.reduce(
    (acc, cur) => {
      if (acc[`${cur["plant-id"]}:${cur["fiscal-year"]}`] === undefined) {
        acc[`${cur["plant-id"]}:${cur["fiscal-year"]}`] = {
          "fiscal-year": cur["fiscal-year"],
          "plant-id": cur["plant-id"],
          value: 0,
        }
      }
      acc[`${cur["plant-id"]}:${cur["fiscal-year"]}`].value += cur.value
      return acc
    },
    {} as Record<plantIdAndFiscalYear, responseSummaryDataType>,
  )

const getGrossMarginSummary = async (
  plantId: string,
  unitList: string[],
  generationOutputForecastRecord: Record<unitIdAndFiscalYear, getGenerationOutputForecastResponse>,
  fuelPriceRecord: Record<plantIdAndFiscalYear, getFuelPriceForecastResponse>,
  fiscalYearList: number[],
  thermalEfficiencyRecord: Record<unitIdAndFiscalYear, getThermalEfficiencyForecastResponse>,
  ppaThermalEfficiencyMater: Record<unitId, ppaThermalEfficiencyType>,
  fuelUnitCalorificValueMaster: Record<unitId, fuelUnitCalorificValueType>,
): Promise<responseSummaryDataType[]> => {
  const calculatedGrossMarginData = await calculateGrossMargin(
    plantId,
    unitList,
    generationOutputForecastRecord,
    fuelPriceRecord,
    ascSort(fiscalYearList),
    thermalEfficiencyRecord,
    ppaThermalEfficiencyMater,
    fuelUnitCalorificValueMaster,
  )

  return Object.values(calculateGrossMarginSummary(calculatedGrossMarginData))
}

const getGrossMarginForecast = async (
  input: requestType,
): Promise<{
  grossMarginSfData: responseDataType[]
  calculatedGrossMarginData: responseDataType[]
}> => {
  const grossMarginSfData = await wrapInSnowflakeTransaction((snowflakeTransaction) =>
    getGrossMarginForecastSfData(input, snowflakeTransaction),
  ).then(transformSf)

  if (input["end-fiscal-year"] !== undefined && input["end-fiscal-year"] <= currentFiscalYear()) {
    return { grossMarginSfData, calculatedGrossMarginData: [] }
  }

  const generationOutputData = await getGenerationOutputForecastFn(input)
  const generartionOutputRecord = transformGenerationOutputForecast(generationOutputData)
  const fuelPriceData = await getFuelPriceForecastFn(input)
  const fuelPriceRecord = transformFuelPriceForecast(fuelPriceData)

  const [ppaThermalEfficiencyMater, fuelUnitCalorificValueMaster] = await wrapInTransactionCmn((transactionCmn) =>
    Promise.all([
      getPPAThermalEfficiencyMaster(
        {
          plantId: input["plant-id"],
          unitList: input["unit-id"] === undefined ? undefined : [input["unit-id"]],
        },
        transactionCmn,
      ).then(transformPpaThermalEfficiencyMaster),
      getFuelUnitCalorificValueMaster(
        {
          plantId: input["plant-id"],
          unitId: input["unit-id"],
        },
        transactionCmn,
      ).then(transformFuelUnitCalorificValueMaster),
    ]),
  )

  const fiscalYearList = Array.from(
    new Set([...generationOutputData.map((x) => x["fiscal-year"]), ...fuelPriceData.map((x) => x["fiscal-year"])]),
  ).filter((x) => x > currentFiscalYear())

  const thermalEfficiencyData =
    fiscalYearList.length === 0
      ? {}
      : await getThermalEfficiencyForecastFn({
          ...input,
          "start-fiscal-year": Math.min(...fiscalYearList) || undefined,
          "end-fiscal-year": Math.max(...fiscalYearList) || undefined,
        }).then(transformThermalEfficiencyForecast)

  const unitIdList =
    input["unit-id"] === undefined
      ? Array.from(new Set(Object.values(thermalEfficiencyData).map((x) => x["unit-id"])))
      : [input["unit-id"]]

  const calculatedGrossMarginData = await calculateGrossMargin(
    input["plant-id"],
    unitIdList,
    generartionOutputRecord,
    fuelPriceRecord,
    ascSort(fiscalYearList),
    thermalEfficiencyData,
    ppaThermalEfficiencyMater,
    fuelUnitCalorificValueMaster,
  )

  return { grossMarginSfData, calculatedGrossMarginData }
}

const getGrossMarginForecastSummary = async (
  input: requestSummaryType,
): Promise<{
  grossMarginSfData: responseSummaryDataType[]
  calculatedGrossMarginData: responseSummaryDataType[]
}> => {
  const grossMarginSfData = await wrapInSnowflakeTransaction((snowflakeTransaction) =>
    getGrossMarginForecastSummarySfData(input, snowflakeTransaction),
  ).then(transformSummarySf)

  if (input["end-fiscal-year"] !== undefined && input["end-fiscal-year"] <= currentFiscalYear()) {
    return { grossMarginSfData, calculatedGrossMarginData: [] }
  }

  const generationOutputData = await getGenerationOutputForecastFn(input)
  const generartionOutputRecord = transformGenerationOutputForecast(generationOutputData)
  const fuelPriceData = await getFuelPriceForecastFn(input)
  const fuelPriceRecord = transformFuelPriceForecast(fuelPriceData)

  const [ppaThermalEfficiencyMater, fuelUnitCalorificValueMaster, unitList] = await wrapInTransactionCmn(
    (transactionCmn) =>
      Promise.all([
        getPPAThermalEfficiencyMaster({ plantId: input["plant-id"] }, transactionCmn).then(
          transformPpaThermalEfficiencyMaster,
        ),
        getFuelUnitCalorificValueMaster(
          {
            plantId: input["plant-id"],
          },
          transactionCmn,
        ).then(transformFuelUnitCalorificValueMaster),
        getUnitList(input, transactionCmn).then((res) => res.map((x) => x["unit-id"])),
      ]),
  )

  const fiscalYearList = Array.from(
    new Set([...generationOutputData.map((x) => x["fiscal-year"]), ...fuelPriceData.map((x) => x["fiscal-year"])]),
  ).filter((x) => x > currentFiscalYear())
  const thermalEfficiencyData =
    fiscalYearList.length === 0
      ? {}
      : await getThermalEfficiencyForecastFn({
          ...input,
          "start-fiscal-year": Math.min(...fiscalYearList) || undefined,
          "end-fiscal-year": Math.max(...fiscalYearList) || undefined,
        }).then(transformThermalEfficiencyForecast)

  const calculatedGrossMarginData = await getGrossMarginSummary(
    input["plant-id"],
    unitList,
    generartionOutputRecord,
    fuelPriceRecord,
    ascSort(fiscalYearList),
    thermalEfficiencyData,
    ppaThermalEfficiencyMater,
    fuelUnitCalorificValueMaster,
  )

  return { grossMarginSfData, calculatedGrossMarginData }
}

export const truncGrossMargin = (grossMarginList: getGrossMarginForecastResponse[]): responseDataType[] =>
  grossMarginList.map((x) => ({
    "fiscal-year": x["fiscal-year"],
    "plant-id": x["plant-id"],
    "unit-id": x["unit-id"],
    value: truncGrossMarginValue(x.value),
  }))

export const getGrossMarginForecastFn = getGrossMarginForecast
export const getGrossMarginForecastSummaryFn = getGrossMarginForecastSummary

export const calculateTruncedGrossMarginTestFn = calculateTruncedGrossMargin
export const calculateGrossMarginSummaryTestFn = (
  plantId: string,
  unitList: string[],
  generationOutputForecastRecord: Record<unitIdAndFiscalYear, getGenerationOutputForecastResponse>,
  fuelPriceRecord: Record<plantIdAndFiscalYear, getFuelPriceForecastResponse>,
  fiscalYearList: number[],
  thermalEfficiencyRecord: Record<unitIdAndFiscalYear, getThermalEfficiencyForecastResponse>,
  ppaThermalEfficiencyMater: Record<unitId, ppaThermalEfficiencyType>,
  fuelUnitCalorificValueMaster: Record<unitId, fuelUnitCalorificValueType>,
): Promise<responseSummaryDataType[]> =>
  getGrossMarginSummary(
    plantId,
    unitList,
    generationOutputForecastRecord,
    fuelPriceRecord,
    fiscalYearList,
    thermalEfficiencyRecord,
    ppaThermalEfficiencyMater,
    fuelUnitCalorificValueMaster,
  ).then(truncGrossMarginSummary)

export const getPPAThermalEfficiencyMasterTestFn = (
  input: requestType,
  transactionCmn: Transaction,
): Promise<Record<string, ppaThermalEfficiencyType>> =>
  getPPAThermalEfficiencyMaster(
    {
      plantId: input["plant-id"],
      unitList: input["unit-id"] === undefined ? undefined : [input["unit-id"]],
    },
    transactionCmn,
  ).then(transformPpaThermalEfficiencyMaster)
export const getFluelUnitCalorificValueMasterTestFn = (
  input: requestType,
  transactionCmn: Transaction,
): Promise<Record<string, fuelUnitCalorificValueType>> =>
  getFuelUnitCalorificValueMaster(
    {
      plantId: input["plant-id"],
      unitId: input["unit-id"],
    },
    transactionCmn,
  ).then(transformFuelUnitCalorificValueMaster)
