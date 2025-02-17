// Initially copied from ToT-BE, commit 545c1dd02ed8df920e315645df162212e80b2a03

/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request } from "express"
import { QueryTypes, Transaction } from "sequelize"
import { sequelize } from "../../../../infrastructure/orm/sqlize/index.js"
import { extractValue, jsonOrEmptyResponse } from "../../../decorators.js"
import logger from "../../../../infrastructure/logger.js"
import { Constants } from "../../../../config/constants.js"
import {
  send404Response,
  EventTypeIdNotFoundError,
  handleDbError,
  EventTypeAttachWithSapError,
  send400Response,
} from "./utils.js"
import {
  deleteEventTypeAPIResponse,
  deleteEventTypesRequest,
} from "../../../../domain/entities/tot/v1/deleteEventTypes.js"

/**
 * Description delete EventTypes
 *
 * @async
 * @param {(deleteEventTypesRequest | Record<string, any>)} postValidationInput
 * @returns {Promise<deleteEventTypeAPIResponse>} deleteEventTypeAPIResponse
 */
const deleteEventTypes = async (
  postValidationInput: deleteEventTypesRequest | Record<string, any>,
): Promise<deleteEventTypeAPIResponse> => {
  const input = postValidationInput as deleteEventTypesRequest
  /** select EventType query to validate eventType id */
  const selectEventType = `SELECT EVENT_TYPE_ID, IS_ATTACHED_WITH_SAP FROM m_event_type WHERE EVENT_TYPE_ID= :eventTypeId
  AND IS_DELETED = ${Constants.IS_NOT_DELETED}`

  /** select event template query to validate event type id */
  const selectEventTemplate = `SELECT EVENT_TYPE_ID 'event-type-id', group_concat(TASK_TYPE_ID) 'task-type-id' FROM m_event_template WHERE EVENT_TYPE_ID= :eventTypeId
  AND IS_DELETED = ${Constants.IS_NOT_DELETED} group by EVENT_TYPE_ID;`

  /** delete EventType query */
  const deleteEventTypeQuery = `
    UPDATE m_event_type
            SET
            IS_DELETED = ${Constants.IS_DELETED},
            UPDATE_TIMESTAMP = :curdate,
            UPDATE_USER_ID = :updateUserId
            WHERE
            EVENT_TYPE_ID = :eventTypeId`

  /** delete TaskType query */
  const deleteTaskTypeQuery = `
    UPDATE m_task_type
            SET
            IS_DELETED = ${Constants.IS_DELETED},
            UPDATE_TIMESTAMP = :curdate,
            UPDATE_USER_ID = :updateUserId
            WHERE
            TASK_TYPE_ID IN (:taskTypeId)`

  /** delete EventTemplate query */
  const deleteEventTemplateQuery = `
    UPDATE m_event_template
            SET
            IS_DELETED = ${Constants.IS_DELETED}
            WHERE
            EVENT_TYPE_ID = :eventTypeId`
  try {
    const result = await sequelize.transaction<deleteEventTypeAPIResponse>(async (transaction: Transaction) => {
      const curdate = new Date()

      /** building queries for get event type id */
      const eventTypeIdRes = await sequelize.query<{
        EVENT_TYPE_ID: number
        IS_ATTACHED_WITH_SAP: number
      }>(selectEventType, {
        replacements: {
          eventTypeId: input[Constants.FIELDS.EVENT_TYPE_ID],
        },
        raw: true,
        plain: true,
        type: QueryTypes.SELECT,
        transaction,
      })

      //eventType and taskType For eventTemplate
      const eventTypeForEventTemplateId = await sequelize.query<{
        "event-type-id": number
        "task-type-id": string
      }>(selectEventTemplate, {
        replacements: {
          eventTypeId: input[Constants.FIELDS.EVENT_TYPE_ID],
        },
        raw: true,
        plain: true,
        type: QueryTypes.SELECT,
        transaction,
      })

      if (eventTypeIdRes === null) {
        throw new EventTypeIdNotFoundError(input[Constants.FIELDS.EVENT_TYPE_ID])
      } else {
        // check if event-type is attached with sap
        if (eventTypeIdRes.IS_ATTACHED_WITH_SAP === Constants.IS_ATTACHED_WITH_SAP) {
          throw new EventTypeAttachWithSapError(input[Constants.FIELDS.EVENT_TYPE_ID])
        }
      }

      /** delete event type model */
      await sequelize.query(deleteEventTypeQuery, {
        raw: true,
        type: QueryTypes.UPDATE,
        transaction,
        replacements: {
          eventTypeId: input[Constants.FIELDS.EVENT_TYPE_ID],
          curdate,
          updateUserId: input[Constants.FIELDS.OPERATE_USER_ID],
        },
      })

      if (eventTypeForEventTemplateId !== null) {
        /** delete task type model */
        await sequelize.query(deleteTaskTypeQuery, {
          raw: true,
          type: QueryTypes.UPDATE,
          transaction,
          replacements: {
            taskTypeId: eventTypeForEventTemplateId[Constants.FIELDS.TASK_TYPE_ID].split(","),
            curdate,
            updateUserId: input[Constants.FIELDS.OPERATE_USER_ID],
          },
        })

        /** delete event template model */
        await sequelize.query(deleteEventTemplateQuery, {
          raw: true,
          type: QueryTypes.UPDATE,
          transaction,
          replacements: {
            eventTypeId: input[Constants.FIELDS.EVENT_TYPE_ID],
          },
        })
      }

      return {
        code: Constants.STATUS_CODES.SUCCESS_CODE,
        body: Constants.SUCCESS_MESSAGES.SUCCESS,
      }
    })
    return result
  } catch (e: any) {
    logger.error(e)
    handleDbError("DB Error", e)
    if (e instanceof EventTypeIdNotFoundError) {
      return send404Response(e)
    }
    if (e instanceof EventTypeAttachWithSapError) {
      return send400Response(e)
    }
    return {
      code: Constants.ERROR_CODES.BAD_REQUEST,
      body: Constants.ERROR_MESSAGES.BAD_REQUEST,
    }
  }
}

/**
 * Description consolidateDeleteEventTypesRequest
 *
 * @param {Request} req
 * @returns {(softdeleteEventTypesRequest | Record<string, any>)} deleteEventTypesReq
 */
export const consolidateDeleteEventTypesRequest = (req: Request): deleteEventTypesRequest | Record<string, any> => {
  return {
    "operate-user-id": req.body[Constants.FIELDS.OPERATE_USER_ID],
    "event-type-id": Number(req.params.eventTypeId),
  }
}

/**
 * Description delete event type controller
 *
 * @type {*} export
 */
export const deleteEventTypesController = jsonOrEmptyResponse(
  extractValue(consolidateDeleteEventTypesRequest)(deleteEventTypes),
  [Constants.STATUS_CODES.SUCCESS_CODE, Constants.ERROR_CODES.BAD_REQUEST, Constants.ERROR_CODES.NOT_FOUND_CODE],
)
