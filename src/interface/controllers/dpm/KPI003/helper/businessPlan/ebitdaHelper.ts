import { getBasicChargeForecastSummaryData } from "../../../../../../domain/entities/dpm/basicChargeForecastSummary.js"
import {
  getEbitdaForecastResponse,
  basicChargeForecastDbType,
  ebitdaForecastSnowflakeType,
  basicChargeForecastType,
} from "../../../../../../domain/entities/dpm/ebitdaForecast.js"
import {
  getEbitdaForecastSummaryRequest,
  getEbitdaForecastSummaryResponse,
} from "../../../../../../domain/entities/dpm/ebitdaForecastSummary.js"
import { getGrossMarginForecastResponse } from "../../../../../../domain/entities/dpm/grossMarginForecast.js"
import { getGrossMarginForecastSummaryResponse } from "../../../../../../domain/entities/dpm/grossMarginForecastSummary.js"
import { getOpexForecastResponse } from "../../../../../../domain/entities/dpm/opexForecast.js"
import { getOpexForecastSummaryResponse } from "../../../../../../domain/entities/dpm/opexForecastSummary.js"
import {
  SnowflakeTransaction,
  wrapInSnowflakeTransaction,
} from "../../../../../../infrastructure/orm/snowflake/index.js"
import { wrapInTransaction } from "../../../../../../infrastructure/orm/sqlize/index.js"
import { getOpexForecastFn } from "../../getOpexForecastController.js"
import { currentFiscalYear, fixedNumber } from "./businessPlanHelper.js"
import { getBasicChargForecastData, getEbitdaForecastSfData, getEbitdaForecastSummarySfData } from "./ebitdaDbHelper.js"
import { getGrossMarginForecastFn } from "./grossMarginHelper.js"

const ONE_HANDRED_MILLION = 100000000

type requestType = {
  "plant-id": string
  "unit-id"?: string
  "start-fiscal-year"?: number
  "end-fiscal-year"?: number
}

type requestSummaryType = getEbitdaForecastSummaryRequest
type responseDataType = getEbitdaForecastResponse
type responseSummaryDataType = getEbitdaForecastSummaryResponse

type basicChargeDbType = basicChargeForecastDbType
type snowflakeType = ebitdaForecastSnowflakeType

type unitIdAndFiscalYear = string
type plantIdAndFiscalYear = string

const transform = async (data: basicChargeDbType[]) =>
  data.map((x) => ({
    "plant-id": x.PLANT_CODE,
    "unit-id": x.UNIT_CODE,
    "fiscal-year": x.FISCAL_YEAR,
    "operation-input": Number(x.OPERATION_INPUT),
    "maintenance-input": Number(x.MAINTENANCE_INPUT),
    sum: Number(x.SUM),
  }))

const createRecordByUnitIdAndFiscalYear = <T extends { "unit-id": string; "fiscal-year": number }>(data: T[]) =>
  data.reduce(
    (acc, cur) => {
      acc[`${cur["unit-id"]}:${cur["fiscal-year"]}`] = cur
      return acc
    },
    {} as Record<unitIdAndFiscalYear, T>,
  )
const createRecordByPlantIdAndFiscalYear = <T extends { "plant-id": string; "fiscal-year": number }>(data: T[]) =>
  data.reduce(
    (acc, cur) => {
      acc[`${cur["plant-id"]}:${cur["fiscal-year"]}`] = cur
      return acc
    },
    {} as Record<plantIdAndFiscalYear, T>,
  )

const transformSf = (data: snowflakeType[]) =>
  data.map((x) => ({
    "plant-id": x.PLANT_CODE,
    "unit-id": x.UNIT_CODE,
    "fiscal-year": x.FISCAL_YEAR,
    value: Math.trunc(x.VALUE / 1000000) / 100, // convert value into 億円 from 円 & trunc the value to two decimal place
  }))

const transformSfYen = (data: snowflakeType[]) =>
  data.map((x) => ({
    "plant-id": x.PLANT_CODE,
    "unit-id": x.UNIT_CODE,
    "fiscal-year": x.FISCAL_YEAR,
    value: x.VALUE,
  }))

const getAfterCurrentFiscalYear = (fiscalYear: number | undefined) => {
  return fiscalYear === undefined || fiscalYear <= currentFiscalYear() ? currentFiscalYear() + 1 : fiscalYear
}

const calcEbitda = (
  grossMarginData: getGrossMarginForecastResponse[],
  opexData: Record<unitIdAndFiscalYear, getOpexForecastResponse>,
  basicCharge: Record<unitIdAndFiscalYear, basicChargeForecastType>,
) =>
  grossMarginData
    .map((x) => {
      const key = `${x["unit-id"]}:${x["fiscal-year"]}`
      if (basicCharge[key] === undefined) {
        return
      }
      if (opexData[key] === undefined) {
        return
      }
      return {
        "plant-id": x["plant-id"],
        "unit-id": x["unit-id"],
        "fiscal-year": x["fiscal-year"],
        value: fixedNumber(x.value + basicCharge[key].sum - opexData[key].sum),
      }
    })
    .filter((x): x is Exclude<typeof x, undefined> => x !== undefined)

