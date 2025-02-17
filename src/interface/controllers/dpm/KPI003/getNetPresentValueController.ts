import { Request } from "express"
import { jsonResponseWithErrorHandler } from "../../../decorators.js"
import { OptionalNumber } from "../../tot/v1/utils.js"
import { QueryTypes, Transaction } from "sequelize"
import { sequelize, wrapInTransactionCmn } from "../../../../infrastructure/orm/sqlize/index.js"
import { readSqlFile } from "./utils.js"
import { currentFiscalYear, fixedNumber } from "./helper/businessPlan/businessPlanHelper.js"
import {
  discountRateDbMaster,
  discountRateMaster,
  getNetPresentValueRequest,
  getNetPresentValueResponse,
  netPresentValueData,
} from "../../../../domain/entities/dpm/netPresentValue.js"
import { getEbitdaPlanFn } from "./getEBITDAPlanController.js"
import { getEbitdaYenForecastFn } from "./helper/businessPlan/ebitdaHelper.js"
import { getEbitdaForecastResponse } from "../../../../domain/entities/dpm/ebitdaForecast.js"

const MASTER_QUERY = readSqlFile("getDiscountRateMaster")

const ONE_HANDRED_MILLION = 100000000
const RES_DOT_POSITION = 2

type requestType = getNetPresentValueRequest
type responseType = getNetPresentValueResponse
type responseDataType = netPresentValueData

type ebitdaType = getEbitdaForecastResponse

type discountRateMasterDb = discountRateDbMaster
type discountRateMasterType = discountRateMaster

type unitId = string

const query = (input: requestType, inputQuery: string) => {
  let ret = inputQuery
  ret =
    input["unit-id"] === undefined
      ? ret.replace("%unitIdFilter%", "TRUE")
      : ret.replace("%unitIdFilter%", "UNIT_CODE = :unitId")

  ret =
    input["start-fiscal-year"] === undefined
      ? ret.replace("%startFiscalYearFilter%", "TRUE")
      : ret.replace("%startFiscalYearFilter%", "FISCAL_YEAR >= :startFiscalYear")

  ret =
    input["end-fiscal-year"] === undefined
      ? ret.replace("%endFiscalYearFilter%", "TRUE")
      : ret.replace("%endFiscalYearFilter%", "FISCAL_YEAR <= :endFiscalYear")

  return ret
}

export const getDiscountRateMaster = async (
  input: requestType,
  transaction: Transaction,
): Promise<discountRateMasterDb[]> =>
  await sequelize.query<discountRateMasterDb>(query(input, MASTER_QUERY), {
    replacements: {
      plantId: input["plant-id"],
      unitId: input["unit-id"],
    },
    type: QueryTypes.SELECT,
    transaction,
  })

export const transformDiscountRateMaster = (masterData: discountRateMasterDb[]): discountRateMaster[] =>
  masterData.map<discountRateMasterType>((x) => ({
    "unit-id": x.UNIT_CODE,
    "discount-rate": Number(x.DISCOUNT_RATE),
  }))

const getData = async (input: requestType) => {
  const [ebitdaPlan, ebitdaForecast, discountRateMaster] = await Promise.all([
    getEbitdaPlanFn(input),
    getEbitdaYenForecastFn(input),
    wrapInTransactionCmn((transactionCmn: Transaction) => getDiscountRateMaster(input, transactionCmn)).then(
      transformDiscountRateMaster,
    ),
  ])
  return {
    ebitdaPlan,
    ebitdaForecast,
    discountRateMaster,
  }
}

const getDiscountRateMasterRecord = (master: discountRateMaster[]) =>
  master.reduce(
    (acc, cur) => {
      acc[cur["unit-id"]] = cur
      return acc
    },
    {} as Record<unitId, discountRateMaster>,
  )

const calculateValue = (
  ebitda: ebitdaType[],
  discountRateMaster: Record<unitId, discountRateMaster>,
  currentFiscalYear: number,
) =>
  ebitda.map((x) => {
    const fiscalYearPassed = x["fiscal-year"] <= currentFiscalYear ? 0 : x["fiscal-year"] - currentFiscalYear
    const npv = x.value * ((100 + discountRateMaster[x["unit-id"]]["discount-rate"]) / 100) ** -fiscalYearPassed
    return {
      ...x,
      value: fixedNumber(npv),
    }
  })

const sumValues = (values: ebitdaType[]) => values.reduce((acc, cur) => (acc += cur.value), 0)

const convertToHandredMillionYenFromYen = (value: number | null) =>
  value === null
    ? null
    : Math.trunc(value / (ONE_HANDRED_MILLION / Math.pow(10, RES_DOT_POSITION))) /
      Math.pow(10, RES_DOT_POSITION) /* 小数点以下第3位を切り捨て*/

const truncValue = (value: number | null) =>
  value === null
    ? null
    : Math.trunc(value * Math.pow(10, RES_DOT_POSITION)) / Math.pow(10, RES_DOT_POSITION) /* 小数点以下第3位を切り捨て*/

const calculateNpv = (
  ebitdaPlan: ebitdaType[],
  ebitdaForecast: ebitdaType[],
  discountRateMaster: Record<unitId, discountRateMaster>,
  currentFiscalYear: number,
): { sumPlan: number | null; sumForecast: number | null } => {
  const calculatedPlan = calculateValue(ebitdaPlan, discountRateMaster, currentFiscalYear)
  const caclulatedForecast = calculateValue(ebitdaForecast, discountRateMaster, currentFiscalYear)
  return {
    sumPlan: calculatedPlan.length === 0 ? null : sumValues(calculatedPlan),
    sumForecast: caclulatedForecast.length === 0 ? null : sumValues(caclulatedForecast),
  }
}

const data = async (input: requestType): Promise<responseDataType> => {
  const { ebitdaPlan, ebitdaForecast, discountRateMaster } = await getData(input)
  const discountRateMasterRecord = getDiscountRateMasterRecord(discountRateMaster)
  const { sumPlan, sumForecast } = calculateNpv(
    ebitdaPlan,
    ebitdaForecast,
    discountRateMasterRecord,
    currentFiscalYear(),
  )
  return {
    plan: truncValue(sumPlan),
    forecast: convertToHandredMillionYenFromYen(sumForecast),
  }
}

const controller = async (input: requestType, dataFn = data): Promise<responseType> => {
  return {
    code: 200,
    body: await dataFn(input),
  }
}

const consolidate = (request: Request): requestType => ({
  "plant-id": request.query["plant-id"] as string,
  "unit-id": request.query["unit-id"] as string,
  "start-fiscal-year": OptionalNumber(request.query["start-fiscal-year"]),
  "end-fiscal-year": OptionalNumber(request.query["end-fiscal-year"]),
})

export const consolidateGetNetPresentValueRequest = consolidate
export const getNetPresentValue = controller
export const getNetPresentValueController = jsonResponseWithErrorHandler((x) =>
  controller(consolidate(x) as requestType),
)
export const calculateNpvFn = (
  ebitdaPlan: ebitdaType[],
  ebitdaForecast: ebitdaType[],
  discountRateMaster: Record<unitId, discountRateMaster>,
  currentFiscalYear: number,
): responseDataType => {
  const { sumPlan, sumForecast } = calculateNpv(ebitdaPlan, ebitdaForecast, discountRateMaster, currentFiscalYear)
  return {
    plan: truncValue(sumPlan),
    forecast: convertToHandredMillionYenFromYen(sumForecast),
  }
}
