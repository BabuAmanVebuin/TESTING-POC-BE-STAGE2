// Initially copied from ToT-BE, commit 545c1dd02ed8df920e315645df162212e80b2a03
import { QueryTypes, Transaction } from "sequelize"
import { cmnSequelize } from "../../../../infrastructure/orm/sqlize/index.js"
import logger from "../../../../infrastructure/logger.js"
import { createPlantMaintenance } from "../../../../domain/entities/tot/v1/createPlantMaintenanceOrder.js"
import { Constants } from "../../../../config/constants.js"
/** Insert data sap table query */
const insertSapQuery = `INSERT INTO t_plant_maintenance_order (
    TYPE,
    SOURCE,
    TIMESTAMP,
    CONTENT_TYPE,
    ORDER_ID,
    SHORT_TEXT,
    ORDER_TYPE,
    PLAN_GROUP,
    FUNCTIONAL_LOCATION,
    PLANT_ID,
    SYSTEM_STATUS,
    PLAN_PLANT,
    USER_STATUS,
    BASIC_START_DATE,
    BASIC_FINISH_DATE,
    REVISION_CODE,
    PLANT_SECTION,
    CREATE_TIMESTAMP,
    UPDATE_TIMESTAMP,
    CREATED_DATE,
    UPDATED_DATE
  ) VALUES (
    :type,
    :source,
    :timestamp,
    :contentType,
    :orderId,
    :shortText,
    :orderType,
    :planGroup,
    :functionalLocation,
    :plantId,
    :systemStatus,
    :planPlant,
    :userStatus,
    :basicStartDate,
    :basicFinishDate,
    :revisionCode,
    :plantSection,
    :createTimestamp,
    :updateTimestamp,
    :createDate,
    :updateDate
  );`

/** Insert data sap operation table query */
const insertSapOperationQuery = `INSERT INTO t_plant_maintenance_order_operation (
    PLANT_MAINTENANCE_ORDER_ID,
    ORDER_ID,
    ROUTING_ID,
    ROUTING_COUNTER,
    ACTIVITY,
    DESCRIPTION,
    START_CONSTRAINT_DATE,
    START_CONSTRAINT_TIME,
    FINISH_CONSTRAINT_DATE,
    FINISH_CONSTRAINT_TIME,
    ACTUAL_START_DATE,
    ACTUAL_START_TIME,
    ACTUAL_FINISH_DATE,
    ACTUAL_FINISH_TIME,
    CONTROL_KEY,
    STANDARD_TEXT_KEY,
    SYSTEM_STATUS,
    USER_STATUS,
    WORKER_AND_SUPERVISOR,
    SITE_SUPERVISOR,
    REQUEST,
    REQUESTEE,
    CREATE_TIMESTAMP,
    UPDATE_TIMESTAMP
  ) VALUES (
    :sapId,
    :orderId,
    :routingId,
    :routingCounter,
    :activity,
    :description,
    :startConstraintDate,
    :startConstraintTime,
    :finishConstraintDate,
    :finishConstraintTime,
    :actualStartDate,
    :actualStartTime,
    :actualFinishDate,
    :actualFinishTime,
    :controlKey,
    :standardTextKey,
    :systemStatus,
    :userStatus,
    :workerAndSupervisor,
    :siteSupervisor,
    :request,
    :requestee,
    :createTimestamp,
    :updateTimestamp
);`

/** check sap order data exists query */
const checkSapOrderQuery = `SELECT PLANT_MAINTENANCE_ORDER_ID,ORDER_ID FROM t_plant_maintenance_order WHERE ORDER_ID  IN (:orderId)`

/** check t_plant_maintenance_order_operation data exists query */
const checkPlantMaintenanceOrderDataQuery = `SELECT ACTIVITY,ORDER_ID,PLANT_MAINTENANCE_ORDER_ID FROM t_plant_maintenance_order_operation WHERE ORDER_ID =:orderId`

