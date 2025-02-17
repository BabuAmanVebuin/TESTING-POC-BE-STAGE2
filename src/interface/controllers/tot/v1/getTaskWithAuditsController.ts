// Initially copied from ToT-BE, commit 545c1dd02ed8df920e315645df162212e80b2a03
/* eslint-disable @typescript-eslint/no-explicit-any */

import { Request } from "express"
import { QueryTypes, Transaction } from "sequelize"

import {
  getTaskWithAuditsAPIResponse,
  getTaskAuditWithTaskRequest,
  TaskAuditQueryResponse,
  Team,
  AssigneeData,
} from "../../../../domain/entities/tot/v1/getTaskWithAudits.js"
import logger from "../../../../infrastructure/logger.js"
import { cmnSequelize, sequelize, wrapInTransaction } from "../../../../infrastructure/orm/sqlize/index.js"
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
/** get assignee function */
const getAssignees = async (transaction: Transaction, taskId: string[], teamId?: string): Promise<AssigneeData[]> => {
  if (taskId.length == 0) return []
  const teamIdFromFilter = teamId ? " AND T2.TEAM_ID = :teamId" : ""

  const assigneeQuery = `SELECT
        T1.USER_ID 'user-id',
        T1.TASK_ID 'task-id',
        T2.USER_NAME 'user-name',
        T2.TEAM_ID 'team-id'
      FROM
        t_task_assignee T1
        JOIN m_user_tot T2 ON T1.USER_ID = T2.USER_ID
      WHERE T1.TASK_ID IN (:taskId)
      ${teamIdFromFilter}
      ORDER BY T2.USER_NAME ASC;`

  return sequelize.query<AssigneeData>(assigneeQuery, {
    raw: true,
    type: QueryTypes.SELECT,
    replacements: { taskId, teamId },
    transaction,
  })
}

