// Initially copied from ToT-BE, commit 545c1dd02ed8df920e315645df162212e80b2a03

/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request } from "express"
import { QueryTypes } from "sequelize"
import { sequelize } from "../../../../infrastructure/orm/sqlize/index.js"
import { extractValue, jsonOrEmptyResponse } from "../../../decorators.js"
import logger from "../../../../infrastructure/logger.js"
import { Constants } from "../../../../config/constants.js"
import {
  send404Response,
  setDifference,
  EventTypeIdsNotFoundError,
  EventTypeNameNotFoundError,
  UserIdNotFoundError,
} from "./utils.js"
import {
  updateEventTypeAPIResponse,
  updateEventTypesRequest,
  updateEventTypesRequestItem,
} from "../../../../domain/entities/tot/v1/updateEventTypes.js"

/**
 * Description update EventTypes
 *
 * @async
 * @param {(updateEventTypesRequest | Record<string, any>)} postValidationInput
 * @returns {Promise<updateEventTypeAPIResponse>} updateEventTypeAPIResponse
 */
const updateEventTypes = async (
  postValidationInput: updateEventTypesRequest | Record<string, any>,
): Promise<updateEventTypeAPIResponse> => {
  const input = postValidationInput as updateEventTypesRequest

  try {
    const result = await sequelize.transaction(async (transaction) => {
      /* select user name by user id in user table */
      const selectOperatorNameQuery = `SELECT USER_NAME FROM m_user_tot WHERE USER_ID = :operateUserId;`
      // Validate eventType IDs
      const curdate = new Date()
      const inputEventTypeIdSet = new Set(input.eventTypes.map((t) => t[Constants.FIELDS.EVENT_TYPE_ID]))
      const existingEventTypes =
        input.eventTypes.length === 0
          ? []
          : await sequelize.query<{ EVENT_TYPE_ID: number }>(
              `SELECT EVENT_TYPE_ID FROM m_event_type WHERE EVENT_TYPE_ID IN (?) FOR UPDATE;`,
              {
                replacements: [[...inputEventTypeIdSet]],
                type: QueryTypes.SELECT,
                raw: true,
                transaction,
              },
            )
      const existingEventTypeIdSet = new Set(existingEventTypes.map((t) => t.EVENT_TYPE_ID))
      const notFoundEventTypeIdSet = setDifference(inputEventTypeIdSet, existingEventTypeIdSet)
      if (notFoundEventTypeIdSet.size > 0) {
        throw new EventTypeIdsNotFoundError([...notFoundEventTypeIdSet])
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
        const updateEventTypeQuery = `UPDATE m_event_type
          SET
            ${eventType[Constants.FIELDS.EVENT_TYPE_NAME] === undefined ? "" : "EVENT_TYPE_NAME = $eventTypeName,"}
            ${input[Constants.FIELDS.OPERATE_USER_ID] === undefined ? "" : "UPDATE_USER_ID = $operateUserId,"}
            UPDATE_TIMESTAMP = $curdate
          WHERE EVENT_TYPE_ID = $eventTypeId;`
        await sequelize.query(updateEventTypeQuery, {
          raw: true,
          type: QueryTypes.UPDATE,
          transaction,
          bind: {
            eventTypeName: eventType[Constants.FIELDS.EVENT_TYPE_NAME],
            operateUserId: input[Constants.FIELDS.OPERATE_USER_ID],
            curdate,
            eventTypeId: eventType[Constants.FIELDS.EVENT_TYPE_ID],
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
    if (err instanceof EventTypeIdsNotFoundError) {
      return send404Response(err)
    }
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
 * @param {Record<string, unknown>[]} details
 * @returns {updateEventTypesRequestItem[]} updateEventTypesRequestItem
 */
const consolidateEventTypesFromRequest = (details: Record<string, unknown>[]): updateEventTypesRequestItem[] => {
  return details.map<updateEventTypesRequestItem>((x) => ({
    "event-type-id": Number(x[Constants.FIELDS.EVENT_TYPE_ID]),
    "event-type-name": x[Constants.FIELDS.EVENT_TYPE_NAME] as string,
  }))
}

/**
 * Description consolidateupdateEventTypesRequest
 *
 * @param {Request} req
 * @returns {(updateEventTypesRequest | Record<string, any>)} updateEventTypesReq
 */
export const consolidateupdateEventTypesRequest = (req: Request): updateEventTypesRequest | Record<string, any> => {
  return {
    "operate-user-id": req.body[Constants.FIELDS.OPERATE_USER_ID],
    eventTypes: consolidateEventTypesFromRequest(req.body[Constants.FIELDS.EVENT_TYPE]),
  }
}

/**
 * Description update event type controller
 *
 * @type {*} export
 */
export const updateEventTypesController = jsonOrEmptyResponse(
  extractValue(consolidateupdateEventTypesRequest)(updateEventTypes),
  [Constants.STATUS_CODES.SUCCESS_CODE, Constants.ERROR_CODES.BAD_REQUEST, Constants.ERROR_CODES.NOT_FOUND_CODE],
)
