import { Request } from "express"
import { jsonResponseWithErrorHandler } from "../../../decorators.js"
import { OptionalNumber } from "../../tot/v1/utils.js"
import { sequelize, wrapInTransactionCmn } from "../../../../infrastructure/orm/sqlize/index.js"
import { readSqlFile } from "./utils.js"

import { GenerationOutputRepositoryPort } from "../../../../application/port/GenerationOutputRepositoryPort.js"
import { QueryTypes, Transaction } from "sequelize"
import { getGenerationOutputSalesUsecase } from "../../../../application/use_cases/dpm/getGenerationOutputSalesUsecase.js"
import {
  SnowflakeTransaction,
  snowflakeSelectWrapper,
  wrapInSnowflakeTransaction,
} from "../../../../infrastructure/orm/snowflake/index.js"
import { currentFiscalYear, filterByFiscalYear, fixedNumber } from "./helper/businessPlan/businessPlanHelper.js"
import { getGenerationOutputForecastFn } from "./getGenerationOutputForecastController.js"
import { getThermalEfficiencyForecastFn } from "./helper/businessPlan/thermalEfficiencyHelper.js"
import {
  generationOutputData,
  getHeatRateSummaryRequest,
  getHeatRateSummaryResponse,
  heatInput,
  heatRateSummaryData,
  heatRateSummarySf,
  ppaThermalEfficiencies,
  ppaThermalEfficiencyFromDB,
  transofrmedHeatRateSummarySf,
} from "../../../../domain/entities/dpm/heatRateSummary.js"
import { calcGenerationOutputSummaryForForecast } from "./getGenerationOutputSummaryController.js"

enum Measure {
  GenerationOutput = "GenerationOutput",
  ThermalEfficiency = "ThermalEfficiency",
}

const SF_QUERY_PLANT_WISE = readSqlFile("getSfHeatRatePlantWise")
const SF_QUERY_UNIT_WISE = readSqlFile("getSfHeatRateUnitWise")

const SQL_QUERY_THERMAL_EFFICIENCY = readSqlFile("getPPAThermalEfficiencyMaster")

type requestType = getHeatRateSummaryRequest
type responseType = getHeatRateSummaryResponse
type responseDataType = heatRateSummaryData

type snowflakeType = heatRateSummarySf
type ppaThermalEfficiencyType = ppaThermalEfficiencyFromDB

const sfQuery = (input: requestType) => {
  let ret
  if (input["unit-id"] === undefined) {
    ret = SF_QUERY_PLANT_WISE
  } else {
    ret = SF_QUERY_UNIT_WISE
    ret = ret.replace("%unitIdFilter%", "cr.UNIT_CODE = :4")
  }
  ret =
    input["start-fiscal-year"] === undefined
      ? ret.replace("%startFiscalYearFilter%", "TRUE")
      : ret.replace("%startFiscalYearFilter%", "cr.FISCAL_YEAR >= :5")

  ret =
    input["end-fiscal-year"] === undefined
      ? ret.replace("%endFiscalYearFilter%", "TRUE")
      : ret.replace("%endFiscalYearFilter%", "cr.FISCAL_YEAR <= :6")
  return ret
}

const thermalQuery = (input: requestType, inputQuery: string) => {
  let ret = inputQuery
  ret =
    input["unit-id"] === undefined
      ? ret.replace("%unitIdFilter%", "TRUE")
      : ret.replace("%unitIdFilter%", "UNIT_CODE = :unitId")

  return ret
}

export const getHeatRateSummarySfData = (
  input: requestType,
  measure: Measure,
  snowflakeTransaction: SnowflakeTransaction,
): Promise<snowflakeType[]> =>
  snowflakeSelectWrapper<snowflakeType>(snowflakeTransaction, {
    sqlText: sfQuery(input),
    binds: [
      currentFiscalYear(),
      input["plant-id"],
      measure,
      input["unit-id"] || "",
      input["start-fiscal-year"] || "",
      input["end-fiscal-year"] || "",
    ],
  })

const getPpaThermalEfficiency = (input: requestType, transaction: Transaction) =>
  sequelize.query<ppaThermalEfficiencyType>(thermalQuery(input, SQL_QUERY_THERMAL_EFFICIENCY), {
    replacements: {
      plantId: input["plant-id"],
      unitId: input["unit-id"],
    },
    type: QueryTypes.SELECT,
    transaction,
  })

