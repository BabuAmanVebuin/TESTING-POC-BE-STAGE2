import { getGenerationOutputSalesUsecase } from "../../../../../../application/use_cases/dpm/getGenerationOutputSalesUsecase.js"
import { getOpexPlanUseCase } from "../../../../../../application/use_cases/dpm/getOpexPlanUseCase.js"
import { GenerationOutputPlanData } from "../../../../../../domain/entities/dpm/generationOutputPlan.js"
import {
  fuelUnitCalorificValueType,
  ppaThermalEfficiencyType,
} from "../../../../../../domain/entities/dpm/grossMarginForecast.js"
import {
  fuelPriceDatabaseType,
  getLifeCycleCostRequest,
  lifeCycleCostData,
  snowflakeData,
} from "../../../../../../domain/entities/dpm/lifeCycleCost.js"
import { discountRateMaster } from "../../../../../../domain/entities/dpm/netPresentValue.js"
import { getThermalEfficiencyForecastResponse } from "../../../../../../domain/entities/dpm/thermalEfficiencyForecast.js"
import { wrapInSnowflakeTransaction } from "../../../../../../infrastructure/orm/snowflake/index.js"
import { wrapInTransaction, wrapInTransactionCmn } from "../../../../../../infrastructure/orm/sqlize/index.js"
import { GenerationOutputRepositorySequelizeMysql } from "../../../../../../infrastructure/repositories/dpm/GenerationOutputRepositorySequelizeMySQL.js"
import { OpexRepositorySequelizeMysql } from "../../../../../../infrastructure/repositories/dpm/OpexRepositorySequelizeMySQL.js"
import { getFuelPriceForecastFn } from "../../getFuelPriceForecastController.js"
import { getGenerationOutputForecastFn } from "../../getGenerationOutputForecastController.js"
import { getDiscountRateMaster, transformDiscountRateMaster } from "../../getNetPresentValueController.js"
import { getOpexForecastNotCielFn } from "../../getOpexForecastController.js"
import { currentFiscalYear, fixedNumber } from "./businessPlanHelper.js"
import { getFuelUnitCalorificValueMaster, getPPAThermalEfficiencyMaster } from "./grossMarginDbHelper.js"
import { getFuelPricePlan, getGenerationOutput, getSalesUnitPrice, getSpreadMarket } from "./lifeCycleCostDbHelper.js"
import { getThermalEfficiencyForecastFn } from "./thermalEfficiencyHelper.js"

const ONE_HANDRED_MILLION = 100000000
const RES_DOT_POSITION = 2

type requestType = getLifeCycleCostRequest
type responseType = lifeCycleCostData
type plantWiseReqyestType = {
  "plant-id": string
  "start-fiscal-year"?: number
  "end-fiscal-year"?: number
}
type unitWiseRequestType = {
  "plant-id": string
  "unit-id": string
  "start-fiscal-year"?: number
  "end-fiscal-year"?: number
}

type basicType = {
  "plant-id": string
  "unit-id": string
  "fiscal-year": number
  value: number | null
}

type plantOnlyType = {
  "plant-id": string
  "fiscal-year": number
  value: number | null
}

type unitId = string
type unitIdAndFiscalYear = string
type plantIdAndFiscalYear = string

const transformDatabaseType = (data: fuelPriceDatabaseType[]) =>
  data.map((x) => ({
    "plant-id": x.PLANT_CODE,
    "fiscal-year": x.FISCAL_YEAR,
    value: x.VALUE,
  }))

const transformSf = (data: snowflakeData[]): basicType[] =>
  data.map((x) => ({
    "plant-id": x.PLANT_CODE,
    "unit-id": x.UNIT_CODE,
    "fiscal-year": x.FISCAL_YEAR,
    value: x.VALUE,
  }))

const transformSumToBasicType = <
  T extends {
    "plant-id": string
    "unit-id": string
    "fiscal-year": number
    sum: number
  },
>(
  data: T[],
): basicType[] =>
  data.map((x) => ({
    ...x,
    value: x.sum,
  }))

const getRecordByUnitId = <T extends { "unit-id": string }>(data: T[]) =>
  data.reduce(
    (acc, cur) => {
      acc[cur["unit-id"]] = cur
      return acc
    },
    {} as Record<unitId, T>,
  )

