// Initially copied from ToT-BE, commit 545c1dd02ed8df920e315645df162212e80b2a03

/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request } from "express"
import { QueryTypes, Transaction } from "sequelize"

import {
  updateTasksAPIResponse,
  updateTasksRequest,
  updateTasksRequestItem,
} from "../../../../domain/entities/tot/v1/updateTasks.js"
import {
  sequelize,
  cmnSequelize,
  wrapInTransaction,
  wrapInTransactionCmn,
} from "../../../../infrastructure/orm/sqlize/index.js"
import { extractValue, jsonResponse } from "../../../decorators.js"
import logger from "../../../../infrastructure/logger.js"
import {
  setDifference,
  OptionalStringField,
  OptionalNullableStringField,
  NullableDateTimeFromString,
  OptionalNullNumber,
  OptionalNumber,
  send404Response,
  AssetCodeNotFoundError,
  TaskIdsNotFoundError,
  EventTemplateIdNotFoundError,
} from "./utils.js"

import { Constants } from "../../../../config/constants.js"
import { Operation } from "../../../../domain/entities/tot/v1/getOperation.js"

/** fetch operation data */
const getOperationData = async (eventTypeId: any, transaction: Transaction): Promise<Operation[]> => {
  const OperationQuery = `SELECT
  OPERATION_ID 'operation-id',
  EVENT_TYPE_ID 'event-type-id'
    FROM
    t_operation_event_type
    where EVENT_TYPE_ID = :eventTypeId AND IS_DELETED = :isDeleted
        ORDER BY  OPERATION_ID ASC`

  return sequelize.query<Operation>(OperationQuery, {
    raw: true,
    type: QueryTypes.SELECT,
    transaction,
    replacements: { eventTypeId, isDeleted: Constants.IS_NOT_DELETED },
  })
}
// /**  wot lock update functions function */
const wotLockUpdateTask = async (
  tasks: updateTasksRequestItem[],
  transaction: Transaction,
  assetCodeIdMap: any,
): Promise<updateTasksAPIResponse> => {
  const curdate = new Date()
  /** select event template query to validate event type id or task type id */
  const selectEventTemplate = `SELECT EVENT_TYPE_ID FROM m_event_template WHERE EVENT_TYPE_ID= :eventTypeId AND TASK_TYPE_ID= :taskTypeId
  AND IS_DELETED = ${Constants.IS_NOT_DELETED}`
  let statusCode: number = Constants.ERROR_CODES.BAD_REQUEST
  for (const task of tasks) {
    // getting the Asset Code Id from the assetcodeidmap array
    const assetId = task[Constants.FIELDS.ASSET_CODE] ? assetCodeIdMap.get(task[Constants.FIELDS.ASSET_CODE]!) : null

    logger.info(`assetId ::: ${assetId}`)
    if (task[Constants.FIELDS.EVENT_TYPE_ID] != undefined && task[Constants.FIELDS.TASK_TYPE_ID] != undefined) {
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
        throw new EventTemplateIdNotFoundError(task[Constants.FIELDS.EVENT_TYPE_ID]!)
      }
    }
    // logger.info(task[Constants.FIELDS.EVENT_TYPE_ID]);
    // logger.info(task[Constants.FIELDS.EVENT_TYPE_ID]);
    // logger.info(task[Constants.FIELDS.TASK_TYPE_ID]);
    /** select task for is-lock */
    const selectTask = `SELECT IS_LOCK 'is-lock',
    TASK_STATUS_ID 'task-status-id', EVENT_TYPE_ID 'event-type-id' FROM t_task WHERE TASK_ID= :taskId`
    const optional = (x: unknown) => (x === undefined ? null : x)
    const isLockTask: any = await sequelize.query<{
      IS_LOCK: number
      TASK_STATUS_ID: number
      EVENT_TYPE_ID: number
    }>(selectTask, {
      replacements: {
        taskId: task[Constants.FIELDS.TASK_ID],
      },
      raw: true,
      plain: true,
      type: QueryTypes.SELECT,
      transaction,
    })
    if (Boolean(isLockTask[Constants.FIELDS.IS_LOCK]) === true) {
      /**is-wot-lock true, task-status-id 4 and takeover-team-id value available
       *  and pass below field from update task request
       * then return bad request
       * else update takeover-team-id and remarks */
      if (
        assetId ||
        task[Constants.FIELDS.TASK_TYPE_ID] ||
        task[Constants.FIELDS.TASK_NAME] ||
        task[Constants.FIELDS.ASSET_CODE] ||
        task[Constants.FIELDS.PLANNED_DATE_TIME] ||
        task[Constants.FIELDS.TASK_PRIORITY_ID] ||
        task[Constants.FIELDS.DUE_DATE_TIME] ||
        task[Constants.FIELDS.START_DATE_TIME] ||
        task[Constants.FIELDS.END_DATE_TIME] ||
        task[Constants.FIELDS.ESTIMATED_TASK_TIME] ||
        task[Constants.FIELDS.WORKING_HOURS] ||
        task[Constants.FIELDS.ORDER_ID] ||
        task[Constants.FIELDS.EVENT_TYPE_ID] ||
        task[Constants.FIELDS.EVENT_NAME] ||
        (isLockTask[Constants.FIELDS.TASK_STATUS_ID] === 4 && task[Constants.FIELDS.TAKEOVER_TEAM_ID] != undefined)
      ) {
        statusCode = Constants.ERROR_CODES.BAD_REQUEST
      } else {
        const updateISLockTaskQuery = `UPDATE t_task
              SET
              ${task[Constants.FIELDS.TAKEOVER_TEAM_ID] === undefined ? "" : "TAKEOVER_TEAM_ID = $takeoverTeamId,"}
              ${task[Constants.FIELDS.REMARKS] === undefined ? "" : "REMARKS = $remarks,"}
              UPDATE_TIMESTAMP = $curdate
              WHERE TASK_ID = $taskId`

        await sequelize.query(updateISLockTaskQuery, {
          raw: true,
          type: QueryTypes.UPDATE,
          transaction,
          bind: {
            takeoverTeamId: optional(task[Constants.FIELDS.TAKEOVER_TEAM_ID]),
            remarks: optional(task[Constants.FIELDS.REMARKS]),
            curdate,
            taskId: task[Constants.FIELDS.TASK_ID],
          },
        })
        statusCode = Constants.STATUS_CODES.SUCCESS_CODE
      }
    } else {
      //fetch OperationId on the bases of eventTypeId
      const eventTypeId = optional(task[Constants.FIELDS.EVENT_TYPE_ID])
      let operationData: any = []
      // if request event-type-id and existing event-type-id is not same then update operation-id otherwise do not update operation-id
      if (
        eventTypeId != null &&
        eventTypeId != undefined &&
        eventTypeId !== isLockTask[Constants.FIELDS.EVENT_TYPE_ID]
      ) {
        operationData = await getOperationData(eventTypeId, transaction)
      }

      const operationId = operationData.length > 0 ? operationData[0][Constants.FIELDS.OPERATION_ID] : undefined
      const updateTaskQuery = `UPDATE t_task
      SET
        ${task[Constants.FIELDS.TASK_TYPE_ID] === undefined ? "" : "TASK_TYPE_ID = $taskTypeId,"}
        ${task[Constants.FIELDS.TASK_NAME] === undefined ? "" : "TASK_NAME = $taskName,"}
        ${
          task[Constants.FIELDS.ASSET_CODE] === undefined || task[Constants.FIELDS.ASSET_CODE] === ""
            ? ""
            : "ASSET_ID = $assetId,"
        }
        ${task[Constants.FIELDS.PLANNED_DATE_TIME] === undefined ? "" : "PLANNED_DATE_TIME = $plannedDateTime,"}
        ${task[Constants.FIELDS.TASK_PRIORITY_ID] === undefined ? "" : "TASK_PRIORITY_ID = $taskPriorityId,"}
        ${task[Constants.FIELDS.DUE_DATE_TIME] === undefined ? "" : "DUE_DATE_TIME = $dueDateTime,"}
        ${task[Constants.FIELDS.START_DATE_TIME] === undefined ? "" : "START_DATE_TIME = $startDateTime,"}
        ${task[Constants.FIELDS.END_DATE_TIME] === undefined ? "" : "END_DATE_TIME = $endDateTime,"}
        ${task[Constants.FIELDS.WORKING_HOURS] === undefined ? "" : "WORKING_HOURS = $workingHours,"}
        ${task[Constants.FIELDS.ESTIMATED_TASK_TIME] === undefined ? "" : "ESTIMATED_TASK_TIME = $estimatedTaskTime,"}
        ${task[Constants.FIELDS.TAKEOVER_TEAM_ID] === undefined ? "" : "TAKEOVER_TEAM_ID = $takeoverTeamId,"}
        ${task[Constants.FIELDS.REMARKS] === undefined ? "" : "REMARKS = $remarks,"}
        ${task[Constants.FIELDS.ORDER_ID] === undefined ? "" : "ORDER_ID = $orderId,"}
        ${task[Constants.FIELDS.EVENT_TYPE_ID] === undefined ? "" : "EVENT_TYPE_ID = $eventTypeId,"}
        ${operationId === undefined ? "" : "OPERATION_ID = $operationId,"}
        ${task[Constants.FIELDS.EVENT_NAME] === undefined ? "" : "EVENT_NAME = $eventName,"}
        UPDATE_TIMESTAMP = $curdate
      WHERE TASK_ID = $taskId;`
      await sequelize.query(updateTaskQuery, {
        raw: true,
        type: QueryTypes.UPDATE,
        transaction,
        bind: {
          taskTypeId: optional(task[Constants.FIELDS.TASK_TYPE_ID]),
          taskName: task[Constants.FIELDS.TASK_NAME],
          assetId: optional(assetId),
          plannedDateTime: optional(task[Constants.FIELDS.PLANNED_DATE_TIME]),
          taskPriorityId: optional(task[Constants.FIELDS.TASK_PRIORITY_ID]),
          dueDateTime: optional(task[Constants.FIELDS.DUE_DATE_TIME]),
          startDateTime: optional(task[Constants.FIELDS.START_DATE_TIME]),
          endDateTime: optional(task[Constants.FIELDS.END_DATE_TIME]),
          workingHours: optional(task[Constants.FIELDS.WORKING_HOURS]),
          estimatedTaskTime: optional(task[Constants.FIELDS.ESTIMATED_TASK_TIME]),
          takeoverTeamId: optional(task[Constants.FIELDS.TAKEOVER_TEAM_ID]),
          remarks: optional(task[Constants.FIELDS.REMARKS]),
          orderId: optional(task[Constants.FIELDS.ORDER_ID]),
          curdate,
          taskId: task[Constants.FIELDS.TASK_ID],
          eventTypeId: optional(task[Constants.FIELDS.EVENT_TYPE_ID]),
          operationId: optional(operationId),
          eventName: optional(task[Constants.FIELDS.EVENT_NAME]),
        },
      })
      statusCode = Constants.STATUS_CODES.SUCCESS_CODE
    }
  }
  return responseStatus(statusCode)
}

