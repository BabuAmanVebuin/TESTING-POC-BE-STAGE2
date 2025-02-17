// Initially copied from ToT-BE, commit 545c1dd02ed8df920e315645df162212e80b2a03
import { BaseError, QueryTypes, Transaction } from "sequelize"
import { sequelize } from "../../../../infrastructure/orm/sqlize/index.js"
import crypto from "crypto"
import { TextEncoder } from "util"
import logger from "../../../../infrastructure/logger.js"
import axios from "axios"
import config from "../../../../infrastructure/config/index.js"
import {
  validDateTime,
  getDateFromDateTimeString,
  validDate,
  getIosDate,
} from "../../../../domain/entities/tot/v1/utils.js"

import { Constants } from "../../../../config/constants.js"
import { env } from "process"

export const handleDbError = (label: string, error: BaseError): undefined => {
  const errorWithType = error as BaseError
  logger.info(
    `${label}: Database error. ${Object.getPrototypeOf(errorWithType)}: ${
      errorWithType.name
    } ${errorWithType.message} `,
  )
  return undefined
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type poorlyShapedRequest = Record<string, any>

export const EnumFromString = (val: string, enumVals: string[]): string | undefined => {
  if (enumVals.includes(val)) {
    return val
  }
  return undefined
}

export const BoolFromString = (val: string): boolean | undefined => {
  return val === undefined ? undefined : val === "true"
}

export const DateTimeFromString = (val: string): Date | undefined => {
  return validDateTime(val) ? getDateFromDateTimeString(val) : undefined
}

//Fetch datetime without UTC
export const DateTimeFromStringWithoutUTC = (val: string): string | undefined | Date => {
  try {
    return new Date(val)
  } catch (e) {
    return undefined
  }
}

export const DateFromString = (val: string): Date | undefined => {
  return validDate(val) ? getIosDate(val) : undefined
}

export const LanguageFromString = (val: string): string => {
  return val !== undefined && ["JA", "EN"].includes(val) ? val : "JA"
}
export const OptionalStringField = (val: string): string | undefined => {
  return val ? val : undefined
}

export const consolidatePossibleArray = (x: unknown): any => {
  if (x === null || x === undefined || Array.isArray(x)) {
    return x
  }

  return [x]
}

//Fetch date record from string
export const FetchDateFromString = (val: any): string | undefined => {
  const date = new Date(val)
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, "0")
  const dd = String(date.getDate()).padStart(2, "0")
  const newdate = `${yyyy}-${mm}-${dd}`
  return newdate
}

//make single digit to double when 1-9 number is coming
const padTo2Digits = (num: any) => {
  return num.toString().padStart(2, "0")
}
//millis to hours, minutes and seconds calculation
export const millisToMinutesAndSeconds = (milliseconds: any) => {
  let seconds = Math.floor(milliseconds / 1000)
  let minutes = Math.floor(seconds / 60)
  let hours = Math.floor(minutes / 60)
  seconds = seconds % 60
  minutes = seconds >= 30 ? minutes + 1 : minutes
  minutes = minutes % 60
  hours = hours % 24
  return `${padTo2Digits(hours)}:${padTo2Digits(minutes)}:${padTo2Digits(seconds)}`
}

export const sendCreateTaskAssigneeNotification = async (
  userIds: string[],
  operatorName: string,
  taskName: string,
  dateString: string,
  priorityNameString: string,
  curdate: Date,
  transaction: Transaction,
) => {
  return sendNotification(
    userIds,
    "タスクがアサインされました",
    `${operatorName}さんが${taskName}にあなたをアサインしました。実施予定時刻 ${dateString} 優先度 ${priorityNameString}`,
    curdate,
    transaction,
  )
}

//Task reminder before 10min
export const sendTaskReminderNotification = async (
  userIds: string[],
  remarks: string,
  taskName: string,
  dateString: string,
  curdate: Date,
  transaction: Transaction,
  notificationType: string,
  taskId: number,
) => {
  const remarks_cond = remarks ? `\r${remarks}` : ""
  const notificationContent = `${Constants.NOTIFICATION.TASK_NAME}: ${taskName}\r${Constants.NOTIFICATION.SCHEDULE_DATE_AND_TIME} : ${dateString}${remarks_cond}`
  return sendNotification(
    userIds,
    Constants.NOTIFICATION.TASK_REMINDER_TITLE,
    notificationContent,
    curdate,
    transaction,
    notificationType,
    taskId,
  )
}

