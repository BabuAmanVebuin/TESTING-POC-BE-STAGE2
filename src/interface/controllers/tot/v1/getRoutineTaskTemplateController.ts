// Initially copied from ToT-BE, commit 545c1dd02ed8df920e315645df162212e80b2a03

import { Request } from "express"
import { QueryTypes } from "sequelize"
import { sequelize } from "../../../../infrastructure/orm/sqlize/index.js"
import { extractValue, jsonResponse } from "../../../decorators.js"
import logger from "../../../../infrastructure/logger.js"
import {
  RoutineTaskTemplate,
  getRoutineTaskTemplateAPIResponse,
  getRoutineTaskTemplateRequest,
} from "../../../../domain/entities/tot/v1/RoutineTaskTemplate.js"
import { Constants } from "../../../../config/constants.js"
import {
  AssetTaskGroupIdNotFoundError,
  consolidatePossibleArray,
  DateFromString,
  send404Response,
  ValidDateNotFoundError,
} from "./utils.js"

/** fetch routine task template */
const RoutineTaskTemplate = async (
  validDate: Date | undefined,
  assetTaskGroupId: number,
  operationId?: number,
): Promise<RoutineTaskTemplate[]> => {
  let operation = ""
  if (operationId != undefined) {
    operation = ` AND RTT.OPERATION_ID IN (:operationId)`
  }

  const dateCondition = validDate ? `(RTT.VALID_END_DATE >= :validDate OR RTT.VALID_END_DATE IS NULL)` : "TRUE"

  const RoutineTaskTemplateQuery = `SELECT
  RTT.ID 'routine-task-template-id',
  RTT.TASK_NAME 'task-name',
  RTT.EVENT_TYPE_ID 'event-type-id',
  ET.EVENT_TYPE_NAME 'event-type-name',
  ET.IS_DELETED 'is-event-type-delete',
  RTT.EVENT_NAME 'event-name',
  RTT.TASK_TYPE_ID 'task-type-id',
  TT.TASK_TYPE_NAME 'task-type-name',
  TT.TASK_CATEGORY_ID 'task-category-id',
  TT.TASK_CATEGORY_NAME 'task-category-name',
  TT.IS_DELETED 'is-task-type-delete',
  RTT.VALID_START_DATE 'valid-start-date',
  RTT.VALID_END_DATE 'valid-end-date',
  RTT.WORK_START_TIME  'work-start-time',
  RTT.WORK_END_TIME 'work-end-time',
  RTT.DESIGNATION_ID 'designation-id',
  D.DESIGNATION_NAME 'designation-name',
  RTT.ESTIMATED_TASK_TIME 'estimated-task-time',
  RTT.PATTERN 'pattern',
  RTT.PATTERN_RULE 'pattern-rule',
  RTT.REMARKS 'remarks',
  RTT.ASSET_TASK_GROUP_ID 'asset-task-group-id',
  T9.ASSET_TASK_GROUP_NAME 'asset-task-group-name',
  RTT.CREATE_TIMESTAMP 'create-timestamp',
  RTT.CREATE_USER_ID 'create-user-id',
  RTT.UPDATE_TIMESTAMP 'update-timestamp',
  RTT.UPDATE_USER_ID  'update-user-id',
  TOE.IS_DELETED 'is-operation-event-delete'
    FROM t_routine_task_template as RTT
    INNER JOIN 
    m_task_type TT ON RTT.TASK_TYPE_ID = TT.TASK_TYPE_ID
    INNER JOIN
    m_event_type ET ON RTT.EVENT_TYPE_ID = ET.EVENT_TYPE_ID
    INNER JOIN 
    m_designation D ON RTT.DESIGNATION_ID = D.DESIGNATION_ID INNER JOIN
    (
      SELECT
        ASSET_TASK_GROUP_ID,
        ASSET_TASK_GROUP_NAME
      FROM
        m_asset_task_group
      GROUP BY
        ASSET_TASK_GROUP_ID,
        ASSET_TASK_GROUP_NAME
    ) T9 ON RTT.ASSET_TASK_GROUP_ID = T9.ASSET_TASK_GROUP_ID
    LEFT OUTER JOIN t_operation_event_type TOE ON RTT.OPERATION_ID = TOE.OPERATION_ID AND RTT.EVENT_TYPE_ID = TOE.EVENT_TYPE_ID
    WHERE ${dateCondition}
    AND RTT.ASSET_TASK_GROUP_ID = :assetTaskGroupId
    AND RTT.IS_DELETED = ${Constants.IS_NOT_DELETED}
    ${operation}
    ORDER BY RTT.ID ASC`

  return sequelize.query<RoutineTaskTemplate>(RoutineTaskTemplateQuery, {
    raw: true,
    type: QueryTypes.SELECT,
    replacements: { validDate, assetTaskGroupId, operationId },
  })
}

