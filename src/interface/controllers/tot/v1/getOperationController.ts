// Initially copied from ToT-BE, commit 545c1dd02ed8df920e315645df162212e80b2a03
import { QueryTypes } from "sequelize"
import { sequelize } from "../../../../infrastructure/orm/sqlize/index.js"
import { jsonResponse } from "../../../decorators.js"
import logger from "../../../../infrastructure/logger.js"
import { Operation, getOperationAPIResponse } from "../../../../domain/entities/tot/v1/getOperation.js"
import { Constants } from "../../../../config/constants.js"

/**
 * Description getOperation
 *
 * @async
 * @returns {Promise<Designation[]>} Operation
 */
const getOperationResult = async (): Promise<Operation[]> => {
  const operationQuery = `SELECT
      OPERATION_ID 'operation-id',
      OPERATION_NAME 'operation-name'
    FROM m_operation
    ORDER BY OPERATION_ID ASC;`

  return sequelize.query<Operation>(operationQuery, {
    raw: true,
    type: QueryTypes.SELECT,
    replacements: {},
  })
}

/**
 * Description get operation
 *
 * @async
 * @param {Request} req
 * @returns {Promise<getOperationAPIResponse>} getOperationAPIResponse
 */
export const getOperation = async (): Promise<getOperationAPIResponse> => {
  try {
    const operation = await getOperationResult()

    // There is no input here, just return everything.
    return {
      code: Constants.STATUS_CODES.SUCCESS_CODE,
      body: operation,
    }
  } catch (err) {
    logger.error(err)
    return {
      code: Constants.ERROR_CODES.SERVER_ERROR,
      body: Constants.ERROR_MESSAGES.BAD_REQUEST,
    }
  }
}

/**
 * Description get Operation
 *
 * @type {*}
 */
export const getOperationController = jsonResponse(getOperation)
