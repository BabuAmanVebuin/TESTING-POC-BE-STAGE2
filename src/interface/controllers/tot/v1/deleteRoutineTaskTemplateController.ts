// Initially copied from ToT-BE, commit 545c1dd02ed8df920e315645df162212e80b2a03

import { Request } from "express"
import { QueryTypes, Transaction } from "sequelize"
import { sequelize } from "../../../../infrastructure/orm/sqlize/index.js"
import { extractValue, jsonResponse } from "../../../decorators.js"
import logger from "../../../../infrastructure/logger.js"
import { Constants } from "../../../../config/constants.js"
import { handleDbError, send404Response, RoutineTaskTemplateIdNotFoundError } from "./utils.js"
import {
  RoutineTaskTemplateAPIResponse,
  createRoutineTaskTemplateResponse_OR_DeleteRoutineTaskTemplateRequest,
} from "../../../../domain/entities/tot/v1/RoutineTaskTemplate.js"
/** delete Routine task template function */
const deleteRoutineTaskTemplate = async (
  postValidationInput: createRoutineTaskTemplateResponse_OR_DeleteRoutineTaskTemplateRequest | Record<string, any>,
): Promise<RoutineTaskTemplateAPIResponse> => {
  const input = postValidationInput as createRoutineTaskTemplateResponse_OR_DeleteRoutineTaskTemplateRequest
  /** select Routine task template query to validate routine task template id */
  const selectRoutineTaskTemplate = `SELECT ID FROM t_routine_task_template WHERE ID= :routineTaskTemplateId`
  /** soft delete Routine task template query */
  const deleteRoutineTaskTemplateQuery = `
  UPDATE t_routine_task_template
          SET
          IS_DELETED = ${Constants.IS_DELETED},
          UPDATE_TIMESTAMP = :curdate
          WHERE
          ID = :routineTaskTemplateId`
  try {
    const result = await sequelize.transaction<RoutineTaskTemplateAPIResponse>(async (transaction: Transaction) => {
      const curdate = new Date()

      /** building queries for get routine task template id */
      const routineTaskTemplateId = await sequelize.query<{
        ID: number
      }>(selectRoutineTaskTemplate, {
        replacements: {
          routineTaskTemplateId: input[Constants.FIELDS.ROUTINE_TASK_TEMPLATE_ID],
        },
        raw: true,
        plain: true,
        type: QueryTypes.SELECT,
        transaction,
      })

      if (routineTaskTemplateId === null) {
        throw new RoutineTaskTemplateIdNotFoundError(input[Constants.FIELDS.ROUTINE_TASK_TEMPLATE_ID])
      }
      /** soft delete routine task template model */
      await sequelize.query(deleteRoutineTaskTemplateQuery, {
        raw: true,
        type: QueryTypes.UPDATE,
        transaction,
        replacements: {
          routineTaskTemplateId: input[Constants.FIELDS.ROUTINE_TASK_TEMPLATE_ID],
          curdate,
        },
      })
      return {
        code: Constants.STATUS_CODES.SUCCESS_CODE,
        body: Constants.SUCCESS_MESSAGES.SUCCESS,
      }
    })
    return result
  } catch (e: any) {
    logger.error(e)
    handleDbError("DB Error", e)
    if (e instanceof RoutineTaskTemplateIdNotFoundError) {
      return send404Response(e)
    }
    return {
      code: Constants.ERROR_CODES.BAD_REQUEST,
      body: Constants.ERROR_MESSAGES.BAD_REQUEST,
    }
  }
}
/* consolidate routine task template delete request parameter */
export const consolidatedeleteRoutineTaskTemplateRequest = (
  req: Request,
): RoutineTaskTemplateAPIResponse | Record<string, any> => ({
  "routine-task-template-id": Number(req.params.routineTaskTemplateId),
})
/** export delete plant section controller */
export const deleteRoutineTaskTemplateController = jsonResponse(
  extractValue(consolidatedeleteRoutineTaskTemplateRequest)(deleteRoutineTaskTemplate),
)
