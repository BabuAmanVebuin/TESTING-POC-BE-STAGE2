// Initially copied from ToT-BE, commit 545c1dd02ed8df920e315645df162212e80b2a03

/* eslint-disable @typescript-eslint/no-explicit-any */

import { Request } from "express"
import { QueryTypes } from "sequelize"

import {
  getTaskTypeWithTaskCountAPIResponse,
  getEventTypeWithTaskCountRequest,
  TaskCountQueryResponse,
} from "../../../../domain/entities/tot/v1/getEventTypeWithTaskCount.js"
import logger from "../../../../infrastructure/logger.js"
import { sequelize } from "../../../../infrastructure/orm/sqlize/index.js"
import { extractValue, jsonResponse } from "../../../decorators.js"

import {
  consolidatePossibleArray,
  poorlyShapedRequest,
  DateTimeFromString,
  send404Response,
  AssetTaskGroupIdNotFoundError,
} from "./utils.js"

import { Constants } from "../../../../config/constants.js"

const lang = "JA"
/** task audit and category query filter validate function */
const buildTaskAuditCategoryQuery = (input: getEventTypeWithTaskCountRequest): any => {
  logger.info(`input :::: ${JSON.stringify(input)}`)

  const endDateFromFilter = input[Constants.FIELDS.END_DATE_TIME_FROM] ? " AND T.END_DATE_TIME >= :endDateTimeFrom" : ""
  const endDateToFilter = input[Constants.FIELDS.END_DATE_TIME_TO] ? " AND T.END_DATE_TIME <= :endDateTimeTo" : ""

  const taskStatusIdFilter =
    Array.isArray(input[Constants.FIELDS.TASK_STATUS_ID]) && input[Constants.FIELDS.TASK_STATUS_ID]!.length > 0
      ? " AND T.TASK_STATUS_ID IN (:tasksStatusId)"
      : ""

  /** get task category query */
  const getTaskAuditWithTaskQuery = `
        SELECT 
            TT.EVENT_TYPE_ID 'event-type-id',
            TT.EVENT_TYPE_NAME 'event-type-name',
            T.TASK_ID 'task-id',
            T.WORKING_HOURS 'working-hours'
        FROM
            t_task T,
          m_event_type TT
        WHERE T.ASSET_TASK_GROUP_ID= :assetTaskGroupId
          AND TT.EVENT_TYPE_ID = T.EVENT_TYPE_ID
          ${taskStatusIdFilter}
          ${endDateFromFilter}
          ${endDateToFilter}
          GROUP BY TT.EVENT_TYPE_NAME, TT.EVENT_TYPE_ID, T.TASK_STATUS_ID, T.TASK_ID; `
  return getTaskAuditWithTaskQuery
}

/** validate asset-tak-grou-id query */
const validateAssetTaskGroupQuery =
  "SELECT ASSET_TASK_GROUP_ID FROM m_asset_task_group WHERE ASSET_TASK_GROUP_ID=:assetTaskGroupId LIMIT 1"

