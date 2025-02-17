// Initially copied from ToT-BE, commit 545c1dd02ed8df920e315645df162212e80b2a03

import { Request } from "express"
import { QueryTypes } from "sequelize"
import { sequelize } from "../../../../infrastructure/orm/sqlize/index.js"
import { extractValue, jsonOrEmptyResponse } from "../../../../interface/decorators.js"
import logger from "../../../../infrastructure/logger.js"
import { Constants } from "../../../../config/constants.js"

import {
  OptionalStringField,
  handleDbError,
  DateFromString,
  EventTemplateIdNotFoundError,
  send404Response,
  OperationEventTypeIdNotFoundError,
} from "./utils.js"

import {
  RoutineTaskTemplateAPIResponse,
  RoutineTaskTemplateRequest,
} from "../../../../domain/entities/tot/v1/RoutineTaskTemplate.js"

/** create Routine task template function */
const createRoutineTaskTemplate = async (
  postValidationInput: RoutineTaskTemplateRequest | Record<string, any>,
): Promise<RoutineTaskTemplateAPIResponse> => {
  const input = postValidationInput as RoutineTaskTemplateRequest
  /** select event template query to validate event type id or task type id */
  const selectEventTemplate = `SELECT EVENT_TYPE_ID FROM m_event_template WHERE EVENT_TYPE_ID= :eventTypeId AND TASK_TYPE_ID= :taskTypeId
  AND IS_DELETED = ${Constants.IS_NOT_DELETED}`

  /** select operation event type query to validate operation id or event type id */
  const selectOperationEventType = `SELECT EVENT_TYPE_ID, IS_DELETED FROM t_operation_event_type WHERE EVENT_TYPE_ID= :eventTypeId AND OPERATION_ID= :operationId`

  /** insert Routine task template query */
  const insertRoutineTaskTemplateQuery = `INSERT INTO t_routine_task_template
  (
  EVENT_TYPE_ID,
  OPERATION_ID,
  EVENT_NAME,
  TASK_NAME,
  TASK_TYPE_ID,
  VALID_START_DATE,
  VALID_END_DATE,
  WORK_START_TIME,
  WORK_END_TIME,
  DESIGNATION_ID,
  ESTIMATED_TASK_TIME,
  PATTERN,
  PATTERN_RULE,
  REMARKS,
  ASSET_TASK_GROUP_ID,
  CREATE_TIMESTAMP,
  CREATE_USER_ID,
  UPDATE_TIMESTAMP,
  UPDATE_USER_ID)
   VALUES (
      :eventTypeId,
      :operationId,
      :eventName,
      :taskName,
      :taskTypeId,
      :validStartDate,
      :validEndDate,
      :workStartTime,
      :workEndTime,
      :designationId,
      :estimatedTaskTime,
      :pattern,
      :patternRule,
      :remarks,
      :assetTaskGroupId,
      :curdate,
      :operateUserId,
      :curdate,
      :operateUserId
    );`

  try {
    const result = await sequelize.transaction<RoutineTaskTemplateAPIResponse>(async (transaction) => {
      const curdate = new Date()
      /**
       * building quries for event template query to validate event type id or task type id
       */
      const eventTemplateData = await sequelize.query<{
        EVENT_TYPE_ID: number
      }>(selectEventTemplate, {
        replacements: {
          eventTypeId: input[Constants.FIELDS.EVENT_TYPE_ID],
          taskTypeId: input[Constants.FIELDS.TASK_TYPE_ID],
        },
        raw: true,
        plain: true,
        type: QueryTypes.SELECT,
        transaction,
      })
      /** return error */
      if (eventTemplateData === null) {
        throw new EventTemplateIdNotFoundError(input[Constants.FIELDS.EVENT_TYPE_ID])
      }

      /**
       * building quries for event template query to validate event type id or task type id
       */
      const operationEventTypeData = await sequelize.query<{
        EVENT_TYPE_ID: number
        IS_DELETED: number
      }>(selectOperationEventType, {
        replacements: {
          eventTypeId: input[Constants.FIELDS.EVENT_TYPE_ID],
          operationId: input[Constants.FIELDS.OPERATION_ID],
        },
        raw: true,
        plain: true,
        type: QueryTypes.SELECT,
        transaction,
      })
      /** return error */
      if (operationEventTypeData === null) {
        throw new OperationEventTypeIdNotFoundError(input[Constants.FIELDS.EVENT_TYPE_ID])
      } else {
        /** check if operation-event-type relation is deleted */
        if (operationEventTypeData.IS_DELETED === Constants.IS_DELETED) {
          throw Error()
        }
      }

      /** for optional param */
      const optional = (x: unknown) => (x === undefined ? null : x)

      /** insert routine task template model */
      const insertId = await sequelize.query(insertRoutineTaskTemplateQuery, {
        raw: true,
        type: QueryTypes.INSERT,
        transaction,
        replacements: {
          eventTypeId: input[Constants.FIELDS.EVENT_TYPE_ID],
          operationId: input[Constants.FIELDS.OPERATION_ID],
          eventName: optional(input[Constants.FIELDS.EVENT_NAME]),
          taskName: input[Constants.FIELDS.TASK_NAME],
          taskTypeId: input[Constants.FIELDS.TASK_TYPE_ID],
          validStartDate: input[Constants.FIELDS.VALID_START_DATE],
          validEndDate: optional(input[Constants.FIELDS.VALID_END_DATE]),
          workStartTime: input[Constants.FIELDS.WORK_START_TIME],
          workEndTime: input[Constants.FIELDS.WORK_END_TIME],
          designationId: input[Constants.FIELDS.DESIGNATION_ID],
          estimatedTaskTime: input[Constants.FIELDS.ESTIMATED_TASK_TIME],
          pattern: input[Constants.FIELDS.PATTERN],
          patternRule: input[Constants.FIELDS.PATTERN_RULE],
          remarks: optional(input[Constants.FIELDS.REMARKS]),
          assetTaskGroupId: input[Constants.FIELDS.ASSET_TASK_GROUP_ID],
          curdate,
          operateUserId: input[Constants.FIELDS.OPERATE_USER_ID],
        },
      })
      return {
        code: Constants.STATUS_CODES.CREATE_SUCCESS_CODE,
        body: {
          [Constants.FIELDS.ROUTINE_TASK_TEMPLATE_ID]: insertId[0],
        },
      }
    })

    return result
  } catch (e: any) {
    logger.error(e)
    handleDbError("DB Error", e)
    if (e instanceof EventTemplateIdNotFoundError) {
      return send404Response(e)
    }
    if (e instanceof OperationEventTypeIdNotFoundError) {
      return send404Response(e)
    }
    return {
      code: Constants.ERROR_CODES.BAD_REQUEST,
      body: Constants.ERROR_MESSAGES.BAD_REQUEST,
    }
  }
}

