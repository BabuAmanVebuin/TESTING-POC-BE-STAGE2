// Initially copied from ToT-BE, commit 545c1dd02ed8df920e315645df162212e80b2a03
/* eslint-disable @typescript-eslint/no-explicit-any */

import { Request } from "express"
import { QueryTypes } from "sequelize"

import {
  updateTaskForecastRequest,
  updateTaskForecastAPIResponse,
} from "../../../../domain/entities/tot/v1/updateTaskForecast.js"
import logger from "../../../../infrastructure/logger.js"
import { sequelize } from "../../../../infrastructure/orm/sqlize/index.js"
import { extractValue, jsonResponse } from "../../../decorators.js"
import { Constants } from "../../../../config/constants.js"
import {
  poorlyShapedRequest,
  TaskForecastIdNotFoundError,
  send404Response,
  EventTemplateIdNotFoundError,
  OptionalIntNumber,
} from "./utils.js"

/** select task forecast query for validation duplicate records */
const selectTaskForecastQuery = `SELECT TASK_FORECAST_ID FROM t_task_forecast 
                                WHERE EVENT_TYPE_ID=:eventTypeId AND TASK_TYPE_ID=:taskTypeId 
                                AND MONTH=:month AND YEAR=:year AND ASSET_TASK_GROUP_ID=:assetTaskGroupId AND TASK_FORECAST_ID != :taskForecastId limit 1`

/** select task forecast query to validate task forecast id */
const selectTaskForecast = `SELECT TASK_FORECAST_ID FROM t_task_forecast WHERE TASK_FORECAST_ID= :taskForecastId`

/** select event template query to validate event type id or task type id */
const selectEventTemplate = `SELECT EVENT_TYPE_ID FROM m_event_template WHERE EVENT_TYPE_ID= :eventTypeId AND TASK_TYPE_ID= :taskTypeId
AND IS_DELETED = ${Constants.IS_NOT_DELETED}`

/** get asset-task-group-id by team-id query */
const getAssetTaskGroupIdQuery = `SELECT ASSET_TASK_GROUP_ID FROM m_asset_task_group WHERE TEAM_ID= :teamId LIMIT 1`

/**
 * This is the main controller function where data is fetched from the database and response send back to the client
 * @param postValidationInput Request parameter
 * @returns response body for the request, either data or bad request
 */
