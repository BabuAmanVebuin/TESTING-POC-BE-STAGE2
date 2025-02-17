// Initially copied from ToT-BE, commit 545c1dd02ed8df920e315645df162212e80b2a03
import { Request } from "express"
import { QueryTypes, Transaction } from "sequelize"
import logger from "../../../../infrastructure/logger.js"
import { sequelize } from "../../../../infrastructure/orm/sqlize/index.js"
import { extractValue, jsonResponse } from "../../../decorators.js"

import { TASK_STATUS, LOCK_STATUS, OptionalStringField, millisToMinutesAndSeconds } from "./utils.js"
import { Constants } from "../../../../config/constants.js"
import {
  Task,
  updateSapTaskStatusAPIResponse,
  updateSapTaskStatusRequest,
} from "../../../../domain/entities/tot/v1/updateSapTaskStatus.js"
import { AssigneeData } from "../../../../domain/entities/tot/v1/getTaskById.js"
import { getDateFromDateTime, getDateFromDateTimeWithoutTimezone } from "../../../../domain/entities/tot/v1/utils.js"

type WorkingHours = {
  "working-hours": string
}

type LastRecordTaskAudit = {
  "task-id": number
  "post-task-status-id": number
  "operate-timestamp": Date
}

//Convert minutes to hours and minutes when minutes greater then 60
const convertMinsToHrsMins = (minutes: any) => {
  let h: any = Math.floor(minutes / 60)
  let m: any = minutes % 60
  h = h < 10 ? "0" + h : h
  m = m < 10 ? "0" + m : m
  return `${h}:${m}`
}

//Convert seconds to hours,minutes and seconds when seconds greater then 60
const convertHMS = (value: any) => {
  const measuredTime = new Date(null as any)
  measuredTime.setSeconds(value)
  const secondtoMHSTime = measuredTime.toISOString().substring(11, 19)
  return secondtoMHSTime
}

//Getting final time after add operate-timestamp and actual-end-date-time from request
const timesplit = async (val1: string, val2: string) => {
  const time1 = val1.split(":")
  const time2 = val2.split(":")

  const hours1 = time1[0]
  const minutes1 = time1[1]
  const seconds1 = time1[2]

  const hours2 = time2[0]
  const minutes2 = time2[1]
  const seconds2 = time2[2]

  const hours = Number(hours1) + Number(hours2)
  const minutes = Number(minutes1) + Number(minutes2)
  const seconds = Number(seconds1) + Number(seconds2)

  let h = hours
  let m = minutes
  let s = seconds

  if (minutes >= 60) {
    const mhm = convertMinsToHrsMins(minutes)
    const extractTime = mhm.split(":")
    const hourFromMin = Number(extractTime[0])
    const minuteFromMin = Number(extractTime[1])
    h = Number(hours) + Number(hourFromMin)
    m = Number(minuteFromMin)
  }

  if (seconds >= 60) {
    const shms = convertHMS(seconds)
    const extractTimefromsec = shms.split(":")
    const hourFromSec = Number(extractTimefromsec[0])
    const minuteFromSec = Number(extractTimefromsec[1])
    const secondFromSec = Number(extractTimefromsec[2])
    h = Number(h) + Number(hourFromSec)
    m = Number(m) + Number(minuteFromSec)
    s = Number(secondFromSec)
  }

  const time = `${h}:${m}:${s}`
  return time
}
/** get assignee function */
const getAssignees = async (taskId: string): Promise<AssigneeData[]> => {
  const assigneeQuery = `SELECT
      T1.USER_ID 'operate-user-id',
      T1.TASK_ID 'task-id',
      T2.USER_NAME 'user-name'
    FROM
      t_task_assignee T1
      JOIN m_user_tot T2 ON T1.USER_ID = T2.USER_ID
    WHERE T1.TASK_ID = :taskId
    ORDER BY T2.USER_NAME ASC LIMIT 1;`

  return sequelize.query<AssigneeData>(assigneeQuery, {
    raw: true,
    type: QueryTypes.SELECT,
    replacements: { taskId },
  })
}

