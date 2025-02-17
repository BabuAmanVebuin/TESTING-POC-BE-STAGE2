// Initially copied from ToT-BE, commit 545c1dd02ed8df920e315645df162212e80b2a03

/* eslint-disable @typescript-eslint/no-explicit-any */

import { Request } from "express"
import { QueryTypes } from "sequelize"

import {
  getTaskAuditWithTaskAPIResponse,
  getTaskAuditWithTaskRequest,
  TaskAuditQueryResponse,
  Team,
} from "../../../../domain/entities/tot/v1/getTaskTypeAuditWithTask.js"
import logger from "../../../../infrastructure/logger.js"
import { cmnSequelize, sequelize } from "../../../../infrastructure/orm/sqlize/index.js"
import { extractValue, jsonResponse } from "../../../decorators.js"

import { consolidatePossibleArray, poorlyShapedRequest, DateTimeFromString } from "./utils.js"

import { Constants } from "../../../../config/constants.js"

const lang = "JA"
/** get asset query */
const assetQuery = `SELECT
  ASSET_ID 'asset-id',
  ASSET_NAME 'asset-name',
  ASSET_CODE 'asset-code'
  FROM
  m_asset
  WHERE
  ASSET_ID IN (:assetId)`
const getAssetData = (assetResult: any, value: any) => {
  const commonAssetResult: any = assetResult.find((valueAsset: any) => {
    return valueAsset[Constants.FIELDS.ASSET_ID] == value[Constants.FIELDS.ASSET_ID]
  })
  if (commonAssetResult) {
    value[Constants.FIELDS.ASSET_NAME] = commonAssetResult[Constants.FIELDS.ASSET_NAME]
    value[Constants.FIELDS.ASSET_CODE] = commonAssetResult[Constants.FIELDS.ASSET_CODE]
  } else {
    value[Constants.FIELDS.ASSET_NAME] = ""
    value[Constants.FIELDS.ASSET_CODE] = ""
  }
  return value
}

