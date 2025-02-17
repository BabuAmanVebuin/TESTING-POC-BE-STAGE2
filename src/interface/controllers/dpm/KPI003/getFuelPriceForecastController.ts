import { Request } from "express"
import { jsonResponseWithErrorHandler } from "../../../decorators.js"
import { OptionalNumber } from "../../tot/v1/utils.js"
import { QueryTypes, Transaction } from "sequelize"
import { sequelize, wrapInTransaction, wrapInTransactionCmn } from "../../../../infrastructure/orm/sqlize/index.js"
import { readSqlFile, setLimitAndOffset } from "./utils.js"
import {
  getFuelPriceForecastRequest,
  getFuelPriceForecastAPIResponse,
  getFuelPriceForecastResponse,
  fuelPriceForecastDbType,
  fuelPriceForecastSfType,
  fuelPriceForecastDataType,
  fuelCostDataType,
  fuelUnitCalorificType,
  fuelCostPerUnitTotalType,
} from "../../../../domain/entities/dpm/fuelPriceForecast.js"
import {
  SnowflakeTransaction,
  snowflakeSelectWrapper,
  wrapInSnowflakeTransaction,
} from "../../../../infrastructure/orm/snowflake/index.js"
import { currentFiscalYear } from "./helper/businessPlan/businessPlanHelper.js"
import { getFuelCostSf } from "./helper/businessPlan/lifeCycleCostHelper.js"

const QUERY = readSqlFile("getFuelPriceForecast")
const FUEL_UNIT_CALORIFIC_VALUE_QUERY = readSqlFile("getFuelUnitCalorificValueMasterForFuelPrice")
const SF_FUEL_CONSUMPTION_QUERY = readSqlFile("getFuelConsumptionForecastSf")
const SF_GENERATION_OUTPUT_FORECAST_QUERY = readSqlFile("getGenerationOutputForecastForFuelCostSf")
const SF_THERMAL_EFFICIENCY_FORECAST_QUERY = readSqlFile("getThermalEfficiencyForecastForFuelCostSf")

type requestType = getFuelPriceForecastRequest
type responseType = getFuelPriceForecastAPIResponse
type responseDataType = getFuelPriceForecastResponse
type databaseType = fuelPriceForecastDbType

type snowflakeType = fuelPriceForecastSfType

const ONE_HUNDRED_MILLION = 100000000

