import { jsonResponseWithErrorHandler } from "../../../decorators.js"
import { Request } from "express"
import { OptionalNumber } from "../../tot/v1/utils.js"
import { getOpexPlanRequest, getOpexPlanResponse } from "../../../../domain/entities/dpm/opexPlan.js"
import { getOpexPlanUseCase } from "../../../../application/use_cases/dpm/getOpexPlanUseCase.js"
import { OpexRepositoryPort } from "../../../../application/port/OpexRepositoryPort.js"

const controller = async <X>(
  input: getOpexPlanRequest,
  generationOutputRepository: OpexRepositoryPort<X>,
): Promise<getOpexPlanResponse> => {
  const body = await generationOutputRepository.wrapInWorkUnitCtx(async (workUnitCtx) =>
    getOpexPlanUseCase(
      input["plant-id"],
      input["unit-id"],
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

const consolidate = (request: Request): getOpexPlanRequest => ({
  "plant-id": request.query["plant-id"] as string,
  "unit-id": request.query["unit-id"] as string,
  "start-fiscal-year": OptionalNumber(request.query["start-fiscal-year"]),
  "end-fiscal-year": OptionalNumber(request.query["end-fiscal-year"]),
})

export const consolidateGetOpexPlanRequest = consolidate
export const getOpexPlan = controller
export const getOpexPlanController = <X>(OpexRepository: OpexRepositoryPort<X>) =>
  jsonResponseWithErrorHandler((x) => controller(consolidate(x), OpexRepository))