/** get task category */
const getTaskAuditWithTask = async (
  postValidationInput: getEventTypeWithTaskCountRequest | Record<string, any>,
): Promise<getTaskTypeWithTaskCountAPIResponse> => {
  try {
    const input = postValidationInput as getEventTypeWithTaskCountRequest

    /** validate asset-tak-grou-id query */
    const assetTaskGroupIdResult = await sequelize.query<{
      ASSET_TASK_GROUP_ID: number
    }>(validateAssetTaskGroupQuery, {
      type: QueryTypes.SELECT,
      raw: true,
      replacements: {
        assetTaskGroupId: input[Constants.FIELDS.ASSET_TASK_GROUP_ID],
      },
    })
    if (assetTaskGroupIdResult.length == 0) {
      logger.warn("[getTaskAuditWithTask] Not Found - Asset task group id was not found")
      throw new AssetTaskGroupIdNotFoundError(input[Constants.FIELDS.ASSET_TASK_GROUP_ID]!)
    }

    // convert input['task-status-id'] to an array if it's just a lone number because we'll use an IN filter
    const tasksStatusId: number[] =
      Array.isArray(input[Constants.FIELDS.TASK_STATUS_ID]) && input[Constants.FIELDS.TASK_STATUS_ID]!.length > 0
        ? input[Constants.FIELDS.TASK_STATUS_ID]!
        : []

    /** task audit and category query */
    const taskAuditCategoryQuery = buildTaskAuditCategoryQuery(input)
    const tasksCategorysReport = await sequelize.query<TaskCountQueryResponse>(taskAuditCategoryQuery, {
      type: QueryTypes.SELECT,
      raw: true,
      replacements: {
        lang,
        assetTaskGroupId: input[Constants.FIELDS.ASSET_TASK_GROUP_ID],
        endDateTimeFrom: input[Constants.FIELDS.END_DATE_TIME_FROM],
        endDateTimeTo: input[Constants.FIELDS.END_DATE_TIME_TO],
        tasksStatusId,
      },
    })

    const arrDifferentCategories: any[] = []
    const arrDifferentTasksInCategories: any[] = []

    /**
     * Iterate to the complete dataset, to create 2 different arrays for individual category, and seperate tasks
     */
    tasksCategorysReport.map((objEachDataSet) => {
      const eventTypeName = objEachDataSet[Constants.FIELDS.EVENT_TYPE_NAME]
      const eventTypeId = objEachDataSet[Constants.FIELDS.EVENT_TYPE_ID]

      if (typeof arrDifferentCategories[eventTypeId] === "undefined") {
        arrDifferentCategories[eventTypeId] = {
          "event-type-id": eventTypeId,
          "event-type-name": eventTypeName,
          tasks: [],
        }
      }

      if (typeof arrDifferentTasksInCategories[eventTypeId] === "undefined") {
        arrDifferentTasksInCategories[eventTypeId] = []
      }
      arrDifferentTasksInCategories[eventTypeId].push({
        ...objEachDataSet,
      })
      return {}
    })

    /**
     * Iterate to array for different tasks, to seperate them using task type wise audits
     */
    const mappedTaskAudits: any[] = []
    const mappedTaskDetails: any[] = []
    arrDifferentTasksInCategories.map((arrEachTaskTypeAuditWithTask, eventTypeId) => {
      if (typeof mappedTaskAudits[eventTypeId] === "undefined") {
        mappedTaskAudits[eventTypeId] = []
      }

      if (typeof mappedTaskDetails[eventTypeId] === "undefined") {
        mappedTaskDetails[eventTypeId] = []
      }

      arrEachTaskTypeAuditWithTask.map((objIndividualTask: any) => {
        const thisTaskId = objIndividualTask[Constants.FIELDS.TASK_ID]
        const workingHours = objIndividualTask[Constants.FIELDS.WORKING_HOURS]

        if (typeof mappedTaskAudits[eventTypeId][thisTaskId] === "undefined") {
          mappedTaskAudits[eventTypeId][thisTaskId] = []
        }
        const objToPush = {
          "task-id": thisTaskId,
          "working-hours": workingHours,
        }

        mappedTaskAudits[eventTypeId][thisTaskId].push({ ...objToPush })
      })

      arrEachTaskTypeAuditWithTask.map((objIndividualTask: any) => {
        const thisTaskId = objIndividualTask[Constants.FIELDS.TASK_ID]

        if (typeof mappedTaskDetails[eventTypeId][thisTaskId] === "undefined") {
          const tmpttt = {
            "task-id": objIndividualTask[Constants.FIELDS.TASK_ID],
            workingHoursVal:
              objIndividualTask[Constants.FIELDS.WORKING_HOURS] != null
                ? objIndividualTask[Constants.FIELDS.WORKING_HOURS]
                : "00:00:00",
          }

          mappedTaskDetails[eventTypeId][thisTaskId] = { ...tmpttt }
        }
      })
    })

    /** Creating seperate final response to the output */
    let getTaskAuditWithTaskResponse: any[] = []
    getTaskAuditWithTaskResponse = arrDifferentCategories.map((objTask, eventTypeId) => {
      /** working hours calculation */
      const workingHours = mappedTaskDetails[eventTypeId].filter((n: any) => n)
      let hour: any = 0
      let minute: any = 0
      let second = 0
      workingHours.forEach(function (d: any) {
        hour += parseInt(d.workingHoursVal.split(":")[0])
        minute += parseInt(d.workingHoursVal.split(":")[1])
        second += parseInt(d.workingHoursVal.split(":")[2])
      })
      hour = Math.floor(hour + minute / 60)
      minute = minute % 60
      minute = Math.floor(minute + second / 60)
      second = second % 60

      const tmpObj = {
        "event-type-id": objTask[Constants.FIELDS.EVENT_TYPE_ID],
        "event-type-name": objTask[Constants.FIELDS.EVENT_TYPE_NAME],
        "total-tasks": mappedTaskDetails[eventTypeId].filter((n: any) => n).length,
        "total-working-hours": hour + ":" + minute + ":" + second,
      }
      return tmpObj
    })

    getTaskAuditWithTaskResponse = getTaskAuditWithTaskResponse.filter((n) => n)

    return {
      code: 200,
      body: getTaskAuditWithTaskResponse,
    }
  } catch (err) {
    logger.error(err)
    if (err instanceof AssetTaskGroupIdNotFoundError) {
      return send404Response(err)
    }
    return {
      code: 400,
      body: "Bad Request",
    }
  }
}

/** to chaek task status is array */
const consolidateTaskStatusId = (x: unknown) =>
  consolidatePossibleArray(x) ? consolidatePossibleArray(x).map((y: string) => Number(y)) : x

/* consolidate user request parameter */
export const consolidategetEventTypeWithTaskCountRequest = (
  req: Request,
): getEventTypeWithTaskCountRequest | poorlyShapedRequest => ({
  "asset-task-group-id": Number(req.params.assetTaskGroupId),
  "end-date-time-from": DateTimeFromString(req.query[Constants.FIELDS.END_DATE_TIME_FROM] as string),
  "end-date-time-to": DateTimeFromString(req.query[Constants.FIELDS.END_DATE_TIME_TO] as string),
  "task-status-id": consolidateTaskStatusId(req.query[Constants.FIELDS.TASK_STATUS_ID]),
})

export const getEventTypeWithTaskCountController = jsonResponse(
  extractValue(consolidategetEventTypeWithTaskCountRequest)(getTaskAuditWithTask),
)