/* get routine task template function */
export const getRoutineTaskTemplate = async (
  postValidationInput: getRoutineTaskTemplateRequest | Record<string, any>,
): Promise<getRoutineTaskTemplateAPIResponse> => {
  try {
    const input = postValidationInput as getRoutineTaskTemplateRequest
    const operationId: any = input[Constants.FIELDS.OPERATION_ID]
    const validDate = input[Constants.FIELDS.VALID_DATE]
    const assetTaskGroupId = input[Constants.FIELDS.ASSET_TASK_GROUP_ID]
    if (!assetTaskGroupId) {
      throw new AssetTaskGroupIdNotFoundError(assetTaskGroupId!)
    }
    const routineTaskTemplate = await RoutineTaskTemplate(validDate, assetTaskGroupId, operationId)

    const keys = [
      Constants.FIELDS.REMARKS,
      Constants.FIELDS.TASK_NAME,
      Constants.FIELDS.TASK_TYPE_NAME,
      Constants.FIELDS.EVENT_TYPE_NAME,
      Constants.FIELDS.EVENT_NAME,
      Constants.FIELDS.DESIGNATION_NAME,
      Constants.FIELDS.ASSET_TASK_GROUP_NAME,
    ] as const

    routineTaskTemplate.forEach((t: any, _idx, _arr) => {
      keys.forEach((key, _idx2, _arr2) => {
        t[key] = t[key] || ""
      })
    })

    // assigned boolean value to is-operation-event-delete, is-event-type-deleted and is-task-type-deleted instead of integer
    routineTaskTemplate.map((routineTaskTemplateElement: RoutineTaskTemplate) => {
      routineTaskTemplateElement[Constants.FIELDS.IS_EVENT_TYPE_DELETED] =
        routineTaskTemplateElement[Constants.FIELDS.IS_EVENT_TYPE_DELETED] === 0 ? Boolean(0) : Boolean(1)

      routineTaskTemplateElement[Constants.FIELDS.IS_TASK_TYPE_DELETED] =
        routineTaskTemplateElement[Constants.FIELDS.IS_TASK_TYPE_DELETED] === 0 ? Boolean(0) : Boolean(1)

      routineTaskTemplateElement[Constants.FIELDS.IS_OPERATION_EVENT_DELETED] =
        routineTaskTemplateElement[Constants.FIELDS.IS_OPERATION_EVENT_DELETED] === 1
      return true
    })

    return {
      code: Constants.STATUS_CODES.SUCCESS_CODE,
      body: routineTaskTemplate,
    }
  } catch (err) {
    logger.error(err)
    if (err instanceof AssetTaskGroupIdNotFoundError) {
      return send404Response(err)
    }
    if (err instanceof ValidDateNotFoundError) {
      return send404Response(err)
    }
    return {
      code: Constants.ERROR_CODES.BAD_REQUEST,
      body: Constants.ERROR_MESSAGES.BAD_REQUEST,
    }
  }
}

/* consolidate operationId request parameter */
const consolidateOperationId = (x: unknown) =>
  consolidatePossibleArray(x) ? consolidatePossibleArray(x).map((y: string) => Number(y)) : x

/* consolidate get routine task template request parameter */
export const consolidategetRoutineTaskTemplateRequest = (
  req: Request,
): getRoutineTaskTemplateRequest | Record<string, any> => ({
  "valid-date": DateFromString(req.query[Constants.FIELDS.VALID_DATE] as string),
  "asset-task-group-id": Number(req.query[Constants.FIELDS.ASSET_TASK_GROUP_ID]),
  "operation-id": consolidateOperationId(req.query[Constants.FIELDS.OPERATION_ID]),
})

/** export get routine task template controller */
export const getRoutineTaskTemplateController = jsonResponse(
  extractValue(consolidategetRoutineTaskTemplateRequest)(getRoutineTaskTemplate),
)
