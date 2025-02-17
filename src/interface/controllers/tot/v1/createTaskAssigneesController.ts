// Initially copied from ToT-BE, commit 545c1dd02ed8df920e315645df162212e80b2a03

import { env } from "process"

import { Request } from "express"
import { BaseError, QueryTypes, Transaction } from "sequelize"

import {
  createTaskAssigneesAPIResponse,
  createTaskAssigneesRequest,
} from "../../../../domain/entities/tot/v1/createTaskAssignees.js"
import logger from "../../../../infrastructure/logger.js"
import { sequelize } from "../../../../infrastructure/orm/sqlize/index.js"
import { extractValue, jsonOrEmptyResponse } from "../../../decorators.js"

import { handleDbError, sendCreateTaskAssigneeNotification, setDifference } from "./utils.js"
import { Constants } from "../../../../config/constants.js"
import { NOTIFICATION_TYPE, sendTaskReminderNotification, TASK_STATUS } from "./utils.js"
import { Duration } from "../../../../infrastructure/config/enum.js"

//Send notification before 9 min
const Notification = async (taskId: any, assignment: any, transaction: Transaction): Promise<any> => {
  const date = new Date()
  const options: any = { timeZone: "Asia/Tokyo" }

  const curdate: any = date.toLocaleDateString("ja-JP", options).split("/")
  const curtime = date.toLocaleTimeString("ja-JP", options).split(" ")

  const year = `${curdate[0]}`
  const month = `${curdate[1] < 10 ? 0 + curdate[1] : curdate[1]}`
  const day = `${curdate[2] < 10 ? 0 + curdate[2] : curdate[2]}`

  const nowTime: any = curtime[0]

  const nowDate = `${year}-${month}-${day}`
  try {
    /**Get task which is on waiting status and
     * task gap less 9 min and greate 0 min after substract current date time
     *  to planned date time
     */
    const getTaskQuery = `select
           t.TASK_ID  'task-id',
           t.TASK_NAME 'task-name',
           t.TASK_ID 'task-id',
           t.PLANNED_DATE_TIME 'planned-date-time',
           t.REMARKS 'remarks'
           from t_task t
           where t.TASK_STATUS_ID = ${TASK_STATUS.WAITING}
           AND TIMEDIFF(t.PLANNED_DATE_TIME, '${nowDate} ${nowTime}') >= '${Duration.TIME_NEW_TASK_NOTIFICATION_START}'
           AND TIMEDIFF(t.PLANNED_DATE_TIME, '${nowDate} ${nowTime}') <= '${Duration.TIME_NEW_TASK_NOTIFICATION_END}'
           AND t.TASK_ID IN (${taskId})`

    //comment code whose task not passed inprogress in before this waiting task
    /**
            *  t.TASK_ID NOT IN (
           select DISTINCT(ta1.TASK_ID)
           from t_task_audit ta1
           where ta1.POST_TASK_STATUS_ID > ${TASK_STATUS.WAITING})
           AND 
            * 
            */
    const tasks = await sequelize.query<any>(getTaskQuery, {
      raw: true,
      type: QueryTypes.SELECT,
      replacements: {},
      transaction,
    })
    logger.info(tasks.length > 0 ? JSON.stringify(tasks, null, 4) : "task not found")
    const taskArray = JSON.parse(JSON.stringify(tasks, null, 4))
    const taskData: any = taskArray.length > 0 ? taskArray : []
    let statusCode: any = Constants.ERROR_CODES.BAD_REQUEST

    /** Getting task then send notification before 10min
     * orelse getting error task not found
     */
    const taskResult = taskData[0]
    const currentTimestamp = new Date()

    /** If exist notification connection string then send task reminder notification
     * or else return Bad Request
     */
    if (env.NTF_PUSH_NOTIFICATION_CONNECTION_STRING) {
      /** Getting task result then send notification whose type
       * have before start and exist task-id
       */
      if (taskResult) {
        const plannedDatetimeArray = taskResult[Constants.FIELDS.PLANNED_DATE_TIME]
          ? taskResult[Constants.FIELDS.PLANNED_DATE_TIME].split("T")
          : ""
        const plannedDate = plannedDatetimeArray ? plannedDatetimeArray[0].substring(0, 10) : ""
        const plannedTime = plannedDatetimeArray ? plannedDatetimeArray[1].substring(0, 8) : ""
        //Get userId for fetching assignee
        const concatePlannedDateTime = `${plannedDate} ${plannedTime}`

        //Send task reminder before 10 min
        await sendTaskReminderNotification(
          assignment.assignees.map((assignee: any) => assignee[Constants.FIELDS.USER_ID]),
          taskResult[Constants.FIELDS.REMARKS],
          taskResult[Constants.FIELDS.TASK_NAME],
          concatePlannedDateTime,
          currentTimestamp,
          transaction,
          NOTIFICATION_TYPE.BEFORE_START,
          taskResult[Constants.FIELDS.TASK_ID],
        )
        statusCode = Constants.STATUS_CODES.SUCCESS_CODE
        return statusCode
      }
    } else {
      logger.warn("[sendTaskReminder] You do not have environmental settings set to send push notifications")
      statusCode = Constants.ERROR_CODES.BAD_REQUEST
      return statusCode
    }
    // There is no input here, just return everything.
  } catch (error: any) {
    logger.error(error)
    handleDbError("notification", error)

    return {
      code: Constants.ERROR_CODES.BAD_REQUEST,
      body: Constants.ERROR_MESSAGES.BAD_REQUEST,
    }
  }
}