/**  get sap order function */
export const createPlantMaintenanceOrder = async (reqBody: createPlantMaintenance): Promise<unknown> => {
  const result = await cmnSequelize.transaction<unknown>(async (transaction) => {
    /** get plant maintenance order data */
    const curdate = new Date()
    const sapOrderData = await selectPlantMaintenanceOrder(reqBody.data)

    const reqDataOrderId = reqBody.data.map((val) => {
      return String(val["order-id"])
    })
    const reqsapOrderId = sapOrderData.map((val: any) => {
      return String(val["ORDER_ID"])
    })
    /** unique insert plan order data */
    const uniqueInsertplanOrderData: any = reqDataOrderId.filter((val: any) => !reqsapOrderId.includes(val))

    const arrOrderToInsert = reqBody.data.filter((objEachOrder) => {
      if (uniqueInsertplanOrderData.indexOf(objEachOrder["order-id"]) >= 0) {
        return true
      } else {
        return false
      }
    })

    /** unique update plan order data */
    const uniqueUpdateplanOrderData: any = reqDataOrderId.filter((val: any) => reqsapOrderId.includes(val))
    const arrOrderToUpdate = reqBody.data.filter((objEachOrder) => {
      if (uniqueUpdateplanOrderData.indexOf(objEachOrder["order-id"]) >= 0) {
        return true
      } else {
        return false
      }
    })

    const { type, source, timestamp, "content-type": contentType } = reqBody
    /** insert plant maintenace order */
    await insertPlantMaintenanceOrder(
      {
        data: arrOrderToInsert,
        objCommon: { type, source, timestamp, contentType, curdate },
      },
      transaction,
    )
    /** update plant maintenance order */
    await updatePlantMaintenanceOrder(
      {
        data: arrOrderToUpdate,
        objCommon: { type, source, timestamp, contentType, curdate },
      },
      transaction,
    )

    return {
      code: 201,
      body: "success",
    }
  })
  return result
}

/** get plant Maintenace Order  */
const selectPlantMaintenanceOrder = async (data: any) => {
  try {
    const orderIdresult = data.map((order: any) => {
      return order["order-id"]
    })
    const sapOrderData = await cmnSequelize.query<
      [
        {
          PLANT_MAINTENANCE_ORDER_ID: number
          ORDER_ID: string
        },
      ]
    >(checkSapOrderQuery, {
      type: QueryTypes.SELECT,
      replacements: { orderId: orderIdresult },
    })
    return sapOrderData
  } catch (err) {
    logger.error(err)
    throw err
  }
}

/** get plant Maintenance order Operation */
const selectPlantMaintenanceOrderOperation = async (orderId: any) => {
  try {
    const sapOrderOperationData = await cmnSequelize.query<
      [
        {
          ACTIVITY: string
          ORDER_ID: string
          PLANT_MAINTENANCE_ORDER_ID: number
        },
      ]
    >(checkPlantMaintenanceOrderDataQuery, {
      type: QueryTypes.SELECT,
      replacements: { orderId: orderId },
    })
    return sapOrderOperationData
  } catch (err) {
    logger.error(err)
    throw err
  }
}

/** insert plant maintenance Order */
const insertPlantMaintenanceOrder = async (reqBodyData: any, transaction: Transaction) => {
  try {
    const { data, objCommon } = reqBodyData
    for (const orderInsertData of data) {
      const sapId = await cmnSequelize.query(insertSapQuery, {
        raw: true,
        type: QueryTypes.INSERT,
        transaction,
        replacements: {
          type: objCommon["type"],
          source: objCommon["source"],
          timestamp: objCommon["timestamp"],
          contentType: objCommon["contentType"],
          orderId: orderInsertData["order-id"],
          shortText: orderInsertData["short-text"],
          orderType: orderInsertData["order-type"],
          planGroup: orderInsertData["plan-group"],
          functionalLocation: orderInsertData["functional-location"],
          plantId: orderInsertData["functional-location"].substring(0, 3),
          systemStatus: orderInsertData["system-status"],
          planPlant: orderInsertData["plan-plant"],
          userStatus: orderInsertData["user-status"],
          basicStartDate:
            orderInsertData["basic-start-date"] != undefined
              ? orderInsertData["basic-start-date"] != Constants.FIELDS.DEFAULT_DATE_STRING
                ? orderInsertData["basic-start-date"]
                : null
              : null,
          basicFinishDate: orderInsertData["basic-finish-date"],
          revisionCode: orderInsertData["revision-code"] != undefined ? orderInsertData["revision-code"] : null,
          plantSection: orderInsertData["plant-section"] != undefined ? orderInsertData["plant-section"] : null,
          createTimestamp: objCommon["curdate"],
          updateTimestamp: objCommon["curdate"],
          createDate: orderInsertData["created-date"],
          updateDate:
            orderInsertData["updated-date"] != undefined
              ? orderInsertData["updated-date"] != Constants.FIELDS.DEFAULT_DATE_STRING
                ? orderInsertData["updated-date"]
                : null
              : null,
        },
      })

      logger.info(`sapId ::: ${sapId[0]}`)
      await insertPlantMaintenanceOrderOperation(
        orderInsertData.operations,
        sapId[0],
        transaction,
        orderInsertData["order-id"],
        objCommon["curdate"],
      )
    }
  } catch (err) {
    logger.error(err)
    throw err
  }
}