//response status for the updateTaskAPIResponse
const responseStatus = (val: number): updateTasksAPIResponse => {
  if (val === Constants.STATUS_CODES.SUCCESS_CODE) {
    return {
      code: Constants.STATUS_CODES.SUCCESS_CODE,
      body: Constants.SUCCESS_MESSAGES.SUCCESS,
    }
  } else {
    return {
      code: Constants.ERROR_CODES.BAD_REQUEST,
      body: Constants.ERROR_MESSAGES.BAD_REQUEST,
    }
  }
}

/**
 * Description Check if EventType or TaskType is delete and user try to update the task.
Check if the Previously stored EventType or TaskType is same as per request then allow to update the task.
So simply remove EventType or TaskType and request parameter.
 *
 * @async
 * @param {updateTasksRequestItem} input
 * @param {Transaction} transaction
 * @returns {*}
 */
const checkDeleteEventTypeORTaskType = async (input: updateTasksRequestItem, transaction: Transaction) => {
  if (input[Constants.FIELDS.EVENT_TYPE_ID] && input[Constants.FIELDS.TASK_TYPE_ID]) {
    const selectEventTemplate = `SELECT EVENT_TYPE_ID,TASK_TYPE_ID, IS_DELETED FROM m_event_template
            WHERE EVENT_TYPE_ID= :eventTypeId AND TASK_TYPE_ID= :taskTypeId`

    const selectTask = `SELECT EVENT_TYPE_ID,TASK_TYPE_ID FROM t_task
            WHERE TASK_ID= :taskId`
    const task: any = await sequelize.query<{
      EVENT_TYPE_ID: number
      TASK_TYPE_ID: number
    }>(selectTask, {
      replacements: {
        taskId: input[Constants.FIELDS.TASK_ID],
      },
      raw: true,
      plain: true,
      type: QueryTypes.SELECT,
      transaction,
    })

    const eventTemplate: any = await sequelize.query<{
      EVENT_TYPE_ID: number
      TASK_TYPE_ID: number
    }>(selectEventTemplate, {
      replacements: {
        eventTypeId: input[Constants.FIELDS.EVENT_TYPE_ID],
        taskTypeId: input[Constants.FIELDS.TASK_TYPE_ID],
      },
      raw: true,
      plain: true,
      type: QueryTypes.SELECT,
      transaction,
    })

    if (eventTemplate) {
      if (eventTemplate.IS_DELETED === 1) {
        if (task) {
          if (
            task.EVENT_TYPE_ID === input[Constants.FIELDS.EVENT_TYPE_ID] &&
            task.TASK_TYPE_ID === input[Constants.FIELDS.TASK_TYPE_ID]
          ) {
            //If Previous EventTypeORTaskType is same as the Request
            //EventTypeORTaskType then remove from request
            delete input[Constants.FIELDS.EVENT_TYPE_ID]
            delete input[Constants.FIELDS.TASK_TYPE_ID]
          }
        }
      }
    }
  }
}