const sendNotification = async (
  userIds: string[],
  notificationTitle: string,
  notificationContent: string,
  curdate: Date,
  transaction: Transaction,
  notificationType?: string | NOTIFICATION_TYPE.NEW_ASSIGNMENT,
  taskId?: number | null,
) => {
  if (userIds.length === 0) {
    return
  }

  const selectDeviceTokenQuery = `SELECT USER_ID, DEVICE_TOKEN FROM m_user_tot WHERE USER_ID IN (:userIds) FOR UPDATE;`
  const insertNotificationQuery = `INSERT INTO t_notification (
      TARGET_USER_ID,
      MESSAGE,
      TASK_ID,
      TYPE,
      CREATE_TIMESTAMP
    ) VALUES (
      $userId,
      $notificationContent,
      $taskId,
      $notificationType,
      $curdate
    );`

  const deviceTokenRows = await sequelize.query<DeviceTokenRow>(selectDeviceTokenQuery, {
    raw: true,
    type: QueryTypes.SELECT,
    transaction,
    replacements: { userIds },
  })

  type DeviceTokenRow = {
    USER_ID: string
    DEVICE_TOKEN: string | null
  }

  const _sendNotificationDirect = async (
    curdate: Date,
    deviceTokenRows: DeviceTokenRow[],
    notificationTitle: string,
    notificationContent: string,
  ) => {
    /* Azure Notification Hub Client */
    const msgSource = `${env.NOTIFICATION_HUB_NAME}`
    const name = msgSource.toUpperCase()
    const { uri, saName, saKey } = config.azureNotification
    const url = `${uri.replace(/^sb/, "https")}${name}/messages/?api-version=2015-01`
    const tags = deviceTokenRows.map((row) => `userId:${row.USER_ID}`)

    return Promise.all(
      tags.map(async (tag) => {
        const data = {
          aps: {
            alert: {
              title: notificationTitle,
              body: notificationContent,
            },
            sound: "default",
          },
        }
        const axiosConfig = {
          headers: {
            Authorization: createSharedAccessToken(uri, saName, saKey, 60 * 60 * 24 * 7),
            "ServiceBusNotification-Tags": tag,
            "ServiceBusNotification-Format": "apple",
          },
        }

        try {
          const response = await axios.post(url, data, axiosConfig)
          return response
        } catch (err: any) {
          curdate
          logger.debug("Azure notification hub request error")
          logger.debug(`uri: ${uri}`)
          logger.debug(`saName: ${saName}`)
          logger.debug(`saKey: ${saKey}`)
          logger.debug(`url: ${url}`)
          logger.debug(`tags: ${JSON.stringify(tags)}`)
          logger.debug(`request data: ${JSON.stringify(data)}`)
          logger.debug(`request options: ${JSON.stringify(axiosConfig)}`)
          if (err.toJSON) {
            logger.debug(`error: ${JSON.stringify(err.toJSON())}`)
          }
          throw err
        }
      }),
    )
  }

  await _sendNotificationDirect(curdate, deviceTokenRows, notificationTitle, notificationContent)

  for (const row of deviceTokenRows) {
    if (row.DEVICE_TOKEN !== null) {
      const taskIdResult = taskId ? taskId : null
      const notificationTypeResult = notificationType ? notificationType : NOTIFICATION_TYPE.NEW_ASSIGNMENT
      const [insertId, _] = await sequelize.query(insertNotificationQuery, {
        raw: true,
        type: QueryTypes.INSERT,
        transaction,
        bind: {
          userId: row.USER_ID,
          notificationContent,
          taskId: taskIdResult,
          notificationType: notificationTypeResult,
          curdate,
        },
      })
      insertId
    }
  }
}

class MissingRequiredParameterError extends Error {}

