// Initially copied from ToT-BE, commit 545c1dd02ed8df920e315645df162212e80b2a03
import { Request } from "express"
import { QueryTypes } from "sequelize"
import { sequelize } from "../../../../infrastructure/orm/sqlize/index.js"
import { extractValue, jsonOrEmptyResponse } from "../../../decorators.js"
import logger from "../../../../infrastructure/logger.js"
import { Constants } from "../../../../config/constants.js"
import {
  UserIdNotFoundError,
  send404Response,
  setDifference,
  TaskExecutionTimeNotFoundError,
  TaskTypeIdsNotFoundError,
  TaskTypeNameNotFoundError,
} from "./utils.js"
import {
  updateTaskTypeAPIResponse,
  updateTaskTypeRequest,
  updateTaskTypeRequestItem,
} from "../../../../domain/entities/tot/v1/updateTaskType.js"

/**
 * Description update TaskType
 *
 * @async
 * @param {(updateTaskTypeRequest | Record<string, any>)} postValidationInput
 * @returns {Promise<updateTaskTypeAPIResponse>} updateTaskTypeAPIResponse
 */
const updateTaskType = async (
  postValidationInput: updateTaskTypeRequest | Record<string, any>,
): Promise<updateTaskTypeAPIResponse> => {
  const input = postValidationInput as updateTaskTypeRequest

  try {
    const result = await sequelize.transaction(async (transaction) => {
      /* select user name by user id in user table */
      const selectOperatorNameQuery = `SELECT USER_NAME FROM m_user_tot WHERE USER_ID = :operateUserId;`
      // Validate taskType IDs
      const curdate = new Date()
      const inputTaskTypeIdSet = new Set(input.taskTypes.map((t) => t[Constants.FIELDS.TASK_TYPE_ID]))
      const existingTaskTypes =
        input.taskTypes.length === 0
          ? []
          : await sequelize.query<{ TASK_TYPE_ID: number }>(
              `SELECT TASK_TYPE_ID FROM m_task_type WHERE TASK_TYPE_ID IN (?) FOR UPDATE;`,
              {
                replacements: [[...inputTaskTypeIdSet]],
                type: QueryTypes.SELECT,
                raw: true,
                transaction,
              },
            )
      const existingTaskTypeIdSet = new Set(existingTaskTypes.map((t) => t.TASK_TYPE_ID))
      const notFoundTaskTypeIdSet = setDifference(inputTaskTypeIdSet, existingTaskTypeIdSet)
      if (notFoundTaskTypeIdSet.size > 0) {
        throw new TaskTypeIdsNotFoundError([...notFoundTaskTypeIdSet])
      }
      /**
       * Description fetch operate-user-id
       *
       * @type {*}
       */
      const operator = await sequelize.query<{ USER_NAME: string }>(selectOperatorNameQuery, {
        raw: true,
        type: QueryTypes.SELECT,
        plain: true,
        transaction,
        replacements: {
          operateUserId: input[Constants.FIELDS.OPERATE_USER_ID],
        },
      })
      /* validate the operate-user-id */
      if (operator === null) {
        throw new UserIdNotFoundError(input[Constants.FIELDS.OPERATE_USER_ID])
      }
      input.taskTypes.forEach((value) => {
        if (
          value[Constants.FIELDS.TASK_TYPE_NAME] === "" ||
          value[Constants.FIELDS.TASK_TYPE_NAME] === undefined ||
          value[Constants.FIELDS.TASK_TYPE_NAME] === null
        ) {
          throw new TaskTypeNameNotFoundError(value[Constants.FIELDS.TASK_TYPE_NAME])
        }
        if (
          value[Constants.FIELDS.TASK_EXECUTION_TIME] === "" ||
          value[Constants.FIELDS.TASK_EXECUTION_TIME] === undefined ||
          value[Constants.FIELDS.TASK_EXECUTION_TIME] === null
        ) {
          throw new TaskExecutionTimeNotFoundError(value[Constants.FIELDS.TASK_EXECUTION_TIME])
        }
      })
      for (const tasktype of input.taskTypes) {
        const updateTaskTypeQuery = `UPDATE m_task_type
          SET
            ${tasktype[Constants.FIELDS.TASK_TYPE_NAME] === undefined ? "" : "TASK_TYPE_NAME = $taskTypeName,"}
            ${tasktype[Constants.FIELDS.TASK_CATEGORY_ID] === undefined ? "" : "TASK_CATEGORY_ID = $taskCategoryId,"}
            ${
              tasktype[Constants.FIELDS.TASK_CATEGORY_NAME] === undefined
                ? ""
                : "TASK_CATEGORY_NAME = $taskCategoryName,"
            }
            ${
              tasktype[Constants.FIELDS.TASK_EXECUTION_TIME] === undefined
                ? ""
                : "TASK_EXECUTION_TIME = $taskExecutionTime,"
            }
            ${input[Constants.FIELDS.OPERATE_USER_ID] === undefined ? "" : "UPDATE_USER_ID = $operateUserId,"}
            UPDATE_TIMESTAMP = $curdate
          WHERE TASK_TYPE_ID = $taskTypeId;`
        await sequelize.query(updateTaskTypeQuery, {
          raw: true,
          type: QueryTypes.UPDATE,
          transaction,
          bind: {
            taskTypeName: tasktype[Constants.FIELDS.TASK_TYPE_NAME],
            taskCategoryId: tasktype[Constants.FIELDS.TASK_CATEGORY_ID],
            taskCategoryName: tasktype[Constants.FIELDS.TASK_CATEGORY_NAME],
            taskExecutionTime: tasktype[Constants.FIELDS.TASK_EXECUTION_TIME],
            operateUserId: input[Constants.FIELDS.OPERATE_USER_ID],
            curdate,
            taskTypeId: tasktype[Constants.FIELDS.TASK_TYPE_ID],
          },
        })
      }
      return {
        code: Constants.STATUS_CODES.SUCCESS_CODE,
        body: Constants.SUCCESS_MESSAGES.SUCCESS,
      }
    })
    return result
  } catch (err) {
    logger.error(err)
    if (err instanceof TaskTypeNameNotFoundError) {
      return send404Response(err)
    }
    if (err instanceof TaskExecutionTimeNotFoundError) {
      return send404Response(err)
    }
    if (err instanceof TaskTypeIdsNotFoundError) {
      return send404Response(err)
    }
    if (err instanceof UserIdNotFoundError) {
      return send404Response(err)
    }

    return {
      code: Constants.ERROR_CODES.BAD_REQUEST,
      body: Constants.ERROR_MESSAGES.BAD_REQUEST,
    }
  }
}