/* update task function */
const updateTasks = async (
  postValidationInput: updateTasksRequest | Record<string, any>,
): Promise<updateTasksAPIResponse> => {
  const input = postValidationInput as updateTasksRequest

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

  try {
    // Start database transaction
    const result = await wrapInTransaction(async (transaction) => {
      // Map the asset codes to asset IDs
      const assetCodes = input.tasks
        .map((task) => task[Constants.FIELDS.ASSET_CODE])
        .filter((assetCode) => {
          return assetCode !== undefined && assetCode !== null && assetCode !== ""
        }) as string[]

      //let assetCodeIdMap = {} as Record<string, string>

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

      // Validate task IDs
      const inputTaskIdSet = new Set(input.tasks.map((t) => t[Constants.FIELDS.TASK_ID]))
      const existingTasks =
        input.tasks.length === 0
          ? []
          : await sequelize.query<{ TASK_ID: number }>(`SELECT TASK_ID FROM t_task WHERE TASK_ID IN (?) FOR UPDATE;`, {
              replacements: [[...inputTaskIdSet]],
              type: QueryTypes.SELECT,
              raw: true,
              transaction,
            })
      const existingTaskIdSet = new Set(existingTasks.map((t) => t.TASK_ID))
      const notFoundTaskIdSet = setDifference(inputTaskIdSet, existingTaskIdSet)

      //remove deleted EventType or TaskType from Request
      for (const taskRes of input.tasks) {
        await checkDeleteEventTypeORTaskType(taskRes, transaction)
      }
      if (notFoundTaskIdSet.size > 0) {
        throw new TaskIdsNotFoundError([...notFoundTaskIdSet])
      }
      // //wotLockUpdateTask for update as per different lock condition
      return await wotLockUpdateTask(input.tasks, transaction, commonResult)
    })
    return result
  } catch (err) {
    logger.error(err)

    if (err instanceof EventTemplateIdNotFoundError) {
      return send404Response(err)
    }

    if (err instanceof AssetCodeNotFoundError || err instanceof TaskIdsNotFoundError) {
      return send404Response(err)
    }

    return {
      code: 400,
      body: "Bad Request",
    }
  }
}

