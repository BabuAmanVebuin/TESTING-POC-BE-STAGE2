import { Request } from "express"
import { jsonResponseWithErrorHandler } from "../../../decorators.js"
import { OptionalNumber } from "../../tot/v1/utils.js"
import { QueryTypes, Transaction } from "sequelize"
import { sequelize, wrapInTransactionCmn } from "../../../../infrastructure/orm/sqlize/index.js"
import { readSqlFile } from "./utils.js"
import { getGenerationOutputSalesUsecase } from "../../../../application/use_cases/dpm/getGenerationOutputSalesUsecase.js"
import { GenerationOutputRepositoryPort } from "../../../../application/port/GenerationOutputRepositoryPort.js"
import {
  generationOutputPlanData,
  generationOutputPlanSummaryData,
  getHeatRatePlanSummaryRequest,
  getHeatRatePlanSummaryResponse,
  heatRatePlanSummaryData,
  ppaThermalEfficienciesData,
  ppaThermalEfficienciesFromDB,
} from "../../../../domain/entities/dpm/heatRatePlanSummary.js"
import { getGenerationOutputPlanSummaryUsecase } from "../../../../application/use_cases/dpm/getGenerationOutputPlanSummaryUsecase.js"

const SQL_QUERY_THERMAL_EFFICIENCY = readSqlFile("getPpaThermalEfficiencyForHeatRatePlanSummary")

type requestType = getHeatRatePlanSummaryRequest
type responseType = getHeatRatePlanSummaryResponse
type responseDataType = heatRatePlanSummaryData

type generationOutputPlanDataType = generationOutputPlanData
type generationOutputPlanSummaryDataType = generationOutputPlanSummaryData
type ppaThermalEfficienciesDataType = ppaThermalEfficienciesData
type ppaThermalEfficienciesDatabaseType = ppaThermalEfficienciesFromDB

export const calcHeatRatePlanSummary = (
  ppaThermalEfficiencies: ppaThermalEfficienciesDataType[],
  generationOutputPlan: generationOutputPlanDataType[],
  generationOutputPlanSummary: generationOutputPlanSummaryDataType[],
): responseDataType[] => {
  const genererationOutputPlanResult: responseDataType[] = generationOutputPlan.map((elem) => {
    const value = elem.value || 0
    const ppaThermalEfficiency = ppaThermalEfficiencies.find((item) => item["unit-id"] === elem["unit-id"])
    return {
      "plant-id": elem["plant-id"],
      "fiscal-year": elem["fiscal-year"],
      value:
        ppaThermalEfficiency !== undefined && Number(ppaThermalEfficiency["ppa-thermal-efficiency"]) !== 0
          ? value / Number(ppaThermalEfficiency["ppa-thermal-efficiency"])
          : 0,
    }
  })

  const genererationOutputPlanHeatInput: responseDataType[] = Object.values(
    genererationOutputPlanResult.reduce(
      (acc, item) => {
        const fiscalYear = item["fiscal-year"]
        if (!acc[fiscalYear]) {
          acc[fiscalYear] = { ...item }
        } else {
          acc[fiscalYear].value += item.value
        }
        return acc
      },
      {} as Record<number, responseDataType>,
    ),
  )

  const result = generationOutputPlanSummary.map((elem) => {
    const heatInputValue = genererationOutputPlanHeatInput.find((item) => item["fiscal-year"] === elem["fiscal-year"])
    const value =
      Number(heatInputValue?.value) !== 0 && heatInputValue !== undefined
        ? 3600 / (elem.value / heatInputValue.value / 100)
        : 0
    return {
      "plant-id": elem["plant-id"],
      "fiscal-year": elem["fiscal-year"],
      value: Number(value.toFixed(2)),
    }
  })

  return result
}

const transform = (data: ppaThermalEfficienciesDatabaseType[]) =>
  data.map((x) => ({
    "unit-id": x.UNIT_CODE,
    "ppa-thermal-efficiency": x.PPA_THERMAL_EFFICIENCY,
  }))

const getPpaThermalEfficiencies = (input: requestType, transaction: Transaction) =>
  sequelize.query<ppaThermalEfficienciesDatabaseType>(SQL_QUERY_THERMAL_EFFICIENCY, {
    replacements: {
      plantCode: input["plant-id"],
    },
    type: QueryTypes.SELECT,
    transaction,
  })

const data = async <WorkUnitCtx>(
  input: requestType,
  generationOutputRepository: GenerationOutputRepositoryPort<WorkUnitCtx>,
): Promise<responseDataType[]> => {
  const [ppaThermalEfficiencies, generationOutputPlan, generationOutputPlanSummary] = await Promise.all([
    wrapInTransactionCmn((transaction) => getPpaThermalEfficiencies(input, transaction).then(transform)),
    generationOutputRepository.wrapInWorkUnitCtx(async (workUnitCtx) =>
      getGenerationOutputSalesUsecase(
        input["plant-id"],
        undefined,
        input["start-fiscal-year"],
        input["end-fiscal-year"],
        undefined,
        undefined,
        generationOutputRepository,
        workUnitCtx,
      ),
    ),
    generationOutputRepository.wrapInWorkUnitCtx(async (workUnitCtx) =>
      getGenerationOutputPlanSummaryUsecase(
        input["plant-id"],
        input["start-fiscal-year"],
        input["end-fiscal-year"],
        generationOutputRepository,
        workUnitCtx,
      ),
    ),
  ])
  // ppa熱効率が0の場合は空の配列を返却する
  const ppaThermalEfficiencyCheck = ppaThermalEfficiencies.every((x) => Number(x["ppa-thermal-efficiency"]) === 0)
  if (ppaThermalEfficiencyCheck) {
    return []
  }
  const result = calcHeatRatePlanSummary(ppaThermalEfficiencies, generationOutputPlan, generationOutputPlanSummary)

  return result
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
  "start-fiscal-year": OptionalNumber(request.query["start-fiscal-year"]),
  "end-fiscal-year": OptionalNumber(request.query["end-fiscal-year"]),
})

export const consolidateGetHeatRatePlanSummaryRequest = consolidate
export const getHeatRatePlanSummary = controller
export const getHeatRatePlanSummaryController = <WorkUnitCtx>(
  generationOutputRepository: GenerationOutputRepositoryPort<WorkUnitCtx>,
) => jsonResponseWithErrorHandler((x) => controller(consolidate(x), generationOutputRepository))
export const getHeatRatePlanSummaryFn = data
