// Initially copied from DPM-BE, commit d0e2f45544cc9890762f93cf3e8f224f15efd619
import { CONST_VARIABLE } from "../../../config/dpm/constant.js"
import { MaintenancePlan } from "../../../domain/models/dpm/MaintenancePlan.js"
import logger from "../../../infrastructure/logger.js"
import { Sequelize } from "sequelize"
import { MaintenancePlanRepositorySequelizeMysql } from "../../../infrastructure/repositories/dpm/snowflake/MaintenancePlanRepositorySequelizeMySQL.js"
import { IntervalUnit } from "../../../config/dpm/enums.js"

/**
 * receive Maintenance Plan controller data
 * @param data
 * @param connections
 * @returns
 */
export const receiveMaintenancePlanController = async (
  data: MaintenancePlan[],
  connections: {
    dpmDb: Sequelize
  },
): Promise<void> => {
  logger.info(`MaintenancePlan processing start data: ${JSON.stringify(data)}`)

  const maintenancePlanRepository = await MaintenancePlanRepositorySequelizeMysql(connections.dpmDb)

  /**
   * Filter valid data
   */
  data = data.filter((record) => validateMaintenancePlan(record))
  logger.debug(`Validate filtered records: ${JSON.stringify(data)}`)

  if (data.length == 0) {
    logger.info(`MaintenancePlan processing completed`)
    return
  }
  await maintenancePlanRepository.wrapInWorkUnitCtx(async (t) => {
    /**
     * Get maintenance plan ids
     */
    const existingMappedMaintenanceIds = await maintenancePlanRepository.selectMappedMaintenancePlanIds(data, t)
    logger.debug(`Existing mapped Maintenance Ids records: ${JSON.stringify(existingMappedMaintenanceIds)}`)

    const maintenancePlanRecords = data.map((i) => ({
      ...i,
      isMapped: existingMappedMaintenanceIds.some(
        (existingMaintenanceId) => i.maintenancePlanId === existingMaintenanceId.maintenancePlanId,
      ),
      isBreakdownMaintenance: i.intervals.some(
        (interval) =>
          interval.unit == IntervalUnit.JHR &&
          interval.length / CONST_VARIABLE.BM_YEAR_CONVERSION_FACTOR === CONST_VARIABLE.BM_MAINTENANCE_PLAN_YEARS,
      ),
    }))

    logger.debug(`Maintenance plan records mapped:  ${JSON.stringify(maintenancePlanRecords)}`)
    /**
     * filter new maintenance records
     */
    const upsertMaintenanceRecords = maintenancePlanRecords.filter(
      (maintenancePlanRecord) =>
        maintenancePlanRecord.isBreakdownMaintenance &&
        !maintenancePlanRecord.isMapped &&
        maintenancePlanRecord.isDeleted != true,
    )
    logger.debug(`Upsert maintenance records: ${JSON.stringify(upsertMaintenanceRecords)}`)

    // upsert records
    if (upsertMaintenanceRecords.length > 0) {
      await maintenancePlanRepository.upsertMaintenancePlan(upsertMaintenanceRecords, t)
    }
    const existingMaintenanceIds = await maintenancePlanRepository.selectMaintenancePlanIds(maintenancePlanRecords, t)
    logger.debug(`Existing maintenance records: ${JSON.stringify(existingMaintenanceIds)}`)

    const deleteRecord: string[] = []

    for (const maintenancePlanRecord of maintenancePlanRecords) {
      /**
       * filter maintenancePlanRecord for delete
       * @description
       * 1) existingMaintenanceIds
       * 2) (it's not mapped and isDeleted)
       * 3) not isBreakdownMaintenance
       */
      if (
        existingMaintenanceIds.some((i) => i.maintenancePlanId == maintenancePlanRecord.maintenancePlanId) &&
        (!maintenancePlanRecord.isBreakdownMaintenance ||
          (!maintenancePlanRecord.isMapped && maintenancePlanRecord.isDeleted === true))
      ) {
        deleteRecord.push(maintenancePlanRecord.maintenancePlanId)
      }
    }
    logger.debug(`Delete Record: ${JSON.stringify(deleteRecord)}`)

    if (deleteRecord.length > 0) {
      await maintenancePlanRepository.deleteMaintenancePlan(deleteRecord, t)
    }
  })
  logger.info(`MaintenancePlan processing completed`)
}
/**
 * Function to validated notification params
 * @param params NotificationEventData
 * @returns is valid params
 */
export function validateMaintenancePlan(params: MaintenancePlan): boolean {
  /**
   * maintenancePlanId is required and number and max 12 string
   */
  if (!params?.maintenancePlanId || params.maintenancePlanId.length > 12) {
    logger.warn(`Event validation error - Invalid maintenancePlanId : ${params.maintenancePlanId} `)
    return false
  }
  // maintenancePlanName required and length max 40
  if (!params?.maintenancePlanName || params.maintenancePlanName.length > 40) {
    logger.warn(`Event validation error - Invalid maintenancePlanName : ${params.maintenancePlanName} `)
    return false
  }
  // assetCode required and length max 40
  if (!params?.assetCode || params.assetCode.length > 40) {
    logger.warn("Event validation error - Invalid assetCode :", params.assetCode)
    return false
  }
  //plantCode is required and max length 10
  if (!params?.plantCode || params.plantCode.length > 10) {
    logger.warn(`Event validation error - Invalid plantCode : ${params.plantCode}`)
    return false
  }
  //plantCode is not required type boolean
  if (params.isDeleted !== null && typeof params.isDeleted !== "boolean") {
    logger.warn(`Event validation error - Invalid isDeleted : ${typeof params.isDeleted === "boolean"}`)
    return false
  }
  //  intervals array validation
  for (const interval of params.intervals) {
    //  unit is required and intervalUnit.length max 3
    if (!interval.unit || `${interval.unit}`.length > 3) {
      logger.warn(`Event validation error - Invalid interval.unit : ${interval.unit}`)
      return false
    }
    // length required and max 16 digits
    if ((!interval.length && interval.length !== 0) || `${interval.length}`.length > 16) {
      logger.warn(`Event validation error - Invalid interval.length : ${interval.length}`)
      return false
    }
  }
  return true
}
