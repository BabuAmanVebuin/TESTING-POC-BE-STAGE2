import { Request } from "express"
import { QueryTypes } from "sequelize"

import { sequelize } from "../../../../infrastructure/orm/sqlize/index.js"
import { extractValue, jsonOrEmptyResponse } from "../../../decorators.js"
import logger from "../../../../infrastructure/logger.js"
import { Constants } from "../../../../config/constants.js"

import {
  handleDbError,
  send404Response,
  EventTypeIdNotFoundError,
  OperationNameNotFoundError,
  InvalidEventTypeNameError,
  send400Response,
  UserIdNotFoundError,
  EventTypeAttachWithSapError,
} from "./utils.js"
import { createEventTemplateRequest } from "../../../../domain/entities/tot/v1/createEventTemplate.js"
import {
  updateOperationEventTypeAPIResponse,
  updateOperationEventTypeRequest,
} from "../../../../domain/entities/tot/v1/updateOperationEventType.js"

/**
 * update operation event function
 *
 * @async
 * @param {(updateOperationEventTypeRequest | Record<string, any>)} postValidationInput
 * @returns {Promise<updateOperationEventTypeAPIResponse>} updateOperationEventTypeAPI
 */
const updateOperationEventType = async (
  postValidationInput: updateOperationEventTypeRequest | Record<string, any>,
): Promise<updateOperationEventTypeAPIResponse> => {
  const input = postValidationInput as updateOperationEventTypeRequest

  // select m_event_type query for validate event-type-id and event-type-name
  const selectEventTypeQuery = `SELECT EVENT_TYPE_ID, EVENT_TYPE_NAME, IS_ATTACHED_WITH_SAP FROM m_event_type WHERE EVENT_TYPE_ID= :eventTypeId AND IS_DELETED = :isDeleted`

  // select m_operation query for validate operation-name
  const selectOperationQuery = `SELECT OPERATION_ID FROM m_operation WHERE OPERATION_NAME= :operationName`

  // select m_user_tot query for validate operator-user-id
  const selectOperatorNameQuery = `SELECT USER_NAME FROM m_user_tot WHERE USER_ID = :operateUserId;`

  // select t_operation_event_type to check if event type associated with any operation
  const selectOperationEventTypeQuery = `SELECT OPERATION_ID, EVENT_TYPE_ID FROM t_operation_event_type WHERE EVENT_TYPE_ID = :eventTypeId AND IS_DELETED = :isDeleted;`

  // delete operationEventType
  const deleteOperationEventTypeQuery = `UPDATE t_operation_event_type SET IS_DELETED = :isDeleted, UPDATE_USER_ID =:operateUserId WHERE EVENT_TYPE_ID= :eventTypeId`

  // upsert operationEventType
  const upsertOperationEventTypeQuery = `INSERT INTO t_operation_event_type
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
  )
  ON DUPLICATE KEY UPDATE IS_DELETED = :isDeleted, UPDATE_USER_ID =:operateUserId`

  try {
    const result = await sequelize.transaction<updateOperationEventTypeAPIResponse>(async (transaction) => {
      /** building queries for get event type */
      const eventType = await sequelize.query<{
        EVENT_TYPE_ID: number
        EVENT_TYPE_NAME: string
        IS_ATTACHED_WITH_SAP: number
      }>(selectEventTypeQuery, {
        replacements: {
          eventTypeId: input[Constants.FIELDS.EVENT_TYPE_ID],
          isDeleted: Constants.IS_NOT_DELETED,
        },
        raw: true,
        plain: true,
        type: QueryTypes.SELECT,
        transaction,
      })

      if (!eventType) {
        throw new EventTypeIdNotFoundError(input[Constants.FIELDS.EVENT_TYPE_ID])
      } else {
        if (eventType.EVENT_TYPE_NAME !== input[Constants.FIELDS.EVENT_TYPE_NAME]) {
          throw new InvalidEventTypeNameError(input[Constants.FIELDS.EVENT_TYPE_NAME])
        } else {
          if (eventType.IS_ATTACHED_WITH_SAP === Constants.IS_ATTACHED_WITH_SAP) {
            throw new EventTypeAttachWithSapError(input[Constants.FIELDS.EVENT_TYPE_ID])
          }
        }
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

      /** building queries for get OperationEventType */
      const OperationEventType = await sequelize.query<{
        OPERATION_ID: number
        EVENT_TYPE_ID: number
      }>(selectOperationEventTypeQuery, {
        replacements: {
          eventTypeId: input[Constants.FIELDS.EVENT_TYPE_ID],
          isDeleted: Constants.IS_NOT_DELETED,
        },
        raw: true,
        plain: true,
        type: QueryTypes.SELECT,
        transaction,
      })

      // if eventType is not in relation with any operation
      if (!OperationEventType) {
        throw Error()
      }

      // if new operation name is same as old then return conflict response
      if (operation.OPERATION_ID === OperationEventType.OPERATION_ID) {
        return {
          code: Constants.ERROR_CODES.CONFLICT,
          body: Constants.ERROR_MESSAGES.CONFLICT,
        }
      }

      // delete old operation-event relation
      await sequelize.query(deleteOperationEventTypeQuery, {
        raw: true,
        type: QueryTypes.UPDATE,
        transaction,
        replacements: {
          isDeleted: Constants.IS_DELETED,
          operateUserId: input[Constants.FIELDS.OPERATE_USER_ID],
          eventTypeId: input[Constants.FIELDS.EVENT_TYPE_ID],
        },
      })

      // insert or update operation-event relation
      await sequelize.query(upsertOperationEventTypeQuery, {
        replacements: {
          eventTypeId: input[Constants.FIELDS.EVENT_TYPE_ID],
          operationId: operation.OPERATION_ID,
          operateUserId: input[Constants.FIELDS.OPERATE_USER_ID],
          isDeleted: Constants.IS_NOT_DELETED,
        },
        raw: true,
        type: QueryTypes.UPDATE,
        transaction,
      })

      return {
        code: Constants.STATUS_CODES.CREATE_SUCCESS_CODE,
        body: Constants.SUCCESS_MESSAGES.SUCCESS,
      }
    })
    return result
  } catch (err: any) {
    logger.error(err)
    handleDbError("UpdateOperationEventType", err)
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
 * consolidate update operation event relation request parameter
 *
 * @param {Request} req
 * @returns {(updateOperationEventTypeRequest | Record<string, any>)} updateOperationEventTypeRequest
 */
export const consolidateUpdateOperationEventTypeRequest = (
  req: Request,
): createEventTemplateRequest | Record<string, any> => ({
  "event-type-id": req.body[Constants.FIELDS.EVENT_TYPE_ID],
  "event-type-name": req.body[Constants.FIELDS.EVENT_TYPE_NAME],
  "operation-name": req.body[Constants.FIELDS.OPERATION_NAME],
  "operate-user-id": req.body[Constants.FIELDS.OPERATE_USER_ID],
})

/**
 * Update operation-event relation controller
 *
 * @type {*} export
 */
export const updateOperationEventTypeController = jsonOrEmptyResponse(
  extractValue(consolidateUpdateOperationEventTypeRequest)(updateOperationEventType),
  [
    Constants.STATUS_CODES.CREATE_SUCCESS_CODE,
    Constants.ERROR_CODES.NOT_FOUND_CODE,
    Constants.ERROR_CODES.BAD_REQUEST,
    Constants.ERROR_CODES.CONFLICT,
  ],
)
