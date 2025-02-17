// Initially copied from ToT-BE, commit 545c1dd02ed8df920e315645df162212e80b2a03
import { Request } from "express"
import { QueryTypes } from "sequelize"

import { sequelize } from "../../../../infrastructure/orm/sqlize/index.js"
import { extractValue, jsonOrEmptyResponse } from "../../../decorators.js"
import logger from "../../../../infrastructure/logger.js"
import { Constants } from "../../../../config/constants.js"

import { EventTypeNameNotFoundError, handleDbError, UserIdNotFoundError, send404Response } from "./utils.js"
import {
  createEventTypeAPIResponse,
  createEventTypeRequest,
} from "../../../../domain/entities/tot/v1/createEventTypes.js"

/**
 * Description create event type function
 *
 * @async
 * @param {(createEventTypeRequest | Record<string, any>)} postValidationInput
 * @returns {Promise<createEventTypeAPIResponse>} createEventTypeAPI
 */
const createEventType = async (
  postValidationInput: createEventTypeRequest | Record<string, any>,
): Promise<createEventTypeAPIResponse> => {
  const input = postValidationInput as createEventTypeRequest

  /** insert event type query */
  const insertEventTypeQuery = `INSERT INTO m_event_type
  (
  EVENT_TYPE_NAME,
  EVENT_TYPE_SORT_NUMBER,
  CREATE_TIMESTAMP,
  CREATE_USER_ID,
  UPDATE_TIMESTAMP,
  UPDATE_USER_ID)
  VALUES
  (
  :eventTypeName,
  :eventTypeSortNumber,
  :curdate,
  :operateUserId,
  :curdate,
  :operateUserId);`

  try {
    const result = await sequelize.transaction<createEventTypeAPIResponse>(async (transaction) => {
      /* select user name by user id in user table */
      const selectOperatorNameQuery = `SELECT USER_NAME FROM m_user_tot WHERE USER_ID = :operateUserId;`

      const curdate = new Date()
      const insertIds: number[] = []
      /**
       * Query to check event-type-sort-number validation from request
       */
      const getEventTypeSortNumberQuery = `SELECT MAX(EVENT_TYPE_SORT_NUMBER) 'event-type-sort-number'
        FROM m_event_type;`

      const EventTypeSortNumber = await sequelize.query<{
        "event-type-sort-number": number
      }>(getEventTypeSortNumberQuery, {
        raw: true,
        type: QueryTypes.SELECT,
        replacements: {},
      })

      let counter = EventTypeSortNumber[0][Constants.FIELDS.EVENT_TYPE_SORT_NUMBER] + 1

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
      input.eventTypes.forEach((value) => {
        if (
          value[Constants.FIELDS.EVENT_TYPE_NAME] === "" ||
          value[Constants.FIELDS.EVENT_TYPE_NAME] === undefined ||
          value[Constants.FIELDS.EVENT_TYPE_NAME] === null
        ) {
          throw new EventTypeNameNotFoundError(value[Constants.FIELDS.EVENT_TYPE_NAME])
        }
      })
      for (const eventType of input.eventTypes) {
        if (!eventType[Constants.FIELDS.EVENT_TYPE_NAME]) {
          return {
            code: Constants.ERROR_CODES.BAD_REQUEST,
            body: Constants.ERROR_MESSAGES.BAD_REQUEST,
          }
        } else {
          /** insert eventtype model */
          const [insertId, _] = await sequelize.query(insertEventTypeQuery, {
            raw: true,
            type: QueryTypes.INSERT,
            transaction,
            replacements: {
              eventTypeName: eventType[Constants.FIELDS.EVENT_TYPE_NAME],
              curdate,
              eventTypeSortNumber: counter,
              operateUserId: input[Constants.FIELDS.OPERATE_USER_ID],
            },
          })
          counter++
          insertIds.push(insertId)
        }
      }
      return {
        code: Constants.STATUS_CODES.CREATE_SUCCESS_CODE,
        body: insertIds.map((value) => ({ "event-type-id": value })),
      }
    })
    return result
  } catch (err: any) {
    logger.error(err)
    handleDbError("CreateEventType", err)
    if (err instanceof EventTypeNameNotFoundError) {
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
 * Description consolidate event type request parameter
 *
 * @param {Request} req
 * @returns {(createEventTypeRequest | Record<string, any>)} createEventTypeRequest
 */
export const consolidatecreateEventTypeRequest = (req: Request): createEventTypeRequest | Record<string, any> => ({
  eventTypes: req.body[Constants.FIELDS.EVENT_TYPE].map((eventType: Record<string, any>) => ({
    "event-type-name": eventType[Constants.FIELDS.EVENT_TYPE_NAME],
  })),
  "operate-user-id": req.body[Constants.FIELDS.OPERATE_USER_ID],
})

/**
 * Description create event type controller
 *
 * @type {*} export
 */
export const createEventTypesController = jsonOrEmptyResponse(
  extractValue(consolidatecreateEventTypeRequest)(createEventType),
  [Constants.STATUS_CODES.CREATE_SUCCESS_CODE, Constants.ERROR_CODES.NOT_FOUND_CODE, Constants.ERROR_CODES.BAD_REQUEST],
)
