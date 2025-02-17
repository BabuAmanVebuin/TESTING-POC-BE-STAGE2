// Initially copied from ToT-BE, commit 545c1dd02ed8df920e315645df162212e80b2a03
import { Request } from "express"
import { QueryTypes } from "sequelize"
import { sequelize } from "../../../../infrastructure/orm/sqlize/index.js"
import { extractValue, jsonResponse } from "../../../decorators.js"
import logger from "../../../../infrastructure/logger.js"
import {
  OperationEventTemplate,
  getOperationEventTemplateAPIResponse,
  getOperationEventTemplateRequest,
} from "../../../../domain/entities/tot/v1/getOperationEventTemplate.js"
import { Constants } from "../../../../config/constants.js"
import { poorlyShapedRequest } from "./utils.js"

/**
 * Description fetch operation-event-template
 *
 * @async
 * @param {getOperationEventTemplateRequest | Record<string, any>} postValidationInput deleteStatus Flag
 * @returns {Promise<OperationEventTemplate[]>} OperationEventTemplate
 */
const operationEventTemplate = async (
  input: getOperationEventTemplateRequest | Record<string, any>,
): Promise<OperationEventTemplate[]> => {
  let operationEventTemplateDeleted
  if (input[Constants.FIELDS.DELETE_STATUS] === "true") {
    operationEventTemplateDeleted = `OET.IS_DELETED = ${Constants.IS_DELETED} OR ETEM.IS_DELETED = ${Constants.IS_DELETED}`
  } else {
    operationEventTemplateDeleted = `OET.IS_DELETED = ${Constants.IS_NOT_DELETED} AND ETEM.IS_DELETED = ${Constants.IS_NOT_DELETED}`
  }
  const operationEventTemplateQuery = `SELECT
  ETY.EVENT_TYPE_ID 'event-type-id',
  ETY.EVENT_TYPE_NAME 'event-type-name',
  TT.TASK_TYPE_ID 'task-type-id',
  TT.TASK_TYPE_NAME 'task-type-name',
  TT.TASK_CATEGORY_ID 'task-category-id',
  TT.TASK_CATEGORY_NAME 'task-category-name',
  TT.TASK_EXECUTION_TIME 'task-execution-time',
  OET.OPERATION_ID 'operation-id',
  O.OPERATION_NAME 'operation-name'
  FROM m_event_template ETEM
  INNER JOIN m_task_type TT ON ETEM.TASK_TYPE_ID = TT.TASK_TYPE_ID  
  INNER JOIN m_event_type  ETY ON ETEM.EVENT_TYPE_ID = ETY.EVENT_TYPE_ID 
  INNER JOIN t_operation_event_type OET ON ETEM.EVENT_TYPE_ID = OET.EVENT_TYPE_ID
  INNER JOIN m_operation O ON OET.OPERATION_ID = O.OPERATION_ID
  WHERE ${operationEventTemplateDeleted}
  ORDER BY OET.OPERATION_ID, OET.EVENT_TYPE_ID ASC;`

  return sequelize.query<OperationEventTemplate>(operationEventTemplateQuery, {
    raw: true,
    type: QueryTypes.SELECT,
    replacements: {},
  })
}

/**
 * Description operation-event-template
 *
 * @async
 * @param {Request} req
 * @returns {Promise<getOperationEventTemplateAPIResponse>}
 */
export const getOperationEventTemplate = async (
  postValidationInput: getOperationEventTemplateRequest | Record<string, any>,
): Promise<getOperationEventTemplateAPIResponse> => {
  try {
    const input = postValidationInput as getOperationEventTemplateRequest

    const operationEventTemplateRes = await operationEventTemplate(input)

    // There is no input here, just return everything.
    return {
      code: Constants.STATUS_CODES.SUCCESS_CODE,
      body: operationEventTemplateRes,
    }
  } catch (err) {
    logger.error(err)
    return {
      code: Constants.ERROR_CODES.BAD_REQUEST,
      body: Constants.ERROR_MESSAGES.BAD_REQUEST,
    }
  }
}

/* consolidate operation-event-template request parameter */
export const consolidategetOperationEventTemplateRequest = (
  req: Request,
): getOperationEventTemplateRequest | poorlyShapedRequest => ({
  "delete-status": req.query[Constants.FIELDS.DELETE_STATUS],
})

/**
 * Description getOperationEventTemplate
 *
 * @type {*}
 */
export const getOperationEventTemplateController = jsonResponse(
  extractValue(consolidategetOperationEventTemplateRequest)(getOperationEventTemplate),
)
