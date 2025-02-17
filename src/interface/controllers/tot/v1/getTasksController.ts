// Initially copied from ToT-BE, commit 545c1dd02ed8df920e315645df162212e80b2a03

/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request } from "express"
/*import { pass } from "fp-ts/lib/Writer";*/
import { QueryTypes } from "sequelize"

import { Assignee, getTasksRequest, Task } from "../../../../domain/entities/tot/v1/getTasks.js"
import logger from "../../../../infrastructure/logger.js"
import { sequelize, cmnSequelize } from "../../../../infrastructure/orm/sqlize/index.js"

import { extractValue, jsonResponse } from "../../../decorators.js"

import {
  BoolFromString,
  DateTimeFromString,
  consolidatePossibleArray,
  poorlyShapedRequest,
  OptionalStringField,
} from "./utils.js"

import { Constants } from "../../../../config/constants.js"

/** build task planned date time filter */
const buildTaskPlannedDateTimeFilter = (
  fromDT: Date | undefined,
  toDT: Date | undefined,
  blankFlag: boolean | undefined,
): string => {
  if (fromDT === undefined) {
    if (toDT === undefined) {
      if (blankFlag) {
        logger.info("BLANK FLAG ONLY")
        return ""
      } else {
        logger.info("All EMPTY")
        return `T1.PLANNED_DATE_TIME IS NOT NULL AND `
      }
    } else if (blankFlag) {
      logger.info("TO AND BLANK ONLY")
      return `(
        T1.PLANNED_DATE_TIME <= :plannedDateTimeTo OR
        T1.PLANNED_DATE_TIME IS NULL
      )  AND `
    } else {
      logger.info("TO ONLY")
      return `T1.PLANNED_DATE_TIME <= :plannedDateTimeTo AND `
    }
  } else if (toDT === undefined) {
    if (blankFlag) {
      logger.info("FROM AND BLANK ONLY")
      return `(
          T1.PLANNED_DATE_TIME >= :plannedDateTimeFrom OR
          T1.PLANNED_DATE_TIME IS NULL
      ) AND `
    } else {
      logger.info("FROM ONLY")
      return `T1.PLANNED_DATE_TIME >= :plannedDateTimeFrom AND `
    }
  } else if (blankFlag) {
    logger.info("TO AND FROM AND BLANK")
    return `(
      (
        T1.PLANNED_DATE_TIME >= :plannedDateTimeFrom AND
        T1.PLANNED_DATE_TIME <= :plannedDateTimeTo
      ) OR T1.PLANNED_DATE_TIME IS NULL
    ) AND `
  } else {
    logger.info("TO AND FROM")
    return `(
      T1.PLANNED_DATE_TIME >= :plannedDateTimeFrom AND
      T1.PLANNED_DATE_TIME <= :plannedDateTimeTo
    ) AND `
  }
}

