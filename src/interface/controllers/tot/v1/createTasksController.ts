// Initially copied from ToT-BE, commit 545c1dd02ed8df920e315645df162212e80b2a03

/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request } from "express"
import { BaseError, QueryTypes, Transaction } from "sequelize"

import { createTasksRequest, createTasksAPIResponse } from "../../../../domain/entities/tot/v1/createTasks.js"
import {
  sequelize,
  cmnSequelize,
  wrapInTransaction,
  wrapInTransactionCmn,
} from "../../../../infrastructure/orm/sqlize/index.js"
import { extractValue, jsonOrEmptyResponse } from "../../../decorators.js"
import logger from "../../../../infrastructure/logger.js"
import { Constants } from "../../../../config/constants.js"

import {
  DateTimeFromString,
  OptionalStringField,
  // setDifference,
  handleDbError,
  AssetCodeNotFoundError,
  send404Response,
  EventTemplateIdNotFoundError,
  SapTaskCategoryIdNotFoundError,
  OptionalNumberField,
  setDifference,
} from "./utils.js"
import { Operation } from "../../../../domain/entities/tot/v1/getOperation.js"

/** fetch operation data */
const getOperationData = async (eventTypeId: number, transaction: Transaction): Promise<Operation[]> => {
  const OperationQuery = `SELECT
  OPERATION_ID 'operation-id',
  EVENT_TYPE_ID 'event-type-id'
    FROM
    t_operation_event_type
    where EVENT_TYPE_ID = :eventTypeId AND IS_DELETED = :isDeleted
        ORDER BY  OPERATION_ID ASC LIMIT 1`

  return sequelize.query<Operation>(OperationQuery, {
    raw: true,
    type: QueryTypes.SELECT,
    transaction,
    replacements: { eventTypeId, isDeleted: Constants.IS_NOT_DELETED },
  })
}