export const calcHeatRatePlan = (
  generationOutputPlan: generationOutputData[],
  thermalEfficienciesPlan: ppaThermalEfficiencyType[],
): number | null => {
  if (generationOutputPlan.length === 0) return null
  const ppaThermalEfficiencyCheck = thermalEfficienciesPlan.every((x) => Number(x["ppa-thermal-efficiency"]) === 0)
  if (ppaThermalEfficiencyCheck) return null

  const heatInputs: heatInput[] = generationOutputPlan.map((elem) => {
    const sum = elem.sum || 0
    const ppaThermalEfficiency = thermalEfficienciesPlan.find(
      (item: ppaThermalEfficiencyType) => item["unit-id"] === elem["unit-id"],
    )
    return {
      "plant-id": elem["plant-id"],
      "fiscal-year": elem["fiscal-year"],
      value:
        ppaThermalEfficiency !== undefined &&
        ppaThermalEfficiency["ppa-thermal-efficiency"] !== null &&
        Number(ppaThermalEfficiency["ppa-thermal-efficiency"]) !== 0
          ? sum / ppaThermalEfficiency["ppa-thermal-efficiency"]
          : 0,
    }
  })
  const totalHeatInputs = heatInputs.reduce((acc: number, item: heatInput) => acc + item.value, 0)
  const totalGenerationOutputPlan = generationOutputPlan.reduce(
    (acc: number, item: generationOutputData) => acc + (item.sum || 0),
    0,
  )
  if (totalHeatInputs === 0) return 0

  const thermalEfficiency = totalGenerationOutputPlan / totalHeatInputs

  return fixedNumber((3600 / thermalEfficiency) * 100, 2)
}

export const calcHeatRateForecast = (
  generationOutputForecastSf: transofrmedHeatRateSummarySf[],
  thermalEfficienciesForecastSf: transofrmedHeatRateSummarySf[],
  generationOutputForecast: generationOutputData[],
  thermalEfficienciesForecast: ppaThermalEfficiencies[],
  generationOutputForecastSummaryTotal: number | null,
): number | null => {
  if (
    generationOutputForecastSf.length === 0 &&
    generationOutputForecast.length === 0 &&
    generationOutputForecastSummaryTotal === null
  )
    return null

  const heatInputsSf: heatInput[] = generationOutputForecastSf.map((elem) => {
    const value = elem.value || 0
    const thermalEfficiency = thermalEfficienciesForecastSf.find(
      (item: transofrmedHeatRateSummarySf) =>
        item["plant-id"] === elem["plant-id"] &&
        item["unit-id"] === elem["unit-id"] &&
        item["fiscal-year"] === elem["fiscal-year"],
    )
    return {
      "plant-id": elem["plant-id"],
      "unit-id": elem["unit-id"],
      "fiscal-year": elem["fiscal-year"],
      value:
        thermalEfficiency !== undefined && thermalEfficiency.value !== null && Number(thermalEfficiency.value) !== 0
          ? value / thermalEfficiency.value
          : 0,
    }
  })
  const totalHeatInputsSf = heatInputsSf.reduce((acc: number, item: heatInput) => acc + item.value, 0)
  const heatInputsSql: heatInput[] = generationOutputForecast.map((elem) => {
    const sum = elem.sum || 0
    const thermalEfficiency = thermalEfficienciesForecast.find(
      (item) =>
        item["plant-id"] === elem["plant-id"] &&
        item["unit-id"] === elem["unit-id"] &&
        item["fiscal-year"] === elem["fiscal-year"],
    )
    return {
      "plant-id": elem["plant-id"],
      "fiscal-year": elem["fiscal-year"],
      value:
        thermalEfficiency !== undefined && thermalEfficiency.sum !== null && Number(thermalEfficiency.sum) !== 0
          ? sum / thermalEfficiency.sum
          : 0,
    }
  })

  const totalHeatInputsSql = heatInputsSql.reduce((acc: number, item: heatInput) => acc + item.value, 0)
  const totalHeatInputs = totalHeatInputsSf + totalHeatInputsSql

  if (totalHeatInputs === 0) return 0

  const thermalEfficiency =
    (generationOutputForecastSummaryTotal === null ? 0 : generationOutputForecastSummaryTotal) / totalHeatInputs

  return fixedNumber((3600 / thermalEfficiency) * 100, 2)
}

export const calcHeatRateSummary = (
  generationOutputPlan: generationOutputData[],
  thermalEfficienciesPlan: ppaThermalEfficiencyType[],
  generationOutputForecastSf: transofrmedHeatRateSummarySf[],
  thermalEfficienciesForecastSf: transofrmedHeatRateSummarySf[],
  generationOutputForecast: generationOutputData[],
  thermalEfficienciesForecast: ppaThermalEfficiencies[],
  generationOutputForecastSummaryTotal: number | null,
): responseDataType => {
  const plan = calcHeatRatePlan(generationOutputPlan, thermalEfficienciesPlan)
  const forecast = calcHeatRateForecast(
    generationOutputForecastSf,
    thermalEfficienciesForecastSf,
    generationOutputForecast,
    thermalEfficienciesForecast,
    generationOutputForecastSummaryTotal,
  )

  return {
    plan: plan,
    forecast: forecast,
  }
}

