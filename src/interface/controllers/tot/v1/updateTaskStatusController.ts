// Initially copied from ToT-BE, commit 545c1dd02ed8df920e315645df162212e80b2a03

/* eslint-disable @typescript-eslint/no-explicit-any */
import { env } from "process"

import { Request } from "express"
import { QueryTypes, Transaction } from "sequelize"

import {
  updateTaskStatusAPIResponse,
  updateTaskStatusRequest,
} from "../../../../domain/entities/tot/v1/updateTaskStatus.js"
import logger from "../../../../infrastructure/logger.js"
import { sequelize } from "../../../../infrastructure/orm/sqlize/index.js"
import { extractValue, jsonResponse } from "../../../decorators.js"

import { EnumFromString, DateTimeFromString, sendStopTaskNotification, TASK_STATUS } from "./utils.js"
import { Constants } from "../../../../config/constants.js"

/**
 * Description Insert Task Audit on update task status
 *
 * @async
 * @param {(updateTaskStatusRequest | Record<string, any>)} input
 * @param {*} operator
 * @param {*} timestamp
 * @param {Transaction} transaction
 * @param {number} preTaskStatusId
 * @param {number} postTaskStatusId
 * @returns {Promise<any>} Insert TaskAudit
 */
const insertTaskAudit = async (
  input: updateTaskStatusRequest | Record<string, any>,
  operator: any,
  timestamp: any,
  transaction: Transaction,
  preTaskStatusId: number,
  postTaskStatusId: number,
): Promise<any> => {
  /* insert task audit */
  const insertTaskAuditQuery = `INSERT INTO t_task_audit (TASK_ID, PRE_TASK_STATUS_ID, POST_TASK_STATUS_ID,TEAM_ID, OPERATE_USER_ID, OPERATE_TIMESTAMP) VALUES (
      :taskId,
      :preTaskStatusId,
      :postTaskStatusId,
      :teamId,
      :operateUserId,
      :timestamp
    );`

  return sequelize.query(insertTaskAuditQuery, {
    raw: true,
    type: QueryTypes.INSERT,
    replacements: {
      taskId: input[Constants.FIELDS.TASK_ID],
      preTaskStatusId: preTaskStatusId,
      postTaskStatusId: postTaskStatusId,
      teamId: operator.TEAM_ID,
      operateUserId: input[Constants.FIELDS.OPERATE_USER_ID],
      timestamp,
    },
    transaction,
  })
}

/**
 * Description Insert Task Assignee on update task status when status is not started
 *
 * @async
 * @param {(updateTaskStatusRequest | Record<string, any>)} input
 * @param {*} taskAudit
 * @param {Transaction} transaction
 * @returns {Promise<any>} Insert Taskassignee
 */
const insertTaskAssignee = async (
  input: updateTaskStatusRequest | Record<string, any>,
  taskAudit: any,
  transaction: Transaction,
): Promise<any> => {
  const insertTaskAssigneeQuery = `INSERT INTO t_task_assignee (
      TASK_ID, USER_ID
    ) VALUES (:taskId, :userId);`
  return sequelize.query(insertTaskAssigneeQuery, {
    raw: true,
    type: QueryTypes.INSERT,
    transaction,
    replacements: {
      taskId: input[Constants.FIELDS.TASK_ID],
      userId: taskAudit[Constants.FIELDS.OPERATE_USER_ID],
    },
  })
}

/**
 * Description update task status
 *
 * @async
 * @param {(updateTaskStatusRequest | Record<string, any>)} postValidationInput
 * @returns {Promise<updateTaskStatusAPIResponse>} updateTaskStatusAPIResponse or else Bad Request
 */
