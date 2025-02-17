// Initially copied from ToT-BE, commit 545c1dd02ed8df920e315645df162212e80b2a03

import { Request } from "express"
import { QueryTypes } from "sequelize"
import { sequelize } from "../../../../infrastructure/orm/sqlize/index.js"
import { extractValue, jsonResponse } from "../../../decorators.js"
import logger from "../../../../infrastructure/logger.js"
import { TaskType, getTaskTypeAPIResponse, getTaskTypeRequest } from "../../../../domain/entities/tot/v1/getTaskType.js"
import { Constants } from "../../../../config/constants.js"
import { poorlyShapedRequest } from "./utils.js"

/**
 * Description fetch taskType
 *
 * @async
 * @param {getTaskTypeRequest | Record<string, any>} postValidationInput deleteStatus Flag
 * @returns {Promise<TaskType[]>} getTaskType
 */
const taskType = async (input: getTaskTypeRequest | Record<string, any>): Promise<TaskType[]> => {
  let taskTypeDeleted
  if (input[Constants.FIELDS.DELETE_STATUS] != undefined) {
    taskTypeDeleted = `TT.IS_DELETED = ${input[Constants.FIELDS.DELETE_STATUS]}`
  } else {
    taskTypeDeleted = `TT.IS_DELETED = ${Constants.IS_NOT_DELETED}`
  }
  const taskTypeQuery = `SELECT
      TT.TASK_TYPE_ID 'task-type-id',
      TT.TASK_TYPE_NAME 'task-type-name',
      TT.TASK_CATEGORY_ID 'task-category-id',
      TT.TASK_CATEGORY_NAME 'task-category-name',
      TT.TASK_EXECUTION_TIME 'task-execution-time',
      ETY.EVENT_TYPE_ID 'event-type-id',
      ETY.EVENT_TYPE_NAME 'event-type-name',
      TT.IS_ATTACHED_WITH_SAP 'is-attached-with-sap'
    FROM m_task_type TT
    LEFT OUTER JOIN m_event_template ETEM ON TT.TASK_TYPE_ID = ETEM.TASK_TYPE_ID
    LEFT OUTER JOIN m_event_type  ETY ON ETEM.EVENT_TYPE_ID = ETY.EVENT_TYPE_ID
    WHERE ${taskTypeDeleted}
    ORDER BY TT.TASK_TYPE_ID ASC;`

  return sequelize.query<TaskType>(taskTypeQuery, {
    raw: true,
    type: QueryTypes.SELECT,
    replacements: {},
  })
}

/**
 * Description get tasktype
 *
 * @async
 * @param {Request} req
 * @returns {Promise<getTaskTypeAPIResponse>}
 */
export const getTaskType = async (
  postValidationInput: getTaskTypeRequest | Record<string, any>,
): Promise<getTaskTypeAPIResponse> => {
  try {
    const input = postValidationInput as getTaskTypeRequest

    const taskTypeRes = await taskType(input)

    // assigned boolean value to is-attached-with-sap instead of integer
    taskTypeRes.map((taskTypeElement: TaskType) => {
      taskTypeElement[Constants.FIELDS.IS_ATTACHED_WITH_SAP] =
        taskTypeElement[Constants.FIELDS.IS_ATTACHED_WITH_SAP] === 0 ? Boolean(0) : Boolean(1)
      return true
    })

    // There is no input here, just return everything.
    return {
      code: Constants.STATUS_CODES.SUCCESS_CODE,
      body: taskTypeRes,
    }
  } catch (err) {
    logger.error(err)
    return {
      code: Constants.ERROR_CODES.BAD_REQUEST,
      body: Constants.ERROR_MESSAGES.BAD_REQUEST,
    }
  }
}

/* consolidate Task Type request parameter */
export const consolidategetTaskTypeRequest = (req: Request): getTaskTypeRequest | poorlyShapedRequest => ({
  "delete-status": req.query[Constants.FIELDS.DELETE_STATUS],
})

export const getTaskTypeController = jsonResponse(extractValue(consolidategetTaskTypeRequest)(getTaskType))
