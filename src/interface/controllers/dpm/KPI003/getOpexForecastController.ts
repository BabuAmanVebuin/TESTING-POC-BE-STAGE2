import { Request } from "express"
import { jsonResponseWithErrorHandler } from "../../../decorators.js"
import { OptionalNumber } from "../../tot/v1/utils.js"
import { QueryTypes, Transaction } from "sequelize"
import { sequelize, wrapInTransaction } from "../../../../infrastructure/orm/sqlize/index.js"
import { readSqlFile } from "./utils.js"
import {
  SnowflakeTransaction,
  snowflakeSelectWrapper,
  wrapInSnowflakeTransaction,
} from "../../../../infrastructure/orm/snowflake/index.js"
import { currentFiscalYear } from "./helper/businessPlan/businessPlanHelper.js"
import {
  getOpexForecastRequest,
  getOpexForecastAPIResponse,
  getOpexForecastResponse,
  opexForecastDbType,
  opexForecastSnowflakeType,
  operationCostForecastSnowflakeType,
  maintenanceCostForecastSnowflakeType,
  globalSnowflakeType,
} from "../../../../domain/entities/dpm/opexForecast.js"

const QUERY = readSqlFile("getOpexForecast")

const SF_QUERY = readSqlFile("getSfOpexForecast")
const SF_OPEATION_COST_QUERY = readSqlFile("getSfOpexForecastForOperationCost")
const SF_MAINTENANCE_COST_QUERY = readSqlFile("getSfOpexForecastForMaintenanceCost")

type requestType = getOpexForecastRequest
type responseType = getOpexForecastAPIResponse
type responseDataType = getOpexForecastResponse