/** create task function */
const createTasks = async (
  postValidationInput: createTasksRequest | Record<string, any>,
): Promise<createTasksAPIResponse> => {
  const input = postValidationInput as createTasksRequest

  /**
   * Query to check asset-code validation from request
   */
  const getAssetIDQuery = `SELECT ASSET_ID, ASSET_CODE
    FROM m_asset
    WHERE
      ASSET_CODE in (:assetCodes) AND
      ASSET_ID IS NOT NULL AND
      ASSET_ID <> ''
    FOR UPDATE;`

  /** insert task query */
  const insertTaskQuery = `INSERT INTO t_task (
      PLANT_ID,
      ASSET_TASK_GROUP_ID,
      TASK_TYPE_ID,
      TASK_NAME,
      ASSET_ID,
      PLANNED_DATE_TIME,
      TASK_PRIORITY_ID,
      DUE_DATE_TIME,
      START_DATE_TIME,
      END_DATE_TIME,
      WORKING_HOURS,
      ESTIMATED_TASK_TIME,
      TASK_STATUS_ID,
      TAKEOVER_TEAM_ID,
      REMARKS,
      ORDER_ID,
      EVENT_ID,
      EVENT_NAME,
      EVENT_TYPE_ID,
      OPERATION_ID,
      ROUTING_ID,
      ROUTING_COUNTER,
      ACTIVITY_ID,
      SAP_TASK_CATEGORY_ID,
      CREATE_TIMESTAMP,
      CREATE_USER_ID,
      UPDATE_TIMESTAMP,
      UPDATE_USER_ID
    ) VALUES (
      :powerPlantId,
      :assetTaskGroupId,
      :taskTypeId,
      :taskName,
      :assetId,
      :plannedDateTime,
      :taskPriorityId,
      :dueDateTime,
      null,
      null,
      :workingHours,
      :estimateTaskTime,
      :taskStatusId,
      :takeoverTeamId,
      :remarks,
      :orderId,
      :eventId,
      :eventName,
      :eventTypeId,
      :operationId,
      :routingId,
      :routingCounter,
      :activityId,
      :sapTaskCategoryId,
      :curdate,
      :operateUserId,
      :curdate,
      :operateUserId
    );`

  /* select teamid by operate user id */
  const selectTeamIdByOperateUserQuery = `SELECT TEAM_ID FROM m_user_tot WHERE USER_ID = :operateUserId;`

  /* select saptask query to validate sap task category id */
  const selectSapTaskCategoryQuery = `SELECT SAP_TASK_CATEGORY_ID FROM m_sap_task_category WHERE SAP_TASK_CATEGORY_ID = :sapTaskCategoryId;`

  /** select event template query to validate event type id or task type id */
  const selectEventTemplate = `SELECT EVENT_TYPE_ID FROM m_event_template WHERE EVENT_TYPE_ID= :eventTypeId AND TASK_TYPE_ID= :taskTypeId
  AND IS_DELETED = ${Constants.IS_NOT_DELETED}`

  /** insert task audit query with team id */
  const insertTaskAuditQuery = `INSERT INTO t_task_audit (
      TASK_ID,
      PRE_TASK_STATUS_ID,
      POST_TASK_STATUS_ID,
      TEAM_ID,
      OPERATE_USER_ID,
      OPERATE_TIMESTAMP
    ) VALUES (
      :taskId,
      1,
      :taskStatusId,
      :teamId,
      :operateUserId,
      :curdate
    );`

  try {
    // Start database transaction
    const result = await wrapInTransaction<createTasksAPIResponse>(async (transaction) => {
      const curdate = new Date()
      const insertIds: number[] = []

      // Map the asset codes to asset IDs
      const assetCodes = input.tasks
        .map((task) => task["asset-code"])
        .filter((assetCode) => {
          return assetCode !== undefined && assetCode !== null && assetCode !== ""
        }) as string[]

      let commonResult: any
      /**
       * If asset codes found in request, then fetch their information from database
       */
      if (assetCodes.length > 0) {
        commonResult = await wrapInTransactionCmn<any>(async (cmnTransaction) => {
          let assetIdResults: { ASSET_ID: any; ASSET_CODE: string }[] = []
          assetIdResults = await cmnSequelize.query<{
            ASSET_ID: any
            ASSET_CODE: string
          }>(getAssetIDQuery, {
            raw: true,
            type: QueryTypes.SELECT,
            transaction: cmnTransaction,
            replacements: {
              assetCodes,
            },
          })

          /**
           * Creating assetcode and asset id Map to store in key value pair
           */
          const assetCodeIdMap = new Map(assetIdResults.map(({ ASSET_ID, ASSET_CODE }) => [ASSET_CODE, ASSET_ID]))

          // If any asset code cannot be mapped, throw an exception
          // Existing Asset code in database
          const existingAssetCodeSet = new Set(assetCodeIdMap.keys())
          // Asset code comes from request
          const inputAssetCodeSet = new Set(assetCodes)
          // Check difference, if there are any new asset codes which are not present in database
          const notFoundAssetCodeSet = setDifference(inputAssetCodeSet, existingAssetCodeSet)

          // If new asset code find, which are not in database, then throw error
          if (notFoundAssetCodeSet.size > 0) {
            throw new AssetCodeNotFoundError(notFoundAssetCodeSet)
          } else {
            return assetCodeIdMap
          }
        })
      }

      for (const task of input.tasks) {
        //fetch OperationId
        const operationData = await getOperationData(task[Constants.FIELDS.EVENT_TYPE_ID], transaction)
        // if operation records not found by event-type-id then throw error
        if (!operationData.length) {
          throw Error()
        }
        const operationId = operationData[0][Constants.FIELDS.OPERATION_ID]
        /**
         * building quries for event template query to validate event type id or task type id
         */
        const eventTemplateData = await sequelize.query<{
          EVENT_TYPE_ID: number
        }>(selectEventTemplate, {
          replacements: {
            eventTypeId: task[Constants.FIELDS.EVENT_TYPE_ID],
            taskTypeId: task[Constants.FIELDS.TASK_TYPE_ID],
          },
          raw: true,
          plain: true,
          type: QueryTypes.SELECT,
          transaction,
        })
        /** return error */
        if (eventTemplateData === null) {
          throw new EventTemplateIdNotFoundError(task[Constants.FIELDS.EVENT_TYPE_ID])
        }

        /**
         * building quries for sap task category query to validate sap task category id
         */
        if (task[Constants.FIELDS.SAP_TASK_CATEGORY_ID] != undefined) {
          const sapTaskCategoryIdData = await sequelize.query<{
            SAP_TASK_CATEGORY_ID: number
          }>(selectSapTaskCategoryQuery, {
            replacements: {
              sapTaskCategoryId: task[Constants.FIELDS.SAP_TASK_CATEGORY_ID],
            },
            raw: true,
            plain: true,
            type: QueryTypes.SELECT,
            transaction,
          })
          /** return error */
          if (sapTaskCategoryIdData === null) {
            throw new SapTaskCategoryIdNotFoundError(task[Constants.FIELDS.SAP_TASK_CATEGORY_ID] || 0)
          }
        }
        // getting the Asset Code Id from the assetcodeidmap array
        const assetCodeassetId =
          task[Constants.FIELDS.ASSET_CODE] === undefined ||
          task[Constants.FIELDS.ASSET_CODE] === null ||
          task[Constants.FIELDS.ASSET_CODE] === ""
            ? null
            : commonResult.get(task[Constants.FIELDS.ASSET_CODE]!)

        // if asset code is not found in database, and if asset id is present in request, then use asset id
        const assetId = assetCodeassetId ? assetCodeassetId : task[Constants.FIELDS.ASSET_ID]
        const optional = (x: unknown) => (x === undefined ? null : x)

        /** insert task model */
        const [insertId, _] = await sequelize.query(insertTaskQuery, {
          raw: true,
          type: QueryTypes.INSERT,
          transaction,
          replacements: {
            powerPlantId: task[Constants.FIELDS.POWER_PLANT_ID],
            assetTaskGroupId: task[Constants.FIELDS.ASSET_TASK_GROUP_ID],
            taskTypeId: task[Constants.FIELDS.TASK_TYPE_ID],
            taskName: task[Constants.FIELDS.TASK_NAME],
            assetId: optional(assetId),
            plannedDateTime: optional(task[Constants.FIELDS.PLANNED_DATE_TIME]),
            taskPriorityId: optional(task[Constants.FIELDS.TASK_PRIORITY_ID]),
            dueDateTime: optional(task[Constants.FIELDS.DUE_DATE_TIME]),
            workingHours: optional(task[Constants.FIELDS.WORKING_HOURS]),
            estimateTaskTime: optional(task[Constants.FIELDS.ESTIMATED_TASK_TIME]),
            taskStatusId: optional(task[Constants.FIELDS.TASK_STATUS_ID]),
            takeoverTeamId: optional(task[Constants.FIELDS.TAKEOVER_TEAM_ID]),
            remarks: optional(task[Constants.FIELDS.REMARKS]),
            orderId: optional(task[Constants.FIELDS.ORDER_ID]),
            eventId: optional(task[Constants.FIELDS.EVENT_ID]),
            eventName: optional(task[Constants.FIELDS.EVENT_NAME]),
            eventTypeId: optional(task[Constants.FIELDS.EVENT_TYPE_ID]),
            operationId: optional(operationId),
            routingId: optional(task[Constants.FIELDS.ROUTING_ID]),
            routingCounter: optional(task[Constants.FIELDS.ROUTING_COUNTER]),
            activityId: optional(task[Constants.FIELDS.ACTIVITY_ID]),
            sapTaskCategoryId: optional(task[Constants.FIELDS.SAP_TASK_CATEGORY_ID]),
            curdate,
            operateUserId: input[Constants.FIELDS.OPERATE_USER_ID],
          },
        })

        insertIds.push(insertId)

        const userTeamId: any = await sequelize.query<{
          TEAM_ID: number
        }>(selectTeamIdByOperateUserQuery, {
          replacements: {
            operateUserId: input[Constants.FIELDS.OPERATE_USER_ID],
          },
          raw: true,
          plain: true,
          type: QueryTypes.SELECT,
          transaction,
        })

        /** insert task audit model */
        await sequelize.query(insertTaskAuditQuery, {
          raw: true,
          type: QueryTypes.INSERT,
          transaction,
          replacements: {
            taskId: insertId,
            taskStatusId: task[Constants.FIELDS.TASK_STATUS_ID],
            teamId: userTeamId.TEAM_ID,
            operateUserId: input[Constants.FIELDS.OPERATE_USER_ID],
            curdate,
          },
        })
      }
      return {
        code: 201,
        body: insertIds.map((value) => ({ "task-id": value })),
      }
    })

    return result
  } catch (err) {
    logger.error(err)
    if (err instanceof BaseError) {
      handleDbError("CreateTasks", err)
    }

    if (err instanceof EventTemplateIdNotFoundError) {
      return send404Response(err)
    }
    if (err instanceof SapTaskCategoryIdNotFoundError) {
      return send404Response(err)
    }
    if (err instanceof AssetCodeNotFoundError) {
      return send404Response(err)
    }

    return {
      code: 400,
      body: "Bad Request",
    }
  }
}