/** insert plant maintenance Order Operation */
const insertPlantMaintenanceOrderOperation = async (
  operations: any,
  sapId: number,
  transaction: Transaction,
  orderId: string,
  curdate: any,
) => {
  try {
    for (const taskOperation of operations) {
      await cmnSequelize.query(insertSapOperationQuery, {
        raw: true,
        type: QueryTypes.INSERT,
        transaction,
        replacements: {
          sapId: sapId,
          orderId: orderId,
          routingId: taskOperation["routing-id"] != undefined ? taskOperation["routing-id"] : null,
          routingCounter: taskOperation["routing-counter"] != undefined ? taskOperation["routing-counter"] : null,
          activity: taskOperation["activity"],
          description: taskOperation["description"] != undefined ? taskOperation["description"] : null,
          startConstraintDate:
            taskOperation["start-constraint-date"] != undefined
              ? taskOperation["start-constraint-date"] != Constants.FIELDS.DEFAULT_DATE_STRING
                ? taskOperation["start-constraint-date"]
                : null
              : null,
          startConstraintTime:
            taskOperation["start-constraint-time"] != undefined ? taskOperation["start-constraint-time"] : null,
          finishConstraintDate:
            taskOperation["finish-constraint-date"] != undefined
              ? taskOperation["finish-constraint-date"] != Constants.FIELDS.DEFAULT_DATE_STRING
                ? taskOperation["finish-constraint-date"]
                : null
              : null,
          finishConstraintTime:
            taskOperation["finish-constraint-time"] != undefined ? taskOperation["finish-constraint-time"] : null,
          actualStartDate:
            taskOperation["actual-start-date"] != undefined
              ? taskOperation["actual-start-date"] != Constants.FIELDS.DEFAULT_DATE_STRING
                ? taskOperation["actual-start-date"]
                : null
              : null,
          actualStartTime: taskOperation["actual-start-time"] != undefined ? taskOperation["actual-start-time"] : null,
          actualFinishDate:
            taskOperation["actual-finish-date"] != undefined
              ? taskOperation["actual-finish-date"] != Constants.FIELDS.DEFAULT_DATE_STRING
                ? taskOperation["actual-finish-date"]
                : null
              : null,
          actualFinishTime:
            taskOperation["actual-finish-time"] != undefined ? taskOperation["actual-finish-time"] : null,
          controlKey: taskOperation["control-key"],
          standardTextKey: taskOperation["standard-text-key"] != undefined ? taskOperation["standard-text-key"] : null,
          systemStatus: taskOperation["system-status"],
          userStatus: taskOperation["user-status"],
          workerAndSupervisor:
            taskOperation["worker-and-supervisor"] != undefined ? taskOperation["worker-and-supervisor"] : null,
          siteSupervisor: taskOperation["site-supervisor"] != undefined ? taskOperation["site-supervisor"] : null,
          request: taskOperation["request"] != undefined ? taskOperation["request"] : null,
          requestee: taskOperation["requestee"] != undefined ? taskOperation["requestee"] : null,
          createTimestamp: curdate,
          updateTimestamp: curdate,
        },
      })
    }
  } catch (err) {
    logger.error(err)
    throw err
  }
}

