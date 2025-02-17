import { Request } from "express"
import { jsonResponseWithErrorHandler } from "../../../decorators.js"
import { OptionalNumber } from "../../tot/v1/utils.js"
import { QueryTypes, Transaction } from "sequelize"
import { sequelize, wrapInTransactionCmn } from "../../../../infrastructure/orm/sqlize/index.js"
import { readSqlFile } from "./utils.js"
import {
  generationOutputPlanData,
  getHeatRatePlanRequest,
  getHeatRatePlanResponse,
  heatRatePlanData,
  ppaThermalEfficiencyFromDB,
} from "../../../../domain/entities/dpm/heatRatePlan.js"
import { getGenerationOutputSalesUsecase } from "../../../../application/use_cases/dpm/getGenerationOutputSalesUsecase.js"
import { GenerationOutputRepositoryPort } from "../../../../application/port/GenerationOutputRepositoryPort.js"

const SQL_QUERY_THERMAL_EFFICIENCY = readSqlFile("getPpaThermalEfficiencyForHeatRatePlan")

type requestType = getHeatRatePlanRequest
type responseType = getHeatRatePlanResponse
type responseDataType = heatRatePlanData

type generationOuputPlanType = generationOutputPlanData
type ppaThermalEfficiencyDatabaseType = ppaThermalEfficiencyFromDB

const getPpaThermalEfficiency = (input: requestType, transaction: Transaction) =>
  sequelize.query<ppaThermalEfficiencyDatabaseType>(SQL_QUERY_THERMAL_EFFICIENCY, {
    replacements: {
      plantCode: input["plant-id"],
      unitCode: input["unit-id"],
    },
    type: QueryTypes.SELECT,
    plain: true,
    transaction,
  })

// Created Transform function to omit sum value from generationOutputPlanUseCase
const transform = (data: generationOuputPlanType[]) =>
  data.map((x) => ({
    "plant-id": x["plant-id"],
    "unit-id": x["unit-id"],
    "fiscal-year": x["fiscal-year"],
    value: x.value,
    "correction-value": x["correction-value"],
  }))

const data = async <WorkUnitCtx>(
  input: requestType,
  generationOutputRepository: GenerationOutputRepositoryPort<WorkUnitCtx>,
): Promise<responseDataType[]> => {
  const [ppaThermalEfficiency, generationOutputPlan] = await Promise.all([
    wrapInTransactionCmn((transaction) =>
      getPpaThermalEfficiency(input, transaction).then(
        (ppaThermalEfficiency) => ppaThermalEfficiency?.PPA_THERMAL_EFFICIENCY ?? null,
      ),
    ),
    generationOutputRepository
      .wrapInWorkUnitCtx(async (workUnitCtx) =>
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
      )
      .then(transform),
  ])

  const thermalEfficiencyValue =
    ppaThermalEfficiency !== null && Number(ppaThermalEfficiency) !== 0
      ? 3600 / (Number(ppaThermalEfficiency) / 100)
      : null

  const heatRates = generationOutputPlan.map((generationOutput) => {
    return {
      "plant-id": generationOutput["plant-id"],
      "unit-id": generationOutput["unit-id"],
      "fiscal-year": generationOutput["fiscal-year"],
      value: thermalEfficiencyValue ? parseFloat(thermalEfficiencyValue.toFixed(2)) : thermalEfficiencyValue,
    }
  })

  return heatRates
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

export const consolidateGetHeatRatePlanRequest = consolidate
export const getHeatRatePlan = controller
export const getHeatRatePlanController = <WorkUnitCtx>(
  generationOutputRepository: GenerationOutputRepositoryPort<WorkUnitCtx>,
) => jsonResponseWithErrorHandler((x) => controller(consolidate(x), generationOutputRepository))
export const getHeatRatePlanFn = data