/**
 * Description consolidate task type request parameter
 *
 * @param {Record<string, unknown>[]} details
 * @returns {updateTaskTypeRequestItem[]} updateTaskTypeRequestItem
 */
const consolidateTaskTypeFromRequest = (details: Record<string, unknown>[]): updateTaskTypeRequestItem[] => {
  return details.map<updateTaskTypeRequestItem>((x) => ({
    "task-type-id": Number(x[Constants.FIELDS.TASK_TYPE_ID]),
    "task-type-name": x[Constants.FIELDS.TASK_TYPE_NAME] as string,
    "task-category-id": Number(x[Constants.FIELDS.TASK_CATEGORY_ID]),
    "task-category-name": x[Constants.FIELDS.TASK_CATEGORY_NAME] as string,
    "task-execution-time": x[Constants.FIELDS.TASK_EXECUTION_TIME] as string,
  }))
}

/**
 * Description consolidateupdateTaskTypeRequest
 *
 * @param {Request} req
 * @returns {(updateTaskTypeRequest | Record<string, any>)} updateTaskTypeReq
 */
export const consolidateupdateTaskTypeRequest = (req: Request): updateTaskTypeRequest | Record<string, any> => {
  return {
    "operate-user-id": req.body[Constants.FIELDS.OPERATE_USER_ID],
    taskTypes: consolidateTaskTypeFromRequest(req.body[Constants.FIELDS.TASK_TYPE]),
  }
}

/**
 * Description update task type controller
 *
 * @type {*} export
 */
export const updateTaskTypeController = jsonOrEmptyResponse(
  extractValue(consolidateupdateTaskTypeRequest)(updateTaskType),
  [Constants.STATUS_CODES.SUCCESS_CODE, Constants.ERROR_CODES.BAD_REQUEST, Constants.ERROR_CODES.NOT_FOUND_CODE],
)
