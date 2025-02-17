// Initially copied from ToT-BE, commit 545c1dd02ed8df920e315645df162212e80b2a03

/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request } from "express"
import { QueryTypes } from "sequelize"

import {
  AssigneeData,
  getTaskByIdAPIResponse,
  getTaskByIdRequest,
  getTaskByIdResponse,
  TaskAudit,
} from "../../../../domain/entities/tot/v1/getTaskById.js"
import { cmnSequelize, sequelize } from "../../../../infrastructure/orm/sqlize/index.js"
import { jsonResponse, extractValue } from "../../../decorators.js"
import logger from "../../../../infrastructure/logger.js"
import { Constants } from "../../../../config/constants.js"

/*import { handleDbError, EnumFromString, BoolFromString, DateTimeFromString, DateFromString } from "./utils";*/

type Task = Omit<getTaskByIdResponse, "assignees" | "task-audits">

const lang = "JA"

/** get task function */
const getTask = async (taskId: string): Promise<Task | null> => {
  const taskQuery = `SELECT
      T1.PLANT_ID 'plant-id',
      T1.ASSET_TASK_GROUP_ID 'asset-task-group-id',
      T1.TASK_TYPE_ID 'task-type-id',
      T2.TASK_TYPE_NAME 'task-type-name',
      T2.TASK_CATEGORY_ID 'task-category-id',
      T2.TASK_CATEGORY_NAME 'task-category-name',
      T2.IS_DELETED 'is-task-type-delete',
      T1.TASK_NAME 'task-name',
      T1.ASSET_ID 'asset-id',
      T1.PLANNED_DATE_TIME 'planned-date-time',
      T1.TASK_PRIORITY_ID 'task-priority-id',
      T4.TASK_PRIORITY_NAME 'task-priority-name',
      T1.DUE_DATE_TIME 'due-date-time',
      T1.START_DATE_TIME 'start-date-time',
      T1.END_DATE_TIME 'end-date-time',
      T1.WORKING_HOURS 'working-hours',
      T1.ESTIMATED_TASK_TIME 'estimated-task-time',
      T1.TASK_STATUS_ID 'task-status-id',
      T6.TASK_STATUS_NAME 'task-status-name',
      T1.TAKEOVER_TEAM_ID 'takeover-team-id',
      T5.TEAM_NAME 'takeover-team-name',
      T1.REMARKS 'remarks',
      T1.ORDER_ID 'order-id',
      T1.EVENT_ID 'event-id',
      T1.EVENT_TYPE_ID 'event-type-id',
      ET.EVENT_TYPE_NAME 'event-type-name',
      ET.IS_DELETED 'is-event-type-delete',
      T1.ROUTING_ID 'routing-id',
      T1.ROUTING_COUNTER 'routing-counter',
      T1.ACTIVITY_ID 'activity-id',
      T1.SAP_TASK_CATEGORY_ID 'sap-task-category-id',
      mst.SAP_TASK_CATEGORY_NAME 'sap-task-category-name',
      T1.IS_LOCK 'is-lock',
      T1.EVENT_NAME 'event-name',
      T1.CREATE_TIMESTAMP 'create-timestamp',
      T1.CREATE_USER_ID 'create-user-id',
      T1.UPDATE_TIMESTAMP 'update-timestamp',
      T1.UPDATE_USER_ID 'update-user-id',
      (
        (
          SELECT COUNT(*)
          FROM t_chain_memo T7
          WHERE T1.TASK_ID = T7.TASK_ID
        ) > 0
      ) AS 'is-chain-memo-available',
      T8.IS_DELETED 'is-operation-event-delete'
    FROM
      t_task T1
      JOIN m_task_type T2
      ON T1.TASK_TYPE_ID = T2.TASK_TYPE_ID AND
      T2.LANG = :lang
      LEFT OUTER JOIN m_event_type ET ON T1.EVENT_TYPE_ID = ET.EVENT_TYPE_ID
      LEFT OUTER JOIN m_task_priority T4
      ON T1.TASK_PRIORITY_ID = T4.TASK_PRIORITY_ID AND
      T4.LANG = :lang
      LEFT OUTER JOIN m_sap_task_category mst ON T1.SAP_TASK_CATEGORY_ID = mst.SAP_TASK_CATEGORY_ID
      LEFT OUTER JOIN m_team T5
      ON T1.TAKEOVER_TEAM_ID = T5.TEAM_ID
      JOIN m_task_status T6
      ON T1.TASK_STATUS_ID = T6.TASK_STATUS_ID AND
      T6.LANG = :lang 
      LEFT OUTER JOIN t_operation_event_type T8 ON T1.OPERATION_ID = T8.OPERATION_ID AND T1.EVENT_TYPE_ID = T8.EVENT_TYPE_ID
    WHERE
      T1.TASK_ID = :taskId`

  return sequelize.query<Task>(taskQuery, {
    raw: true,
    type: QueryTypes.SELECT,
    plain: true,
    replacements: { taskId, lang },
  })
}

/** get assignee function */
const getAssignees = async (taskId: string): Promise<AssigneeData[]> => {
  const assigneeQuery = `SELECT
      T1.USER_ID 'user-id',
      T1.TASK_ID 'task-id',
      T2.USER_NAME 'user-name'
    FROM
      t_task_assignee T1
      JOIN m_user_tot T2 ON T1.USER_ID = T2.USER_ID
    WHERE T1.TASK_ID = :taskId
    ORDER BY T2.USER_NAME ASC;`

  return sequelize.query<AssigneeData>(assigneeQuery, {
    raw: true,
    type: QueryTypes.SELECT,
    replacements: { taskId },
  })
}