export const createSharedAccessToken = (
  uri: string,
  saName: string,
  saKey: string,
  sec: number | undefined = undefined,
): string => {
  if (!uri || !saName || !saKey) {
    throw new MissingRequiredParameterError()
  }

  const encoded = encodeURIComponent(uri)
  const now = new Date()

  // TODO: confirm how long we want the TTL to be
  const _sec = sec === undefined ? 600 : sec
  const ttl = Math.round(now.getTime() / 1000) + _sec

  const signature = `${encoded}\n${ttl}`
  const utf8 = new TextEncoder()
  const signatureUTF8 = utf8.encode(signature)
  const hash = crypto.createHmac("sha256", saKey).update(signatureUTF8).digest("base64")
  return `SharedAccessSignature sr=${encoded}&sig=${encodeURIComponent(hash)}&se=${ttl}&skn=${saName}`
}

export const setDifference = (setA: Set<any>, setB: Set<any>): Set<any> => {
  const _diff = new Set(setA)
  setB.forEach((element: any) => {
    _diff.delete(element)
  })
  return _diff
}

export const sendDeleteTaskAssigneeNotification = async (
  userIds: string[],
  operatorName: string,
  taskName: string,
  curdate: Date,
  transaction: Transaction,
) => {
  return sendNotification(
    userIds,
    "タスクがリリースされました",
    `${operatorName}さんがあなたを${taskName}の担当者から外しました。`,
    curdate,
    transaction,
  )
}

export const OptionalNullableStringField = (val: string): string | undefined | null => {
  return val === undefined ? undefined : val
}

export const NullableDateTimeFromString = (val: string): Date | null | undefined => {
  if (val === null) {
    return null
  }
  return DateTimeFromString(val)
}

export const OptionalNullNumber = (x: unknown): number | null | undefined => {
  if (x === null) {
    return x
  }
  return OptionalNumber(x)
}

export const OptionalNumber = (x: unknown): number | undefined => {
  if (x === undefined) {
    return x
  }
  return Number(x)
}

export const OptionalIntNumber = (x: number): number | any => {
  if (x === undefined) {
    return x
  }
  if (Number(x) === x && x % 1 === 0) {
    return Number(x)
  }
  return ""
}

export const sendStopTaskNotification = async (
  userIds: string[],
  operatorName: string,
  taskName: string,
  curdate: Date,
  transaction: Transaction,
) => {
  return sendNotification(
    userIds,
    "タスクが中断されました",
    `${operatorName}さんが${taskName}を強制中断しました。`,
    curdate,
    transaction,
  )
}

export const languageFromHeader = (headerLangVal: string) => {
  return ["EN", "JA"].includes(headerLangVal) ? headerLangVal : "JA"
}

/**
 * New Error class, if asset code in the request are invalid
 */
export class AssetCodeNotFoundError extends Error {
  assetCodes: Set<string>
  constructor(assetCodes: Set<string>, ...params: any) {
    super(...params)

    this.assetCodes = assetCodes
  }
}

/* task id validate */
export class TaskIdsNotFoundError extends Error {
  taskIds: number[]
  constructor(taskIds: number[], ...params: any) {
    super(...params)
    this.taskIds = taskIds
  }
}

/* eventtype id validate */
export class EventTypeIdsNotFoundError extends Error {
  eventTypeIds: number[]
  constructor(eventTypeIds: number[], ...params: any) {
    super(...params)
    this.eventTypeIds = eventTypeIds
  }
}

/* task forecast id validate */
export class TaskForecastIdNotFoundError extends Error {
  taskForecastId: number
  constructor(taskForecastId: number, ...params: any) {
    super(...params)
    this.taskForecastId = taskForecastId
  }
}

/* routine task template id validate */
export class RoutineTaskTemplateIdNotFoundError extends Error {
  routineTaskTemplateId: any
  constructor(routineTaskTemplateId: any, ...params: any) {
    super(...params)
    this.routineTaskTemplateId = routineTaskTemplateId
  }
}

/* event template id validate */
export class EventTemplateIdNotFoundError extends Error {
  eventTemplateId: number
  constructor(eventTemplateId: number, ...params: any) {
    super(...params)
    this.eventTemplateId = eventTemplateId
  }
}

/*  operationId validate */
export class OperationIdsNotFoundError extends Error {
  operationIds: Set<string>
  constructor(operationIds: Set<string>, ...params: any) {
    super(...params)

    this.operationIds = operationIds
  }
}