/* consolidate user request parameter */
const consolidateTasksFromRequest = (details: Record<string, unknown>[]): updateTasksRequestItem[] => {
  return details.map<updateTasksRequestItem>((x) => ({
    "task-id": Number(x[Constants.FIELDS.TASK_ID]),
    "task-type-id": OptionalNumber(x[Constants.FIELDS.TASK_TYPE_ID]),
    "task-name": OptionalStringField(x[Constants.FIELDS.TASK_NAME] as string),
    "asset-id": OptionalNumber(x[Constants.FIELDS.ASSET_ID]),
    "asset-code": OptionalStringField(x[Constants.FIELDS.ASSET_CODE] as string),
    "planned-date-time": NullableDateTimeFromString(x[Constants.FIELDS.PLANNED_DATE_TIME] as string),
    "task-priority-id": OptionalNullNumber(x[Constants.FIELDS.TASK_PRIORITY_ID]),
    "due-date-time": NullableDateTimeFromString(x[Constants.FIELDS.DUE_DATE_TIME] as string),
    "start-date-time": NullableDateTimeFromString(x[Constants.FIELDS.START_DATE_TIME] as string),
    "end-date-time": NullableDateTimeFromString(x[Constants.FIELDS.END_DATE_TIME] as string),
    "working-hours": OptionalNullableStringField(x[Constants.FIELDS.WORKING_HOURS] as string),
    "estimated-task-time": OptionalNullableStringField(x[Constants.FIELDS.ESTIMATED_TASK_TIME] as string),
    "takeover-team-id": OptionalNullNumber(x[Constants.FIELDS.TAKEOVER_TEAM_ID]),
    remarks: OptionalNullableStringField(x[Constants.FIELDS.REMARKS] as string),
    "order-id": OptionalNullableStringField(x[Constants.FIELDS.ORDER_ID] as string),
    "event-name": OptionalNullableStringField(x[Constants.FIELDS.EVENT_NAME] as string),
    "event-type-id": x[Constants.FIELDS.EVENT_TYPE_ID] ? Number(x[Constants.FIELDS.EVENT_TYPE_ID]) : undefined,
  }))
}

export const consolidateupdateTasksRequest = (req: Request): updateTasksRequest | Record<string, any> => {
  return {
    "operate-user-id": req.body[Constants.FIELDS.OPERATE_USER_ID],
    tasks: consolidateTasksFromRequest(req.body.tasks),
  }
}

export const updateTasksController = jsonResponse(extractValue(consolidateupdateTasksRequest)(updateTasks))