const getRecordByUnitIdAndFiscalYear = <T extends { "unit-id": string; "fiscal-year": number }>(data: T[]) =>
  data.reduce(
    (acc, cur) => {
      acc[`${cur["unit-id"]}:${cur["fiscal-year"]}`] = cur
      return acc
    },
    {} as Record<unitIdAndFiscalYear, T>,
  )

const getRecordByPlanttIdAndFiscalYear = <T extends { "plant-id": string; "fiscal-year": number }>(data: T[]) =>
  data.reduce(
    (acc, cur) => {
      acc[`${cur["plant-id"]}:${cur["fiscal-year"]}`] = cur
      return acc
    },
    {} as Record<plantIdAndFiscalYear, T>,
  )

const currentYearFilter = <T extends { "fiscal-year": number }>(data: T[]) =>
  data.filter((x) => x["fiscal-year"] > currentFiscalYear())

const getHeatRatePlan = <T extends basicType>(
  generationOutputPlan: T[],
  ppaThermalEfficiency: Record<unitId, ppaThermalEfficiencyType>,
): basicType[] =>
  generationOutputPlan.map((x) => {
    const targetPpaThermalEfficiency = ppaThermalEfficiency[x["unit-id"]]
    const heatRate =
      targetPpaThermalEfficiency === undefined || Number(targetPpaThermalEfficiency["ppa-thermal-efficiency"]) === 0
        ? 0
        : 3600 / (Number(targetPpaThermalEfficiency["ppa-thermal-efficiency"]) / 100)
    return {
      ...x,
      value: heatRate,
    }
  })

const getHeatRateForecast = <T extends basicType>(
  generationOutputForecast: T[],
  thermalEfficiency: Record<unitIdAndFiscalYear, getThermalEfficiencyForecastResponse>,
): basicType[] =>
  generationOutputForecast.map((x) => {
    const targetThermalEfficiency = thermalEfficiency[`${x["unit-id"]}:${x["fiscal-year"]}`]
    const heatRate =
      targetThermalEfficiency === undefined || targetThermalEfficiency.sum === 0
        ? 0
        : 3600 / (targetThermalEfficiency.sum / 100)
    return {
      ...x,
      value: heatRate,
    }
  })

const calculateFuelCost = (
  generationOutput: GenerationOutputPlanData[],
  heatRate: Record<unitIdAndFiscalYear, basicType>,
  fuelUnitCalorificMaster: Record<unitId, fuelUnitCalorificValueType>,
  fuelPrice: Record<plantIdAndFiscalYear, plantOnlyType>,
): basicType[] =>
  generationOutput.map((x) => {
    if (
      heatRate[`${x["unit-id"]}:${x["fiscal-year"]}`] === undefined ||
      heatRate[`${x["unit-id"]}:${x["fiscal-year"]}`].value === null ||
      fuelUnitCalorificMaster[x["unit-id"]] === undefined ||
      fuelUnitCalorificMaster[x["unit-id"]]["fuel-unit-calorific-value"] === 0 ||
      fuelPrice[`${x["plant-id"]}:${x["fiscal-year"]}`] === undefined ||
      fuelPrice[`${x["plant-id"]}:${x["fiscal-year"]}`].value === null ||
      fuelPrice[`${x["plant-id"]}:${x["fiscal-year"]}`].value === 0
    ) {
      return {
        ...x,
        value: null,
      }
    }
    const fuelCost =
      (((x.sum * (heatRate[`${x["unit-id"]}:${x["fiscal-year"]}`].value || 0)) /
        fuelUnitCalorificMaster[x["unit-id"]]["fuel-unit-calorific-value"]) *
        (fuelPrice[`${x["plant-id"]}:${x["fiscal-year"]}`].value || 0)) /
      100000

    return {
      ...x,
      value: fixedNumber(fuelCost),
    }
  })