/** build task query */
const buildTaskQuery = (input: getTasksRequest): string => {
  // task name filter
  const taskNameFilter = input[Constants.FIELDS.TASK_NAME] ? "T1.TASK_NAME LIKE :taskName AND " : ""

  // operationId filter
  const operationIdFilter = input[Constants.FIELDS.OPERATION_ID] ? "T1.OPERATION_ID IN (:operationId) AND " : ""

  // task status filter
  const taskStatusIds: number[] | null =
    Array.isArray(input[Constants.FIELDS.TASK_STATUS_ID]!) && input[Constants.FIELDS.TASK_STATUS_ID]!.length > 0
      ? input[Constants.FIELDS.TASK_STATUS_ID]!
      : null

  const taskStatusFilter = taskStatusIds ? "T1.TASK_STATUS_ID IN (:taskStatusId) AND " : ""

  // planned date time filter
  const taskPlannedDateTimeFilter = buildTaskPlannedDateTimeFilter(
    input[Constants.FIELDS.PLANNED_DATE_TIME_FROM],
    input[Constants.FIELDS.PLANNED_DATE_TIME_TO],
    input[Constants.FIELDS.PLANNED_DATE_TIME_BLANK_FLAG],
  )
  /** get task query */
  const taskQuery = `SELECT
    T1.TASK_ID 'task-id',
    T1.PLANT_ID 'power-plant-id',
    T1.ASSET_TASK_GROUP_ID 'asset-task-group-id',
    T9.ASSET_TASK_GROUP_NAME 'asset-task-group-name',
    T1.TASK_TYPE_ID 'task-type-id',
    T2.TASK_TYPE_NAME 'task-type-name',
    T2.TASK_CATEGORY_ID 'task-category-id',
    T2.TASK_CATEGORY_NAME 'task-category-name',
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
    ) AS 'is-chain-memo-available'
  FROM
    t_task T1 INNER JOIN
    m_task_type T2 ON T1.TASK_TYPE_ID = T2.TASK_TYPE_ID AND T2.LANG = :lang LEFT OUTER JOIN
    m_task_priority T4 ON T1.TASK_PRIORITY_ID = T4.TASK_PRIORITY_ID AND T4.LANG = :lang 
    LEFT OUTER JOIN m_event_type ET ON T1.EVENT_TYPE_ID = ET.EVENT_TYPE_ID
    LEFT OUTER JOIN m_sap_task_category mst ON T1.SAP_TASK_CATEGORY_ID = mst.SAP_TASK_CATEGORY_ID
    LEFT OUTER JOIN m_team T5 ON T1.TAKEOVER_TEAM_ID = T5.TEAM_ID INNER JOIN
    m_task_status T6 ON T1.TASK_STATUS_ID = T6.TASK_STATUS_ID AND T6.LANG = :lang INNER JOIN
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
    ) T9 ON T1.ASSET_TASK_GROUP_ID = T9.ASSET_TASK_GROUP_ID AND T1.PLANT_ID = T9.PLANT_ID
  WHERE
    T1.ASSET_TASK_GROUP_ID = :assetTaskGroupId AND
    ${taskNameFilter}
    ${taskStatusFilter}
    ${taskPlannedDateTimeFilter}
    ${operationIdFilter}
    T1.PLANT_ID = :powerPlantId
  ORDER BY
    T4.TASK_PRIORITY_SORT_NUMBER IS NULL ASC,
    T4.TASK_PRIORITY_SORT_NUMBER ASC,
    T1.PLANNED_DATE_TIME DESC,
    T1.TASK_ID DESC
  ${input["search-upper-limit"] === undefined ? "" : "LIMIT :searchUpperLimit"}
  ;`
  return taskQuery
}

/** task assign query */
const assigneeQuery = `SELECT
    T1.USER_ID 'user-id',
    T1.TASK_ID 'task-id',
    T2.USER_NAME 'user-name'
  FROM
    t_task_assignee T1 INNER JOIN
    m_user_tot T2 ON T1.USER_ID = T2.USER_ID
  WHERE
    T1.TASK_ID IN (:taskIdArray)
  ORDER BY
    T1.TASK_ID`

/** get asset query */
const assetQuery = `SELECT
    ASSET_ID 'asset-id',
   ASSET_NAME 'asset-name',
   ASSET_CODE 'asset-code'
  FROM
    m_asset
  WHERE
    ASSET_ID IN  (:assetId)`

const lang = "JA"

