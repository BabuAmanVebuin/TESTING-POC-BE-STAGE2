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
  EventTypeIdNotFoundError,
  TaskTypeIdNotFoundError,
  InvalidEventTypeNameError,
  InvalidTaskTypeNameError,
  send400Response,
} from "./utils.js"
import {
  createEventTemplateAPIResponse,
  createEventTemplateRequest,
} from "../../../../domain/entities/tot/v1/createEventTemplate.js"

/**
 * Description create event template function
 *
 * @async
 * @param {(createEventTemplateRequest | Record<string, any>)} postValidationInput
 * @returns {Promise<createEventTemplateAPIResponse>} createEventTemplateAPI
 */
const createEventTemplate = async (
  postValidationInput: createEventTemplateRequest | Record<string, any>,
): Promise<createEventTemplateAPIResponse> => {
  const input = postValidationInput as createEventTemplateRequest
  const taskPriorityId = Constants.DEFAULT_TASK_PRIORITY_ID
  const curdate = new Date()
  // select m_event_type query for validate event-type-id and event-type-name
  const selectEventTypeQuery = `SELECT EVENT_TYPE_ID, EVENT_TYPE_NAME FROM m_event_type WHERE EVENT_TYPE_ID= :eventTypeId AND IS_DELETED = ${Constants.IS_NOT_DELETED}`

  // select m_task_type query for validate task-type-id and task-type-name
  const selectTaskTypeQuery = `SELECT TASK_TYPE_ID, TASK_TYPE_NAME FROM m_task_type WHERE TASK_TYPE_ID= :taskTypeId AND IS_DELETED = ${Constants.IS_NOT_DELETED}`

  // select m_user_tot query for validate operator-user-id
  const selectOperatorNameQuery = `SELECT USER_NAME FROM m_user_tot WHERE USER_ID = :operateUserId;`

  // select highest eventTemplateSortNumber for eventTypeId
  const selectHighestEventTemplateSortNumberQuery = `SELECT MAX(EVENT_TEMPLATE_SORT_NUMBER) HIGHEST_EVENT_TEMPLATE_SORT_NUMBER FROM m_event_template WHERE EVENT_TYPE_ID = :eventTypeId;`

  // select eventTemplate to check if task type associated with any eventType
  const selectEventTemplateQuery = `SELECT EVENT_TEMPLATE_ID FROM m_event_template WHERE TASK_TYPE_ID = :taskTypeId;`

  // insert eventTemplate
  const insertEventTemplateQuery = `INSERT INTO m_event_template
  (EVENT_TEMPLATE_ID,
  EVENT_TYPE_ID,
  TASK_TYPE_ID,
  TASK_PRIORITY_ID,
  EVENT_TEMPLATE_SORT_NUMBER,
  CREATE_TIMESTAMP,
  CREATE_USER_ID,
  UPDATE_TIMESTAMP,
  UPDATE_USER_ID
  )
  VALUES
  (:eventTemplateId,
  :eventTypeId,
  :taskTypeId,
  :taskPriorityId,
  :eventTemplateSortNumber,
  :curdate,
  :operateUserId,
  :curdate,
  :operateUserId
  )`

  try {
    const result = await sequelize.transaction<createEventTemplateAPIResponse>(async (transaction) => {
      /** building queries for get event type */
      const eventType = await sequelize.query<{
        EVENT_TYPE_ID: number
        EVENT_TYPE_NAME: string
      }>(selectEventTypeQuery, {
        replacements: {
          eventTypeId: input[Constants.FIELDS.EVENT_TYPE_ID],
        },
        raw: true,
        plain: true,
        type: QueryTypes.SELECT,
        transaction,
      })

      if (eventType === null) {
        throw new EventTypeIdNotFoundError(input[Constants.FIELDS.EVENT_TYPE_ID])
      } else {
        if (eventType.EVENT_TYPE_NAME !== input[Constants.FIELDS.EVENT_TYPE_NAME]) {
          throw new InvalidEventTypeNameError(input[Constants.FIELDS.EVENT_TYPE_NAME])
        }
      }

      /** building queries for get task type */
      const taskType = await sequelize.query<{
        TASK_TYPE_ID: number
        TASK_TYPE_NAME: string
      }>(selectTaskTypeQuery, {
        replacements: {
          taskTypeId: input[Constants.FIELDS.TASK_TYPE_ID],
        },
        raw: true,
        plain: true,
        type: QueryTypes.SELECT,
        transaction,
      })

      if (taskType === null) {
        throw new TaskTypeIdNotFoundError(input[Constants.FIELDS.TASK_TYPE_ID])
      } else {
        if (taskType.TASK_TYPE_NAME !== input[Constants.FIELDS.TASK_TYPE_NAME]) {
          throw new InvalidTaskTypeNameError(input[Constants.FIELDS.TASK_TYPE_NAME])
        }
      }

      /** building queries for get operation */
      const operator = await sequelize.query<{
        USER_NAME: string
      }>(selectOperatorNameQuery, {
        replacements: {
          operateUserId: input[Constants.FIELDS.OPERATE_USER_ID],
        },
        raw: true,
        plain: true,
        type: QueryTypes.SELECT,
        transaction,
      })

      if (operator === null) {
        throw new UserIdNotFoundError(input[Constants.FIELDS.OPERATE_USER_ID])
      }

      /** building queries for get eventTemplate */
      const eventTemplate = await sequelize.query<{
        EVENT_TEMPLATE_ID: number
      }>(selectEventTemplateQuery, {
        replacements: {
          taskTypeId: input[Constants.FIELDS.TASK_TYPE_ID],
        },
        raw: true,
        plain: true,
        type: QueryTypes.SELECT,
        transaction,
      })

      if (eventTemplate !== null) {
        return {
          code: Constants.ERROR_CODES.CONFLICT,
          body: Constants.ERROR_MESSAGES.CONFLICT,
        }
      }

      // get highest event template sort number for eventTypeId
      const highestEventTemplateSortNumber = await sequelize.query<{
        HIGHEST_EVENT_TEMPLATE_SORT_NUMBER: number
      }>(selectHighestEventTemplateSortNumberQuery, {
        replacements: {
          eventTypeId: input[Constants.FIELDS.EVENT_TYPE_ID],
        },
        raw: true,
        plain: true,
        type: QueryTypes.SELECT,
        transaction,
      })
      const eventTemplateSortNumber: number = highestEventTemplateSortNumber
        ? highestEventTemplateSortNumber.HIGHEST_EVENT_TEMPLATE_SORT_NUMBER + 1
        : 1

      // insert record in eventTemplate
      await sequelize.query(insertEventTemplateQuery, {
        raw: true,
        type: QueryTypes.INSERT,
        transaction,
        replacements: {
          eventTemplateId: eventTemplateSortNumber,
          eventTypeId: input[Constants.FIELDS.EVENT_TYPE_ID],
          taskTypeId: input[Constants.FIELDS.TASK_TYPE_ID],
          taskPriorityId: taskPriorityId,
          eventTemplateSortNumber: eventTemplateSortNumber,
          curdate,
          operateUserId: input[Constants.FIELDS.OPERATE_USER_ID],
        },
      })

      return {
        code: Constants.STATUS_CODES.CREATE_SUCCESS_CODE,
        body: Constants.SUCCESS_MESSAGES.SUCCESS,
      } as createEventTemplateAPIResponse
    })
    return result
  } catch (err: any) {
    logger.error(err)
    handleDbError("CreateEventTemplate.js", err)
    if (
      err instanceof EventTypeIdNotFoundError ||
      err instanceof TaskTypeIdNotFoundError ||
      err instanceof UserIdNotFoundError
    ) {
      return send404Response(err)
    }

    if (err instanceof InvalidEventTypeNameError || err instanceof InvalidTaskTypeNameError) {
      return send400Response(err)
    }

    return {
      code: Constants.ERROR_CODES.BAD_REQUEST,
      body: Constants.ERROR_MESSAGES.BAD_REQUEST,
    }
  }
}

/**
 * Description consolidate create event template request parameter
 *
 * @param {Request} req
 * @returns {(createEventTemplateRequest | Record<string, any>)} createEventTemplateRequest
 */
export const consolidateCreateEventTemplateRequest = (
  req: Request,
): createEventTemplateRequest | Record<string, any> => ({
  "event-type-id": req.body[Constants.FIELDS.EVENT_TYPE_ID],
  "event-type-name": req.body[Constants.FIELDS.EVENT_TYPE_NAME],
  "task-type-id": req.body[Constants.FIELDS.TASK_TYPE_ID],
  "task-type-name": req.body[Constants.FIELDS.TASK_TYPE_NAME],
  "operate-user-id": req.body[Constants.FIELDS.OPERATE_USER_ID],
})

/**
 * Description create event template controller
 *
 * @type {*} export
 */
export const createEventTemplateController = jsonOrEmptyResponse(
  extractValue(consolidateCreateEventTemplateRequest)(createEventTemplate),
  [
    Constants.STATUS_CODES.CREATE_SUCCESS_CODE,
    Constants.ERROR_CODES.NOT_FOUND_CODE,
    Constants.ERROR_CODES.BAD_REQUEST,
    Constants.ERROR_CODES.CONFLICT,
  ],
)