type databaseType = opexForecastDbType
const query = (input: requestType) => {
  let ret = QUERY
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

const getOpexForecastData = (input: requestType, transaction: Transaction) =>
  sequelize.query<databaseType>(query(input), {
    replacements: {
      plantId: input["plant-id"],
      unitId: input["unit-id"],
      startFiscalYear: input["start-fiscal-year"],
      endFiscalYear: input["end-fiscal-year"],
      currentFiscalYear: currentFiscalYear(),
    },
    transaction,
    type: QueryTypes.SELECT,
    raw: true,
  })

const transform = (data: databaseType[]) =>
  data.map((x) => ({
    "plant-id": x.PLANT_CODE,
    "unit-id": x.UNIT_CODE,
    "fiscal-year": x.FISCAL_YEAR,
    "operation-cost": x.OPERATION_COST === null ? null : Number(x.OPERATION_COST),
    "maintenance-cost": x.MAINTENANCE_COST === null ? null : Number(x.MAINTENANCE_COST),
    sum: Number(x.SUM),
  }))

const sfQuery = (query: string, input: requestType) => {
  let ret = query
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

const getOpexForecastSfData = (
  input: requestType,
  query: string,
  snowflakeTransaction: SnowflakeTransaction,
): Promise<globalSnowflakeType[]> =>
  snowflakeSelectWrapper<globalSnowflakeType>(snowflakeTransaction, {
    sqlText: sfQuery(query, input),
    binds: [
      currentFiscalYear(),
      input["plant-id"],
      input["unit-id"] || "",
      input["start-fiscal-year"] || "",
      input["end-fiscal-year"] || "",
    ],
  })

const transformSf = (
  opexForecast: opexForecastSnowflakeType[],
  operationCostForecast: operationCostForecastSnowflakeType[],
  maintenanceCostForecast: maintenanceCostForecastSnowflakeType[],
): responseDataType[] => {
  return opexForecast.map((x) => {
    const operationCostItem = operationCostForecast.find(
      (item) =>
        item.FISCAL_YEAR === x.FISCAL_YEAR && item.PLANT_CODE === x.PLANT_CODE && item.UNIT_CODE === x.UNIT_CODE,
    )

    const maintenanceCostItem = maintenanceCostForecast.find(
      (item) =>
        item.FISCAL_YEAR === x.FISCAL_YEAR && item.PLANT_CODE === x.PLANT_CODE && item.UNIT_CODE === x.UNIT_CODE,
    )

    return {
      "plant-id": x.PLANT_CODE,
      "unit-id": x.UNIT_CODE,
      "fiscal-year": x.FISCAL_YEAR,
      "operation-cost": operationCostItem?.OPERATION_COST
        ? Number(Math.ceil(operationCostItem.OPERATION_COST / 1000000) / 100)
        : null,
      "maintenance-cost": maintenanceCostItem?.MAINTENANCE_COST
        ? Number(Math.ceil(maintenanceCostItem.MAINTENANCE_COST / 1000000) / 100)
        : null,
      sum: Math.ceil(x.VALUE / 1000000) / 100, // convert value into 億円 from 円 & ceil the value to two decimal place
    }
  })
}

const transformSfNotCiel = (
  opexForecast: opexForecastSnowflakeType[],
  operationCostForecast: operationCostForecastSnowflakeType[],
  maintenanceCostForecast: maintenanceCostForecastSnowflakeType[],
): responseDataType[] => {
  return opexForecast.map((x) => {
    const operationCostItem = operationCostForecast.find(
      (item) =>
        item.FISCAL_YEAR === x.FISCAL_YEAR && item.PLANT_CODE === x.PLANT_CODE && item.UNIT_CODE === x.UNIT_CODE,
    )

    const maintenanceCostItem = maintenanceCostForecast.find(
      (item) =>
        item.FISCAL_YEAR === x.FISCAL_YEAR && item.PLANT_CODE === x.PLANT_CODE && item.UNIT_CODE === x.UNIT_CODE,
    )

    return {
      "plant-id": x.PLANT_CODE,
      "unit-id": x.UNIT_CODE,
      "fiscal-year": x.FISCAL_YEAR,
      "operation-cost": operationCostItem?.OPERATION_COST ? Number(operationCostItem.OPERATION_COST / 100000000) : null,
      "maintenance-cost": maintenanceCostItem?.MAINTENANCE_COST
        ? Number(maintenanceCostItem.MAINTENANCE_COST / 100000000)
        : null,
      sum: x.VALUE / 100000000, // convert value into 億円 from 円 & ceil the value to two decimal place
    }
  })
}

const data = async (input: requestType): Promise<responseDataType[]> => {
  const [databaseData, snowflakeOpexData, snowflakeOperationCostData, snowflakeMaintenanceCostData] = await Promise.all(
    [
      wrapInTransaction((transaction) => getOpexForecastData(input, transaction).then(transform)),
      wrapInSnowflakeTransaction((snowflakeTransaction) =>
        getOpexForecastSfData(input, SF_QUERY, snowflakeTransaction),
      ),
      wrapInSnowflakeTransaction((snowflakeTransaction) =>
        getOpexForecastSfData(input, SF_OPEATION_COST_QUERY, snowflakeTransaction),
      ),
      wrapInSnowflakeTransaction((snowflakeTransaction) =>
        getOpexForecastSfData(input, SF_MAINTENANCE_COST_QUERY, snowflakeTransaction),
      ),
    ],
  )
  const transformedSnowlakeData = transformSf(
    snowflakeOpexData,
    snowflakeOperationCostData,
    snowflakeMaintenanceCostData,
  )
  return [databaseData, transformedSnowlakeData].flat()
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

export const consolidateGetOpexForecastRequest = consolidate
export const getOpexForecast = controller
export const getOpexForecastController = jsonResponseWithErrorHandler((x) => controller(consolidate(x) as requestType))
export const getOpexForecastFn = data

export const getOpexForecastNotCielFn = async (input: requestType): Promise<responseDataType[]> => {
  const [databaseData, snowflakeOpexData, snowflakeOperationCostData, snowflakeMaintenanceCostData] = await Promise.all(
    [
      wrapInTransaction((transaction) => getOpexForecastData(input, transaction).then(transform)),
      wrapInSnowflakeTransaction((snowflakeTransaction) =>
        getOpexForecastSfData(input, SF_QUERY, snowflakeTransaction),
      ),
      wrapInSnowflakeTransaction((snowflakeTransaction) =>
        getOpexForecastSfData(input, SF_OPEATION_COST_QUERY, snowflakeTransaction),
      ),
      wrapInSnowflakeTransaction((snowflakeTransaction) =>
        getOpexForecastSfData(input, SF_MAINTENANCE_COST_QUERY, snowflakeTransaction),
      ),
    ],
  )
  const transformedSnowlakeData = transformSfNotCiel(
    snowflakeOpexData,
    snowflakeOperationCostData,
    snowflakeMaintenanceCostData,
  )
  return [databaseData, transformedSnowlakeData].flat()
}