/** get task function */
const getTasks = async (postValidationInput: getTasksRequest | Record<string, any>): Promise<any> => {
  try {
    const input = postValidationInput as getTasksRequest

    // convert input['task-status-id'] to an array if it's just a lone number because we'll use an IN filter
    const taskStatusId: number[] =
      Array.isArray(input[Constants.FIELDS.TASK_STATUS_ID]!) && input[Constants.FIELDS.TASK_STATUS_ID]!.length > 0
        ? input[Constants.FIELDS.TASK_STATUS_ID]!
        : []

    // Fetch the tasks
    const taskQuery = buildTaskQuery(input)

    const tasks = await sequelize.query<Task>(taskQuery, {
      type: QueryTypes.SELECT,
      raw: true,
      replacements: {
        lang,
        powerPlantId: input[Constants.FIELDS.POWER_PLANT_ID],
        assetTaskGroupId: input[Constants.FIELDS.ASSET_TASK_GROUP_ID],
        taskName: `%${input[Constants.FIELDS.TASK_NAME]}%`, // We use '%' because it going to be a LIKE filter.
        taskStatusId,
        plannedDateTimeFrom: input[Constants.FIELDS.PLANNED_DATE_TIME_FROM],
        plannedDateTimeTo: input[Constants.FIELDS.PLANNED_DATE_TIME_TO],
        searchUpperLimit: input[Constants.FIELDS.SEARCH_UPPER_LIMIT],
        operationId: input[Constants.FIELDS.OPERATION_ID],
      },
    })

    // Convert nulls to blank string according to process document.
    const keys = [
      Constants.FIELDS.TASK_TYPE_NAME,
      Constants.FIELDS.TASK_CATEGORY_NAME,
      Constants.FIELDS.TASK_NAME,
      Constants.FIELDS.ASSET_NAME,
      Constants.FIELDS.ASSET_CODE,
      Constants.FIELDS.TASK_PRIORITY_NAME,
      Constants.FIELDS.WORKING_HOURS,
      Constants.FIELDS.ESTIMATED_TASK_TIME,
      Constants.FIELDS.REMARKS,
      Constants.FIELDS.ORDER_ID,
      Constants.FIELDS.EVENT_ID,
      Constants.FIELDS.CREATED_USER_ID,
      Constants.FIELDS.UPDATED_USER_ID,
    ] as const

    tasks.forEach((t, _idx, _arr) => {
      keys.forEach((key, _idx2, _arr2) => {
        t[key] = t[key] || ""
      })
    })

    tasks.forEach((x) => {
      x[Constants.FIELDS.IS_CHAIN_MEMO_AVAILABLE] = Number(x[Constants.FIELDS.IS_CHAIN_MEMO_AVAILABLE]) > 0
    })

    //when task is not available
    if (tasks.length > 0) {
      let assetId = tasks.map((task) => {
        return task[Constants.FIELDS.ASSET_ID]
      })
      assetId = assetId.filter((x, i, a) => a.indexOf(x) === i)

      const assetResult = await cmnSequelize.query<any>(assetQuery, {
        type: QueryTypes.SELECT,
        raw: true,
        replacements: { assetId },
      })

      tasks.map((value: any) => {
        const commonAssetResult: any = assetResult.find((valueAsset) => {
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
      })
    }

    // Convert number to boolean for is-lock.
    const isLock = [Constants.FIELDS.IS_LOCK] as const

    //set any for from db we get number and need to convert in boolean
    tasks.forEach((t: any, _idx, _arr) => {
      isLock.forEach((key, _idx2, _arr2) => {
        t[key] = t[key] == 0 ? false : true
      })
    })
    // Fetch the assignees
    const taskIdArray = tasks.map((t) => t[Constants.FIELDS.TASK_ID])
    if (taskIdArray.length === 0) {
      return {
        code: 200,
        body: { tasks: [], assignees: [] },
      }
    }

    const assignees = await sequelize.query<Assignee>(assigneeQuery, {
      type: QueryTypes.SELECT,
      raw: true,
      replacements: { taskIdArray },
    })

    return {
      code: 200,
      body: { tasks, assignees },
    }
  } catch (err) {
    logger.error(err)
    return {
      code: 400,
      body: "Bad Request",
    }
  }
}

const consolidateTaskStatusId = (x: unknown) =>
  consolidatePossibleArray(x) ? consolidatePossibleArray(x).map((y: string) => Number(y)) : x

//consolidate OperationId request parameter
const consolidateOperationId = (x: unknown) =>
  consolidatePossibleArray(x) ? consolidatePossibleArray(x).map((y: string) => Number(y)) : x

/* consolidate user request parameter */
export const consolidategetTasksRequest = (req: Request): getTasksRequest | poorlyShapedRequest => ({
  "power-plant-id": req.query[Constants.FIELDS.POWER_PLANT_ID] as string,
  "asset-task-group-id": Number(req.query[Constants.FIELDS.ASSET_TASK_GROUP_ID]),
  "operation-id": consolidateOperationId(req.query[Constants.FIELDS.OPERATION_ID]),
  "search-upper-limit":
    req.query[Constants.FIELDS.SEARCH_UPPER_LIMIT] === undefined
      ? undefined
      : Number(req.query[Constants.FIELDS.SEARCH_UPPER_LIMIT]),
  "task-name": OptionalStringField(req.query[Constants.FIELDS.TASK_NAME] as string),
  "task-status-id": consolidateTaskStatusId(req.query[Constants.FIELDS.TASK_STATUS_ID]),
  "planned-date-time-to": DateTimeFromString(req.query[Constants.FIELDS.PLANNED_DATE_TIME_TO] as string),
  "planned-date-time-from": DateTimeFromString(req.query[Constants.FIELDS.PLANNED_DATE_TIME_FROM] as string),
  "planned-date-time-blank-flag": BoolFromString(req.query[Constants.FIELDS.PLANNED_DATE_TIME_BLANK_FLAG] as string),
})

export const getTasksController = jsonResponse(extractValue(consolidategetTasksRequest)(getTasks))
