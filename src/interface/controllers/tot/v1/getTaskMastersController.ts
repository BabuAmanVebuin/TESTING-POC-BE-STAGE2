// Initially copied from ToT-BE, commit 545c1dd02ed8df920e315645df162212e80b2a03

import { Request } from "express"
import { QueryTypes } from "sequelize"

import {
  EventType,
  getTaskMastersAPIResponse,
  TaskPriority,
  TaskStatus,
  TaskType,
} from "../../../../domain/entities/tot/v1/getTaskMasters.js"
import { sequelize } from "../../../../infrastructure/orm/sqlize/index.js"
import { jsonResponse } from "../../../decorators.js"
import logger from "../../../../infrastructure/logger.js"
import { languageFromHeader } from "./utils.js"
import { Constants } from "../../../../config/constants.js"

/**
 * Description getTaskTypes
 *
 * @async
 * @param {string} lang
 * @returns {Promise<TaskType[]>} get TaskType Data
 */
const getTaskTypes = async (lang: string): Promise<TaskType[]> => {
  const taskTypeQuery = `SELECT
      TASK_TYPE_ID 'task-type-id',
      TASK_CATEGORY_ID 'task-category-id',
      TASK_TYPE_NAME 'task-type-name',
      TASK_CATEGORY_NAME 'task-category-name',
      TASK_EXECUTION_TIME 'task-execution-time'
    FROM m_task_type
      WHERE LANG = :lang
      AND IS_DELETED = ${Constants.IS_NOT_DELETED}
    ORDER BY TASK_TYPE_ID ASC;
    `

  return sequelize.query<TaskType>(taskTypeQuery, {
    raw: true,
    type: QueryTypes.SELECT,
    replacements: {
      lang,
    },
  })
}

/**
 * Description getTaskPriorities
 *
 * @async
 * @param {string} lang
 * @returns {Promise<TaskPriority[]>} get TaskPriority Data
 */
const getTaskPriorities = async (lang: string): Promise<TaskPriority[]> => {
  const taskPriorityQuery = `SELECT
      TASK_PRIORITY_ID 'task-priority-id',
      TASK_PRIORITY_NAME 'task-priority-name'
    FROM m_task_priority
      WHERE LANG = :lang
    ORDER BY TASK_PRIORITY_SORT_NUMBER;`

  return sequelize.query<TaskPriority>(taskPriorityQuery, {
    raw: true,
    type: QueryTypes.SELECT,
    replacements: {
      lang,
    },
  })
}

/**
 * Description getTaskStatuses
 *
 * @async
 * @param {string} lang
 * @returns {Promise<TaskStatus[]>} get Task Status
 */
const getTaskStatuses = async (lang: string): Promise<TaskStatus[]> => {
  const taskStatusQuery = `SELECT
      TASK_STATUS_ID 'task-status-id',
      TASK_STATUS_NAME 'task-status-name'
    FROM m_task_status
    WHERE LANG = :lang
    ORDER BY TASK_STATUS_SORT_NUMBER ASC;`

  return sequelize.query<TaskStatus>(taskStatusQuery, {
    raw: true,
    type: QueryTypes.SELECT,
    replacements: {
      lang,
    },
  })
}

/**
 * Description get event types
 *
 * @async
 * @returns {Promise<EventType[]>} get Event Type Data
 */
const getEventTypes = async (): Promise<EventType[]> => {
  const eventTypeQuery = `SELECT
    ET.EVENT_TYPE_ID 'event-type-id',
    ET.EVENT_TYPE_NAME 'event-type-name',
    OET.OPERATION_ID 'operation-id',
    O.OPERATION_NAME 'operation-name'
    FROM m_event_type ET, t_operation_event_type OET, m_operation O
    where ET.EVENT_TYPE_ID = OET.EVENT_TYPE_ID 
    AND OET.OPERATION_ID = O.OPERATION_ID
    AND ET.IS_DELETED = ${Constants.IS_NOT_DELETED}
    AND OET.IS_DELETED = ${Constants.IS_NOT_DELETED}
    ORDER BY EVENT_TYPE_SORT_NUMBER ASC;`

  return sequelize.query<EventType>(eventTypeQuery, {
    raw: true,
    type: QueryTypes.SELECT,
  })
}

/* get task master function */

/**
 * Description get task master
 *
 * @async
 * @param {Request} req
 * @returns {Promise<getTaskMastersAPIResponse>} getTaskMastersAPI Response
 */
export const getTaskMasters = async (req: Request): Promise<getTaskMastersAPIResponse> => {
  try {
    const lang = languageFromHeader(req.headers["accept-language"] as string)
    const taskTypes = await getTaskTypes(lang)
    const taskPriorities = await getTaskPriorities(lang)
    const taskStatuses = await getTaskStatuses(lang)
    const eventTypes = await getEventTypes()

    // There is no input here, just return everything.
    return {
      code: 200,
      body: {
        "task-type": taskTypes,
        "task-priority": taskPriorities,
        "task-status": taskStatuses,
        "event-type": eventTypes,
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

/**
 * Description GetTaskMasters
 *
 * @type {*}
 */
export const getTaskMastersController = jsonResponse(getTaskMasters)
