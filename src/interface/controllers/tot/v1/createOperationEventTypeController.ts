import { Request } from "express"
import { QueryTypes } from "sequelize"
import { sequelize } from "../../../../infrastructure/orm/sqlize/index.js"
import { extractValue, jsonOrEmptyResponse } from "../../../decorators.js"
import { Constants } from "../../../../config/constants.js"

import {
  handleDbError,
  UserIdNotFoundError,
  send404Response,
  EventTypeIdNotFoundError,
  OperationNameNotFoundError,
  InvalidEventTypeNameError,
  send400Response,
  EventTypeAttachWithSapError,
} from "./utils.js"
import {
  createOperationEventTypeAPIResponse,
  createOperationEventTypeRequest,
} from "../../../../domain/entities/tot/v1/createOperationEventType.js"
import { logger } from "@azure/event-hubs"

/**
 * create operation-event-type relation function
 *
 * @async
 * @param {(createOperationEventTypeRequest | Record<string, any>)} postValidationInput
 * @returns {Promise<createOperationEventTypeAPIResponse>} createOperationEventTypeAPI
 */
const createOperationEventType = async (
  postValidationInput: createOperationEventTypeRequest | Record<string, any>,
): Promise<createOperationEventTypeAPIResponse> => {
  const input = postValidationInput as createOperationEventTypeRequest
  // select m_event_type query for validate event-type-id and event-type-name
  const selectEventTypeQuery = `SELECT EVENT_TYPE_ID, EVENT_TYPE_NAME, IS_ATTACHED_WITH_SAP FROM m_event_type WHERE EVENT_TYPE_ID= :eventTypeId AND IS_DELETED = ${Constants.IS_NOT_DELETED}`

  // select m_operation query for validate operation-name
  const selectOperationQuery = `SELECT OPERATION_ID FROM m_operation WHERE OPERATION_NAME= :operationName`

  // select m_user_tot query for validate operator-user-id
  const selectOperatorNameQuery = `SELECT USER_NAME FROM m_user_tot WHERE USER_ID = :operateUserId;`

  // select t_operation_event_type to check if event type associated with any operation
  const selectOperationEventQuery = `SELECT OPERATION_ID FROM t_operation_event_type WHERE EVENT_TYPE_ID = :eventTypeId;`

  // insert operationEventType
  const insertOperationEventTypeQuery = `INSERT INTO t_operation_event_type
  (OPERATION_ID,
  EVENT_TYPE_ID,
  CREATE_USER_ID,
  UPDATE_USER_ID
  )
  VALUES
  (:operationId,
  :eventTypeId,
  :operateUserId,
  :operateUserId
  )`

  try {
    const result = await sequelize.transaction<createOperationEventTypeAPIResponse>(async (transaction) => {
      /** building queries for get event type */
      const eventType = await sequelize.query<{
        EVENT_TYPE_ID: number
        EVENT_TYPE_NAME: string
        IS_ATTACHED_WITH_SAP: number
      }>(selectEventTypeQuery, {
        replacements: {
          eventTypeId: input[Constants.FIELDS.EVENT_TYPE_ID],
        },
        raw: true,
        plain: true,
        type: QueryTypes.SELECT,
        transaction,
      })

      if (eventType) {
        if (eventType.EVENT_TYPE_NAME !== input[Constants.FIELDS.EVENT_TYPE_NAME]) {
          throw new InvalidEventTypeNameError(input[Constants.FIELDS.EVENT_TYPE_NAME])
        } else {
          if (eventType.IS_ATTACHED_WITH_SAP === Constants.IS_ATTACHED_WITH_SAP) {
            throw new EventTypeAttachWithSapError(input[Constants.FIELDS.EVENT_TYPE_ID])
          }
        }
      } else {
        throw new EventTypeIdNotFoundError(input[Constants.FIELDS.EVENT_TYPE_ID])
      }

      /** building queries for get operation */
      const operation = await sequelize.query<{
        OPERATION_ID: number
      }>(selectOperationQuery, {
        replacements: {
          operationName: input[Constants.FIELDS.OPERATION_NAME],
        },
        raw: true,
        plain: true,
        type: QueryTypes.SELECT,
        transaction,
      })

      if (!operation) {
        throw new OperationNameNotFoundError(input[Constants.FIELDS.OPERATION_NAME])
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

      if (!operator) {
        throw new UserIdNotFoundError(input[Constants.FIELDS.OPERATE_USER_ID])
      }

      /** building queries for get operationEvent */
      const operationEvent = await sequelize.query<{
        OPERATION_ID: number
      }>(selectOperationEventQuery, {
        replacements: {
          eventTypeId: input[Constants.FIELDS.EVENT_TYPE_ID],
        },
        raw: true,
        plain: true,
        type: QueryTypes.SELECT,
        transaction,
      })

      // if eventType is in relation with any operation
      if (operationEvent) {
        return {
          code: Constants.ERROR_CODES.CONFLICT,
          body: Constants.ERROR_MESSAGES.CONFLICT,
        }
      }

      // create operationEventType relation
      await sequelize.query(insertOperationEventTypeQuery, {
        raw: true,
        type: QueryTypes.INSERT,
        transaction,
        replacements: {
          operationId: operation.OPERATION_ID,
          eventTypeId: input[Constants.FIELDS.EVENT_TYPE_ID],
          operateUserId: input[Constants.FIELDS.OPERATE_USER_ID],
        },
      })

      return {
        code: Constants.STATUS_CODES.CREATE_SUCCESS_CODE,
        body: Constants.SUCCESS_MESSAGES.SUCCESS,
      }
    })
    return result
  } catch (err: any) {
    logger.error(err)
    handleDbError("CreateOperationEventType", err)
    if (
      err instanceof EventTypeIdNotFoundError ||
      err instanceof OperationNameNotFoundError ||
      err instanceof UserIdNotFoundError
    ) {
      return send404Response(err)
    }

    if (err instanceof InvalidEventTypeNameError || err instanceof EventTypeAttachWithSapError) {
      return send400Response(err)
    }

    return {
      code: Constants.ERROR_CODES.BAD_REQUEST,
      body: Constants.ERROR_MESSAGES.BAD_REQUEST,
    }
  }
}

/**
 * consolidate create operation-event-type relation request parameter
 *
 * @param {Request} req
 * @returns {(createOperationEventTypeRequest | Record<string, any>)} createOperationEventTypeRequest
 */
export const consolidateCreateOperationEventTypeRequest = (
  req: Request,
): createOperationEventTypeRequest | Record<string, any> => ({
  "event-type-id": req.body[Constants.FIELDS.EVENT_TYPE_ID],
  "event-type-name": req.body[Constants.FIELDS.EVENT_TYPE_NAME],
  "operation-name": req.body[Constants.FIELDS.OPERATION_NAME],
  "operate-user-id": req.body[Constants.FIELDS.OPERATE_USER_ID],
})

/**
 * create operation-event-type relation controller
 *
 * @type {*} export
 */
export const createOperationEventTypeController = jsonOrEmptyResponse(
  extractValue(consolidateCreateOperationEventTypeRequest)(createOperationEventType),
  [
    Constants.STATUS_CODES.CREATE_SUCCESS_CODE,
    Constants.ERROR_CODES.NOT_FOUND_CODE,
    Constants.ERROR_CODES.BAD_REQUEST,
    Constants.ERROR_CODES.CONFLICT,
  ],
)