//Insert Task Audit on update task status
const insertTaskAudit = async (
  task: Task,
  taskAudit: any,
  input: updateSapTaskStatusRequest,
  operator: any,
  user_assignees: any,
  transaction: Transaction,
): Promise<any> => {
  /* insert task audit */
  const insertTaskAuditQuery = `INSERT INTO t_task_audit (TASK_ID, PRE_TASK_STATUS_ID, POST_TASK_STATUS_ID,TEAM_ID, OPERATE_USER_ID, OPERATE_TIMESTAMP) VALUES (
    :taskId,
    :preTaskStatusId,
    :postTaskStatusId,
    :teamId,
    :operateUserId,
    :currentTimestamp
  );`
  const currentTimestamp = new Date()
  await sequelize.query(insertTaskAuditQuery, {
    raw: true,
    type: QueryTypes.INSERT,
    replacements: {
      taskId: task[Constants.FIELDS.TASK_ID],
      preTaskStatusId: taskAudit[Constants.FIELDS.POST_TASK_STATUS_ID],
      postTaskStatusId: input[Constants.FIELDS.TASK_STATUS_ID],
      teamId: operator.TEAM_ID,
      operateUserId: user_assignees[Constants.FIELDS.OPERATE_USER_ID],
      currentTimestamp,
    },
    transaction,
  })

  return
}

//Update task status with lock in t_task table
const updateSapTask = async (
  task: Task,
  input: updateSapTaskStatusRequest,
  transaction: Transaction,
  statusCode: number,
  isLock: any,
  wotTaskStatus: any,
): Promise<number> => {
  let actualStartDateTime
  let actualEndDateTime

  //When the task is started for the first time insert start-date-time
  if (wotTaskStatus === TASK_STATUS.INPROGRESS && task[Constants.FIELDS.START_DATE_TIME] === null) {
    actualStartDateTime = getDateFromDateTimeWithoutTimezone(input[Constants.FIELDS.ACTUAL_START_DATE_TIME])
  } else if (wotTaskStatus === TASK_STATUS.INPROGRESS) {
    //When the task is restarted then clear the end-date-time
    actualEndDateTime = null
  } else if (wotTaskStatus === TASK_STATUS.COMPLETE) {
    //When the task is completed then add the end-date-time
    actualEndDateTime = getDateFromDateTimeWithoutTimezone(input[Constants.FIELDS.ACTUAL_END_DATE_TIME])
  }

  //Get sap task status working hours
  const calculatedworkingHours = await updateSapTaskWorkingHours(task, input, wotTaskStatus)
  /*update sap task record */
  const updateSapTaskStatusQuery = `UPDATE t_task
    SET
      TASK_STATUS_ID = :taskStatusId,
      UPDATE_TIMESTAMP = :currentTimestamp,
      IS_LOCK = :isLock,
      ${actualStartDateTime == undefined ? "" : "START_DATE_TIME = :startDateTime,"}
      ${calculatedworkingHours == undefined ? "" : "WORKING_HOURS = :workingHours,"}
      END_DATE_TIME = :endDateTime
    WHERE
      TASK_ID = :taskId;`
  const currentTimestamp = new Date()
  const [_updateTaskStatusResults, updateTaskStatusMetadata] = await sequelize.query(updateSapTaskStatusQuery, {
    raw: true,
    type: QueryTypes.UPDATE,
    replacements: {
      taskStatusId: input[Constants.FIELDS.TASK_STATUS_ID],
      taskId: task[Constants.FIELDS.TASK_ID],
      currentTimestamp,
      isLock: isLock,
      startDateTime: actualStartDateTime != null ? actualStartDateTime : null,
      endDateTime: actualEndDateTime != null ? actualEndDateTime : null,
      workingHours: calculatedworkingHours != null ? calculatedworkingHours : null,
    },
    transaction,
  })

  // updateTaskStatusMetadata is the number of affected rows; its value would be 0 if the existing UPDATE_TIMESTAMP
  // value of the task row does not match the expected timestamp from the input.
  if (updateTaskStatusMetadata === 0) {
    statusCode = Constants.ERROR_CODES.CONFLICT
  } else {
    statusCode = Constants.STATUS_CODES.SUCCESS_CODE
  }
  return statusCode
}
//Fetch the task on the basis on search criteria
const getTask = async (input: updateSapTaskStatusRequest): Promise<Task[]> => {
  /**
   * select task whose status is not deleted and completeandtakenover
   * and ignore routing-counter when sap-task-category is restoration
   */
  const selectTaskQuery = `SELECT
    TASK_ID 'task-id',
    TASK_STATUS_ID 'task-status-id',
    IS_LOCK  'is-lock',
    START_DATE_TIME 'start-date-time',
    END_DATE_TIME 'end-date-time'
    FROM t_task
    WHERE ORDER_ID = :orderId AND ROUTING_ID = :routingId 
     AND ROUTING_COUNTER = :routingCounter
    AND DATE(PLANNED_DATE_TIME) = :plannedDateTime
    AND SAP_TASK_CATEGORY_ID = :sapTaskCategoryId
    AND TASK_STATUS_ID != ${TASK_STATUS.DELETE}
    AND TASK_STATUS_ID != ${TASK_STATUS.COMPLETE_AND_TAKENOVER};`

  //fetch task based on below field passed
  return sequelize.query<Task>(selectTaskQuery, {
    raw: true,
    type: QueryTypes.SELECT,
    replacements: {
      orderId: input[Constants.FIELDS.ORDER_ID],
      routingId: input[Constants.FIELDS.ROUTING_ID],
      routingCounter: input[Constants.FIELDS.ROUTING_COUNTER],
      plannedDateTime: getDateFromDateTime(input[Constants.FIELDS.PLANNED_DATE_TIME]),
      sapTaskCategoryId: input[Constants.FIELDS.SAP_TASK_CATEGORY_ID],
    },
  })
}

