import { jsonResponseWithErrorHandler } from "../../../decorators.js"
import { Request } from "express"
import { GenerationOutputRepositoryPort } from "../../../../application/port/GenerationOutputRepositoryPort.js"
import { OptionalNumber } from "../../tot/v1/utils.js"
import {
  getGenerationOutputPlanSummaryRequest,
  getGenerationOutputPlanSummaryResponse,
} from "../../../../domain/entities/dpm/generationOutputPlanSummary.js"
import { getGenerationOutputPlanSummaryUsecase } from "../../../../application/use_cases/dpm/getGenerationOutputPlanSummaryUsecase.js"

const controller = async <X>(
  input: getGenerationOutputPlanSummaryRequest,
  generationOutputRepository: GenerationOutputRepositoryPort<X>,
): Promise<getGenerationOutputPlanSummaryResponse> => {
  const body = await generationOutputRepository.wrapInWorkUnitCtx(async (workUnitCtx) =>
    getGenerationOutputPlanSummaryUsecase(
      input["plant-id"],
      input["start-fiscal-year"],
      input["end-fiscal-year"],
      generationOutputRepository,
      workUnitCtx,
    ),
  )

  return {
    code: 200,
    body,
  }
}

const consolidate = (request: Request): getGenerationOutputPlanSummaryRequest => ({
  "plant-id": request.query["plant-id"] as string,
  "start-fiscal-year": OptionalNumber(request.query["start-fiscal-year"]),
  "end-fiscal-year": OptionalNumber(request.query["end-fiscal-year"]),
})

export const consolidateGetGenerationOutputPlanSummaryRequest = consolidate
export const getGenerationOutputPlanSummary = controller
export const getGenerationOutputPlanSummaryController = <X>(
  generationOutputRepository: GenerationOutputRepositoryPort<X>,
) => jsonResponseWithErrorHandler((x) => controller(consolidate(x), generationOutputRepository))