/** update plant maintenance order */
const updatePlantMaintenanceOrder = async (reqBodyData: any, transaction: Transaction) => {
  try {
    const { data, objCommon } = reqBodyData

    for (const orderData of data) {
      const updateSapOrderQuery = `UPDATE t_plant_maintenance_order
                        SET
                        TYPE = :type,
                        SOURCE = :source,
                        TIMESTAMP = :timestamp,
                        CONTENT_TYPE = :contentType,
                        SHORT_TEXT = :shortText,
                        ORDER_TYPE = :orderType,
                        PLAN_GROUP = :planGroup,
                        FUNCTIONAL_LOCATION = :functionalLocation,
                        PLANT_ID=:plantId,
                        SYSTEM_STATUS = :systemStatus,
                        PLAN_PLANT = :planPlant,
                        USER_STATUS = :userStatus,
                        BASIC_FINISH_DATE = :basicFinishDate,
                        UPDATE_TIMESTAMP = :updateTimestamp,
                        CREATED_DATE = :createDate
                        ${
                          orderData["basic-start-date"] == undefined
                            ? ""
                            : orderData["basic-start-date"] != Constants.FIELDS.DEFAULT_DATE_STRING
                              ? ",BASIC_START_DATE = :basicStartDate"
                              : ""
                        }
                        ${orderData["revision-code"] == null ? "" : ",REVISION_CODE = :revisionCode"}
                        ${orderData["plant-section"] == null ? "" : ",PLANT_SECTION = :plantSection"}
                        ${
                          orderData["updated-date"] == null
                            ? ""
                            : orderData["updated-date"] != Constants.FIELDS.DEFAULT_DATE_STRING
                              ? ",UPDATED_DATE = :updateDate"
                              : ""
                        }
                        WHERE
                        ORDER_ID = :orderId;`

      await cmnSequelize.query(updateSapOrderQuery, {
        raw: true,
        type: QueryTypes.UPDATE,
        transaction,
        replacements: {
          type: objCommon["type"],
          source: objCommon["source"],
          timestamp: objCommon["timestamp"],
          contentType: objCommon["contentType"],
          orderId: orderData["order-id"],
          shortText: orderData["short-text"],
          orderType: orderData["order-type"],
          planGroup: orderData["plan-group"],
          functionalLocation: orderData["functional-location"],
          plantId: orderData["functional-location"].substring(0, 3),
          systemStatus: orderData["system-status"],
          planPlant: orderData["plan-plant"],
          userStatus: orderData["user-status"],
          basicStartDate: orderData["basic-start-date"],
          basicFinishDate: orderData["basic-finish-date"],
          revisionCode: orderData["revision-code"] != undefined ? orderData["revision-code"] : null,
          plantSection: orderData["plant-section"] != undefined ? orderData["plant-section"] : null,
          updateTimestamp: objCommon["curdate"],
          createDate: orderData["created-date"],
          updateDate:
            orderData["updated-date"] != undefined
              ? orderData["updated-date"] != Constants.FIELDS.DEFAULT_DATE_STRING
                ? orderData["updated-date"]
                : null
              : null,
        },
      })

      const sapOrderOperationData: any = await selectPlantMaintenanceOrderOperation(orderData["order-id"])
      const PLANT_MAINTENANCE_ORDER_ID = sapOrderOperationData[0]["PLANT_MAINTENANCE_ORDER_ID"]
      const reqDataOrderOperationId = orderData.operations.map((val: any) => {
        return String(val["activity"])
      })
      const reqsapOrderOperationId = sapOrderOperationData.map((val: any) => {
        return String(val["ACTIVITY"])
      })

      const uniqueInsertplanOrderOperationData: any = reqDataOrderOperationId.filter(
        (val: any) => !reqsapOrderOperationId.includes(val),
      )
      const uniqueUpdateplanOrderOperationData: any = reqDataOrderOperationId.filter((val: any) =>
        reqsapOrderOperationId.includes(val),
      )
      const uniqueDeletedPlanOrderOperationData: any = reqsapOrderOperationId.filter(
        (val: any) => !reqDataOrderOperationId.includes(val),
      )

      const arrOrderOperationToInsert = orderData.operations.filter((objEachOrder: any) => {
        if (uniqueInsertplanOrderOperationData.indexOf(objEachOrder["activity"]) >= 0) {
          return true
        } else {
          return false
        }
      })

      const arrOrderOperationToUpdate = orderData.operations.filter((objEachOrder: any) => {
        if (uniqueUpdateplanOrderOperationData.indexOf(objEachOrder["activity"]) >= 0) {
          return true
        } else {
          return false
        }
      })

      await updatePlantMaintenanceOrderOperation(
        { operation: arrOrderOperationToUpdate, order: orderData, objCommon },
        transaction,
      )
      await insertPlantMaintenanceOrderOperation(
        arrOrderOperationToInsert,
        PLANT_MAINTENANCE_ORDER_ID,
        transaction,
        orderData["order-id"],
        objCommon["curdate"],
      )
      await deletePlantMaintenanceOrderOperation(
        uniqueDeletedPlanOrderOperationData,
        orderData["order-id"],
        transaction,
      )
    }
  } catch (err) {
    logger.error(err)
    throw err
  }
}