//Fetch post task status from task_audit table
const getTaskAudit = async (task: Task, transaction: Transaction): Promise<any> => {
  /* select post task status */
  const selectTaskAuditQuery = `SELECT POST_TASK_STATUS_ID 'post-task-status-id'
    FROM t_task_audit
    WHERE TASK_ID = :taskId
    ORDER BY TASK_AUDIT_ID DESC
    LIMIT 1;`

  //fetch task audit based on task-id
  const taskAudit: any = await sequelize.query<{
    "post-task-status-id": number
  }>(selectTaskAuditQuery, {
    raw: true,
    plain: true,
    type: QueryTypes.SELECT,
    replacements: { taskId: task[Constants.FIELDS.TASK_ID] },
    transaction,
  })
  return taskAudit
}

//Get user assignee of task
const getOperator = async (user_assignees: any, transaction: Transaction): Promise<any> => {
  /* select user name by operate user id */
  const selectOperateUserQuery = `SELECT USER_NAME,TEAM_ID FROM m_user_tot WHERE USER_ID = :operateUserId;`

  //fetch operator user data from m_user_tot table as per operator-user-id
  return sequelize.query<{
    USER_NAME: string
    TEAM_ID: number
  }>(selectOperateUserQuery, {
    replacements: {
      operateUserId: user_assignees[Constants.FIELDS.OPERATE_USER_ID],
    },
    raw: true,
    plain: true,
    type: QueryTypes.SELECT,
    transaction,
  })
}