const updateTaskStatus = async (
  postValidationInput: updateTaskStatusRequest | Record<string, any>,
): Promise<updateTaskStatusAPIResponse> => {
  const input = postValidationInput as updateTaskStatusRequest
  /* select user name by operate user id */
  const selectOperateUserQuery = `SELECT USER_NAME,TEAM_ID FROM m_user_tot WHERE USER_ID = :operateUserId;`
  /* select task status */
  const selectTaskStatusQueryWithLock = `SELECT
      TASK_STATUS_ID 'task-status-id',
      TASK_NAME 'task-name',
      UPDATE_TIMESTAMP 'update-timestamp'
    FROM t_task
    WHERE TASK_ID = :taskId FOR UPDATE;`
  /* select post task status */
  const selectTaskAuditQuery = `SELECT POST_TASK_STATUS_ID 'post-task-status-id',
  OPERATE_USER_ID 'operate-user-id'
    FROM t_task_audit
    WHERE TASK_ID = :taskId
    ORDER BY TASK_AUDIT_ID DESC
    LIMIT 1;`
  /* select user id from task assignee */
  const selectAssigneesQueryWithLock = `SELECT USER_ID FROM t_task_assignee WHERE TASK_ID = :taskId FOR UPDATE;`
  /** select is-lock task */
  const selectIsLockTask = `SELECT IS_LOCK 'is-lock' FROM t_task WHERE TASK_ID= :taskId`
  /*update task record */
  const updateTaskStatusQuery = `UPDATE t_task
    SET
      TASK_STATUS_ID = :taskStatusId,
      UPDATE_TIMESTAMP = :currentTimestamp
    WHERE
      TASK_ID = :taskId AND UPDATE_TIMESTAMP = :expectedTimestamp
      AND TASK_STATUS_ID != :taskStatusId;`
  /* insert task audit */
  // const insertTaskAuditQuery = `INSERT INTO t_task_audit (TASK_ID, PRE_TASK_STATUS_ID, POST_TASK_STATUS_ID,TEAM_ID, OPERATE_USER_ID, OPERATE_TIMESTAMP) VALUES (
  //   :taskId,
  //   :preTaskStatusId,
  //   :postTaskStatusId,
  //   :teamId,
  //   :operateUserId,
  //   :currentTimestamp
  // );`

  type taskStatusRow = {
    "task-status-id": number
    "task-name": string
    "update-timestamp": Date
  }

  const currentTimestamp = new Date()

  try {
    const returnValue = await sequelize.transaction<updateTaskStatusAPIResponse>(async (transaction) => {
      const operator = await sequelize.query<{
        USER_NAME: string
        TEAM_ID: number
      }>(selectOperateUserQuery, {
        replacements: { operateUserId: input["operate-user-id"] },
        raw: true,
        plain: true,
        type: QueryTypes.SELECT,
        transaction,
      })

      if (operator === null) {
        return {
          code: 404,
          body: "Not Found - Operate user id was not found",
        }
      }

      const taskStatusRow = await sequelize.query<taskStatusRow>(selectTaskStatusQueryWithLock, {
        raw: true,
        plain: true,
        type: QueryTypes.SELECT,
        transaction,
        replacements: { taskId: input["task-id"] },
      })

      if (taskStatusRow === null) {
        logger.warn("[updateTaskStatus] Not Found - Task id was not found")
        return {
          code: 404,
          body: "Not Found - Task id was not found",
        }
      }

      const taskAudit: any = await sequelize.query<{
        "post-task-status-id": number
      }>(selectTaskAuditQuery, {
        raw: true,
        plain: true,
        type: QueryTypes.SELECT,
        replacements: { taskId: input["task-id"] },
        transaction,
      })

      const assignees = await sequelize.query<{ USER_ID: string }>(selectAssigneesQueryWithLock, {
        replacements: { taskId: input["task-id"] },
        type: QueryTypes.SELECT,
        raw: true,
        transaction,
      })
      const isLockTask: any = await sequelize.query<{ IS_LOCK: boolean }>(selectIsLockTask, {
        type: QueryTypes.SELECT,
        raw: true,
        replacements: {
          taskId: input[Constants.FIELDS.TASK_ID],
        },
      })
      /** is-wot-lock false then update task status
       * otherwise not required to update any field and get bad request
       */
      if (Boolean(isLockTask[0][Constants.FIELDS.IS_LOCK]) === false) {
        const [_updateTaskStatusResults, updateTaskStatusMetadata] = await sequelize.query(updateTaskStatusQuery, {
          raw: true,
          type: QueryTypes.UPDATE,
          replacements: {
            taskStatusId: input["task-status-id"],
            taskId: input["task-id"],
            currentTimestamp,
            expectedTimestamp: input["update-timestamp"],
          },
          transaction,
        })
        // updateTaskStatusMetadata is the number of affected rows; its value would be 0 if the existing UPDATE_TIMESTAMP
        // value of the task row does not match the expected timestamp from the input.
        if (updateTaskStatusMetadata === 0) {
          return {
            code: 409,
            body: "Conflict",
          }
        }
        /**
         * Description When we do direct status not started to complete Record insert into
         * assignee and insert record in task-audit with Not started to waiting, Waiting to Inprogress
         * and Inprogress to Complete and when we change status waiting to complete then Insert Record
         * into task-audits with waiting to Inprogress and Inprogress to Complete
         *
         * @type {*}
         */
        const preTaskStatusId = taskAudit[Constants.FIELDS.POST_TASK_STATUS_ID]
        const postTaskStatusId = input[Constants.FIELDS.TASK_STATUS_ID]
        let updatedpostTaskStatusId
        if (
          (preTaskStatusId === TASK_STATUS.NOT_STARTED && postTaskStatusId === TASK_STATUS.COMPLETE) ||
          (preTaskStatusId === TASK_STATUS.WAITING && postTaskStatusId === TASK_STATUS.COMPLETE)
        ) {
          let preTaskStatusIdforLoop = preTaskStatusId
          while (preTaskStatusIdforLoop < TASK_STATUS.COMPLETE) {
            updatedpostTaskStatusId = preTaskStatusIdforLoop + 1
            if (preTaskStatusIdforLoop === TASK_STATUS.NOT_STARTED) {
              /* insert task assignee table */
              await insertTaskAssignee(input, taskAudit, transaction)
            }
            await insertTaskAudit(
              input,
              operator,
              currentTimestamp,
              transaction,
              preTaskStatusIdforLoop,
              updatedpostTaskStatusId,
            )

            preTaskStatusIdforLoop++
          }
        } else {
          await insertTaskAudit(input, operator, currentTimestamp, transaction, preTaskStatusId, postTaskStatusId)
        }

        // Push notification
        if (taskAudit["post-task-status-id"] === 4 && input["notification-type"] === "stopTask") {
          if (env.NTF_PUSH_NOTIFICATION_CONNECTION_STRING) {
            await sendStopTaskNotification(
              assignees.map((assignee) => assignee.USER_ID),
              operator.USER_NAME,
              taskStatusRow["task-name"],
              currentTimestamp,
              transaction,
            )
          } else {
            logger.warn(
              "[updateTaskStatusController] You do not have environmental settings set to send push notifications",
            )
          }
        }
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
    })

    return returnValue
  } catch (err) {
    logger.error(err)
    return {
      code: Constants.ERROR_CODES.BAD_REQUEST,
      body: Constants.ERROR_MESSAGES.BAD_REQUEST,
    }
  }
}

/**
 * Description consolidate update task status request
 *
 * @param {Request} req
 * @returns {(updateTaskStatusRequest | Record<string, any>)} updateTaskStatusRequest
 */
export const consolidateupdateTaskStatusRequest = (req: Request): updateTaskStatusRequest | Record<string, any> => {
  return {
    "task-id": Number(req.params.taskId),
    "operate-user-id": req.body["operate-user-id"],
    "task-status-id": Number(req.body["task-status-id"]),
    "notification-type": req.body["notification-type"]
      ? EnumFromString(req.body["notification-type"] as string, ["stopTask"])
      : undefined,
    "update-timestamp": DateTimeFromString(req.body["update-timestamp"] as string),
  }
}

/**
 * Description Update Task Status
 *
 * @type {*}
 * @extract {extractValue} ConsolidateupdateTaskStatusRequest and updateTaskStatus
 */
export const updateTaskStatusController = jsonResponse(
  extractValue(consolidateupdateTaskStatusRequest)(updateTaskStatus),
)
