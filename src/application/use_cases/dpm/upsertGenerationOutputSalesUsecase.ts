import { GenerationOutputRepositoryPort } from "../../port/GenerationOutputRepositoryPort.js"
import { GenerationOutputPlan } from "../../../domain/models/GenerationOutput.js"

export const upsertGenerationOutputSalesUsecase = async <WorkUnitCtx>(
  generationOutputPlans: GenerationOutputPlan[],
  generationOutputRepository: GenerationOutputRepositoryPort<WorkUnitCtx>,
  workUnitCtx: WorkUnitCtx,
): Promise<void> => {
  const currentDateTime = new Date()
  await generationOutputRepository.upsertGenerationOutputPlan(workUnitCtx, generationOutputPlans, currentDateTime)
}