//Get the current status of the lock of searched task
const getLock = async (task: Task): Promise<any> => {
  /** select is-lock task */
  const selectIsLockTask = `SELECT IS_LOCK 'is-lock' FROM t_task WHERE TASK_ID= :taskId`
  //fetching isLockTask
  return sequelize.query<{ IS_LOCK: boolean }>(selectIsLockTask, {
    type: QueryTypes.SELECT,
    raw: true,
    plain: true,
    replacements: {
      taskId: task[Constants.FIELDS.TASK_ID],
    },
  })
}

//update Task working hours calculation
const updateSapTaskWorkingHours = async (
  task: Task,
  input: updateSapTaskStatusRequest,
  wotTaskStatus: any,
): Promise<any> => {
  //Fetch task audit last record and fetch operate timestamp from t_task_audit table
  const selectLastRecordTaskAuditQuery = `SELECT
    TASK_ID 'task-id',
    POST_TASK_STATUS_ID 'post-task-status-id',
    OPERATE_TIMESTAMP 'operate-timestamp'
    FROM t_task_audit ORDER BY TASK_AUDIT_ID DESC LIMIT 1;`

  //Fetch working hours from t_task table
  const selectWorkingHoursQuery = `SELECT
    WORKING_HOURS 'working-hours'
    FROM t_task where TASK_ID = :taskId;`

  const workingHoursResult: any = await sequelize.query<WorkingHours>(selectWorkingHoursQuery, {
    raw: true,
    plain: true,
    type: QueryTypes.SELECT,
    replacements: { taskId: task[Constants.FIELDS.TASK_ID] },
  })

  const lastRecordTaskAudit: any = await sequelize.query<LastRecordTaskAudit>(selectLastRecordTaskAuditQuery, {
    raw: true,
    plain: true,
    type: QueryTypes.SELECT,
    replacements: { taskId: task[Constants.FIELDS.TASK_ID] },
  })

  /** When current task status inprogress and WOT task status waiting or
   * current task inprogress and wot task status complete then getting working hours
   */
  if (
    (task[Constants.FIELDS.TASK_STATUS_ID] === TASK_STATUS.INPROGRESS && wotTaskStatus === TASK_STATUS.WAITING) ||
    (task[Constants.FIELDS.TASK_STATUS_ID] === TASK_STATUS.INPROGRESS && wotTaskStatus === TASK_STATUS.COMPLETE)
  ) {
    let workingHours
    const actualEndDateTime: any = new Date(input[Constants.FIELDS.ACTUAL_END_DATE_TIME] as any).toISOString()
    const operateTimeStamp: any = new Date(lastRecordTaskAudit[Constants.FIELDS.OPERATE_TIMESTAMP]).toISOString()
    const subworkingHours: any = (new Date(actualEndDateTime) as any) - (new Date(operateTimeStamp) as any)

    //When date difference getting in negative then assign working hours as 0
    const calculateHRSMin = millisToMinutesAndSeconds(Number(subworkingHours < 0 ? 0 : subworkingHours))
    if (workingHoursResult[Constants.FIELDS.WORKING_HOURS] === null) {
      workingHours = calculateHRSMin
    } else {
      workingHours = timesplit(workingHoursResult[Constants.FIELDS.WORKING_HOURS], calculateHRSMin)
    }
    return workingHours
  }
}

