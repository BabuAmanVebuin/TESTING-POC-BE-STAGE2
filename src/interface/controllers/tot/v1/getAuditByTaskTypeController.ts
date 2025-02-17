// Initially copied from ToT-BE, commit 545c1dd02ed8df920e315645df162212e80b2a03

/* eslint-disable @typescript-eslint/no-explicit-any */

import { Request } from "express"
import { QueryTypes } from "sequelize"

import {
  getTaskCategoryAPIResponse,
  getTaskCategoryRequest,
  TaskAuditQueryResponse,
  Team,
} from "../../../../domain/entities/tot/v1/getAuditByTaskType.js"
import logger from "../../../../infrastructure/logger.js"
import { sequelize } from "../../../../infrastructure/orm/sqlize/index.js"
import { extractValue, jsonResponse } from "../../../decorators.js"

import { consolidatePossibleArray, poorlyShapedRequest, DateTimeFromString } from "./utils.js"
import { Constants } from "../../../../config/constants.js"
const lang = "JA"
/** task audit and category query filter validate function */
const buildTaskAuditCategoryQuery = (input: getTaskCategoryRequest): any => {
  try {
    const startDateFilter = input[Constants.FIELDS.AUDIT_START_DATE_TIME]
      ? " AND TA.OPERATE_TIMESTAMP >= :startDateTime"
      : ""
    logger.info("AND TA.OPERATE_TIMESTAMP >= :startDateTime")
    const endDateFilter = input[Constants.FIELDS.AUDIT_END_DATE_TIME] ? " AND TA.OPERATE_TIMESTAMP <= :endDateTime" : ""
    logger.info("AND TA.OPERATE_TIMESTAMP <= :endDateTime")
    const taskStatusIdFilter =
      Array.isArray(input[Constants.FIELDS.TASK_STATUS_ID]) && input[Constants.FIELDS.TASK_STATUS_ID]!.length > 0
        ? " AND T.TASK_STATUS_ID IN (:tasksStatusId)"
        : ""
    logger.info("AND T.TASK_STATUS_ID IN (:tasksStatusId)")
    /** get task category query */
    const getTaskCategoryQuery = `
        SELECT 
            TT.TASK_TYPE_ID 'task-type-id',
            TT.TASK_TYPE_NAME 'task-type-name',
            TT.TASK_CATEGORY_ID 'task-category-id',
            TT.TASK_CATEGORY_NAME 'task-category-name',
            TA2.TASK_ID 'task-id',
            T.TASK_STATUS_ID 'task-status',
            TA2.TASK_AUDIT_ID 'task-audit-id',
            TA2.TASK_ID 'task-id',
            TA2.PRE_TASK_STATUS_ID 'pre-task-status-id',
            TA2.POST_TASK_STATUS_ID 'post-task-status-id',
            TA2.TEAM_ID 'team-id',
            TA2.OPERATE_USER_ID 'operate-user-id',
            TA2.OPERATE_TIMESTAMP 'operate-timestamp'
        FROM
          t_task T
              LEFT JOIN
          t_task_audit TA2 ON T.TASK_ID = TA2.TASK_ID,
          t_task_audit TA,
          m_task_type TT
        WHERE
          TA.TASK_ID = T.TASK_ID
              AND TT.TASK_TYPE_ID = T.TASK_TYPE_ID
              AND TA.TEAM_ID = :teamId
              ${taskStatusIdFilter}
              ${startDateFilter}
              ${endDateFilter}
        GROUP BY TA2.TASK_AUDIT_ID , TT.TASK_TYPE_NAME, TT.TASK_TYPE_ID,TT.TASK_CATEGORY_NAME, TT.TASK_CATEGORY_ID, T.TASK_STATUS_ID; `
    return getTaskCategoryQuery
  } catch (err) {
    logger.error(err)
  }
}

/** team query to check team id validate */
const teamQuery = `SELECT TEAM_ID from m_team where TEAM_ID=:teamId`