/** get task audit function */
const getTaskAudits = async (taskId: string): Promise<TaskAudit[]> => {
  const taskAuditQuery = `SELECT
      TASK_AUDIT_ID 'task-audit-id',
      TASK_ID 'task-id',
      PRE_TASK_STATUS_ID 'pre-task-status-id',
      POST_TASK_STATUS_ID 'post-task-status-id',
      OPERATE_USER_ID 'operate-user-id',
      OPERATE_TIMESTAMP 'operate-timestamp'
    FROM t_task_audit
    WHERE TASK_ID = :taskId
    ORDER BY TASK_AUDIT_ID ASC;`

  return sequelize.query<TaskAudit>(taskAuditQuery, {
    raw: true,
    type: QueryTypes.SELECT,
    replacements: { taskId },
  })
}

/**  get task by id function */
const getTaskById = async (
  postValidationInput: getTaskByIdRequest | Record<string, any>,
): Promise<getTaskByIdAPIResponse> => {
  try {
    /** get asset query */
    const assetQuery = `SELECT
    ASSET_ID 'asset-id',
    ASSET_NAME 'asset-name',
    ASSET_CODE 'asset-code'
    FROM
    m_asset
    WHERE
    ASSET_ID = :assetId`
    const input = postValidationInput as getTaskByIdRequest
    const taskId = input[Constants.FIELDS.TASK_ID]
    //set any for from db we get number and need to convert in boolean
    const task: any = await getTask(taskId)

    if (!task) {
      logger.warn("[getTaskById] Not Found - Task id was not found")
      return {
        code: 404,
        body: "Not Found - Task id was not found",
      }
    }

    // Convert nulls to blank string
    const keys = [
      Constants.FIELDS.TASK_TYPE_NAME,
      Constants.FIELDS.TASK_CATEGORY_NAME,
      Constants.FIELDS.TASK_NAME,
      Constants.FIELDS.ASSET_CODE,
      Constants.FIELDS.TASK_PRIORITY_NAME,
      Constants.FIELDS.WORKING_HOURS,
      Constants.FIELDS.ESTIMATED_TASK_TIME,
      Constants.FIELDS.TAKEOVER_TEAM_NAME,
      Constants.FIELDS.REMARKS,
      Constants.FIELDS.ORDER_ID,
      Constants.FIELDS.EVENT_ID,
      Constants.FIELDS.CREATED_USER_ID,
      Constants.FIELDS.UPDATED_USER_ID,
    ] as const
    keys.forEach((key, _idx, _arr) => (task[key] = task[key] || ""))

    // Convert number to boolean for is-lock.
    const isLock = [Constants.FIELDS.IS_LOCK] as const

    isLock.forEach((key, _idx2, _arr2) => {
      task[key] = task[key] == 0 ? false : true
    })

    task[Constants.FIELDS.IS_CHAIN_MEMO_AVAILABLE] = Number(task[Constants.FIELDS.IS_CHAIN_MEMO_AVAILABLE]) > 0

    const assetResult = await cmnSequelize.query<any>(assetQuery, {
      type: QueryTypes.SELECT,
      raw: true,
      replacements: { assetId: task[Constants.FIELDS.ASSET_ID] },
    })
    const commonAssetResult = assetResult.find((valueAsset) => {
      return valueAsset[Constants.FIELDS.ASSET_ID] == task[Constants.FIELDS.ASSET_ID]
    })
    if (commonAssetResult) {
      task[Constants.FIELDS.ASSET_NAME] = commonAssetResult[Constants.FIELDS.ASSET_NAME]
      task[Constants.FIELDS.ASSET_CODE] = commonAssetResult[Constants.FIELDS.ASSET_CODE]
    } else {
      task[Constants.FIELDS.ASSET_NAME] = ""
      task[Constants.FIELDS.ASSET_CODE] = ""
    }
    task[Constants.FIELDS.IS_EVENT_TYPE_DELETED] =
      task[Constants.FIELDS.IS_EVENT_TYPE_DELETED] === 0 ? Boolean(0) : Boolean(1)

    task[Constants.FIELDS.IS_TASK_TYPE_DELETED] =
      task[Constants.FIELDS.IS_TASK_TYPE_DELETED] === 0 ? Boolean(0) : Boolean(1)

    task[Constants.FIELDS.IS_OPERATION_EVENT_DELETED] = task[Constants.FIELDS.IS_OPERATION_EVENT_DELETED] === 1

    const assignees = await getAssignees(taskId)
    const taskAudits = await getTaskAudits(taskId)

    return {
      code: 200,
      body: {
        ...task,
        assignees,
        "task-audits": taskAudits,
      },
    }
  } catch (err) {
    logger.error(err)
    return {
      code: 400,
      body: "Bad Request",
    }
  }
}

/* consolidate user request parameter */
export const consolidategetTaskByIdRequest = (req: Request): getTaskByIdRequest | Record<string, any> => ({
  "task-id": req.params.taskId,
})

export const getTaskByIdController = jsonResponse(extractValue(consolidategetTaskByIdRequest)(getTaskById))