const updateTaskForecast = async (
  postValidationInput: updateTaskForecastRequest | Record<string, any>,
): Promise<updateTaskForecastAPIResponse> => {
  try {
    const result = await sequelize.transaction<updateTaskForecastAPIResponse>(async (transaction) => {
      const input = postValidationInput as updateTaskForecastRequest

      /** building queries for get task forcast by id */
      const taskForecastId = await sequelize.query<{
        TASK_FORECAST_ID: number
      }>(selectTaskForecast, {
        replacements: {
          taskForecastId: input[Constants.FIELDS.TASK_FORECAST_ID],
        },
        raw: true,
        plain: true,
        type: QueryTypes.SELECT,
        transaction,
      })

      if (taskForecastId === null) {
        throw new TaskForecastIdNotFoundError(input[Constants.FIELDS.TASK_FORECAST_ID])
      }

      /**
       * building quries for event template query to validate event type id or task type id
       */
      if (input[Constants.FIELDS.EVENT_TYPE_ID] !== undefined && input[Constants.FIELDS.TASK_TYPE_ID] !== undefined) {
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

        if (eventTemplateData === null) {
          throw new EventTemplateIdNotFoundError(input[Constants.FIELDS.EVENT_TYPE_ID] || 0)
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

      if (input[Constants.FIELDS.EVENT_TYPE_ID] !== undefined && input[Constants.FIELDS.TASK_TYPE_ID] !== undefined) {
        const taskForecastData = await sequelize.query<{
          TASK_FORECAST_ID: number
        }>(selectTaskForecastQuery, {
          replacements: {
            eventTypeId: input[Constants.FIELDS.EVENT_TYPE_ID],
            taskTypeId: input[Constants.FIELDS.TASK_TYPE_ID],
            month: input[Constants.FIELDS.MONTH],
            year: input[Constants.FIELDS.YEAR],
            assetTaskGroupId: getAsetTaskGroup["ASSET_TASK_GROUP_ID"],
            taskForecastId: input[Constants.FIELDS.TASK_FORECAST_ID],
          },
          raw: true,
          plain: true,
          type: QueryTypes.SELECT,
          transaction,
        })
        if (taskForecastData) {
          return {
            code: 409,
            body: "Conflict",
          }
        }
      }
      /**
       * building quries for select task forecast
       */

      /** update task forecast query */
      const updateTaskForecastQuery = `UPDATE t_task_forecast
          SET
          ${input[Constants.FIELDS.EVENT_TYPE_ID] === undefined ? "" : "EVENT_TYPE_ID= :eventTypeId"}
           ${input[Constants.FIELDS.TASK_TYPE_ID] === undefined ? "" : ",TASK_TYPE_ID= :taskTypeId,"}
          MONTH = :month,
          YEAR = :year,
          TOTAL_HOURS = :totalHours,
          TEAM_ID = :teamId,
          ASSET_TASK_GROUP_ID = :assetTaskGroupId,
          UPDATE_USER_ID = :updatedById,
          UPDATE_TIMESTAMP = :updatedate
          ${input[Constants.FIELDS.TOTAL_TASKS] === undefined ? "" : ",TOTAL_TASKS= :totalTasks"}
          WHERE
          TASK_FORECAST_ID = :taskForecastId;`

      /**
       * building quries for update task forecast
       */
      const optional = (x: unknown) => (x === undefined ? null : x)

      const updatedate = new Date()
      await sequelize.query(updateTaskForecastQuery, {
        raw: true,
        type: QueryTypes.UPDATE,
        transaction,
        replacements: {
          taskForecastId: input[Constants.FIELDS.TASK_FORECAST_ID],
          eventTypeId: optional(input[Constants.FIELDS.EVENT_TYPE_ID]),
          taskTypeId: optional(input[Constants.FIELDS.TASK_TYPE_ID]),
          month: input[Constants.FIELDS.MONTH],
          year: input[Constants.FIELDS.YEAR],
          totalHours: input[Constants.FIELDS.TOTAL_HOURS],
          teamId: input[Constants.FIELDS.TEAM_ID],
          assetTaskGroupId: getAsetTaskGroup["ASSET_TASK_GROUP_ID"],
          updatedById: input[Constants.FIELDS.OPERATE_USER_ID],
          totalTasks: input[Constants.FIELDS.TOTAL_TASKS],
          updatedate,
        },
      })

      return {
        code: 200,
        body: "OK",
      }
    })

    return result
  } catch (e) {
    logger.error(e)
    if (e instanceof TaskForecastIdNotFoundError) {
      return send404Response(e)
    }
    if (e instanceof EventTemplateIdNotFoundError) {
      return send404Response(e)
    }
    return {
      code: 400,
      body: "Bad Request",
    }
  }
}

/* consolidate user request parameter */
export const consolidateUpdateTaskForecastRequest = (
  req: Request,
): updateTaskForecastRequest | poorlyShapedRequest => ({
  "task-forecast-id": Number(req.params.taskForecastId),
  "event-type-id": OptionalIntNumber(req.body[Constants.FIELDS.EVENT_TYPE_ID]),
  "task-type-id": OptionalIntNumber(req.body[Constants.FIELDS.TASK_TYPE_ID]),
  month: Number(req.body[Constants.FIELDS.MONTH]),
  year: Number(req.body[Constants.FIELDS.YEAR]),
  "total-hours": Number(req.body[Constants.FIELDS.TOTAL_HOURS]),
  "team-id": Number(req.body[Constants.FIELDS.TEAM_ID]),
  "operate-user-id": req.body[Constants.FIELDS.OPERATE_USER_ID],
  "total-tasks": OptionalIntNumber(req.body[Constants.FIELDS.TOTAL_TASKS]),
})

export const updateTaskForecastController = jsonResponse(
  extractValue(consolidateUpdateTaskForecastRequest)(updateTaskForecast),
)