/* consolidate user request parameter */
export const consolidatecreateTasksRequest = (req: Request): createTasksRequest | Record<string, any> => ({
  tasks: req.body.tasks.map((task: Record<string, any>) => ({
    "power-plant-id": task[Constants.FIELDS.POWER_PLANT_ID],
    "asset-task-group-id": Number(task[Constants.FIELDS.ASSET_TASK_GROUP_ID]),
    "task-type-id": Number(task[Constants.FIELDS.TASK_TYPE_ID]),
    "task-category-id": Number(task[Constants.FIELDS.TASK_CATEGORY_ID]),
    "task-name": task[Constants.FIELDS.TASK_NAME],
    "asset-id": task[Constants.FIELDS.ASSET_ID] ? Number(task[Constants.FIELDS.ASSET_ID]) : undefined,
    "asset-code": OptionalStringField(task[Constants.FIELDS.ASSET_CODE]),
    "planned-date-time": DateTimeFromString(task[Constants.FIELDS.PLANNED_DATE_TIME]),
    "task-priority-id": task[Constants.FIELDS.TASK_PRIORITY_ID]
      ? Number(task[Constants.FIELDS.TASK_PRIORITY_ID])
      : undefined,
    "due-date-time": DateTimeFromString(task[Constants.FIELDS.DUE_DATE_TIME]),
    "working-hours": OptionalStringField(task[Constants.FIELDS.WORKING_HOURS]),
    "estimated-task-time": OptionalStringField(task[Constants.FIELDS.ESTIMATED_TASK_TIME]),
    "task-status-id": OptionalStringField(task[Constants.FIELDS.TASK_STATUS_ID]),
    "takeover-team-id": task[Constants.FIELDS.TAKEOVER_TEAM_ID]
      ? Number(task[Constants.FIELDS.TAKEOVER_TEAM_ID])
      : undefined,
    remarks: OptionalStringField(task[Constants.FIELDS.REMARKS]),
    "order-id": OptionalStringField(task[Constants.FIELDS.ORDER_ID]),
    "event-id": OptionalStringField(task[Constants.FIELDS.EVENT_ID]),
    "event-name": OptionalStringField(task[Constants.FIELDS.EVENT_NAME]),
    "event-type-id": task[Constants.FIELDS.EVENT_TYPE_ID] ? Number(task[Constants.FIELDS.EVENT_TYPE_ID]) : undefined,
    "routing-id": OptionalStringField(task[Constants.FIELDS.ROUTING_ID]),
    "routing-counter": OptionalStringField(task[Constants.FIELDS.ROUTING_COUNTER]),
    "activity-id": OptionalStringField(task[Constants.FIELDS.ACTIVITY_ID]),
    "sap-task-category-id": OptionalNumberField(task[Constants.FIELDS.SAP_TASK_CATEGORY_ID]),
  })),
  "operate-user-id": req.body[Constants.FIELDS.OPERATE_USER_ID],
})

export const createTasksController = jsonOrEmptyResponse(
  extractValue(consolidatecreateTasksRequest)(createTasks),
  [201, 404, 400],
)