//response status for the sendnotificationAPIResponse
const responseStatus = (val: number): any => {
  switch (val) {
    case Constants.STATUS_CODES.SUCCESS_CODE:
      return {
        code: Constants.STATUS_CODES.SUCCESS_CODE,
        body: Constants.SUCCESS_MESSAGES.SUCCESS,
      }

    case Constants.ERROR_CODES.BAD_REQUEST:
      return {
        code: Constants.ERROR_CODES.BAD_REQUEST,
        body: Constants.ERROR_MESSAGES.BAD_REQUEST,
      }
    case Constants.ERROR_CODES.NOT_FOUND_CODE:
      return {
        code: Constants.ERROR_CODES.NOT_FOUND_CODE,
        body: Constants.ERROR_MESSAGES.DATA_NOT_FOUND,
      }
    default:
      return {
        code: Constants.ERROR_CODES.BAD_REQUEST,
        body: Constants.ERROR_MESSAGES.BAD_REQUEST,
      }
  }
}

/* create task assignee function */
const createTaskAssignees = async (
  postValidationInput: createTaskAssigneesRequest | Array<Record<string, any>>,
): Promise<createTaskAssigneesAPIResponse> => {
  const input = postValidationInput as createTaskAssigneesRequest

  type Task = {
    TASK_NAME: string
    PLANNED_DATE_TIME: Date
    TASK_PRIORITY_NAME: string
  }

  const curdate = new Date()

  try {
    const result = await sequelize.transaction<createTaskAssigneesAPIResponse>(async (transaction) => {
      /* select user name by user id in user table */
      const selectOperatorNameQuery = `SELECT USER_NAME FROM m_user_tot WHERE USER_ID = :operateUserId;`
      const selectTaskQuery = `SELECT
          T1.TASK_NAME,
          T1.PLANNED_DATE_TIME,
          T2.TASK_PRIORITY_NAME,
          T1.TASK_STATUS_ID
        FROM
          t_task T1 LEFT OUTER JOIN
          m_task_priority T2 ON T1.TASK_PRIORITY_ID = T2.TASK_PRIORITY_ID
        WHERE TASK_ID = :taskId
        FOR UPDATE;`

      /* insert task assignee table */
      const insertTaskAssigneeQuery = `INSERT INTO t_task_assignee (
          TASK_ID, USER_ID
        ) VALUES ?;`

      /* check user in user table by user ids to update records */
      const checkAssigneesQuery = `SELECT USER_ID, USER_NAME FROM m_user_tot WHERE USER_ID IN (:userIDs) FOR UPDATE;`

      const operator = await sequelize.query<{ USER_NAME: string }>(selectOperatorNameQuery, {
        raw: true,
        type: QueryTypes.SELECT,
        plain: true,
        transaction,
        replacements: { operateUserId: input["operate-user-id"] },
      })

      if (operator === null) {
        throw new Error("INVALID_OPERATOR")
      }

      const userIdSet = new Set<string>()
      input.assignments.forEach((assignment) => {
        assignment.assignees.forEach((assignee) => {
          userIdSet.add(assignee["user-id"])
        })
      })

      const checkUserResult =
        userIdSet.size === 0
          ? []
          : await sequelize.query<{ USER_ID: string; USER_NAME: string }>(checkAssigneesQuery, {
              raw: true,
              type: QueryTypes.SELECT,
              transaction,
              replacements: { userIDs: [...userIdSet] },
            })
      const userIdNameMap = new Map(checkUserResult.map(({ USER_ID, USER_NAME }) => [USER_ID, USER_NAME]))

      const validUserIds = new Set(userIdNameMap.keys())
      const invalidUserIds = setDifference(userIdSet, validUserIds)
      if (invalidUserIds.size > 0) {
        return {
          code: 404,
          body: {
            errors: [
              {
                "error-type": "NOT_FOUND_USER_ID",
                "invalid-values": [...invalidUserIds],
              },
            ],
          },
        }
      }
      let statusCode: any = Constants.STATUS_CODES.SUCCESS_CODE

      for (const assignment of input.assignments) {
        // Lock the task row involved
        const task: any = await sequelize.query<Task>(selectTaskQuery, {
          raw: true,
          type: QueryTypes.SELECT,
          transaction,
          plain: true,
          replacements: { taskId: assignment["task-id"] },
        })

        // Create the assignee records
        // TODO: Figure out how to catch duplicate key error
        await sequelize.query(insertTaskAssigneeQuery, {
          raw: true,
          type: QueryTypes.INSERT,
          transaction,
          replacements: [assignment.assignees.map((assignee) => [assignment["task-id"], assignee["user-id"]])],
        })

        if (env.NTF_PUSH_NOTIFICATION_CONNECTION_STRING) {
          /** send notification whose type
           * have New assignment
           */
          const dateString = task.PLANNED_DATE_TIME ? task.PLANNED_DATE_TIME.toLocaleString("ja-JP") : "N/A"
          const priorityNameString = task.TASK_PRIORITY_NAME ? task.TASK_PRIORITY_NAME : "N/A"
          await sendCreateTaskAssigneeNotification(
            assignment.assignees.map((assignee) => assignee["user-id"]),
            operator.USER_NAME,
            task.TASK_NAME,
            dateString,
            priorityNameString,
            curdate,
            transaction,
          )
          //
          /** Get task status is on waiting and gap between
           * planned-date-time and current-date-time less 9 min
           * and greater 0 min then execute below code
           */
          if (task.TASK_STATUS_ID === TASK_STATUS.WAITING) {
            statusCode = await Notification(assignment["task-id"], assignment, transaction)
          }
        } else {
          logger.warn(
            "[createTaskAssignees] You are skipping notification because the environmental variable is not set",
          )
        }
      }
      if (statusCode) {
        return responseStatus(statusCode)
      } else {
        return {
          code: Constants.STATUS_CODES.SUCCESS_CODE,
          body: Constants.SUCCESS_MESSAGES.SUCCESS,
        }
      }
    })

    return result
  } catch (err: any) {
    if (err instanceof BaseError) {
      handleDbError("createTaskAssignees", err)
    }
    if (err.message === "INVALID_OPERATOR") {
      return {
        code: 404,
        body: `Not Found - The operator ID (${input["operate-user-id"]}) was not registered in the database.`,
      } as unknown as createTaskAssigneesAPIResponse
    }
    return {
      code: 400,
      body: "Bad Request",
    }
  }
}

/* consolidate user request parameter */
export const consolidatecreateTaskAssigneeRequest = (req: Request): createTaskAssigneesRequest => {
  return {
    "operate-user-id": req.body["operate-user-id"],
    assignments: req.body.assignments.map((assignment: Record<string, any>) => ({
      "task-id": Number(assignment["task-id"]),
      assignees: assignment.assignees.map((assignee: Record<string, any>) => ({
        "user-id": assignee["user-id"],
      })),
    })),
  }
}

/** export create task assignees controller */
export const createTaskAssigneesController = jsonOrEmptyResponse(
  extractValue(consolidatecreateTaskAssigneeRequest)(createTaskAssignees),
  [404],
)