const calculateFuelCostSf = (
  generationOutput: basicType[],
  salesUnitPrice: Record<unitIdAndFiscalYear, basicType>,
  spreadMarketPrice: Record<unitIdAndFiscalYear, basicType>,
) =>
  generationOutput.map((x) => {
    const key = `${x["unit-id"]}:${x["fiscal-year"]}`
    if (
      salesUnitPrice[key] === undefined ||
      salesUnitPrice[key].value === null ||
      spreadMarketPrice[key] === undefined ||
      spreadMarketPrice[key].value === null ||
      spreadMarketPrice[key].value === 0
    ) {
      return {
        ...x,
        value: null,
      }
    }
    const fuelCost =
      (((salesUnitPrice[key].value || 0) / 1000 - (spreadMarketPrice[key].value || 0)) * ((x.value || 0) * 1000)) /
      ONE_HANDRED_MILLION
    return {
      ...x,
      value: fixedNumber(fuelCost),
    }
  })

const getFuelCostPlan = async (input: requestType): Promise<basicType[]> => {
  const [generationOutput, ppaThermalEfficiencyMaster, fuelUnitMaster, fuelPrice] = await Promise.all([
    wrapInTransaction((transaction) =>
      getGenerationOutputSalesUsecase(
        input["plant-id"],
        input["unit-id"],
        input["start-fiscal-year"],
        input["end-fiscal-year"],
        undefined,
        undefined,
        GenerationOutputRepositorySequelizeMysql,
        transaction,
      ),
    ),
    wrapInTransactionCmn((transactionCmn) =>
      getPPAThermalEfficiencyMaster(
        {
          plantId: input["plant-id"],
          unitList: input["unit-id"] === undefined ? undefined : [input["unit-id"]],
        },
        transactionCmn,
      ),
    ).then(getRecordByUnitId),
    wrapInTransactionCmn((transactionCmn) =>
      getFuelUnitCalorificValueMaster(
        {
          plantId: input["plant-id"],
          unitId: input["unit-id"],
        },
        transactionCmn,
      ),
    ).then(getRecordByUnitId),
    wrapInTransaction((transaction) => getFuelPricePlan(input, transaction))
      .then(transformDatabaseType)
      .then(getRecordByPlanttIdAndFiscalYear),
  ])

  const heatRate = getRecordByUnitIdAndFiscalYear(getHeatRatePlan(generationOutput, ppaThermalEfficiencyMaster))
  return calculateFuelCost(generationOutput, heatRate, fuelUnitMaster, fuelPrice)
}

export const getFuelCostSf = async (input: requestType): Promise<basicType[]> => {
  const [generationOutput, salesUnitPrice, SpreadMarketPrice] = await wrapInSnowflakeTransaction(
    (SnowflakeTransaction) =>
      Promise.all([
        getGenerationOutput(input, SnowflakeTransaction).then(transformSf),
        getSalesUnitPrice(input, SnowflakeTransaction).then(transformSf).then(getRecordByUnitIdAndFiscalYear),
        getSpreadMarket(input, SnowflakeTransaction).then(transformSf).then(getRecordByUnitIdAndFiscalYear),
      ]),
  )
  return calculateFuelCostSf(generationOutput, salesUnitPrice, SpreadMarketPrice)
}

const getFuelCostForecast = async (input: requestType): Promise<basicType[]> => {
  const [generationOutput, fuelUnitMaster, fuelPrice] = await Promise.all([
    getGenerationOutputForecastFn(input).then(currentYearFilter),
    wrapInTransactionCmn((transactionCmn) =>
      getFuelUnitCalorificValueMaster(
        {
          plantId: input["plant-id"],
          unitId: input["unit-id"],
        },
        transactionCmn,
      ),
    ).then(getRecordByUnitId),
    getFuelPriceForecastFn(input).then(getRecordByPlanttIdAndFiscalYear),
  ])
  const targetFiscalYears = generationOutput.map((x) => x["fiscal-year"])
  const thermalEfficiency =
    targetFiscalYears.length === 0
      ? {}
      : await getThermalEfficiencyForecastFn({
          ...input,
          "start-fiscal-year": Math.min(...targetFiscalYears) || undefined,
          "end-fiscal-year": Math.max(...targetFiscalYears) || undefined,
        }).then(getRecordByUnitIdAndFiscalYear)

  const heatRate = getRecordByUnitIdAndFiscalYear(getHeatRateForecast(generationOutput, thermalEfficiency))
  return calculateFuelCost(generationOutput, heatRate, fuelUnitMaster, fuelPrice)
}

