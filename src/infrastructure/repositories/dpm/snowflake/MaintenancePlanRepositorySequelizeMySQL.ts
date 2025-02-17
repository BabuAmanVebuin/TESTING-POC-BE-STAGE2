// Initially copied from DPM-BE, commit d0e2f45544cc9890762f93cf3e8f224f15efd619
import { QueryTypes, Sequelize, Transaction } from "sequelize"
import { MaintenancePlanRepositoryPort } from "../../../../application/port/repositories/dpm/MaintenancePlanRepositoryPort.js"

/**
 * Insert record plant_maintenance
 */
const UPSERT_MAINTENANCE_PLAN = `
  insert into t_maintenance_plan 
    (MAINTENANCE_PLAN_ID,MAINTENANCE_PLAN_NAME,ASSET_CODE,PLANT_CODE)
  values :maintenancePlans 
  on duplicate key update
    MAINTENANCE_PLAN_NAME = values(MAINTENANCE_PLAN_NAME),
    ASSET_CODE = values(ASSET_CODE),
    PLANT_CODE = values(PLANT_CODE)`
/**
 * Select plan maintenance by ids
 */
const SELECT_MAINTENANCE_PLAN_ID = `
  select
    tmp.MAINTENANCE_PLAN_ID as maintenancePlanId
  from
    t_maintenance_plan tmp
  where
    tmp.maintenance_plan_id in (:maintenancePlanIds)
`

/**
 * Select plan maintenance by ids
 */
const SELECT_EXISTING_MAPPED_MAINTENANCE_PLAN_ID = `
  select
    tmprd.MAINTENANCE_PLAN_ID as maintenancePlanId
  from
    t_notification_breakdown_maintenance tmprd
  where
    tmprd.maintenance_plan_id in (:maintenancePlanIds)
`
// delete maintenance plan by id
const DELETE_MAINTENANCE_PLAN_BY_MAINTENANCE_ID =
  "delete from t_maintenance_plan where MAINTENANCE_PLAN_ID in (:maintenancePlanIds)"

export const MaintenancePlanRepositorySequelizeMysql = async (
  sequelize: Sequelize,
): Promise<MaintenancePlanRepositoryPort<Transaction | null>> => ({
  wrapInWorkUnitCtx: async (fn) => {
    return sequelize.transaction(fn)
  },
  /**
   * Function to upsert maintenance plans
   * @param maintenancePlan
   * @param transaction
   * @returns
   */
  upsertMaintenancePlan: async (maintenancePlans, transaction) => {
    return sequelize.query(UPSERT_MAINTENANCE_PLAN, {
      replacements: {
        maintenancePlans: maintenancePlans.map((i) => [
          i.maintenancePlanId,
          i.maintenancePlanName,
          i.assetCode,
          i.plantCode,
        ]),
      },
      type: QueryTypes.UPSERT,
      transaction,
    })
  },
  /**
   * Function to get existing plan Maintenance ids
   * @param maintenancePlanIds
   * @param transaction
   * @returns existing maintenance plan ids
   */
  selectMaintenancePlanIds: async (maintenancePlanIds, transaction) => {
    return sequelize.query(SELECT_MAINTENANCE_PLAN_ID, {
      replacements: {
        maintenancePlanIds: maintenancePlanIds.map((i) => i.maintenancePlanId),
      },
      type: QueryTypes.SELECT,
      transaction,
    })
  },
  /**
   * Function to get existing mapped Maintenance ids
   * @param maintenancePlanIds
   * @param transaction
   * @returns existing maintenance plan ids
   */
  selectMappedMaintenancePlanIds: async (maintenancePlanIds, transaction) => {
    return sequelize.query(SELECT_EXISTING_MAPPED_MAINTENANCE_PLAN_ID, {
      replacements: {
        maintenancePlanIds: maintenancePlanIds.map((i) => i.maintenancePlanId),
      },
      type: QueryTypes.SELECT,
      raw: true,
      transaction,
    })
  },
  /**
   * function to delete Maintenance Plan by ids
   * @param maintenancePlanIds
   * @param transaction
   * @returns
   */
  deleteMaintenancePlan: async (maintenancePlanIds, transaction) => {
    return sequelize.query(DELETE_MAINTENANCE_PLAN_BY_MAINTENANCE_ID, {
      replacements: {
        maintenancePlanIds,
      },
      type: QueryTypes.DELETE,
      transaction,
    })
  },
})
