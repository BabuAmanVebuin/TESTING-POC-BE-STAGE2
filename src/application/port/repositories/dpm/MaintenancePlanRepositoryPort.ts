// Initially copied from DPM-BE, commit d0e2f45544cc9890762f93cf3e8f224f15efd619
import { MaintenancePlan } from "../../../../domain/models/dpm/MaintenancePlan.js"

export type MaintenancePlanRepositoryPort<T> = {
  wrapInWorkUnitCtx: <X>(fn: (workUnitCtx: T) => Promise<X>) => Promise<X>
  upsertMaintenancePlan: (maintenancePlan: MaintenancePlan[], transaction?: T) => Promise<any>
  selectMaintenancePlanIds: (
    maintenancePlanId: Pick<MaintenancePlan, "maintenancePlanId">[],
    transaction?: T,
  ) => Promise<Pick<MaintenancePlan, "maintenancePlanId">[]>
  selectMappedMaintenancePlanIds: (
    maintenancePlanId: Pick<MaintenancePlan, "maintenancePlanId">[],
    transaction?: T,
  ) => Promise<Pick<MaintenancePlan, "maintenancePlanId">[]>
  deleteMaintenancePlan: (maintenancePlanIds: string[], transaction?: T) => Promise<unknown>
}
