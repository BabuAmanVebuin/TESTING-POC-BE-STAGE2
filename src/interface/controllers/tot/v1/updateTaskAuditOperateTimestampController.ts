// Initially copied from ToT-BE, commit 545c1dd02ed8df920e315645df162212e80b2a03
import { Request } from "express"
import logger from "../../../../infrastructure/logger.js"
import { sequelize } from "../../../../infrastructure/orm/sqlize/index.js"
import { extractValue, jsonResponse } from "../../../decorators.js"
import { Constants } from "../../../../config/constants.js"
import { DateTimeFromString } from "./utils.js"
import {
  updateTaskAuditOperateTimestampAPIResponse,
  updateTaskAuditOperateTimestampRequest,
  updateTaskAuditOperateTimestampRequestItem,
} from "../../../../domain/entities/tot/v1/updateTaskAuditOperateTimestamp.js"
import { QueryTypes, Transaction } from "sequelize"

/**
 * This is the main controller function where data is fetched from the database and response send back to the client
 * @param postValidationInput Request parameter
 * @returns response body for the request, either data or bad request
 */
const updateTaskAuditOperateTimestamp = async (
  postValidationInput: updateTaskAuditOperateTimestampRequest | Record<string, any>,
): Promise<updateTaskAuditOperateTimestampAPIResponse> => {
  const input = postValidationInput as updateTaskAuditOperateTimestampRequest
  try {
    const result = await sequelize.transaction<any>(async (transaction: Transaction) => {
      let statusCode: number = Constants.ERROR_CODES.BAD_REQUEST
      for (const taskAudits of input.taskAudits) {
        //update operate-timestamp with specific task-audit-id and task-id
        const updateTaskAuditQuery = `UPDATE t_task_audit
                  SET
                    OPERATE_TIMESTAMP = :operateTimestamp
                  WHERE
                    TASK_AUDIT_ID = :taskAuditId
                    AND TASK_ID = :taskId`
        await sequelize.query(updateTaskAuditQuery, {
          raw: true,
          type: QueryTypes.UPDATE,
          transaction,
          replacements: {
            taskAuditId: taskAudits[Constants.FIELDS.TASK_AUDIT_ID],
            operateTimestamp: taskAudits[Constants.FIELDS.OPERATE_TIMESTAMP],
            taskId: input[Constants.FIELDS.TASK_ID],
          },
        })
        statusCode = Constants.STATUS_CODES.SUCCESS_CODE
      }
      return responseStatus(statusCode)
    })

    return result
  } catch (e) {
    logger.error(e)
    return responseStatus(Constants.ERROR_CODES.BAD_REQUEST)
  }
}

//response status for the updateTaskAuditOperateTimestampAPIResponse
const responseStatus = (val: number): updateTaskAuditOperateTimestampAPIResponse => {
  if (val === Constants.STATUS_CODES.SUCCESS_CODE) {
    return {
      code: Constants.STATUS_CODES.SUCCESS_CODE,
      body: Constants.SUCCESS_MESSAGES.SUCCESS,
    }
  } else {
    return {
      code: Constants.ERROR_CODES.BAD_REQUEST,
      body: Constants.ERROR_MESSAGES.BAD_REQUEST,
    }
  }
}

//updateTaskAudit array request parameter
export const consolidateUpdateTaskAuditRequest = (
  details: Record<string, any>[],
): updateTaskAuditOperateTimestampRequestItem[] => {
  return details.map<updateTaskAuditOperateTimestampRequestItem>((x) => ({
    "task-audit-id": Number(x[Constants.FIELDS.TASK_AUDIT_ID]),
    "operate-timestamp": DateTimeFromString(x[Constants.FIELDS.OPERATE_TIMESTAMP] as string),
  }))
}
/* consolidate updateTaskAuditOperateTimestamp parameter */
export const consolidateUpdateTaskAuditOperateTimestampRequest = (
  req: Request,
): updateTaskAuditOperateTimestampRequest | Record<string, any> => ({
  "task-id": Number(req.params.taskId),
  taskAudits: consolidateUpdateTaskAuditRequest(req.body[Constants.FIELDS.TASK_AUDITS]),
})

/** Export Update task-audit operate-timestamp controller */
export const updateTaskAuditOperateTimestampController = jsonResponse(
  extractValue(consolidateUpdateTaskAuditOperateTimestampRequest)(updateTaskAuditOperateTimestamp),
)
