import { jsonResponseWithErrorHandler } from "../../../decorators.js"
import { Request } from "express"
import { GenerationOutputRepositoryPort } from "../../../../application/port/GenerationOutputRepositoryPort.js"
import {
  getGenerationOutputPlanRequest,
  getGenerationOutputPlanResponse,
} from "../../../../domain/entities/dpm/generationOutputPlan.js"
import { OptionalNumber } from "../../tot/v1/utils.js"
import { getGenerationOutputSalesUsecase } from "../../../../application/use_cases/dpm/getGenerationOutputSalesUsecase.js"

const controller = async <X>(
  input: getGenerationOutputPlanRequest,
  generationOutputRepository: GenerationOutputRepositoryPort<X>,
): Promise<getGenerationOutputPlanResponse> => {
  const body = await generationOutputRepository.wrapInWorkUnitCtx(async (workUnitCtx) =>
    getGenerationOutputSalesUsecase(
      input["plant-id"],
      input["unit-id"],
      input["start-fiscal-year"],
      input["end-fiscal-year"],
      input.limit,
      input.offset,
      generationOutputRepository,
      workUnitCtx,
    ),
  )

  return {
    code: 200,
    body,
  }
}

const consolidate = (request: Request): getGenerationOutputPlanRequest => ({
  "plant-id": request.query["plant-id"] as string,
  "unit-id": request.query["unit-id"] as string,
  "start-fiscal-year": OptionalNumber(request.query["start-fiscal-year"]),
  "end-fiscal-year": OptionalNumber(request.query["end-fiscal-year"]),
  limit: OptionalNumber(request.query.limit),
  offset: OptionalNumber(request.query.offset),
})

export const consolidateGetGenerationOutputPlanRequest = consolidate
export const getGenerationOutputPlan = controller
export const getGenerationOutputPlanController = <X>(generationOutputRepository: GenerationOutputRepositoryPort<X>) =>
  jsonResponseWithErrorHandler((x) => controller(consolidate(x), generationOutputRepository))
