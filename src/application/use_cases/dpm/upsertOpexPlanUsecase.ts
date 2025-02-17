import { OpexPlan } from "../../../domain/models/Opex.js"
import { OpexRepositoryPort } from "../../port/OpexRepositoryPort.js"

export const upsertOpexPlanUsecase = async <WorkUnitCtx>(
  opexPlans: OpexPlan[],
  opexRepository: OpexRepositoryPort<WorkUnitCtx>,
  workUnitCtx: WorkUnitCtx,
): Promise<void> => {
  const currentDateTime = new Date()
  await opexRepository.upsertOpexPlan(workUnitCtx, opexPlans, currentDateTime)
}
