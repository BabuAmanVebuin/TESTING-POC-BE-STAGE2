import { jsonResponseWithErrorHandler } from "../../../decorators.js"
import { Request } from "express"
import { OptionalNumber } from "../../tot/v1/utils.js"
import { OpexRepositoryPort } from "../../../../application/port/OpexRepositoryPort.js"
import {
  getOpexPlanSummaryRequest,
  getOpexPlanSummaryResponse,
} from "../../../../domain/entities/dpm/opexPlanSummary.js"
import { getOpexPlanSummaryUseCase } from "../../../../application/use_cases/dpm/getOpexPlanSummaryUseCase.js"

const controller = async <X>(
  input: getOpexPlanSummaryRequest,
  generationOutputRepository: OpexRepositoryPort<X>,
): Promise<getOpexPlanSummaryResponse> => {
  const body = await generationOutputRepository.wrapInWorkUnitCtx(async (workUnitCtx) =>
    getOpexPlanSummaryUseCase(
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

const consolidate = (request: Request): getOpexPlanSummaryRequest => ({
  "plant-id": request.query["plant-id"] as string,
  "start-fiscal-year": OptionalNumber(request.query["start-fiscal-year"]),
  "end-fiscal-year": OptionalNumber(request.query["end-fiscal-year"]),
})

export const consolidateGetOpexPlanSummaryRequest = consolidate
export const getOpexPlanSummary = controller
export const getOpexPlanSummaryController = <X>(OpexRepository: OpexRepositoryPort<X>) =>
  jsonResponseWithErrorHandler((x) => controller(consolidate(x), OpexRepository))