/* update sap task status function */
const updateSapTaskStatus = async (
  postValidationInput: updateSapTaskStatusRequest | Record<string, any>,
): Promise<any> => {
  const dateRegex =
    /^[0-9]{4}-((0[13578]|1[02])-(0[1-9]|[12][0-9]|3[01])|(0[469]|11)-(0[1-9]|[12][0-9]|30)|(02)-(0[1-9]|[12][0-9]))T(0[0-9]|1[0-9]|2[0-3]):(0[0-9]|[1-5][0-9]):(0[0-9]|[1-5][0-9])\.[0-9]{3}\+[0-9]{2}:[0-9]{2}$/
  if (!dateRegex.test(postValidationInput[Constants.FIELDS.ACTUAL_START_DATE_TIME])) {
    return {
      code: Constants.ERROR_CODES.NOT_FOUND_CODE,
      body: Constants.ERROR_MESSAGES.INVALID_ACTUAL_START_DATE,
    }
  }
  if (!dateRegex.test(postValidationInput[Constants.FIELDS.PLANNED_DATE_TIME])) {
    return {
      code: Constants.ERROR_CODES.NOT_FOUND_CODE,
      body: Constants.ERROR_MESSAGES.INVALID_PLANNED_DATE_TIME,
    }
  }
  if (
    !dateRegex.test(postValidationInput[Constants.FIELDS.ACTUAL_END_DATE_TIME]) &&
    postValidationInput[Constants.FIELDS.ACTUAL_END_DATE_TIME] !== null &&
    postValidationInput[Constants.FIELDS.ACTUAL_END_DATE_TIME] !== undefined &&
    postValidationInput[Constants.FIELDS.ACTUAL_END_DATE_TIME] !== ""
  ) {
    return {
      code: Constants.ERROR_CODES.NOT_FOUND_CODE,
      body: Constants.ERROR_MESSAGES.INVALID_ACTUAL_END_DATE,
    }
  }
  const input = postValidationInput as updateSapTaskStatusRequest
  try {
    const returnValue = await sequelize.transaction<updateSapTaskStatusAPIResponse>(async (transaction) => {
      const taskArray: any = await getTask(input)
      //not getting task then send not found task error
      if (taskArray.length === 0) {
        logger.warn("[updateSapTaskStatus] Not Found - Task was not found")
        return {
          code: Constants.ERROR_CODES.NOT_FOUND_CODE,
          body: Constants.ERROR_MESSAGES.TASK_NOT_FOUND,
        }
      } else {
        //fetch more then 1 task then send conflict error
        if (taskArray.length > 1) {
          logger.warn("[updateSapTaskStatus] Conflict")
          return responseStatus(Constants.ERROR_CODES.CONFLICT)
        }
        const task = taskArray[0]
        const taskAudit = await getTaskAudit(task, transaction)
        //fetch user assignees based on taskId
        const user_assigneesArray: AssigneeData[] = await getAssignees(task[Constants.FIELDS.TASK_ID])
        //user assignees not getting then send user not found error
        if (user_assigneesArray.length === 0) {
          logger.warn("[updateSapTaskStatus] Not Found - User assignee was not found")
          return {
            code: Constants.ERROR_CODES.NOT_FOUND_CODE,
            body: Constants.ERROR_MESSAGES.USER_ASSIGNEE_NOT_FOUND,
          }
        }
        const user_assignees = user_assigneesArray[0]
        const operator = await getOperator(user_assignees, transaction)
        //if operator-user-id not found then send  not found error
        if (operator === null) {
          return {
            code: Constants.ERROR_CODES.NOT_FOUND_CODE,
            body: Constants.ERROR_MESSAGES.OPERATE_USER_ID_NOT_FOUND,
          }
        }
        //fetching isLock from t_task table
        const isLockTask: any = await getLock(task)
        /** current task-status-id is not delete and is not complate-and-takenover then get bad request
         * otherwise not required to update any field and get Bad Request
         */
        let statusCode: any = Constants.ERROR_CODES.BAD_REQUEST
        logger.info(`task: ${JSON.stringify(task)}`)
        logger.info(`task: ${JSON.stringify(task[Constants.FIELDS.TASK_STATUS_ID])}`)
        logger.info(`taskstatus: ${TASK_STATUS.DELETE}`)
        if (
          task[Constants.FIELDS.TASK_STATUS_ID] !== TASK_STATUS.DELETE &&
          task[Constants.FIELDS.TASK_STATUS_ID] !== TASK_STATUS.COMPLETE_AND_TAKENOVER
        ) {
          if (
            TASK_STATUS[task[Constants.FIELDS.TASK_STATUS_ID]] === TASK_STATUS[input[Constants.FIELDS.TASK_STATUS_ID]]
          ) {
            //current task status and request task status is same then get Bad Request
            return responseStatus(Constants.ERROR_CODES.CONFLICT)
          } else if (
            task[Constants.FIELDS.TASK_STATUS_ID] === TASK_STATUS.INPROGRESS &&
            Boolean(isLockTask[Constants.FIELDS.IS_LOCK]) === false
          ) {
            //lock false and current task status is inprogress then get bad request
            return responseStatus(Constants.ERROR_CODES.BAD_REQUEST)
          } else {
            //insert entry in TaskAudit and update sap task status in t_task table
            const wotTaskStatus = input[Constants.FIELDS.TASK_STATUS_ID]
            if (taskAudit[Constants.FIELDS.POST_TASK_STATUS_ID] === wotTaskStatus) {
              return responseStatus(Constants.ERROR_CODES.BAD_REQUEST)
            }
            /**wotTaskStatus is in waiting and inprogress then update task-status-id,task-id,
             * update-timestamp and is-lock true otherwise all update field same just is-lock false
             */
            if (wotTaskStatus === TASK_STATUS.WAITING || wotTaskStatus === TASK_STATUS.INPROGRESS) {
              statusCode = await updateSapTask(task, input, transaction, statusCode, LOCK_STATUS.IS_LOCK, wotTaskStatus)
              await insertTaskAudit(task, taskAudit, input, operator, user_assignees, transaction)
            } else {
              statusCode = await updateSapTask(
                task,
                input,
                transaction,
                statusCode,
                LOCK_STATUS.IS_NOT_LOCK,
                wotTaskStatus,
              )
              await insertTaskAudit(task, taskAudit, input, operator, user_assignees, transaction)
            }
            return responseStatus(statusCode)
          }
        } else {
          return responseStatus(Constants.ERROR_CODES.BAD_REQUEST)
        }
      }
    })
    return returnValue
  } catch (err) {
    logger.error(err)
    return responseStatus(Constants.ERROR_CODES.BAD_REQUEST)
  }
}
//response status for the updateSapTaskStausAPIResponse
const responseStatus = (val: number): updateSapTaskStatusAPIResponse => {
  switch (val) {
    case Constants.ERROR_CODES.CONFLICT:
      return {
        code: Constants.ERROR_CODES.CONFLICT,
        body: Constants.ERROR_MESSAGES.CONFLICT,
      }

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

    default:
      return {
        code: Constants.ERROR_CODES.BAD_REQUEST,
        body: Constants.ERROR_MESSAGES.BAD_REQUEST,
      }
  }
}
/* consolidate update sap task status parameter */
export const consolidateupdateSapTaskStatusRequest = (
  req: Request,
): updateSapTaskStatusRequest | Record<string, any> => {
  return {
    "task-status-id": Number(req.body[Constants.FIELDS.TASK_STATUS_ID]),
    "sap-task-category-id": Number(req.params.saptaskCategoryId),
    "order-id": req.body[Constants.FIELDS.ORDER_ID],
    "routing-id": Number(req.body[Constants.FIELDS.ROUTING_ID]),
    "routing-counter": Number(req.body[Constants.FIELDS.ROUTING_COUNTER]),
    "planned-date-time": req.body[Constants.FIELDS.PLANNED_DATE_TIME] as string,
    "actual-start-date-time": req.body[Constants.FIELDS.ACTUAL_START_DATE_TIME] as string,
    "actual-end-date-time": req.body[Constants.FIELDS.ACTUAL_END_DATE_TIME] as string,
    "activity-id": OptionalStringField(req.body[Constants.FIELDS.ACTIVITY_ID] as string),
  }
}

//update Sap Task Staus
export const updateSapTaskStatusController = jsonResponse(
  extractValue(consolidateupdateSapTaskStatusRequest)(updateSapTaskStatus),
)
