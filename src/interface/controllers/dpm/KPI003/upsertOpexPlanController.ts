import { jsonResponseWithErrorHandler } from "../../../decorators.js"
import { Request } from "express"
import { upsertOpexPlanRequest, upsertOpexPlanResponse } from "../../../../domain/entities/dpm/opexPlan.js"
import { OpexRepositoryPort } from "../../../../application/port/OpexRepositoryPort.js"
import { upsertOpexPlanUsecase } from "../../../../application/use_cases/dpm/upsertOpexPlanUsecase.js"

const controller = async <X>(
  input: upsertOpexPlanRequest,
  opexRepository: OpexRepositoryPort<X>,
): Promise<upsertOpexPlanResponse> => {
  const mappedInput = input.map((elt) => {
    return {
      plantCode: elt["plant-id"],
      unitCode: elt["unit-id"],
      fiscalYear: elt["fiscal-year"],
      operationCost: elt["operation-cost"],
      maintenanceCost: elt["maintenance-cost"],
      userId: elt["user-id"],
    }
  })
  await opexRepository.wrapInWorkUnitCtx(async (workUnitCtx) =>
    upsertOpexPlanUsecase(mappedInput, opexRepository, workUnitCtx),
  )

  return {
    code: 200,
    body: "OK",
  }
}

const consolidate = (request: Request): upsertOpexPlanRequest => {
  if (Array.isArray(request.body)) {
    return request.body.map((x: Record<string, unknown>) => ({
      "plant-id": x["plant-id"] as string,
      "unit-id": x["unit-id"] as string,
      "fiscal-year": Number(x["fiscal-year"]),
      "operation-cost": x["operation-cost"] === null ? null : Number(x["operation-cost"]),
      "maintenance-cost": x["maintenance-cost"] === null ? null : Number(x["maintenance-cost"]),
      "user-id": x["user-id"] as string,
    })) as upsertOpexPlanRequest
  }
  return null as unknown as upsertOpexPlanRequest
}

export const consolidateUpsertOpexPlanRequest = consolidate
export const upsertOpexPlan = controller
export const upsertOpexPlanController = <X>(opexRepository: OpexRepositoryPort<X>) =>
  jsonResponseWithErrorHandler((x) => controller(consolidate(x), opexRepository))
