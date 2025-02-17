// Initially copied from ToT-BE, commit 545c1dd02ed8df920e315645df162212e80b2a03
import { Request } from "express"
import { QueryTypes } from "sequelize"

import { sequelize } from "../../../../infrastructure/orm/sqlize/index.js"
import { extractValue, jsonOrEmptyResponse } from "../../../decorators.js"
import logger from "../../../../infrastructure/logger.js"
import { Constants } from "../../../../config/constants.js"

import {
  handleDbError,
  UserIdNotFoundError,
  send404Response,
  TaskExecutionTimeNotFoundError,
  TaskTypeNameNotFoundError,
} from "./utils.js"
import { createTaskTypeAPIResponse, createTaskTypeRequest } from "../../../../domain/entities/tot/v1/createTaskType.js"

const lang = "JA"

/**
 * Description create task type function
 *
 * @async
 * @param {(createTaskTypeRequest | Record<string, any>)} postValidationInput
 * @returns {Promise<createTaskTypeAPIResponse>} createTaskTypeAPI
 */
const createTaskType = async (
  postValidationInput: createTaskTypeRequest | Record<string, any>,
): Promise<createTaskTypeAPIResponse> => {
  const input = postValidationInput as createTaskTypeRequest

  /** insert task type query */
  const insertTaskTypeQuery = `INSERT INTO m_task_type
  (
    TASK_TYPE_NAME,
    LANG,
    TASK_CATEGORY_ID,
  TASK_CATEGORY_NAME,
  TASK_EXECUTION_TIME,
    CREATE_TIMESTAMP,
    CREATE_USER_ID,
  UPDATE_TIMESTAMP,
  UPDATE_USER_ID)
  VALUES
  (
  :taskTypeName,
  :lang,
  :taskCategoryId,
  :taskCategoryName,
  :taskExecutionTime,
  :curdate,
  :operateUserId,
  :curdate,
  :operateUserId);`

  try {
    const result = await sequelize.transaction<createTaskTypeAPIResponse>(async (transaction) => {
      /* select user name by user id in user table */
      const selectOperatorNameQuery = `SELECT USER_NAME FROM m_user_tot WHERE USER_ID = :operateUserId;`
      const curdate = new Date()
      const insertIds: number[] = []

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
      for (const taskType of input.taskTypes) {
        /** insert tasktype model */
        const [insertId, _] = await sequelize.query(insertTaskTypeQuery, {
          raw: true,
          type: QueryTypes.INSERT,
          transaction,
          replacements: {
            taskTypeName: taskType[Constants.FIELDS.TASK_TYPE_NAME],
            lang: lang,
            taskCategoryId: taskType[Constants.FIELDS.TASK_CATEGORY_ID],
            taskCategoryName: taskType[Constants.FIELDS.TASK_CATEGORY_NAME],
            taskExecutionTime: taskType[Constants.FIELDS.TASK_EXECUTION_TIME],
            curdate,
            operateUserId: input[Constants.FIELDS.OPERATE_USER_ID],
          },
        })
        insertIds.push(insertId)
      }
      return {
        code: Constants.STATUS_CODES.CREATE_SUCCESS_CODE,
        body: insertIds.map((value) => ({ "task-type-id": value })),
      }
    })
    return result
  } catch (err: any) {
    logger.error(err)
    handleDbError("CreateTaskType", err)
    if (err instanceof TaskTypeNameNotFoundError) {
      return send404Response(err)
    }
    if (err instanceof TaskExecutionTimeNotFoundError) {
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
 * @param {Request} req
 * @returns {(createTaskTypeRequest | Record<string, any>)} createTaskTypeRequest
 */
export const consolidatecreateTaskTypeRequest = (req: Request): createTaskTypeRequest | Record<string, any> => ({
  taskTypes: req.body[Constants.FIELDS.TASK_TYPE].map((taskType: Record<string, any>) => ({
    "task-type-name": taskType[Constants.FIELDS.TASK_TYPE_NAME],
    "task-category-id": taskType[Constants.FIELDS.TASK_CATEGORY_ID],
    "task-category-name": taskType[Constants.FIELDS.TASK_CATEGORY_NAME],
    "task-execution-time": taskType[Constants.FIELDS.TASK_EXECUTION_TIME],
  })),
  "operate-user-id": req.body[Constants.FIELDS.OPERATE_USER_ID],
})

/**
 * Description create task type controller
 *
 * @type {*} export
 */
export const createTaskTypeController = jsonOrEmptyResponse(
  extractValue(consolidatecreateTaskTypeRequest)(createTaskType),
  [Constants.STATUS_CODES.CREATE_SUCCESS_CODE, Constants.ERROR_CODES.NOT_FOUND_CODE, Constants.ERROR_CODES.BAD_REQUEST],
)
