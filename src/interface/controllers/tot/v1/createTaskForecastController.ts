// Initially copied from ToT-BE, commit 545c1dd02ed8df920e315645df162212e80b2a03
/* eslint-disable @typescript-eslint/no-explicit-any */

import { Request } from "express"
import { QueryTypes } from "sequelize"

import {
  createTaskForecastRequest,
  createTaskForecastAPIResponse,
} from "../../../../domain/entities/tot/v1/createTaskForecast.js"
import logger from "../../../../infrastructure/logger.js"
import { sequelize } from "../../../../infrastructure/orm/sqlize/index.js"
import { extractValue, jsonResponse } from "../../../decorators.js"
import { Constants } from "../../../../config/constants.js"
import {
  poorlyShapedRequest,
  send404Response,
  EventTemplateIdNotFoundError,
  OptionalIntNumber,
  OperationEventTypeIdNotFoundError,
} from "./utils.js"

/** insert task forecast query */
const insertTaskForecastQuery = `INSERT INTO t_task_forecast (
              EVENT_TYPE_ID,
              TASK_TYPE_ID,
              OPERATION_ID,
              MONTH,
              YEAR,
              TOTAL_HOURS,
              TOTAL_TASKS,
              TEAM_ID,
              ASSET_TASK_GROUP_ID,
              CREATE_USER_ID,
              UPDATE_USER_ID,
              CREATE_TIMESTAMP,
              UPDATE_TIMESTAMP
            ) VALUES (
              :eventTypeId,
              :taskTypeId,
              :operationId,
              :month,
              :year,
              :totalHours,
              :totalTasks,
              :teamId,
              :assetTaskGroupId,
              :createdById,
              :updatedById,
              :curdate,
              :updatedate
            );`

/** select task forecast query for validation duplicate records */
const selectTaskForecastQuery = `SELECT TASK_FORECAST_ID FROM t_task_forecast 
                            WHERE EVENT_TYPE_ID=:eventTypeId AND TASK_TYPE_ID=:taskTypeId 
                            AND MONTH=:month AND YEAR=:year AND ASSET_TASK_GROUP_ID=:assetTaskGroupId limit 1`

/** select event template query to validate event type id or task type id */
const selectEventTemplate = `SELECT EVENT_TYPE_ID FROM m_event_template WHERE EVENT_TYPE_ID= :eventTypeId AND TASK_TYPE_ID= :taskTypeId
AND IS_DELETED = ${Constants.IS_NOT_DELETED}`

/** select operation event type query to validate operation id or event type id */
const selectOperationEventType = `SELECT EVENT_TYPE_ID, IS_DELETED FROM t_operation_event_type WHERE EVENT_TYPE_ID= :eventTypeId AND OPERATION_ID= :operationId`

/** get asset-task-group-id by team-id query */
const getAssetTaskGroupIdQuery = `SELECT ASSET_TASK_GROUP_ID FROM m_asset_task_group WHERE TEAM_ID= :teamId LIMIT 1`

/**
 * This is the main controller function where data is fetched from the database and response send back to the client
 * @param postValidationInput Request parameter
 * @returns response body for the request, either data or bad request
 */
const createTaskForecast = async (
  postValidationInput: createTaskForecastRequest | Record<string, any>,
): Promise<createTaskForecastAPIResponse> => {
  try {
    const result = await sequelize.transaction<createTaskForecastAPIResponse>(async (transaction) => {
      const input = postValidationInput as createTaskForecastRequest

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

      /**
       * building quries for get asset task group id
       */
      const getAsetTaskGroup = await sequelize.query<{
        ASSET_TASK_GROUP_ID: number
      }>(getAssetTaskGroupIdQuery, {
        replacements: {
          teamId: input[Constants.FIELDS.TEAM_ID],
        },
        raw: true,
        plain: true,
        type: QueryTypes.SELECT,
        transaction,
      })
      if (!getAsetTaskGroup) {
        return {
          code: 404,
          body: "Not Found - Asset Task Group id was not found",
        }
      }

      /**
       * building quries for select task forecast
       */
      const taskForecast = await sequelize.query<{
        TASK_FORECAST_ID: number
      }>(selectTaskForecastQuery, {
        replacements: {
          eventTypeId: input[Constants.FIELDS.EVENT_TYPE_ID],
          taskTypeId: input[Constants.FIELDS.TASK_TYPE_ID],
          month: input[Constants.FIELDS.MONTH],
          year: input[Constants.FIELDS.YEAR],
          assetTaskGroupId: getAsetTaskGroup["ASSET_TASK_GROUP_ID"],
        },
        raw: true,
        plain: true,
        type: QueryTypes.SELECT,
        transaction,
      })
      if (taskForecast) {
        return {
          code: 409,
          body: "Conflict",
        }
      }

      /**
       * building quries for create task forecast
       */
      const curdate = new Date()
      const updatedate = new Date()
      const [insertId, _] = await sequelize.query(insertTaskForecastQuery, {
        raw: true,
        type: QueryTypes.INSERT,
        transaction,
        replacements: {
          eventTypeId: input[Constants.FIELDS.EVENT_TYPE_ID],
          taskTypeId: input[Constants.FIELDS.TASK_TYPE_ID],
          operationId: input[Constants.FIELDS.OPERATION_ID],
          month: input[Constants.FIELDS.MONTH],
          year: input[Constants.FIELDS.YEAR],
          totalHours: input[Constants.FIELDS.TOTAL_HOURS],
          totalTasks: input[Constants.FIELDS.TOTAL_TASKS] === undefined ? 0 : input[Constants.FIELDS.TOTAL_TASKS],
          teamId: input[Constants.FIELDS.TEAM_ID],
          assetTaskGroupId: getAsetTaskGroup["ASSET_TASK_GROUP_ID"],
          createdById: input[Constants.FIELDS.OPERATE_USER_ID],
          updatedById: input[Constants.FIELDS.OPERATE_USER_ID],
          curdate,
          updatedate,
        },
      })
      /** return response */
      return {
        code: 201,
        body: {
          [Constants.FIELDS.TASK_FORECAST_ID]: insertId,
        },
      }
    })

    return result
  } catch (e) {
    logger.error(e)
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

/* consolidate user request parameter */
export const consolidatecreateTaskForecastRequest = (
  req: Request,
): createTaskForecastRequest | poorlyShapedRequest => ({
  "event-type-id": Number(req.body[Constants.FIELDS.EVENT_TYPE_ID]),
  "task-type-id": Number(req.body[Constants.FIELDS.TASK_TYPE_ID]),
  "operation-id": Number(req.body[Constants.FIELDS.OPERATION_ID]),
  month: Number(req.body[Constants.FIELDS.MONTH]),
  year: Number(req.body[Constants.FIELDS.YEAR]),
  "total-hours": Number(req.body[Constants.FIELDS.TOTAL_HOURS]),
  "team-id": Number(req.body[Constants.FIELDS.TEAM_ID]),
  "operate-user-id": req.body[Constants.FIELDS.OPERATE_USER_ID],
  "total-tasks": OptionalIntNumber(req.body[Constants.FIELDS.TOTAL_TASKS]),
})

/** export create task forecast controller */
export const createTaskForecastController = jsonResponse(
  extractValue(consolidatecreateTaskForecastRequest)(createTaskForecast),
)