/*  operationEventTypeId validate */
export class OperationEventTypeIdNotFoundError extends Error {
  operationEventTypeId: number
  constructor(operationEventTypeId: number, ...params: any) {
    super(...params)
    this.operationEventTypeId = operationEventTypeId
  }
}

/* sap task category id validate */
export class SapTaskCategoryIdNotFoundError extends Error {
  sapTaskCategoryId: number
  constructor(sapTaskCategoryId: number, ...params: any) {
    super(...params)
    this.sapTaskCategoryId = sapTaskCategoryId
  }
}

/* event type name validate */
export class EventTypeNameNotFoundError extends Error {
  eventTypeName: string
  constructor(eventTypeName: string, ...params: any) {
    super(...params)
    this.eventTypeName = eventTypeName
  }
}

/* event type name validate */
export class InvalidEventTypeNameError extends Error {
  eventTypeName: string
  constructor(eventTypeName: string, ...params: any) {
    super(...params)
    this.eventTypeName = eventTypeName
  }
}

/* asset-task-group-name validate */
export class InvalidAssetTaskGroupNameError extends Error {
  assetTaskGroupName: string
  constructor(assetTaskGroupName: string, ...params: any) {
    super(...params)
    this.assetTaskGroupName = assetTaskGroupName
  }
}

/* event type attached with sap error */
export class EventTypeAttachWithSapError extends Error {
  eventTypeId: number
  constructor(eventTypeId: number, ...params: any) {
    super(...params)
    this.eventTypeId = eventTypeId
  }
}

/* tasktype id validate */
export class TaskTypeIdsNotFoundError extends Error {
  taskTypeIds: number[]
  constructor(taskTypeIds: number[], ...params: any) {
    super(...params)
    this.taskTypeIds = taskTypeIds
  }
}

/* asset-task-group-id validate */
export class AssetTaskGroupIdsNotFoundError extends Error {
  assetTaskGroupIds: number[]
  constructor(assetTaskGroupIds: number[], ...params: any) {
    super(...params)
    this.assetTaskGroupIds = assetTaskGroupIds
  }
}

/* asset-task-group-id validate */
export class TeamIdsNotFoundError extends Error {
  teamIds: number[]
  constructor(teamIds: number[], ...params: any) {
    super(...params)
    this.teamIds = teamIds
  }
}

/* task type name validate */
export class TaskTypeNameNotFoundError extends Error {
  taskTypeName: string
  constructor(taskTypeName: string, ...params: any) {
    super(...params)
    this.taskTypeName = taskTypeName
  }
}

/* task type name validate */
export class InvalidTaskTypeNameError extends Error {
  taskTypeName: string
  constructor(taskTypeName: string, ...params: any) {
    super(...params)
    this.taskTypeName = taskTypeName
  }
}

/* operation name validate */
export class OperationNameNotFoundError extends Error {
  operationName: string
  constructor(operationName: string, ...params: any) {
    super(...params)
    this.operationName = operationName
  }
}

/* task execution time validate */
export class TaskExecutionTimeNotFoundError extends Error {
  taskExecutionTime: string
  constructor(taskExecutionTime: string, ...params: any) {
    super(...params)
    this.taskExecutionTime = taskExecutionTime
  }
}

/* operate-user-id validate */
export class UserIdNotFoundError extends Error {
  operateUserId: string
  constructor(operateUserId: string, ...params: any) {
    super(...params)
    this.operateUserId = operateUserId
  }
}

/* asset task group id validate */
export class AssetTaskGroupIdNotFoundError extends Error {
  assetTaskGroupId: number
  constructor(assetTaskGroupId: number, ...params: any) {
    super(...params)
    this.assetTaskGroupId = assetTaskGroupId
  }
}

/* event type id validate */
export class EventTypeIdNotFoundError extends Error {
  eventTypeId: number
  constructor(eventTypeId: number, ...params: any) {
    super(...params)
    this.eventTypeId = eventTypeId
  }
}

/* task type id validate */
export class TaskTypeIdNotFoundError extends Error {
  taskTypeId: number
  constructor(taskTypeId: number, ...params: any) {
    super(...params)
    this.taskTypeId = taskTypeId
  }
}