const calculatePresentValue = (
  targetData: basicType[],
  discountRate: Record<unitId, discountRateMaster>,
  currentFiscalYear: number,
): basicType[] =>
  targetData.map((x) => {
    const fiscalYearPassed = x["fiscal-year"] <= currentFiscalYear ? 0 : x["fiscal-year"] - currentFiscalYear

    const presentValue =
      (x.value || 0) * ((100 + discountRate[x["unit-id"]]["discount-rate"]) / 100) ** -fiscalYearPassed
    return {
      ...x,
      value: fixedNumber(presentValue),
    }
  })

const getOpexPresentValuePlan = async (input: requestType): Promise<basicType[]> => {
  const [opex, discountRateMaster] = await Promise.all([
    wrapInTransaction((transaction) =>
      getOpexPlanUseCase(
        input["plant-id"],
        input["unit-id"],
        input["start-fiscal-year"],
        input["end-fiscal-year"],
        OpexRepositorySequelizeMysql,
        transaction,
      ),
    ).then(transformSumToBasicType),
    wrapInTransactionCmn((transactionCmn) => getDiscountRateMaster(input, transactionCmn))
      .then(transformDiscountRateMaster)
      .then(getRecordByUnitId),
  ])
  return calculatePresentValue(opex, discountRateMaster, currentFiscalYear())
}

const getOpexPresentValueForecast = async (input: requestType): Promise<basicType[]> => {
  const [opex, discountRateMaster] = await Promise.all([
    getOpexForecastNotCielFn(input).then(transformSumToBasicType),
    wrapInTransactionCmn((transactionCmn) => getDiscountRateMaster(input, transactionCmn))
      .then(transformDiscountRateMaster)
      .then(getRecordByUnitId),
  ])
  return calculatePresentValue(opex, discountRateMaster, currentFiscalYear())
}

const getFuelPresentValuePlan = async (input: requestType): Promise<basicType[]> => {
  const [fuelCost, discountRateMaster] = await Promise.all([
    getFuelCostPlan(input),
    wrapInTransactionCmn((transactionCmn) => getDiscountRateMaster(input, transactionCmn))
      .then(transformDiscountRateMaster)
      .then(getRecordByUnitId),
  ])
  return calculatePresentValue(fuelCost, discountRateMaster, currentFiscalYear())
}

const getFuelPresentValueForecast = async (input: requestType): Promise<basicType[]> => {
  const [fuelCostDb, fuelCostSf, discountRateMaster] = await Promise.all([
    getFuelCostForecast(input),
    getFuelCostSf(input),
    wrapInTransactionCmn((transactionCmn) => getDiscountRateMaster(input, transactionCmn))
      .then(transformDiscountRateMaster)
      .then(getRecordByUnitId),
  ])
  const fuelCost = [fuelCostSf, fuelCostDb].flat()
  return calculatePresentValue(fuelCost, discountRateMaster, currentFiscalYear())
}

const getGenerationOutoutPresentValuePlan = async (input: requestType): Promise<basicType[]> => {
  const [generationOutput, discountRateMaster] = await Promise.all([
    wrapInTransaction((transaction) =>
      getGenerationOutputSalesUsecase(
        input["plant-id"],
        input["unit-id"],
        input["start-fiscal-year"],
        input["end-fiscal-year"],
        undefined,
        undefined,
        GenerationOutputRepositorySequelizeMysql,
        transaction,
      ),
    ).then(transformSumToBasicType),
    wrapInTransactionCmn((transactionCmn) => getDiscountRateMaster(input, transactionCmn))
      .then(transformDiscountRateMaster)
      .then(getRecordByUnitId),
  ])
  return calculatePresentValue(generationOutput, discountRateMaster, currentFiscalYear())
}

const getGenerationOutoutPresentValueForecast = async (input: requestType): Promise<basicType[]> => {
  const [generationOutput, discountRateMaster] = await Promise.all([
    getGenerationOutputForecastFn(input).then(transformSumToBasicType),
    wrapInTransactionCmn((transactionCmn) => getDiscountRateMaster(input, transactionCmn))
      .then(transformDiscountRateMaster)
      .then(getRecordByUnitId),
  ])
  return calculatePresentValue(generationOutput, discountRateMaster, currentFiscalYear())
}