/** task audit and category query filter validate function */
const buildTaskAuditCategoryQuery = (input: getTaskAuditWithTaskRequest): any => {
  const startDateFilter = input[Constants.FIELDS.AUDIT_START_DATE_TIME]
    ? " AND TA.OPERATE_TIMESTAMP >= :startDateTime"
    : ""
  const endDateFilter = input[Constants.FIELDS.AUDIT_START_DATE_TIME] ? " AND TA.OPERATE_TIMESTAMP <= :endDateTime" : ""

  const plannedDateTimeFromFilter = input[Constants.FIELDS.PLANNED_DATE_TIME_FROM]
    ? " AND T.PLANNED_DATE_TIME >= :plannedDateTimeFrom"
    : ""

  const plannedDateTimeToFilter = input[Constants.FIELDS.PLANNED_DATE_TIME_TO]
    ? " AND T.PLANNED_DATE_TIME <= :plannedDateTimeTo"
    : ""
  logger.info("AND T.PLANNED_DATE_TIME <= :plannedDateTimeTo")
  const taskStatusIdFilter =
    Array.isArray(input[Constants.FIELDS.TASK_STATUS_ID]) && input[Constants.FIELDS.TASK_STATUS_ID]!.length > 0
      ? " AND T.TASK_STATUS_ID IN (:tasksStatusId)"
      : ""

  /** get task category query */
  const getTaskAuditWithTaskQuery = `
        SELECT 
            TT.TASK_TYPE_ID 'task-type-id',
            TT.TASK_TYPE_NAME 'task-type-name',
            TT.TASK_EXECUTION_TIME 'task-execution-time',
            TA2.TASK_ID 'task-id',
            T.TASK_STATUS_ID 'task-status',
            TA2.TASK_AUDIT_ID 'task-audit-id',
            TA2.TASK_ID 'task-id',
            TA2.PRE_TASK_STATUS_ID 'pre-task-status-id',
            TA2.POST_TASK_STATUS_ID 'post-task-status-id',
            TA2.TEAM_ID 'team-id',
            TA2.OPERATE_USER_ID 'operate-user-id',
            TA2.OPERATE_TIMESTAMP 'operate-timestamp',
            T.TASK_ID 'task-id',
            T.PLANT_ID 'power-plant-id',
            T.ASSET_TASK_GROUP_ID 'asset-task-group-id',
            T9.ASSET_TASK_GROUP_NAME 'asset-task-group-name',
            T.TASK_TYPE_ID 'task-type-id',
            TT.TASK_CATEGORY_ID 'task-category-id',
            TT.TASK_CATEGORY_NAME 'task-category-name',
            T.TASK_NAME 'task-name',
            T.ASSET_ID 'asset-id',
            T.PLANNED_DATE_TIME 'planned-date-time',
            T.TASK_PRIORITY_ID 'task-priority-id',
            T4.TASK_PRIORITY_NAME 'task-priority-name',
            T.DUE_DATE_TIME 'due-date-time',
            T.START_DATE_TIME 'start-date-time',
            T.END_DATE_TIME 'end-date-time',
            T.WORKING_HOURS 'working-hours',
            T.ESTIMATED_TASK_TIME 'estimated-task-time',
            T.TASK_STATUS_ID 'task-status-id',
            T6.TASK_STATUS_NAME 'task-status-name',
            T.TAKEOVER_TEAM_ID 'takeover-team-id',
            T5.TEAM_NAME 'takeover-team-name',
            T.REMARKS 'remarks',
            T.ORDER_ID 'order-id',
            T.EVENT_ID 'event-id',
            T.EVENT_TYPE_ID 'event-type-id',
            T.EVENT_NAME 'event-name',
            T.CREATE_TIMESTAMP 'create-timestamp',
            T.CREATE_USER_ID 'create-user-id',
            T.UPDATE_TIMESTAMP 'update-timestamp',
            T.UPDATE_USER_ID 'update-user-id',
            (
            (
                SELECT COUNT(*)
                FROM t_chain_memo T7
                WHERE T.TASK_ID = T7.TASK_ID
            ) > 0
            ) AS 'is-chain-memo-available'
        FROM
            t_task T
                LEFT JOIN
                    t_task_audit TA2 ON T.TASK_ID = TA2.TASK_ID AND TA2.TEAM_ID = :teamId
                LEFT OUTER JOIN
                    m_task_priority T4 ON T.TASK_PRIORITY_ID = T4.TASK_PRIORITY_ID AND T4.LANG = :lang
                LEFT OUTER JOIN
                    m_team T5 ON T.TAKEOVER_TEAM_ID = T5.TEAM_ID
                INNER JOIN
                    m_task_status T6 ON T.TASK_STATUS_ID = T6.TASK_STATUS_ID AND T6.LANG = :lang
                INNER JOIN
                    (
                      SELECT
                        ASSET_TASK_GROUP_ID,
                        PLANT_ID,
                        ASSET_TASK_GROUP_NAME
                      FROM
                        m_asset_task_group
                      GROUP BY
                        ASSET_TASK_GROUP_ID,
                        PLANT_ID,
                        ASSET_TASK_GROUP_NAME
                    ) T9 ON T.ASSET_TASK_GROUP_ID = T9.ASSET_TASK_GROUP_ID AND T.PLANT_ID = T9.PLANT_ID,
          t_task_audit TA,
          m_task_type TT
        WHERE
          TA.TASK_ID = T.TASK_ID
              AND TT.TASK_TYPE_ID = T.TASK_TYPE_ID
              AND TA.TEAM_ID = :teamId
              ${taskStatusIdFilter}
              ${startDateFilter}
              ${endDateFilter}
              ${plannedDateTimeFromFilter}
              ${plannedDateTimeToFilter}
        GROUP BY TA2.TASK_AUDIT_ID , TT.TASK_TYPE_NAME, TT.TASK_TYPE_ID, T.TASK_STATUS_ID, TT.TASK_EXECUTION_TIME, T.TASK_ID, T9.ASSET_TASK_GROUP_NAME, TT.TASK_CATEGORY_ID, TT.TASK_CATEGORY_NAME; `
  return getTaskAuditWithTaskQuery
}

