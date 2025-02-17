// Initially copied from ToT-BE, commit 545c1dd02ed8df920e315645df162212e80b2a03

import { Request } from "express"
import { QueryTypes } from "sequelize"
import { Constants } from "../../../../config/constants.js"

import {
  getEventTemplatesByIdRequest,
  getEventTemplatesByIdAPIResponse,
  getEventTemplatesByIdResponse,
} from "../../../../domain/entities/tot/v1/getEventTemplatesById.js"
import { sequelize } from "../../../../infrastructure/orm/sqlize/index.js"
import { extractValue, jsonResponse } from "../../../decorators.js"

/*import { handleDbError, EnumFromString, BoolFromString, DateTimeFromString, DateFromString } from "./utils";*/

/* get event template by id function */
export const getEventTemplatesById = async (
  postValidationInput: getEventTemplatesByIdRequest | Record<string, any>,
): Promise<getEventTemplatesByIdAPIResponse> => {
  const input = postValidationInput as getEventTemplatesByIdRequest

  /* select event template query */
  const eventTemplatesQuery = `SELECT
      T1.TASK_TYPE_ID 'task-type-id',
      T2.TASK_TYPE_NAME 'task-type-name',
      T1.EVENT_TEMPLATE_ID 'event-template-id',
      T2.TASK_CATEGORY_ID 'task-category-id',
      T2.TASK_CATEGORY_NAME 'task-category-name',
      T1.TASK_PRIORITY_ID 'task-priority-id',
      T3.TASK_PRIORITY_NAME 'task-priority-name'
    FROM
      m_event_template T1 JOIN
      m_task_type T2 ON T1.TASK_TYPE_ID = T2.TASK_TYPE_ID JOIN
      m_task_priority T3 ON T1.TASK_PRIORITY_ID = T3.TASK_PRIORITY_ID
    WHERE T1.EVENT_TYPE_ID = :eventTypeId
    AND T1.IS_DELETED = ${Constants.IS_NOT_DELETED}
    ORDER BY
      T1.EVENT_TEMPLATE_SORT_NUMBER ASC;
    `

  const results = await sequelize.query<getEventTemplatesByIdResponse>(eventTemplatesQuery, {
    raw: true,
    type: QueryTypes.SELECT,
    replacements: { eventTypeId: input["event-type-id"] },
  })

  if (results.length === 0) {
    return {
      code: 404,
      body: "No Event Template found",
    }
  }

  return {
    code: 200,
    body: results,
  }
}

/* consolidate user request parameter */
export const consolidategetEventTemplatesByIdRequest = (
  req: Request,
): getEventTemplatesByIdRequest | Record<string, any> => ({
  "event-type-id": req.params.eventTypeId,
})

export const getEventTemplatesByIdController = jsonResponse(
  extractValue(consolidategetEventTemplatesByIdRequest)(getEventTemplatesById),
)