const getBasicDataPlantSummary = (data: basicType[]): plantOnlyType[] =>
  Object.values(
    data.reduce(
      (acc, cur) => {
        if (acc[cur["plant-id"]] === undefined) {
          acc[cur["plant-id"]] = { ...cur, value: 0 }
        }
        acc[cur["plant-id"]].value = (acc[cur["plant-id"]].value || 0) + (cur.value || 0)
        return acc
      },
      {} as Record<unitIdAndFiscalYear, plantOnlyType>,
    ),
  )

const getTotalData = <T extends { value: number | null }>(data: T[]) =>
  fixedNumber(data.reduce((acc, cur) => acc + (cur.value || 0), 0))

const calculateLcc = (
  opexPresentValue: number,
  fuelPricePresentValue: number,
  generationOutputPresentValue: number,
) => {
  if (generationOutputPresentValue === 0) {
    return null
  }
  return fixedNumber(((opexPresentValue + fuelPricePresentValue) / generationOutputPresentValue) * 100)
}

const getLccPlanDataPlantWise = async (
  opexPresentValue: plantOnlyType[],
  fuelPricePresentValue: plantOnlyType[],
  generationOutputPresentValue: plantOnlyType[],
) => {
  const opexPresentValueTotal = getTotalData(opexPresentValue)
  const fuelPricePresentValueTotal = getTotalData(fuelPricePresentValue)
  const generationOutputPresentValueTotal = getTotalData(generationOutputPresentValue)

  return calculateLcc(opexPresentValueTotal, fuelPricePresentValueTotal, generationOutputPresentValueTotal)
}

const getLccForecastDataPlantWise = async (
  opexPresentValue: plantOnlyType[],
  fuelPricePresentValue: plantOnlyType[],
  generationOutputPresentValue: plantOnlyType[],
) => {
  const opexPresentValueTotal = getTotalData(opexPresentValue)
  const fuelPricePresentValueTotal = getTotalData(fuelPricePresentValue)
  const generationOutputPresentValueTotal = getTotalData(generationOutputPresentValue)

  return calculateLcc(opexPresentValueTotal, fuelPricePresentValueTotal, generationOutputPresentValueTotal)
}

const getLccPlanDataUnitWise = async (
  opexPresentValue: basicType[],
  fuelPricePresentValue: basicType[],
  generationOutputPresentValue: basicType[],
) => {
  const opexPresentValueTotal = getTotalData(opexPresentValue)
  const fuelPricePresentValueTotal = getTotalData(fuelPricePresentValue)
  const generationOutputPresentValueTotal = getTotalData(generationOutputPresentValue)

  return calculateLcc(opexPresentValueTotal, fuelPricePresentValueTotal, generationOutputPresentValueTotal)
}

const getLccForecastDataUnitWise = async (
  opexPresentValue: basicType[],
  fuelPricePresentValue: basicType[],
  generationOutputPresentValue: basicType[],
) => {
  const opexPresentValueTotal = getTotalData(opexPresentValue)
  const fuelPricePresentValueTotal = getTotalData(fuelPricePresentValue)
  const generationOutputPresentValueTotal = getTotalData(generationOutputPresentValue)
  return calculateLcc(opexPresentValueTotal, fuelPricePresentValueTotal, generationOutputPresentValueTotal)
}

const getPlantWiseLcc = async (input: plantWiseReqyestType) => {
  const [
    opexPresentValuePlan,
    fuelPricePresentValuePlan,
    generationOutputPresentValuePlan,
    opexPresentValueForecast,
    fuelPricePresentValueForecast,
    generationOutputPresentValueForecast,
  ] = await Promise.all([
    getOpexPresentValuePlan(input).then(getBasicDataPlantSummary),
    getFuelPresentValuePlan(input).then(getBasicDataPlantSummary),
    getGenerationOutoutPresentValuePlan(input).then(getBasicDataPlantSummary),
    getOpexPresentValueForecast(input).then(getBasicDataPlantSummary),
    getFuelPresentValueForecast(input).then(getBasicDataPlantSummary),
    getGenerationOutoutPresentValueForecast(input).then(getBasicDataPlantSummary),
  ])

  const [plan, forecast] = await Promise.all([
    getLccPlanDataPlantWise(opexPresentValuePlan, fuelPricePresentValuePlan, generationOutputPresentValuePlan),
    getLccForecastDataPlantWise(
      opexPresentValueForecast,
      fuelPricePresentValueForecast,
      generationOutputPresentValueForecast,
    ),
  ])

  return { plan, forecast }
}