/** get task category */
const getTaskCategory = async (
  postValidationInput: getTaskCategoryRequest | Record<string, any>,
): Promise<getTaskCategoryAPIResponse> => {
  try {
    const input = postValidationInput as getTaskCategoryRequest
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
      logger.warn("[getTaskCategory] Not Found - Team id was not found")
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
        tasksStatusId,
      },
    })

    const arrDifferentCategories: any[] = []
    const arrDifferentTasksInCategories: any[] = []

    /**
     * Iterate to the complete dataset, to create 2 different arrays for individual category, and seperate tasks
     */
    tasksCategorysReport.map((objEachDataSet) => {
      const taskTypeName = objEachDataSet["task-type-name"]
      const tastTypeId = objEachDataSet["task-type-id"]
      const taskCategoryName = objEachDataSet["task-category-name"]
      const tastCategoryId = objEachDataSet["task-category-id"]

      if (typeof arrDifferentCategories[tastTypeId] === "undefined") {
        arrDifferentCategories[tastTypeId] = {
          "task-type-id": tastTypeId,
          "task-type-name": taskTypeName,
          "task-category-id": tastCategoryId,
          "task-category-name": taskCategoryName,
          audits: [],
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
    let mappedTaskAudits: any[] = []
    arrDifferentTasksInCategories.map((arrEachTaskInCategory, taskId) => {
      if (typeof mappedTaskAudits[taskId] === "undefined") {
        mappedTaskAudits[taskId] = []
      }
      arrEachTaskInCategory.map((objIndividualTask: any) => {
        const thisTaskId = objIndividualTask["task-id"]
        const taskAuditId = objIndividualTask["task-audit-id"]
        const preTaskStatusId = objIndividualTask["pre-task-status-id"]
        const postTaskStatusId = objIndividualTask["post-task-status-id"]
        const teamId = objIndividualTask["team-id"]
        const operateUserId = objIndividualTask["operate-user-id"]
        const operateTimestamp = objIndividualTask["operate-timestamp"]

        if (typeof mappedTaskAudits[taskId][thisTaskId] === "undefined") {
          mappedTaskAudits[taskId][thisTaskId] = []
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

        mappedTaskAudits[taskId][thisTaskId].push({ ...objToPush })
      })
    })

    /** removing null elements from array */
    mappedTaskAudits = mappedTaskAudits.map((arrIndividualTask) => {
      return arrIndividualTask.filter((n: any) => n)
    })

    /** Creating seperate final response to the output */
    let getTaskCategoryResponse: any[] = []
    getTaskCategoryResponse = arrDifferentCategories.map((objTask, taskId) => {
      const tmpObj = {
        "task-type-id": objTask["task-type-id"],
        "task-type-name": objTask["task-type-name"],
        "task-category-id": objTask["task-category-id"],
        "task-category-name": objTask["task-category-name"],
        audits: mappedTaskAudits[taskId].map((objEachTaskGroup: any) => {
          return {
            "task-audits": [...objEachTaskGroup],
          }
        }),
      }
      return tmpObj
    })

    /** removing null elements from final array */
    getTaskCategoryResponse = getTaskCategoryResponse.filter((n: any) => n)

    return {
      code: 200,
      body: getTaskCategoryResponse,
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
export const consolidategetTaskTypeAuditRequest = (req: Request): getTaskCategoryRequest | poorlyShapedRequest => ({
  "audit-start-date-time": DateTimeFromString(req.query[Constants.FIELDS.AUDIT_START_DATE_TIME] as string),
  "audit-end-date-time": DateTimeFromString(req.query[Constants.FIELDS.AUDIT_END_DATE_TIME] as string),
  "team-id": Number(req.query[Constants.FIELDS.TEAM_ID]),
  "task-status-id": consolidateTaskStatusId(req.query[Constants.FIELDS.TASK_STATUS_ID]),
})

export const getTaskTypeAuditController = jsonResponse(
  extractValue(consolidategetTaskTypeAuditRequest)(getTaskCategory),
)
