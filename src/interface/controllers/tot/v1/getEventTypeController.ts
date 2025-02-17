// Initially copied from ToT-BE, commit 545c1dd02ed8df920e315645df162212e80b2a03
import { Request } from "express"
import { QueryTypes } from "sequelize"
import { sequelize } from "../../../../infrastructure/orm/sqlize/index.js"
import { extractValue, jsonResponse } from "../../../decorators.js"
import logger from "../../../../infrastructure/logger.js"
import {
  EventType,
  getEventTypeAPIResponse,
  getEventTypeRequest,
} from "../../../../domain/entities/tot/v1/getEventType.js"
import { Constants } from "../../../../config/constants.js"
import { poorlyShapedRequest } from "./utils.js"

/**
 * Description fetch eventType
 *
 * @async
 * @param {getEventTypeRequest | Record<string, any>} postValidationInput isDeleted Flag
 * @returns {Promise<getEventTypeAPIResponse>} getEventType
 */
const eventType = async (input: getEventTypeRequest | Record<string, any>): Promise<EventType[]> => {
  let eventTypeDeleted
  if (input[Constants.FIELDS.DELETE_STATUS] != undefined) {
    eventTypeDeleted = ` T1.IS_DELETED = ${input[Constants.FIELDS.DELETE_STATUS]}`
  } else {
    eventTypeDeleted = `T1.IS_DELETED = ${Constants.IS_NOT_DELETED}`
  }
  const eventTypeQuery = `SELECT
    T1.EVENT_TYPE_ID 'event-type-id',
    T1.EVENT_TYPE_NAME 'event-type-name',
    T3.OPERATION_ID 'operation-id',
    T3.OPERATION_NAME 'operation-name',
    T1.IS_ATTACHED_WITH_SAP 'is-attached-with-sap'
  FROM m_event_type T1 
  LEFT JOIN t_operation_event_type T2 ON T1.EVENT_TYPE_ID = T2.EVENT_TYPE_ID AND T2.IS_DELETED = ${Constants.IS_NOT_DELETED}
  LEFT JOIN m_operation T3 ON T2.OPERATION_ID = T3.OPERATION_ID 
  WHERE  ${eventTypeDeleted}
  ORDER BY T1.EVENT_TYPE_SORT_NUMBER ASC;`

  return sequelize.query<EventType>(eventTypeQuery, {
    raw: true,
    type: QueryTypes.SELECT,
    replacements: {},
  })
}

/**
 * Description get EventType
 *
 * @async
 * @param {getEventTypeRequest | Record<string, any>} postValidationInput isDeleted Flag
 * @returns {Promise<getEventTypeAPIResponse>} getEventType
 */
export const getEventType = async (
  postValidationInput: getEventTypeRequest | Record<string, any>,
): Promise<getEventTypeAPIResponse> => {
  try {
    const input = postValidationInput as getEventTypeRequest

    const eventTypeRes = await eventType(input)
    eventTypeRes.map((eventTypeElement: EventType) => {
      eventTypeElement[Constants.FIELDS.IS_ATTACHED_WITH_SAP] =
        eventTypeElement[Constants.FIELDS.IS_ATTACHED_WITH_SAP] === 0 ? Boolean(0) : Boolean(1)
      eventTypeElement[Constants.FIELDS.OPERATION_NAME] = eventTypeElement[Constants.FIELDS.OPERATION_NAME] || ""
      return true
    })
    // There is no input here, just return everything.
    return {
      code: Constants.STATUS_CODES.SUCCESS_CODE,
      body: eventTypeRes,
    }
  } catch (err) {
    logger.error(err)
    return {
      code: Constants.ERROR_CODES.BAD_REQUEST,
      body: Constants.ERROR_MESSAGES.BAD_REQUEST,
    }
  }
}

/* consolidate Event Type request parameter */
export const consolidategetEventTypeRequest = (req: Request): getEventTypeRequest | poorlyShapedRequest => ({
  "delete-status": req.query[Constants.FIELDS.DELETE_STATUS],
})

export const getEventTypeController = jsonResponse(extractValue(consolidategetEventTypeRequest)(getEventType))