const getUnitWiseLcc = async (input: unitWiseRequestType) => {
  const [
    opexPresentValuePlan,
    fuelPricePresentValuePlan,
    generationOutputPresentValuePlan,
    opexPresentValueForecast,
    fuelPricePresentValueForecast,
    generationOutputPresentValueForecast,
  ] = await Promise.all([
    getOpexPresentValuePlan(input),
    getFuelPresentValuePlan(input),
    getGenerationOutoutPresentValuePlan(input),
    getOpexPresentValueForecast(input),
    getFuelPresentValueForecast(input),
    getGenerationOutoutPresentValueForecast(input),
  ])
  const [plan, forecast] = await Promise.all([
    getLccPlanDataUnitWise(opexPresentValuePlan, fuelPricePresentValuePlan, generationOutputPresentValuePlan),
    getLccForecastDataUnitWise(
      opexPresentValueForecast,
      fuelPricePresentValueForecast,
      generationOutputPresentValueForecast,
    ),
  ])

  return { plan, forecast }
}

export const getLcc = async (input: requestType): Promise<responseType> =>
  input["unit-id"] === undefined
    ? getPlantWiseLcc(input)
    : getUnitWiseLcc({
        ...input,
        "unit-id": input["unit-id"],
      })

export const cielLcc = (lcc: responseType): responseType => ({
  plan:
    lcc.plan === null ? null : Math.ceil(lcc.plan * Math.pow(10, RES_DOT_POSITION)) / Math.pow(10, RES_DOT_POSITION),
  forecast:
    lcc.forecast === null
      ? null
      : Math.ceil(lcc.forecast * Math.pow(10, RES_DOT_POSITION)) / Math.pow(10, RES_DOT_POSITION),
})

export const getPlantWiseLccTest = async (
  opexPresentValuePlan: basicType[],
  fuelPricePresentValuePlan: basicType[],
  generationOutputPresentValuePlan: basicType[],
  opexPresentValueForecast: basicType[],
  fuelPricePresentValueForecast: basicType[],
  generationOutputPresentValueForecast: basicType[],
): Promise<responseType> => {
  const [plan, forecast] = await Promise.all([
    getLccPlanDataPlantWise(opexPresentValuePlan, fuelPricePresentValuePlan, generationOutputPresentValuePlan),
    getLccForecastDataPlantWise(
      opexPresentValueForecast,
      fuelPricePresentValueForecast,
      generationOutputPresentValueForecast,
    ),
  ])
  return cielLcc({
    plan,
    forecast,
  })
}

export const getUnitWiseLccTest = async (
  opexPresentValuePlan: basicType[],
  fuelPricePresentValuePlan: basicType[],
  generationOutputPresentValuePlan: basicType[],
  opexPresentValueForecast: basicType[],
  fuelPricePresentValueForecast: basicType[],
  generationOutputPresentValueForecast: basicType[],
): Promise<responseType> => {
  const [plan, forecast] = await Promise.all([
    getLccPlanDataUnitWise(opexPresentValuePlan, fuelPricePresentValuePlan, generationOutputPresentValuePlan),
    getLccForecastDataUnitWise(
      opexPresentValueForecast,
      fuelPricePresentValueForecast,
      generationOutputPresentValueForecast,
    ),
  ])
  return cielLcc({
    plan,
    forecast,
  })
}

export const calculatePresentValueTest = calculatePresentValue

export const calculateHeatRateForecastTest = getHeatRateForecast

export const calculateHeatRatePlanTest = getHeatRatePlan

export const calculateFuelCostTest = calculateFuelCost