/* power plant id validate */
export class PowerPlantIdNotFoundError extends Error {
  powerPlantId: string
  constructor(powerPlantId: string, ...params: any) {
    super(...params)
    this.powerPlantId = powerPlantId
  }
}

/* valid-date validate */
export class ValidDateNotFoundError extends Error {
  validDate: Date
  constructor(validDate: Date, ...params: any) {
    super(...params)
    this.validDate = validDate
  }
}

/**
 * This is generic function, used to return reponse body for 404 error code
 * @param error Error instance from the controller
 * @returns the response body for 404 response
 */
export const send404Response: any = (error: Error) => {
  let errorType = ""
  let errorInvalidValues: unknown

  if (error instanceof AssetCodeNotFoundError) {
    errorType = Constants.ERROR_TYPES.NOT_FOUND_ASSET_CODE
    errorInvalidValues = [...error.assetCodes]
  } else if (error instanceof TaskIdsNotFoundError) {
    errorType = Constants.ERROR_TYPES.NOT_FOUND_TASK_ID
    errorInvalidValues = error.taskIds
  } else if (error instanceof TaskForecastIdNotFoundError) {
    errorType = Constants.ERROR_TYPES.NOT_FOUND_TASK_FORECAST_ID
    errorInvalidValues = error.taskForecastId
  } else if (error instanceof EventTemplateIdNotFoundError) {
    errorType = Constants.ERROR_TYPES.NOT_FOUND_EVENT_TEMPLATE_ID_OR_TASK_TYPE_ID
    errorInvalidValues = error.eventTemplateId
  } else if (error instanceof AssetTaskGroupIdNotFoundError) {
    errorType = Constants.ERROR_TYPES.NOT_FOUND_ASSET_TASK_GROUP_ID
    errorInvalidValues = error.assetTaskGroupId
  } else if (error instanceof EventTypeIdNotFoundError) {
    errorType = Constants.ERROR_TYPES.NOT_FOUND_EVENT_TYPE_ID
    errorInvalidValues = error.eventTypeId
  } else if (error instanceof TaskTypeIdNotFoundError) {
    errorType = Constants.ERROR_TYPES.NOT_FOUND_TASK_TYPE_ID
    errorInvalidValues = error.taskTypeId
  } else if (error instanceof PowerPlantIdNotFoundError) {
    errorType = Constants.ERROR_TYPES.NOT_FOUND_POWER_PLANT_ID
    errorInvalidValues = error.powerPlantId
  } else if (error instanceof ValidDateNotFoundError) {
    errorType = Constants.ERROR_TYPES.NOT_FOUND_VALID_DATE
    errorInvalidValues = error.validDate
  } else if (error instanceof RoutineTaskTemplateIdNotFoundError) {
    errorType = Constants.ERROR_TYPES.NOT_FOUND_ROUTINE_TASK_TEMPLATE_ID
    errorInvalidValues = error.routineTaskTemplateId
  } else if (error instanceof SapTaskCategoryIdNotFoundError) {
    errorType = Constants.ERROR_TYPES.NOT_FOUND_SAP_TASK_CATEGORY_ID
    errorInvalidValues = error.sapTaskCategoryId
  } else if (error instanceof OperationEventTypeIdNotFoundError) {
    errorType = Constants.ERROR_TYPES.NOT_FOUND_EVENT_TYPE_ID_OR_OPERATION_ID
    errorInvalidValues = error.operationEventTypeId
  } else if (error instanceof EventTypeIdsNotFoundError) {
    errorType = Constants.ERROR_TYPES.NOT_FOUND_EVENT_TYPE_ID
    errorInvalidValues = error.eventTypeIds
  } else if (error instanceof EventTypeNameNotFoundError) {
    errorType = Constants.ERROR_TYPES.NOT_FOUND_EVENT_TYPE_NAME
    errorInvalidValues = error.eventTypeName
  } else if (error instanceof TaskTypeNameNotFoundError) {
    errorType = Constants.ERROR_TYPES.NOT_FOUND_TASK_TYPE_NAME
    errorInvalidValues = error.taskTypeName
  } else if (error instanceof TaskExecutionTimeNotFoundError) {
    errorType = Constants.ERROR_TYPES.NOT_FOUND_TASK_EXECUTION_TIME
    errorInvalidValues = error.taskExecutionTime
  } else if (error instanceof TaskTypeIdsNotFoundError) {
    errorType = Constants.ERROR_TYPES.NOT_FOUND_TASK_TYPE_ID
    errorInvalidValues = error.taskTypeIds
  } else if (error instanceof UserIdNotFoundError) {
    errorType = Constants.ERROR_TYPES.NOT_FOUND_USER_ID
    errorInvalidValues = error.operateUserId
  } else if (error instanceof OperationIdsNotFoundError) {
    errorType = Constants.ERROR_TYPES.NOT_FOUND_OPERATION_ID
    errorInvalidValues = [...error.operationIds]
  } else if (error instanceof OperationNameNotFoundError) {
    errorType = Constants.ERROR_TYPES.NOT_FOUND_OPERATION_NAME
    errorInvalidValues = error.operationName
  } else if (error instanceof AssetTaskGroupIdsNotFoundError) {
    errorType = Constants.ERROR_TYPES.NOT_FOUND_ASSET_TASK_GROUP_ID
    errorInvalidValues = error.assetTaskGroupIds
  } else if (error instanceof TeamIdsNotFoundError) {
    errorType = Constants.ERROR_TYPES.NOT_FOUND_TEAM_ID
    errorInvalidValues = error.teamIds
  }

  return {
    code: 404,
    body: {
      errors: [
        {
          "error-type": errorType,
          "invalid-values": errorInvalidValues,
        },
      ],
    },
  }
}