/** build query for tasks with audit with query filter validate function */
const buildTaskWithAuditsQuery = (input: getTaskAuditWithTaskRequest): any => {
  const taskStatusIdFilter =
    Array.isArray(input[Constants.FIELDS.TASK_STATUS_ID]) && input[Constants.FIELDS.TASK_STATUS_ID]!.length > 0
      ? " AND T.TASK_STATUS_ID IN (:tasksStatusId)"
      : ""

  const plantIdFromFilter = input[Constants.FIELDS.POWER_PLANT_ID] ? " AND T.PLANT_ID = :powerPlantId" : ""

  const teamIdFromFilter = input[Constants.FIELDS.TEAM_ID] ? " AND TA.TEAM_ID = :teamId AND UT.TEAM_ID = :teamId " : ""

  // const leftJointeamIdFromFilter = input[Constants.FIELDS.TEAM_ID]
  //   ? ' AND TA2.TEAM_ID = :teamId'
  //   : ''

  const assetTaskGroupIdFromFilter = input[Constants.FIELDS.ASSET_TASK_GROUP_ID]
    ? " AND T.ASSET_TASK_GROUP_ID = :assetTaskGroupId"
    : ""
  /** get task with audits query building */
  const getGetTaskWithAuditsControllerQuery = `SELECT 
                            T.TASK_ID 'task-id', 
                            T.PLANNED_DATE_TIME 'planned-date-time', 
                            T.DUE_DATE_TIME 'due-date-time', 
                            TT.TASK_TYPE_ID 'task-type-id', 
                            TT.TASK_TYPE_NAME 'task-type-name', 
                            TT.TASK_EXECUTION_TIME 'task-execution-time', 
                            T.TASK_STATUS_ID 'task-status', 
                            TA2.TASK_AUDIT_ID 'task-audit-id', 
                            TA2.PRE_TASK_STATUS_ID 'pre-task-status-id', 
                            TA2.POST_TASK_STATUS_ID 'post-task-status-id', 
                            TA2.TEAM_ID 'team-id', 
                            TA2.OPERATE_USER_ID 'operate-user-id', 
                            TA2.OPERATE_TIMESTAMP 'operate-timestamp', 
                            T.PLANT_ID 'power-plant-id', 
                            T.ASSET_TASK_GROUP_ID 'asset-task-group-id', 
                            T9.ASSET_TASK_GROUP_NAME 'asset-task-group-name', 
                            T.TASK_TYPE_ID 'task-type-id', 
                            TT.TASK_CATEGORY_ID 'task-category-id', 
                            TT.TASK_CATEGORY_NAME 'task-category-name', 
                            T.TASK_NAME 'task-name', 
                            T.ASSET_ID 'asset-id',
                            T.TASK_PRIORITY_ID 'task-priority-id', 
                            T4.TASK_PRIORITY_NAME 'task-priority-name', 
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
                            T.IS_LOCK 'is-lock',
                            (
                              (
                                SELECT 
                                  COUNT(*) 
                                FROM 
                                  t_chain_memo T7 
                                WHERE 
                                  T.TASK_ID = T7.TASK_ID
                              ) > 0
                            ) AS 'is-chain-memo-available' 
                          FROM 
                            t_task T 
                            LEFT JOIN t_task_audit TA2 ON T.TASK_ID = TA2.TASK_ID 
                            AND TA2.TEAM_ID = :teamId 
 
                            LEFT OUTER JOIN m_task_priority T4 ON T.TASK_PRIORITY_ID = T4.TASK_PRIORITY_ID 
                            AND T4.LANG = 'JA' 
                            LEFT OUTER JOIN m_team T5 ON T.TAKEOVER_TEAM_ID = T5.TEAM_ID 
                            INNER JOIN m_task_status T6 ON T.TASK_STATUS_ID = T6.TASK_STATUS_ID 
                            AND T6.LANG = 'JA' 
                            INNER JOIN (
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
                            ) T9 ON T.ASSET_TASK_GROUP_ID = T9.ASSET_TASK_GROUP_ID 
                            AND T.PLANT_ID = T9.PLANT_ID, 
                            t_task_audit TA, 
                            m_task_type TT, 
                            m_user_tot UT 
                          WHERE 
                            TA.TASK_ID = T.TASK_ID 
                            AND TT.TASK_TYPE_ID = T.TASK_TYPE_ID 
                            AND UT.TEAM_ID = TA.TEAM_ID 
                            ${teamIdFromFilter}
                            ${taskStatusIdFilter}
                            AND (
                              (
                                T.TASK_ID IN (
                                  SELECT 
                                    TA5.TASK_ID 
                                  FROM 
                                    t_task_audit AS TA5 
                                  WHERE 
                                    TA5.OPERATE_TIMESTAMP BETWEEN :plannedDateTime
                                    AND :dueDateTime
                                    AND 
                                    (
                                      (TIME(TA5.OPERATE_TIMESTAMP) BETWEEN :plannedTime AND :dueTime)     
                                      OR ( TIME(TA5.OPERATE_TIMESTAMP) > :plannedTime OR TIME(TA5.OPERATE_TIMESTAMP) < :dueTime) 
                                    )
                                )
                              ) 
                              OR (
                                (
                                  T.PLANNED_DATE_TIME BETWEEN :plannedDateTime
                                  AND :dueDateTime
                                  OR T.DUE_DATE_TIME BETWEEN :plannedDateTime
                                  AND :dueDateTime
                                ) 
                                OR (
                                  T.PLANNED_DATE_TIME <= :plannedDateTime
                                  AND T.DUE_DATE_TIME >= :dueDateTime
                                ) 
                                OR (
                                  T.PLANNED_DATE_TIME BETWEEN :plannedDateTime
                                  AND :dueDateTime
                                  AND T.DUE_DATE_TIME IS NULL
                                ) 
                                OR (
                                  T.PLANNED_DATE_TIME IS NULL 
                                  AND T.DUE_DATE_TIME BETWEEN :plannedDateTime
                                  AND :dueDateTime
                                ) 
                                OR (
                                  T.DUE_DATE_TIME IS NULL 
                                  AND T.PLANNED_DATE_TIME IS NULL
                                )
                              )
                                AND (
                              (
                                TIME(T.PLANNED_DATE_TIME) BETWEEN :plannedTime
                                AND :dueTime
                              ) 
                              OR (
                                TIME(T.PLANNED_DATE_TIME) BETWEEN '00:00:00' 
                                AND '00:00:00'
                              ) 
                              OR (
                                TIME(T.PLANNED_DATE_TIME) > :plannedTime
                                OR TIME(T.PLANNED_DATE_TIME) < :dueTime
                              ) 
                              OR (
                                TIME(T.DUE_DATE_TIME) BETWEEN :plannedTime
                                AND :dueTime
                              ) 
                              OR (
                                TIME(T.DUE_DATE_TIME) BETWEEN '00:00:00' 
                                AND '00:00:00'
                              ) 
                              OR (
                                TIME(T.DUE_DATE_TIME) > :plannedTime
                                OR TIME(T.DUE_DATE_TIME) < :dueTime
                              )
                            OR (
                                  T.DUE_DATE_TIME IS NULL 
                                  AND T.PLANNED_DATE_TIME IS NULL
                                )
                            ) 
                            ) 
                            ${plantIdFromFilter}
                            ${assetTaskGroupIdFromFilter}
                          GROUP BY 
                            T.TASK_ID, 
                            TA2.TASK_AUDIT_ID, 
                            TT.TASK_TYPE_NAME, 
                            TT.TASK_TYPE_ID, 
                            T.TASK_STATUS_ID, 
                            TT.TASK_EXECUTION_TIME, 
                            T9.ASSET_TASK_GROUP_NAME, 
                            TT.TASK_CATEGORY_ID, 
                            TT.TASK_CATEGORY_NAME;
                          `
  return getGetTaskWithAuditsControllerQuery
}