const transformSf = (data: snowflakeType[]): transofrmedHeatRateSummarySf[] =>
  data.map((x) => {
    const mappedData: transofrmedHeatRateSummarySf = {
      "plant-id": x.PLANT_CODE,
      "fiscal-year": x.FISCAL_YEAR,
      value: x.VALUE,
    }
    if (x.UNIT_CODE !== undefined) mappedData["unit-id"] = x.UNIT_CODE

    return mappedData
  })

const convertKwhToGwh = (data: transofrmedHeatRateSummarySf[]) =>
  data.map((x) => ({
    ...x,
    value: fixedNumber(x.value / 1000),
  }))

const convertRatioToPercent = (data: transofrmedHeatRateSummarySf[]) =>
  data.map((x) => ({
    ...x,
    value: fixedNumber(x.value * 100),
  }))

const data = async <WorkUnitCtx>(
  input: requestType,
  generationOutputRepository: GenerationOutputRepositoryPort<WorkUnitCtx>,
): Promise<responseDataType> => {
  const [
    generationOutputPlan,
    thermalEfficienciesPlan,
    generationOutputForecastSf,
    thermalEfficienciesForecastSf,
    generationOutputForecast,
    generationOutputForecastSummaryTotal,
  ] = await Promise.all([
    generationOutputRepository.wrapInWorkUnitCtx(async (workUnitCtx) =>
      getGenerationOutputSalesUsecase(
        input["plant-id"],
        input["unit-id"],
        input["start-fiscal-year"],
        input["end-fiscal-year"],
        undefined,
        undefined,
        generationOutputRepository,
        workUnitCtx,
      ),
    ),
    wrapInTransactionCmn((transaction) => getPpaThermalEfficiency(input, transaction)),
    wrapInSnowflakeTransaction((snowflakeTransaction) =>
      getHeatRateSummarySfData(input, Measure.GenerationOutput, snowflakeTransaction)
        .then(transformSf)
        .then(convertKwhToGwh),
    ),
    wrapInSnowflakeTransaction((snowflakeTransaction) =>
      getHeatRateSummarySfData(input, Measure.ThermalEfficiency, snowflakeTransaction)
        .then(transformSf)
        .then(convertRatioToPercent),
    ),
    getGenerationOutputForecastFn(input).then(filterByFiscalYear),
    calcGenerationOutputSummaryForForecast(input).then((x) => (x === null ? null : fixedNumber(x / 1000))),
  ])
  const targetFiscalYears = generationOutputForecast.map((x) => x["fiscal-year"])
  const thermalEfficienciesForecast =
    targetFiscalYears.length === 0
      ? []
      : await getThermalEfficiencyForecastFn({
          "plant-id": input["plant-id"],
          "unit-id": input["unit-id"],
          "start-fiscal-year": Math.min(...targetFiscalYears) || undefined,
          "end-fiscal-year": Math.max(...targetFiscalYears) || undefined,
        })

  const heatRateSummaryData = calcHeatRateSummary(
    generationOutputPlan,
    thermalEfficienciesPlan,
    generationOutputForecastSf,
    thermalEfficienciesForecastSf,
    generationOutputForecast,
    thermalEfficienciesForecast,
    generationOutputForecastSummaryTotal,
  )

  return heatRateSummaryData
}

const controller = async <WorkUnitCtx>(
  input: requestType,
  generationOutputRepository: GenerationOutputRepositoryPort<WorkUnitCtx>,
  dataFn = data,
): Promise<responseType> => {
  return {
    code: 200,
    body: await dataFn(input, generationOutputRepository),
  }
}

const consolidate = (request: Request): requestType => ({
  "plant-id": request.query["plant-id"] as string,
  "unit-id": request.query["unit-id"] as string,
  "start-fiscal-year": OptionalNumber(request.query["start-fiscal-year"]),
  "end-fiscal-year": OptionalNumber(request.query["end-fiscal-year"]),
})

export const consolidateGetHeatRateSummaryRequest = consolidate
export const getHeatRateSummary = controller
export const getHeatRateSummaryController = <WorkUnitCtx>(
  generationOutputRepository: GenerationOutputRepositoryPort<WorkUnitCtx>,
) => jsonResponseWithErrorHandler((x) => controller(consolidate(x), generationOutputRepository))
export const getHeatRateSummaryFn = data