const query = (input: requestType) => {
  let ret = QUERY
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

const getFuelCostSfData = (
  input: requestType,
  snowflakeTransaction: SnowflakeTransaction,
  query: string,
): Promise<snowflakeType[]> =>
  snowflakeSelectWrapper<snowflakeType>(snowflakeTransaction, {
    sqlText: query,
    binds: [input["plant-id"], currentFiscalYear()],
  })

const getFuelUnitCalorific = (input: requestType, transaction: Transaction) =>
  sequelize.query<fuelUnitCalorificType>(FUEL_UNIT_CALORIFIC_VALUE_QUERY, {
    replacements: {
      plantId: input["plant-id"],
    },
    transaction,
    type: QueryTypes.SELECT,
    raw: true,
  })

const database = (input: requestType, transaction: Transaction) =>
  sequelize.query<databaseType>(setLimitAndOffset(query(input), input), {
    replacements: {
      plantId: input["plant-id"],
      currentFiscalYear: currentFiscalYear(),
      startFiscalYear: input["start-fiscal-year"],
      endFiscalYear: input["end-fiscal-year"],
    },
    transaction,
    type: QueryTypes.SELECT,
    raw: true,
  })

const transform = (data: databaseType[]) =>
  data.map((x) => ({
    "plant-id": x.PLANT_CODE,
    "fiscal-year": x.FISCAL_YEAR,
    value: x.VALUE,
  }))

const transformSf = (data: snowflakeType[]): fuelPriceForecastDataType[] =>
  data.map((x) => ({
    "plant-id": x.PLANT_CODE,
    "unit-id": x.UNIT_CODE,
    "fiscal-year": x.FISCAL_YEAR,
    value: x.VALUE,
  }))

const calcTotalPerYear = (data: (fuelCostDataType | fuelPriceForecastDataType)[]): fuelCostPerUnitTotalType[] => {
  type dataType = fuelCostDataType | fuelPriceForecastDataType

  const totalValuesPerYear: fuelCostPerUnitTotalType[] = Object.values(
    data.reduce((acc: Record<number, fuelCostPerUnitTotalType>, item: dataType) => {
      const fiscalYear = item["fiscal-year"]

      if (!acc[fiscalYear]) {
        acc[fiscalYear] = {
          "plant-id": item["plant-id"],
          "fiscal-year": item["fiscal-year"],
          value: item.value || 0,
        }
      } else {
        acc[fiscalYear].value += item.value || 0
      }
      return acc
    }, {}),
  )

  return totalValuesPerYear
}

const calcFuelConsumptionForecast = (
  fuelUnitsCalorific: fuelUnitCalorificType[],
  generationOutputForecast: fuelPriceForecastDataType[],
  thermalEfficienciesForecast: fuelPriceForecastDataType[],
): fuelPriceForecastDataType[] => {
  const fuelConsumptionForecast = generationOutputForecast.map((elem: fuelPriceForecastDataType) => {
    const thermalEfficiencyForecast = thermalEfficienciesForecast.find(
      (item: fuelPriceForecastDataType) =>
        item["plant-id"] === elem["plant-id"] &&
        item["unit-id"] === elem["unit-id"] &&
        item["fiscal-year"] === elem["fiscal-year"],
    )
    const fuelUnitCalorific = fuelUnitsCalorific.find(
      (item: fuelUnitCalorificType) => item["unit-id"] === elem["unit-id"],
    )

    let fuelConsumptionForecastValue

    if (
      thermalEfficiencyForecast === undefined ||
      thermalEfficiencyForecast.value === 0 ||
      fuelUnitCalorific === undefined ||
      fuelUnitCalorific["fuel-unit-calorific-value"] === 0
    ) {
      fuelConsumptionForecastValue = 0
    } else {
      fuelConsumptionForecastValue =
        (elem.value * 3600) / (thermalEfficiencyForecast.value * fuelUnitCalorific["fuel-unit-calorific-value"])
    }
    return {
      "plant-id": elem["plant-id"],
      "unit-id": elem["unit-id"],
      "fiscal-year": elem["fiscal-year"],
      value: fuelConsumptionForecastValue,
    }
  })
  return fuelConsumptionForecast
}

const calcFuelCostPerUnit = (
  fuelCost: fuelCostDataType[],
  fuelConsumptionActualData: fuelPriceForecastDataType[],
  fuelConsumptionForecast: fuelPriceForecastDataType[],
): fuelCostPerUnitTotalType[] => {
  const fuelCostYearly = calcTotalPerYear(fuelCost)
  const fuelConsumptionActualDataYearly = calcTotalPerYear(fuelConsumptionActualData)
  const fuelConsumptionForecastYearly = calcTotalPerYear(fuelConsumptionForecast)

  const fuelCosts = fuelCostYearly.map((elem: fuelCostPerUnitTotalType) => {
    const fuelConsumptionActualDataItem = fuelConsumptionActualDataYearly.find(
      (item: fuelCostPerUnitTotalType) =>
        item["plant-id"] === elem["plant-id"] && item["fiscal-year"] === elem["fiscal-year"],
    )
    const fuelConsumptionForecastItem = fuelConsumptionForecastYearly.find(
      (item: fuelCostPerUnitTotalType) =>
        item["plant-id"] === elem["plant-id"] && item["fiscal-year"] === elem["fiscal-year"],
    )

    let fuelCostPerUnitValue
    if (
      fuelConsumptionActualDataItem !== undefined &&
      fuelConsumptionForecastItem !== undefined &&
      fuelConsumptionActualDataItem.value + fuelConsumptionForecastItem.value !== 0 &&
      elem.value !== null
    ) {
      fuelCostPerUnitValue =
        (elem.value * ONE_HUNDRED_MILLION) / (fuelConsumptionActualDataItem.value + fuelConsumptionForecastItem.value)
    } else {
      fuelCostPerUnitValue = 0
    }
    return {
      "plant-id": elem["plant-id"],
      "fiscal-year": elem["fiscal-year"],
      value: fuelCostPerUnitValue,
    }
  })

  return fuelCosts
}

export const ceilFuelCost = (data: fuelCostPerUnitTotalType[]): responseDataType[] => {
  // Ceil the result of fuel cost per unit
  return data.map((elt) => ({
    ...elt,
    value: Math.ceil(elt.value),
  }))
}

export const calcFuelPriceForecast = (
  fuelUnitsCalorific: fuelUnitCalorificType[],
  fuelCost: fuelCostDataType[],
  fuelConsumptionActualData: fuelPriceForecastDataType[],
  generationOutputForecast: fuelPriceForecastDataType[],
  thermalEfficienciesForecast: fuelPriceForecastDataType[],
): fuelCostPerUnitTotalType[] => {
  const fuelConsumptionForecast = calcFuelConsumptionForecast(
    fuelUnitsCalorific,
    generationOutputForecast,
    thermalEfficienciesForecast,
  )
  const fuelPriceForecast = calcFuelCostPerUnit(fuelCost, fuelConsumptionActualData, fuelConsumptionForecast)

  return fuelPriceForecast
}

const data = async (input: requestType): Promise<responseDataType[]> => {
  const [
    fuelPriceForecastSql,
    fuelUnitsCalorific,
    fuelCost,
    fuelConsumptionActualData,
    generationOutputForecast,
    thermalEfficienciesForecast,
  ] = await Promise.all([
    await wrapInTransaction((transaction) => database(input, transaction).then(transform)),
    // Get Fuel Unit Calorific Data From SQL (DCD)
    wrapInTransactionCmn((cmnTransaction) => getFuelUnitCalorific(input, cmnTransaction)),
    // Get Fuel Cost Data
    getFuelCostSf(input),
    // Get Fuel Consumption Actual Data From Snowflake
    wrapInSnowflakeTransaction((snowflakeTransaction) =>
      getFuelCostSfData(input, snowflakeTransaction, SF_FUEL_CONSUMPTION_QUERY).then(transformSf),
    ),
    // Get Generation Output Forecast Data From Snowflake
    wrapInSnowflakeTransaction((snowflakeTransaction) =>
      getFuelCostSfData(input, snowflakeTransaction, SF_GENERATION_OUTPUT_FORECAST_QUERY).then(transformSf),
    ),
    // Get Thermal Efficiency Forecast Data From Snowflake
    wrapInSnowflakeTransaction((snowflakeTransaction) =>
      getFuelCostSfData(input, snowflakeTransaction, SF_THERMAL_EFFICIENCY_FORECAST_QUERY).then(transformSf),
    ),
  ])
  const fuelPriceForecastResult = calcFuelPriceForecast(
    fuelUnitsCalorific,
    fuelCost,
    fuelConsumptionActualData,
    generationOutputForecast,
    thermalEfficienciesForecast,
  )

  const ceiledFuelPriceForecast = ceilFuelCost(fuelPriceForecastResult)

  return [fuelPriceForecastSql, ceiledFuelPriceForecast].flat()
}

const controller = async (input: requestType, dataFn = data): Promise<responseType> => {
  return {
    code: 200,
    body: await dataFn(input),
  }
}

const consolidate = (request: Request): requestType => ({
  "plant-id": request.query["plant-id"] as string,
  "start-fiscal-year": OptionalNumber(request.query["start-fiscal-year"]),
  "end-fiscal-year": OptionalNumber(request.query["end-fiscal-year"]),
  limit: OptionalNumber(request.query.limit),
  offset: OptionalNumber(request.query.offset),
})

export const consolidateGetFuelPriceForecastRequest = consolidate
export const getFuelPriceForecast = controller
export const getFuelPriceForecastController = jsonResponseWithErrorHandler((x) =>
  controller(consolidate(x) as requestType),
)
export const getFuelPriceForecastFn = data