const calcEbitdaForSummary = (
  grossMarginData: getGrossMarginForecastSummaryResponse[],
  opexData: Record<plantIdAndFiscalYear, getOpexForecastSummaryResponse>,
  basicCharge: Record<plantIdAndFiscalYear, getBasicChargeForecastSummaryData>,
) =>
  grossMarginData
    .map((x) => {
      const key = `${x["plant-id"]}:${x["fiscal-year"]}`
      if (basicCharge[key] === undefined) {
        return
      }
      if (opexData[key] === undefined) {
        return
      }
      return {
        "plant-id": x["plant-id"],
        "fiscal-year": x["fiscal-year"],
        value: fixedNumber(x.value + basicCharge[key].value - opexData[key].sum),
      }
    })
    .filter((x): x is Exclude<typeof x, undefined> => x !== undefined)

export const truncEbitda = <T extends { value: number }>(ebitda: T[]): T[] =>
  ebitda.map((x) => ({
    ...x,
    value: Math.trunc(fixedNumber(x.value * 100)) / 100, // 小数点以下第2位で切り捨て
  }))

const convetOneHandredMillionYenToYen = (ebitda: responseDataType[]) =>
  ebitda.map((x) => ({
    "plant-id": x["plant-id"],
    "unit-id": x["unit-id"],
    "fiscal-year": x["fiscal-year"],
    value: x.value * ONE_HANDRED_MILLION,
  }))

const ebitdaData = async (input: requestType): Promise<responseDataType[]> => {
  const [{ calculatedGrossMarginData }, opexForecastData, basicChargeForecastData, snowflakeData] = await Promise.all([
    getGrossMarginForecastFn({
      "plant-id": input["plant-id"],
      "unit-id": input["unit-id"],
      "start-fiscal-year": getAfterCurrentFiscalYear(input["start-fiscal-year"]),
      "end-fiscal-year": input["end-fiscal-year"],
    }),
    getOpexForecastFn({
      "plant-id": input["plant-id"],
      "unit-id": input["unit-id"],
      "start-fiscal-year": getAfterCurrentFiscalYear(input["start-fiscal-year"]),
      "end-fiscal-year": input["end-fiscal-year"],
    }).then(createRecordByUnitIdAndFiscalYear),
    wrapInTransaction((transaction) => getBasicChargForecastData(input, transaction))
      .then(transform)
      .then(createRecordByUnitIdAndFiscalYear),
    wrapInSnowflakeTransaction((snowflakeTransaction) =>
      getEbitdaForecastSfData(input, snowflakeTransaction).then(transformSf),
    ),
  ])

  const ebitdaData = calcEbitda(calculatedGrossMarginData, opexForecastData, basicChargeForecastData)

  return [ebitdaData, snowflakeData].flat()
}

const ebitdaYenData = async (input: requestType): Promise<responseDataType[]> => {
  const [{ calculatedGrossMarginData }, opexForecastData, basicChargeForecastData, snowflakeData] = await Promise.all([
    getGrossMarginForecastFn({
      "plant-id": input["plant-id"],
      "unit-id": input["unit-id"],
      "start-fiscal-year": getAfterCurrentFiscalYear(input["start-fiscal-year"]),
      "end-fiscal-year": input["end-fiscal-year"],
    }),
    getOpexForecastFn({
      "plant-id": input["plant-id"],
      "unit-id": input["unit-id"],
      "start-fiscal-year": getAfterCurrentFiscalYear(input["start-fiscal-year"]),
      "end-fiscal-year": input["end-fiscal-year"],
    }).then(createRecordByUnitIdAndFiscalYear),
    wrapInTransaction((transaction) => getBasicChargForecastData(input, transaction))
      .then(transform)
      .then(createRecordByUnitIdAndFiscalYear),
    wrapInSnowflakeTransaction((snowflakeTransaction) =>
      getEbitdaForecastSfData(input, snowflakeTransaction).then(transformSfYen),
    ),
  ])

  const ebitdaData = calcEbitda(calculatedGrossMarginData, opexForecastData, basicChargeForecastData)

  return [convetOneHandredMillionYenToYen(ebitdaData), snowflakeData].flat()
}

export const getEbitdaSummarySfData = async (
  input: requestSummaryType,
  swnoflakeTransaction: SnowflakeTransaction,
): Promise<getEbitdaForecastSummaryResponse[]> =>
  getEbitdaForecastSummarySfData(input, swnoflakeTransaction).then(transformSf)

export const calcEbitdaSummaryData = (
  grossMargin: getGrossMarginForecastSummaryResponse[],
  basicCharge: getBasicChargeForecastSummaryData[],
  opexData: getOpexForecastSummaryResponse[],
): responseSummaryDataType[] => {
  const ebitdaData = calcEbitdaForSummary(
    grossMargin,
    createRecordByPlantIdAndFiscalYear(opexData),
    createRecordByPlantIdAndFiscalYear(basicCharge),
  )

  return ebitdaData
}

export const getEbitdaForecastFn = ebitdaData
export const getEbitdaYenForecastFn = ebitdaYenData

export const testCalcEbitda = (
  grossMargin: getGrossMarginForecastResponse[],
  basicCharge: Record<unitIdAndFiscalYear, basicChargeForecastType>,
  opex: Record<unitIdAndFiscalYear, getOpexForecastResponse>,
): responseDataType[] => truncEbitda(calcEbitda(grossMargin, opex, basicCharge))
export const ebitdaDataFn = ebitdaData