/* consolidate routine task template request parameter */
export const consolidatecreateRoutineTaskTemplateRequest = (
  req: Request,
): RoutineTaskTemplateRequest | Record<string, any> => ({
  "asset-task-group-id": Number(req.body[Constants.FIELDS.ASSET_TASK_GROUP_ID]),
  "event-type-id": Number(req.body[Constants.FIELDS.EVENT_TYPE_ID]),
  "operation-id": Number(req.body[Constants.FIELDS.OPERATION_ID]),
  "event-name": OptionalStringField(req.body[Constants.FIELDS.EVENT_NAME]),
  "task-type-id": Number(req.body[Constants.FIELDS.TASK_TYPE_ID]),
  "task-name": req.body[Constants.FIELDS.TASK_NAME],
  "valid-start-date": DateFromString(req.body[Constants.FIELDS.VALID_START_DATE] as string),
  "valid-end-date": DateFromString(req.body[Constants.FIELDS.VALID_END_DATE] as string),
  "work-start-time": req.body[Constants.FIELDS.WORK_START_TIME],
  "work-end-time": req.body[Constants.FIELDS.WORK_END_TIME],
  "designation-id": Number(req.body[Constants.FIELDS.DESIGNATION_ID]),
  "estimated-task-time": req.body[Constants.FIELDS.ESTIMATED_TASK_TIME] as string,
  pattern: req.body[Constants.FIELDS.PATTERN] as string,
  "pattern-rule": req.body[Constants.FIELDS.PATTERN_RULE] as string,
  remarks: OptionalStringField(req.body[Constants.FIELDS.REMARKS] as string),
  "operate-user-id": req.body[Constants.FIELDS.OPERATE_USER_ID],
})

/** export create plant section controller */
export const createRoutineTaskTemplateController = jsonOrEmptyResponse(
  extractValue(consolidatecreateRoutineTaskTemplateRequest)(createRoutineTaskTemplate),
  [Constants.STATUS_CODES.CREATE_SUCCESS_CODE, Constants.ERROR_CODES.BAD_REQUEST, Constants.ERROR_CODES.NOT_FOUND_CODE],
)