/** team query to check team id validate */
const teamQuery = `SELECT TEAM_ID from m_team where TEAM_ID=:teamId`

/**
 * This function executes after all the validation and make calls to database for fetching the dataset for task and audits
 * @param postValidationInput Entity type check
 * @returns getTaskWithAuditAPIResponse
 */
const getGetTaskWithAudits = async (
  postValidationInput: getTaskAuditWithTaskRequest | Record<string, any>,
): Promise<getTaskWithAuditsAPIResponse> => {
  try {
    // Start database transaction
    const result = await wrapInTransaction(async (transaction: Transaction) => {
      const input = postValidationInput as getTaskAuditWithTaskRequest
      // convert input['task-status-id'] to an array if it's just a lone number because we'll use an IN filter
      const tasksStatusId: number[] | null =
        Array.isArray(input[Constants.FIELDS.TASK_STATUS_ID]!) && input[Constants.FIELDS.TASK_STATUS_ID]!.length > 0
          ? input[Constants.FIELDS.TASK_STATUS_ID]!
          : []

      /**
       * If team-id is not passed, then skip team-id validation
       */
      if (input[Constants.FIELDS.TEAM_ID] != null) {
        const teamData = await sequelize.query<Team>(teamQuery, {
          type: QueryTypes.SELECT,
          raw: true,
          replacements: {
            lang,
            teamId: input[Constants.FIELDS.TEAM_ID],
          },
          transaction,
        })
        if (teamData.length == 0) {
          logger.warn("[getGetTaskWithAuditsController] Not Found - Team id was not found")
          return {
            code: 404,
            body: "Not Found - Team id was not found",
          }
        }
      }
      /** convert datetime to time only */
      const planedDate = new Date(input[Constants.FIELDS.PLANNED_DATE_TIME]!)
      const dueDate = new Date(input[Constants.FIELDS.DUE_DATE_TIME]!)

      /** tasks and audits query execution */
      const taskWithAuditsQuery = buildTaskWithAuditsQuery(input)
      const taskWithAuditResponseFromDB = await sequelize.query<TaskAuditQueryResponse>(taskWithAuditsQuery, {
        type: QueryTypes.SELECT,
        raw: true,
        transaction,
        replacements: {
          lang,
          teamId: input[Constants.FIELDS.TEAM_ID],
          plannedDateTime: input[Constants.FIELDS.PLANNED_DATE_TIME],
          dueDateTime: input[Constants.FIELDS.DUE_DATE_TIME],
          tasksStatusId,
          powerPlantId: input[Constants.FIELDS.POWER_PLANT_ID],
          assetTaskGroupId: input[Constants.FIELDS.ASSET_TASK_GROUP_ID],
          plannedTime: planedDate.getHours() + ":" + planedDate.getMinutes() + ":" + planedDate.getSeconds(),
          dueTime: dueDate.getHours() + ":" + dueDate.getMinutes() + ":" + dueDate.getSeconds(),
        },
      })

      const arrDifferentTasksWithAudits: any[] = []

      /**
       * Iterate to the complete dataset, to create 2 different arrays for individual category, and seperate tasks
       */
      taskWithAuditResponseFromDB.map((objEachDataSet) => {
        const taskId = objEachDataSet[Constants.FIELDS.TASK_ID]

        if (typeof arrDifferentTasksWithAudits[taskId] === "undefined") {
          arrDifferentTasksWithAudits[taskId] = []
        }
        // convert is-lock to boolean
        objEachDataSet[Constants.FIELDS.IS_LOCK] = objEachDataSet[Constants.FIELDS.IS_LOCK] === 1
        arrDifferentTasksWithAudits[taskId].push({ ...objEachDataSet })
        return {}
      })

      /**
       * Iterate to array for different tasks, to seperate them using task type wise audits
       */
      const mappedTaskAudits: any[] = []
      let mappedTaskDetails: any[] = []
      let arrTaskIdFetched: string[] = []
      arrDifferentTasksWithAudits.map((arrEachTaskTypeAuditWithTask) => {
        /**
         * This loop to group by task-audits based on taskid's
         */
        arrEachTaskTypeAuditWithTask.map((objIndividualTask: any) => {
          const thisTaskId = objIndividualTask[Constants.FIELDS.TASK_ID]
          const taskAuditId = objIndividualTask[Constants.FIELDS.TASK_AUDIT_ID]
          const preTaskStatusId = objIndividualTask[Constants.FIELDS.PRE_TASK_STATUS_ID]
          const postTaskStatusId = objIndividualTask[Constants.FIELDS.POST_TASK_STATUS_ID]
          const teamId = objIndividualTask[Constants.FIELDS.TEAM_ID]
          const operateUserId = objIndividualTask[Constants.FIELDS.OPERATE_USER_ID]
          const operateTimestamp = objIndividualTask[Constants.FIELDS.OPERATE_TIMESTAMP]

          arrTaskIdFetched.push(thisTaskId)

          if (typeof mappedTaskAudits[thisTaskId] === "undefined") {
            mappedTaskAudits[thisTaskId] = []
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
          mappedTaskAudits[thisTaskId].push({ ...objToPush })
        })
        /**
         * This lop id grouping tasks details from the dataset from database, and adding task-audits in them
         */
        arrEachTaskTypeAuditWithTask.map((objIndividualTask: any) => {
          const thisTaskId = objIndividualTask[Constants.FIELDS.TASK_ID]

          if (typeof mappedTaskDetails[thisTaskId] === "undefined") {
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
              // 'asset-name': objIndividualTask[Constants.FIELDS.ASSET_NAME],
              // 'asset-code': objIndividualTask[Constants.FIELDS.ASSET_CODE],
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
              "is-lock": objIndividualTask[Constants.FIELDS.IS_LOCK],
              "task-audits": mappedTaskAudits[thisTaskId],
            }

            mappedTaskDetails[thisTaskId] = { ...tmpttt }
          }
        })
      })

      /**
       * Removing empty array elements
       */
      mappedTaskDetails = mappedTaskDetails.filter((n) => n)
      //when mapped task is not available
      if (mappedTaskDetails.length > 0) {
        let assetId = mappedTaskDetails.map((task) => {
          return task[Constants.FIELDS.ASSET_ID]
        })
        assetId = assetId.filter((x, i, a) => a.indexOf(x) === i)
        const assetResult = await cmnSequelize.query<any>(assetQuery, {
          type: QueryTypes.SELECT,
          raw: true,
          replacements: { assetId },
        })
        mappedTaskDetails.map((value: any) => {
          getAssetData(assetResult, value)
        })
      }

      /**
       * function call to fetch assigness detail for all the tasks fetched
       */
      arrTaskIdFetched = [...new Set(arrTaskIdFetched)]

      const assignees = await getAssignees(transaction, arrTaskIdFetched, input[Constants.FIELDS.TEAM_ID])
      return {
        code: 200,
        body: { tasks: [...mappedTaskDetails], assignees },
      }
    })

    return result
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
export const consolidateGetTaskWithAuditsRequest = (
  req: Request,
): getTaskAuditWithTaskRequest | poorlyShapedRequest => ({
  "planned-date-time": DateTimeFromString(req.query[Constants.FIELDS.PLANNED_DATE_TIME] as string),
  "due-date-time": DateTimeFromString(req.query[Constants.FIELDS.DUE_DATE_TIME] as string),
  "task-status-id": consolidateTaskStatusId(req.query[Constants.FIELDS.TASK_STATUS_ID]),
  "team-id": req.query[Constants.FIELDS.TEAM_ID],
  "power-plant-id": req.query[Constants.FIELDS.POWER_PLANT_ID],
  "asset-task-group-id": req.query[Constants.FIELDS.ASSET_TASK_GROUP_ID],
})

export const getGetTaskWithAuditsController = jsonResponse(
  extractValue(consolidateGetTaskWithAuditsRequest)(getGetTaskWithAudits),
)
