import { upsertGenerationOutputSalesUsecase } from "../../../../application/use_cases/dpm/upsertGenerationOutputSalesUsecase.js"
import { jsonResponseWithErrorHandler } from "../../../decorators.js"
import { Request } from "express"
import { GenerationOutputRepositoryPort } from "../../../../application/port/GenerationOutputRepositoryPort.js"
import {
  upsertGenerationOutputPlanRequest,
  upsertGenerationOutputPlanResponse,
} from "../../../../domain/entities/dpm/generationOutputPlan.js"

const controller = async <X>(
  input: upsertGenerationOutputPlanRequest,
  generationOutputRepository: GenerationOutputRepositoryPort<X>,
): Promise<upsertGenerationOutputPlanResponse> => {
  const mappedInput = input.map((elt) => {
    return {
      plantCode: elt["plant-id"],
      unitCode: elt["unit-id"],
      fiscalYear: elt["fiscal-year"],
      value: elt.value,
      correctionValue: elt["correction-value"],
      userId: elt["user-id"],
    }
  })
  await generationOutputRepository.wrapInWorkUnitCtx(async (workUnitCtx) =>
    upsertGenerationOutputSalesUsecase(mappedInput, generationOutputRepository, workUnitCtx),
  )

  return {
    code: 200,
    body: "OK",
  }
}

const consolidate = (request: Request): upsertGenerationOutputPlanRequest => {
  if (Array.isArray(request.body)) {
    return request.body.map((x: Record<string, unknown>) => ({
      "plant-id": x["plant-id"] as string,
      "unit-id": x["unit-id"] as string,
      "fiscal-year": Number(x["fiscal-year"]),
      value: x.value === null ? null : Number(x.value),
      "correction-value": x["correction-value"] === null ? null : Number(x["correction-value"]),
      "user-id": x["user-id"] as string,
    })) as upsertGenerationOutputPlanRequest
  }
  return null as unknown as upsertGenerationOutputPlanRequest
}

export const consolidateUpsertGenerationOutputPlanRequest = consolidate
export const upsertGenerationOutputPlan = controller
export const upsertGenerationOutputPlanController = <X>(
  generationOutputRepository: GenerationOutputRepositoryPort<X>,
) => jsonResponseWithErrorHandler((x) => controller(consolidate(x), generationOutputRepository))