/** update plant maintenance order operation */
const updatePlantMaintenanceOrderOperation = async (reqBodyData: any, transaction: Transaction) => {
  try {
    const { order, operation, objCommon } = reqBodyData
    for (const taskOperation of operation) {
      const updatePlantOrderOperationQuery = `UPDATE t_plant_maintenance_order_operation
              SET
              CONTROL_KEY = :controlKey,
              SYSTEM_STATUS = :systemStatus,
              USER_STATUS = :userStatus,
              UPDATE_TIMESTAMP = :updateTimestamp
              ${taskOperation["routing-id"] == undefined ? "" : ",ROUTING_ID = :routingId"}
              ${taskOperation["routing-counter"] == undefined ? "" : ",ROUTING_COUNTER = :routingCounter"}
              ${
                taskOperation["start-constraint-date"] == undefined
                  ? ""
                  : taskOperation["start-constraint-date"] == Constants.FIELDS.DEFAULT_DATE_STRING
                    ? ",START_CONSTRAINT_DATE = NULL"
                    : taskOperation["start-constraint-date"] != Constants.FIELDS.DEFAULT_DATE_STRING
                      ? ",START_CONSTRAINT_DATE = :startConstraintDate"
                      : ""
              }
              ${
                taskOperation["start-constraint-time"] == undefined
                  ? ""
                  : ",START_CONSTRAINT_TIME = :startConstraintTime"
              }
              ${
                taskOperation["finish-constraint-date"] == undefined
                  ? ""
                  : taskOperation["finish-constraint-date"] == Constants.FIELDS.DEFAULT_DATE_STRING
                    ? ",FINISH_CONSTRAINT_DATE = NULL"
                    : taskOperation["finish-constraint-date"] != Constants.FIELDS.DEFAULT_DATE_STRING
                      ? ",FINISH_CONSTRAINT_DATE = :finishConstraintDate"
                      : ""
              }
              ${
                taskOperation["finish-constraint-time"] == undefined
                  ? ""
                  : ",FINISH_CONSTRAINT_TIME = :finishConstraintTime"
              }
              ${
                taskOperation["actual-start-date"] == undefined
                  ? ""
                  : taskOperation["actual-start-date"] == Constants.FIELDS.DEFAULT_DATE_STRING
                    ? ",ACTUAL_START_DATE = NULL"
                    : taskOperation["actual-start-date"] != Constants.FIELDS.DEFAULT_DATE_STRING
                      ? ",ACTUAL_START_DATE = :actualStartDate"
                      : ""
              }
              ${taskOperation["actual-start-time"] == undefined ? "" : ",ACTUAL_START_TIME = :actualStartTime"}
              ${
                taskOperation["actual-finish-date"] == undefined
                  ? ""
                  : taskOperation["actual-finish-date"] == Constants.FIELDS.DEFAULT_DATE_STRING
                    ? ",ACTUAL_FINISH_DATE = NULL"
                    : taskOperation["actual-finish-date"] != Constants.FIELDS.DEFAULT_DATE_STRING
                      ? ",ACTUAL_FINISH_DATE = :actualFinishDate"
                      : ""
              }
              ${taskOperation["actual-finish-time"] == undefined ? "" : ",ACTUAL_FINISH_TIME = :actualFinishTime"}
              ${taskOperation["standard-text-key"] == undefined ? "" : ",STANDARD_TEXT_KEY = :standardTextKey"}
              ${taskOperation["description"] == undefined ? "" : ",DESCRIPTION = :description"}
              ${
                taskOperation["worker-and-supervisor"] == undefined
                  ? ""
                  : ",WORKER_AND_SUPERVISOR = :workerAndSupervisor"
              }
              ${taskOperation["site-supervisor"] == undefined ? "" : ",SITE_SUPERVISOR = :siteSupervisor"}
              ${taskOperation["request"] == undefined ? "" : ",REQUEST = :request"}
              ${taskOperation["requestee"] == undefined ? "" : ",REQUESTEE = :requestee"}
              WHERE
              ORDER_ID =:orderId AND ACTIVITY =:activity`

      await cmnSequelize.query(updatePlantOrderOperationQuery, {
        raw: true,
        type: QueryTypes.UPDATE,
        transaction,
        replacements: {
          orderId: order["order-id"],
          routingId: taskOperation["routing-id"] != null ? taskOperation["routing-id"] : null,
          routingCounter: taskOperation["routing-counter"] != null ? taskOperation["routing-counter"] : null,
          activity: taskOperation["activity"],
          startConstraintDate:
            taskOperation["start-constraint-date"] != null ? taskOperation["start-constraint-date"] : null,
          startConstraintTime:
            taskOperation["start-constraint-time"] != null ? taskOperation["start-constraint-time"] : null,
          finishConstraintDate:
            taskOperation["finish-constraint-date"] != null ? taskOperation["finish-constraint-date"] : null,
          finishConstraintTime:
            taskOperation["finish-constraint-time"] != null ? taskOperation["finish-constraint-time"] : null,
          actualStartDate: taskOperation["actual-start-date"] != null ? taskOperation["actual-start-date"] : null,
          actualStartTime: taskOperation["actual-start-time"] != null ? taskOperation["actual-start-time"] : null,
          actualFinishDate: taskOperation["actual-finish-date"] != null ? taskOperation["actual-finish-date"] : null,
          actualFinishTime: taskOperation["actual-finish-time"] != null ? taskOperation["actual-finish-time"] : null,
          controlKey: taskOperation["control-key"],
          standardTextKey: taskOperation["standard-text-key"] != null ? taskOperation["standard-text-key"] : null,
          description: taskOperation["description"] != null ? taskOperation["description"] : null,
          systemStatus: taskOperation["system-status"],
          userStatus: taskOperation["user-status"],
          workerAndSupervisor:
            taskOperation["worker-and-supervisor"] != null ? taskOperation["worker-and-supervisor"] : null,
          siteSupervisor: taskOperation["site-supervisor"] != null ? taskOperation["site-supervisor"] : null,
          request: taskOperation["request"] != null ? taskOperation["request"] : null,
          requestee: taskOperation["requestee"] != null ? taskOperation["requestee"] : null,
          updateTimestamp: objCommon["curdate"],
        },
      })
    }
  } catch (err) {
    logger.error(err)
    throw err
  }
}

/** delete plant maintenance order operation */
const deletePlantMaintenanceOrderOperation = async (activityIdData: any, orderId: string, transaction: Transaction) => {
  try {
    //   /** delete sap opertation when data not available */
    let strDeleteFilter = ""
    for (let intI = 0; intI < activityIdData.length; intI++) {
      const activityId = activityIdData[intI]
      strDeleteFilter += `(ACTIVITY = ${activityId} AND ORDER_ID = ${orderId}) `
      if (intI + 1 < activityIdData.length) {
        strDeleteFilter += `OR `
      }
    }
    logger.info("strDeleteFilter", strDeleteFilter)
    if (strDeleteFilter != "") {
      const deletePlantMaintenanceOrderQuery = `DELETE FROM t_plant_maintenance_order_operation
           WHERE ${strDeleteFilter}`
      logger.info("deletePlantMaintenanceOrderQuery", deletePlantMaintenanceOrderQuery)
      await cmnSequelize.query(deletePlantMaintenanceOrderQuery, {
        raw: true,
        type: QueryTypes.DELETE,
        transaction,
        plain: true,
        replacements: {},
      })
    }
  } catch (err) {
    logger.error(err)
    throw err
  }
}