/** team query to check team id validate */
const teamQuery = `SELECT TEAM_ID from m_team where TEAM_ID=:teamId`

/** get task category */
const getTaskAuditWithTask = async (
  postValidationInput: getTaskAuditWithTaskRequest | Record<string, any>,
): Promise<getTaskAuditWithTaskAPIResponse> => {
  try {
    const input = postValidationInput as getTaskAuditWithTaskRequest
    // convert input['task-status-id'] to an array if it's just a lone number because we'll use an IN filter
    const tasksStatusId: number[] =
      Array.isArray(input[Constants.FIELDS.TASK_STATUS_ID]) && input[Constants.FIELDS.TASK_STATUS_ID]!.length > 0
        ? input[Constants.FIELDS.TASK_STATUS_ID]!
        : []

    const teamData = await sequelize.query<Team>(teamQuery, {
      type: QueryTypes.SELECT,
      raw: true,
      replacements: {
        lang,
        teamId: input[Constants.FIELDS.TEAM_ID],
      },
    })
    if (teamData.length == 0) {
      logger.warn("[getTaskAuditWithTask] Not Found - Team id was not found")
      return {
        code: 404,
        body: "Not Found - Team id was not found",
      }
    }

    /** task audit and category query */
    const taskAuditCategoryQuery = buildTaskAuditCategoryQuery(input)
    const tasksCategorysReport = await sequelize.query<TaskAuditQueryResponse>(taskAuditCategoryQuery, {
      type: QueryTypes.SELECT,
      raw: true,
      replacements: {
        lang,
        teamId: input[Constants.FIELDS.TEAM_ID],
        startDateTime: input[Constants.FIELDS.AUDIT_START_DATE_TIME],
        endDateTime: input[Constants.FIELDS.AUDIT_END_DATE_TIME],
        plannedDateTimeTo: input[Constants.FIELDS.PLANNED_DATE_TIME_TO],
        plannedDateTimeFrom: input[Constants.FIELDS.PLANNED_DATE_TIME_FROM],
        tasksStatusId,
      },
    })
    //when task is not available
    if (tasksCategorysReport.length > 0) {
      let assetIdResult: any = tasksCategorysReport.map((task: any) => {
        return task[Constants.FIELDS.ASSET_ID]
      })
      assetIdResult = assetIdResult.filter((x: any, i: any, a: any) => a.indexOf(x) === i)
      const assetResult = await cmnSequelize.query<any>(assetQuery, {
        type: QueryTypes.SELECT,
        raw: true,
        replacements: { assetId: assetIdResult },
      })

      tasksCategorysReport.map((value: any) => {
        getAssetData(assetResult, value)
      })
    }

    const arrDifferentCategories: any[] = []
    const arrDifferentTasksInCategories: any[] = []

    /**
     * Iterate to the complete dataset, to create 2 different arrays for individual category, and seperate tasks
     */
    tasksCategorysReport.map((objEachDataSet: any) => {
      const taskTypeName = objEachDataSet[Constants.FIELDS.TASK_TYPE_NAME]
      const tastTypeId = objEachDataSet[Constants.FIELDS.TASK_TYPE_ID]
      const taskExecutionTime = objEachDataSet[Constants.FIELDS.TASK_EXECUTION_TIME]

      if (typeof arrDifferentCategories[tastTypeId] === "undefined") {
        arrDifferentCategories[tastTypeId] = {
          "task-type-id": tastTypeId,
          "task-type-name": taskTypeName,
          "task-execution-time": taskExecutionTime,
          tasks: [],
        }
      }

      if (typeof arrDifferentTasksInCategories[tastTypeId] === "undefined") {
        arrDifferentTasksInCategories[tastTypeId] = []
      }
      arrDifferentTasksInCategories[tastTypeId].push({
        ...objEachDataSet,
      })
      return {}
    })

    /**
     * Iterate to array for different tasks, to seperate them using task type wise audits
     */
    const mappedTaskAudits: any[] = []
    const mappedTaskDetails: any[] = []
    arrDifferentTasksInCategories.map((arrEachTaskTypeAuditWithTask, taskTypeId) => {
      if (typeof mappedTaskAudits[taskTypeId] === "undefined") {
        mappedTaskAudits[taskTypeId] = []
      }

      if (typeof mappedTaskDetails[taskTypeId] === "undefined") {
        mappedTaskDetails[taskTypeId] = []
      }

      arrEachTaskTypeAuditWithTask.map((objIndividualTask: any) => {
        const thisTaskId = objIndividualTask[Constants.FIELDS.TASK_ID]
        const taskAuditId = objIndividualTask[Constants.FIELDS.TASK_AUDIT_ID]
        const preTaskStatusId = objIndividualTask[Constants.FIELDS.PRE_TASK_STATUS_ID]
        const postTaskStatusId = objIndividualTask[Constants.FIELDS.POST_TASK_STATUS_ID]
        const teamId = objIndividualTask[Constants.FIELDS.TEAM_ID]
        const operateUserId = objIndividualTask[Constants.FIELDS.OPERATE_USER_ID]
        const operateTimestamp = objIndividualTask[Constants.FIELDS.OPERATE_TIMESTAMP]

        if (typeof mappedTaskAudits[taskTypeId][thisTaskId] === "undefined") {
          mappedTaskAudits[taskTypeId][thisTaskId] = []
        }
        const objToPush = {
          "task-audit-id": taskAuditId,
          "task-id": thisTaskId,
          "pre-task-status-id": preTaskStatusId,
          "post-task-status-id": postTaskStatusId,
          "team-id": teamId,
          "operate-user-id": operateUserId,
          "operate-timestamp": operateTimestamp,
        }

        mappedTaskAudits[taskTypeId][thisTaskId].push({ ...objToPush })
      })

      arrEachTaskTypeAuditWithTask.map((objIndividualTask: any) => {
        const thisTaskId = objIndividualTask[Constants.FIELDS.TASK_ID]

        if (typeof mappedTaskDetails[taskTypeId][thisTaskId] === "undefined") {
          const tmpttt = {
            "task-id": objIndividualTask[Constants.FIELDS.TASK_ID],
            "power-plant-id": objIndividualTask[Constants.FIELDS.POWER_PLANT_ID],
            "asset-task-group-id": objIndividualTask[Constants.FIELDS.ASSET_TASK_GROUP_ID],
            "task-type-id": objIndividualTask[Constants.FIELDS.TASK_TYPE_ID],
            "task-type-name": objIndividualTask[Constants.FIELDS.TASK_TYPE_NAME],
            "task-category-id": objIndividualTask[Constants.FIELDS.TASK_CATEGORY_ID],
            "task-category-name": objIndividualTask[Constants.FIELDS.TASK_CATEGORY_NAME],
            "task-name": objIndividualTask[Constants.FIELDS.TASK_NAME],
            "asset-id": objIndividualTask[Constants.FIELDS.ASSET_ID],
            "asset-name": objIndividualTask[Constants.FIELDS.ASSET_NAME],
            "asset-code": objIndividualTask[Constants.FIELDS.ASSET_CODE],
            "planned-date-time": objIndividualTask[Constants.FIELDS.PLANNED_DATE_TIME],
            "task-priority-id": objIndividualTask[Constants.FIELDS.TASK_PRIORITY_ID],
            "task-priority-name": objIndividualTask[Constants.FIELDS.TASK_PRIORITY_NAME],
            "due-date-time": objIndividualTask[Constants.FIELDS.DUE_DATE_TIME],
            "start-date-time": objIndividualTask[Constants.FIELDS.START_DATE_TIME],
            "end-date-time": objIndividualTask[Constants.FIELDS.END_DATE_TIME],
            "working-hours": objIndividualTask[Constants.FIELDS.WORKING_HOURS],
            "estimated-task-time": objIndividualTask[Constants.FIELDS.ESTIMATED_TASK_TIME],
            "task-status-id": objIndividualTask[Constants.FIELDS.TASK_STATUS_ID],
            "task-status-name": objIndividualTask[Constants.FIELDS.TASK_STATUS_NAME],
            "takeover-team-id": objIndividualTask[Constants.FIELDS.TAKEOVER_TEAM_ID],
            "takeover-team-name": objIndividualTask[Constants.FIELDS.TAKEOVER_TEAM_NAME],
            remarks: objIndividualTask[Constants.FIELDS.REMARKS],
            "order-id": objIndividualTask[Constants.FIELDS.ORDER_ID],
            "event-id": objIndividualTask[Constants.FIELDS.EVENT_ID],
            "event-name": objIndividualTask[Constants.FIELDS.EVENT_NAME],
            "event-type-id": objIndividualTask[Constants.FIELDS.EVENT_TYPE_ID],
            "create-timestamp": objIndividualTask[Constants.FIELDS.CREATE_TIMESTAMP],
            "create-user-id": objIndividualTask[Constants.FIELDS.CREATED_USER_ID],
            "update-timestamp": objIndividualTask[Constants.FIELDS.UPDATE_TIMESTAMP],
            "update-user-id": objIndividualTask[Constants.FIELDS.UPDATED_USER_ID],
            "is-chain-memo-available": objIndividualTask[Constants.FIELDS.IS_CHAIN_MEMO_AVAILABLE],
            "task-audits": mappedTaskAudits[taskTypeId][thisTaskId],
          }

          mappedTaskDetails[taskTypeId][thisTaskId] = { ...tmpttt }
        }
      })
    })

    /** Creating seperate final response to the output */
    let getTaskAuditWithTaskResponse: any[] = []
    getTaskAuditWithTaskResponse = arrDifferentCategories.map((objTask, taskTypeId) => {
      const tmpObj = {
        "task-type-id": objTask[Constants.FIELDS.TASK_TYPE_ID],
        "task-type-name": objTask[Constants.FIELDS.TASK_TYPE_NAME],
        "task-execution-time": objTask[Constants.FIELDS.TASK_EXECUTION_TIME],
        tasks: mappedTaskDetails[taskTypeId],
      }
      return tmpObj
    })

    getTaskAuditWithTaskResponse = getTaskAuditWithTaskResponse.filter((n) => n)
    getTaskAuditWithTaskResponse = getTaskAuditWithTaskResponse.map((t1) => {
      const tmpdd = { ...t1 }

      tmpdd.tasks = t1.tasks.filter((n: any) => n)

      return tmpdd
    })
    return {
      code: 200,
      body: getTaskAuditWithTaskResponse,
    }
  } catch (err) {
    logger.error(err)
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
export const consolidategetTaskTypeAuditWithTaskRequest = (
  req: Request,
): getTaskAuditWithTaskRequest | poorlyShapedRequest => ({
  "audit-start-date-time": DateTimeFromString(req.query[Constants.FIELDS.AUDIT_START_DATE_TIME] as string),
  "audit-end-date-time": DateTimeFromString(req.query[Constants.FIELDS.AUDIT_END_DATE_TIME] as string),
  "planned-date-time-to": DateTimeFromString(req.query[Constants.FIELDS.PLANNED_DATE_TIME_TO] as string),
  "planned-date-time-from": DateTimeFromString(req.query[Constants.FIELDS.PLANNED_DATE_TIME_FROM] as string),
  "team-id": Number(req.query[Constants.FIELDS.TEAM_ID]),
  "task-status-id": consolidateTaskStatusId(req.query[Constants.FIELDS.TASK_STATUS_ID]),
})

export const getTaskTypeAuditWithTaskController = jsonResponse(
  extractValue(consolidategetTaskTypeAuditWithTaskRequest)(getTaskAuditWithTask),
)