/**
 * This is generic function, used to return reponse body for 400 error code
 * @param error Error instance from the controller
 * @returns the response body for 400 response
 */
export const send400Response: any = (error: Error) => {
  let errorType = ""
  let errorInvalidValues: unknown

  if (error instanceof InvalidEventTypeNameError) {
    errorType = Constants.ERROR_TYPES.INVALID_EVENT_TYPE_NAME
    errorInvalidValues = error.eventTypeName
  } else if (error instanceof InvalidTaskTypeNameError) {
    errorType = Constants.ERROR_TYPES.INVALID_TASK_TYPE_NAME
    errorInvalidValues = error.taskTypeName
  } else if (error instanceof EventTypeAttachWithSapError) {
    errorType = Constants.ERROR_TYPES.EVENTTYPE_ATTACH_WITH_SAP
    errorInvalidValues = error.eventTypeId
  } else if (error instanceof InvalidAssetTaskGroupNameError) {
    errorType = Constants.ERROR_TYPES.INVALID_ASSET_TASK_GROUP_NAME
    errorInvalidValues = error.assetTaskGroupName
  }

  return {
    code: 400,
    body: {
      errors: [
        {
          "error-type": errorType,
          "invalid-values": errorInvalidValues,
        },
      ],
    },
  }
}

export const OptionalNumberField = (val: number): number | undefined => {
  return val ? val : undefined
}

export const paggingWrapper = (res: any, page_no: number, page_size: number, key: string): any => {
  const page = page_no
  const limit = page_size
  const startIndex = (page - 1) * limit
  const endIndex = page * limit
  const data = res.slice(startIndex, endIndex)
  return {
    [Constants.FIELDS.TOTAL_PAGES]: Math.ceil(res.length / limit),
    [Constants.FIELDS.CURRENT_PAGE]: page_no,
    [key]: data,
  }
}

//Task  status as per m_task_status table
export enum TASK_STATUS {
  DELETE = 0,
  SIGNUP = 1,
  NOT_STARTED = 2,
  WAITING = 3,
  INPROGRESS = 4,
  COMPLETE = 5,
  COMPLETE_AND_TAKENOVER = 6,
}

//Lock  status for specific task as per t_task table
export enum LOCK_STATUS {
  IS_LOCK = 1,
  IS_NOT_LOCK = 0,
}
//Notification type
export enum NOTIFICATION_TYPE {
  NEW_ASSIGNMENT = "NewAssignment",
  BEFORE_START = "BeforeStart",
}
