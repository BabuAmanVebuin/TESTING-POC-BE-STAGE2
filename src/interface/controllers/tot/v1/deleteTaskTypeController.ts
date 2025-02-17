import { Request } from "express"
import { QueryTypes, Transaction } from "sequelize"
import { sequelize } from "../../../../infrastructure/orm/sqlize/index.js"
import { extractValue, jsonOrEmptyResponse } from "../../../decorators.js"
import logger from "../../../../infrastructure/logger.js"
import { Constants } from "../../../../config/constants.js"
import { send404Response, TaskTypeIdNotFoundError, handleDbError } from "./utils.js"
import {
  deleteTaskTypesRequest,
  deleteTaskTypeAPIResponse,
} from "../../../../domain/entities/tot/v1/deleteTaskTypes.js"

/**
 * Description update TaskType
 *
 * @async
 * @param {(deleteTaskTypesRequest | Record<string, any>)} postValidationInput
 * @returns {Promise<deleteTaskTypeAPIResponse>} deleteTaskTypeAPIResponse
 */
const deleteTaskType = async (
  postValidationInput: deleteTaskTypesRequest | Record<string, any>,
): Promise<deleteTaskTypeAPIResponse> => {
  const input = postValidationInput as deleteTaskTypesRequest
  /** select TaskType query to validate taskType id */
  const selectTaskType = `SELECT TASK_TYPE_ID, IS_ATTACHED_WITH_SAP FROM m_task_type WHERE TASK_TYPE_ID= :taskTypeId
AND IS_DELETED = ${Constants.IS_NOT_DELETED}`

  /** select event template query to validate task type id */
  const selectEventTemplate = `SELECT TASK_TYPE_ID FROM m_event_template WHERE TASK_TYPE_ID= :taskTypeId
AND IS_DELETED = ${Constants.IS_NOT_DELETED}`

  /** delete TaskType query */
  const deleteTaskTypeQuery = `
  UPDATE m_task_type
          SET
          IS_DELETED = ${Constants.IS_DELETED},
          UPDATE_TIMESTAMP = :curdate,
          UPDATE_USER_ID = :updateUserId
          WHERE
          TASK_TYPE_ID = :taskTypeId`

  /** delete EventTemplate query */
  const deleteEventTemplateQuery = `
  UPDATE m_event_template
          SET
          IS_DELETED = ${Constants.IS_DELETED}
          WHERE
          TASK_TYPE_ID = :taskTypeId`
  try {
    const result = await sequelize.transaction<deleteTaskTypeAPIResponse>(async (transaction: Transaction) => {
      const curdate = new Date()

      /** building queries for get task type id */
      const taskTypeIdRes = await sequelize.query<{
        TASK_TYPE_ID: number
        IS_ATTACHED_WITH_SAP: number
      }>(selectTaskType, {
        replacements: {
          taskTypeId: input[Constants.FIELDS.TASK_TYPE_ID],
        },
        raw: true,
        plain: true,
        type: QueryTypes.SELECT,
        transaction,
      })

      //taskType For eventTemplate
      const taskTypeForEventTemplateId = await sequelize.query<{
        TASK_TYPE_ID: number
      }>(selectEventTemplate, {
        replacements: {
          taskTypeId: input[Constants.FIELDS.TASK_TYPE_ID],
        },
        raw: true,
        plain: true,
        type: QueryTypes.SELECT,
        transaction,
      })

      if (taskTypeIdRes === null) {
        throw new TaskTypeIdNotFoundError(input[Constants.FIELDS.TASK_TYPE_ID])
      } else {
        if (taskTypeIdRes.IS_ATTACHED_WITH_SAP === Constants.IS_ATTACHED_WITH_SAP) {
          throw new Error()
        }
      }

      if (taskTypeForEventTemplateId !== null) {
        /** delete event template model */
        await sequelize.query(deleteEventTemplateQuery, {
          raw: true,
          type: QueryTypes.UPDATE,
          transaction,
          replacements: {
            taskTypeId: input[Constants.FIELDS.TASK_TYPE_ID],
          },
        })
      }

      /** delete task type model */
      await sequelize.query(deleteTaskTypeQuery, {
        raw: true,
        type: QueryTypes.UPDATE,
        transaction,
        replacements: {
          taskTypeId: input[Constants.FIELDS.TASK_TYPE_ID],
          curdate,
          updateUserId: input[Constants.FIELDS.OPERATE_USER_ID],
        },
      })

      return {
        code: Constants.STATUS_CODES.SUCCESS_CODE,
        body: Constants.SUCCESS_MESSAGES.SUCCESS,
      }
    })
    return result
  } catch (e: any) {
    logger.error(e)
    handleDbError("DB Error", e)
    if (e instanceof TaskTypeIdNotFoundError) {
      return send404Response(e)
    }
    return {
      code: Constants.ERROR_CODES.BAD_REQUEST,
      body: Constants.ERROR_MESSAGES.BAD_REQUEST,
    }
  }
}

/**
 * Description consolidateDeleteTaskTypeRequest
 *
 * @param {Request} req
 * @returns {(deleteTaskTypesRequest | Record<string, any>)} deleteTaskTypesReq
 */
export const consolidateDeleteTaskTypeRequest = (req: Request): deleteTaskTypesRequest | Record<string, any> => {
  return {
    "operate-user-id": req.body[Constants.FIELDS.OPERATE_USER_ID],
    "task-type-id": Number(req.params.taskTypeId),
  }
}

/**
 * Description softdelete TaskType controller
 *
 * @type {*} export
 */
export const deleteTaskTypeController = jsonOrEmptyResponse(
  extractValue(consolidateDeleteTaskTypeRequest)(deleteTaskType),
  [Constants.STATUS_CODES.SUCCESS_CODE, Constants.ERROR_CODES.BAD_REQUEST, Constants.ERROR_CODES.NOT_FOUND_CODE],
)
