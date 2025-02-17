// Initially copied from ToT-BE, commit 545c1dd02ed8df920e315645df162212e80b2a03

/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request } from "express"
import { QueryTypes } from "sequelize"

import {
  getTaskForecastListAPIResponse,
  getTaskForecastListRequest,
  getTaskForecastListResponse,
} from "../../../../domain/entities/tot/v1/getTaskForecastList.js"
import { sequelize } from "../../../../infrastructure/orm/sqlize/index.js"
import { jsonResponse, extractValue } from "../../../decorators.js"
import logger from "../../../../infrastructure/logger.js"
import { Constants } from "../../../../config/constants.js"
import {
  OptionalStringField,
  OptionalNumberField,
  paggingWrapper,
  EventTypeIdNotFoundError,
  TaskTypeIdNotFoundError,
  send404Response,
  consolidatePossibleArray,
} from "./utils.js"

/**
 * Query to get task forecast data from database
 */
const buildGetTaskForecastQuery = (input: getTaskForecastListRequest): string => {
  const startYearMonth = input[Constants.FIELDS.START_YEAR]
  const endYearMonth = input[Constants.FIELDS.END_YEAR]
  let where = ""
  let eventType = ""
  let taskType = ""
  let operation = ""
  if (startYearMonth != undefined && endYearMonth != undefined) {
    where = ` AND (SELECT CAST(concat_ws("-", TF.YEAR, TF.MONTH, TF.MONTH ) AS DATE))
    between CAST(:startYearMonth AS DATE)
    AND CAST(:endYearMonth AS DATE) `
  } else if (startYearMonth != undefined) {
    where = ` AND (SELECT CAST(concat_ws("-", TF.YEAR, TF.MONTH, TF.MONTH ) AS DATE)) >= :startYearMonth`
  } else if (endYearMonth != undefined) {
    where = ` AND (SELECT CAST(concat_ws("-", TF.YEAR, TF.MONTH, TF.MONTH ) AS DATE)) <= :endYearMonth`
  }
  if (input[Constants.FIELDS.EVENT_TYPE_ID] != undefined) {
    eventType = ` AND TF.EVENT_TYPE_ID=:eventTypeId `
  }
  if (input[Constants.FIELDS.TASK_TYPE_ID] != undefined) {
    taskType = ` AND TF.TASK_TYPE_ID=:taskTypeId `
  }
  if (input[Constants.FIELDS.OPERATION_ID] != undefined) {
    operation = ` AND TF.OPERATION_ID IN (:operationId)`
  }
  /** Query */
  const getTaskForecastQuery = `
            SELECT 
              TF.TASK_FORECAST_ID 'task-forecast-id',
              TF.EVENT_TYPE_ID 'event-type-id',
              ET.EVENT_TYPE_NAME 'event-type-name',
              ET.IS_DELETED 'is-event-type-delete',
              TF.TASK_TYPE_ID 'task-type-id',
              TT.TASK_TYPE_NAME 'task-type-name',
              TT.IS_DELETED 'is-task-type-delete',
              TF.MONTH 'month',
              TF.YEAR 'year',
              TF.TOTAL_HOURS 'total-hours',
              TF.TOTAL_TASKS 'total-tasks',
              TF.TEAM_ID 'team-id',
              TF.ASSET_TASK_GROUP_ID 'asset-task-group-id',
              TF.CREATE_TIMESTAMP 'create-timestamp',
              TF.CREATE_USER_ID 'create-user-id',
              TF.UPDATE_TIMESTAMP 'update-timestamp',
              TF.UPDATE_USER_ID 'update-user-id',
              TOE.IS_DELETED 'is-operation-event-delete'
            FROM t_task_forecast TF, m_event_type ET, m_task_type TT, t_operation_event_type TOE
            WHERE TF.ASSET_TASK_GROUP_ID = :assetTaskGroupId
            ${where}
            ${eventType}
            ${taskType}
            ${operation}
            AND TF.EVENT_TYPE_ID = ET.EVENT_TYPE_ID
            AND TF.TASK_TYPE_ID = TT.TASK_TYPE_ID
            AND TF.OPERATION_ID = TOE.OPERATION_ID 
            AND TF.EVENT_TYPE_ID = TOE.EVENT_TYPE_ID
            ORDER BY TF.YEAR ASC,TF.MONTH ASC 
            `
  return getTaskForecastQuery
}

/** validate event-type-id query */
const validateEventTypeIdQuery = "SELECT EVENT_TYPE_ID FROM m_event_type WHERE EVENT_TYPE_ID=:eventTypeId LIMIT 1"

/** validate task-type-id query */
const validateTaskTypeIdQuery = "SELECT TASK_TYPE_ID FROM m_task_type WHERE TASK_TYPE_ID=:taskTypeId LIMIT 1"

/**  get task forecast info by id function */
const getTaskForecastList = async (
  postValidationInput: getTaskForecastListRequest | Record<string, any>,
): Promise<getTaskForecastListAPIResponse> => {
  try {
    const input = postValidationInput as getTaskForecastListRequest

    if (input[Constants.FIELDS.EVENT_TYPE_ID] != undefined) {
      /** validate event-type-id query */
      const eventTypeIdQuery = await sequelize.query<{
        EVENT_TYPE_ID: number
      }>(validateEventTypeIdQuery, {
        type: QueryTypes.SELECT,
        raw: true,
        replacements: {
          eventTypeId: input[Constants.FIELDS.EVENT_TYPE_ID],
        },
      })
      if (eventTypeIdQuery.length == 0) {
        logger.warn("[eventTypeIdQuery] Not Found - Event type id was not found")
        throw new EventTypeIdNotFoundError(input[Constants.FIELDS.EVENT_TYPE_ID]!)
      }
    }

    if (input[Constants.FIELDS.TASK_TYPE_ID] != undefined) {
      /** validate task-type-id query */
      const taskTypeIdQuery = await sequelize.query<{
        TASK_TYPE_ID: number
      }>(validateTaskTypeIdQuery, {
        type: QueryTypes.SELECT,
        raw: true,
        replacements: {
          taskTypeId: input[Constants.FIELDS.TASK_TYPE_ID],
        },
      })
      if (taskTypeIdQuery.length == 0) {
        logger.warn("[taskTypeIdQuery] Not Found - Task type id was not found")
        throw new TaskTypeIdNotFoundError(input[Constants.FIELDS.TASK_TYPE_ID]!)
      }
    }

    /** fetch year from start-year*/
    const startYear =
      input[Constants.FIELDS.START_YEAR] != undefined ? input[Constants.FIELDS.START_YEAR]?.split("-")[0] : 1

    /** fetch year from end-year*/
    const endYear = input[Constants.FIELDS.END_YEAR] != undefined ? input[Constants.FIELDS.END_YEAR]?.split("-")[0] : 1

    /** fetch month from start-year*/
    const startMonth =
      input[Constants.FIELDS.START_YEAR] != undefined ? input[Constants.FIELDS.START_YEAR]?.split("-")[1] : 1

    /** fetch month from end-year*/
    const endMonth = input[Constants.FIELDS.END_YEAR] != undefined ? input[Constants.FIELDS.END_YEAR]?.split("-")[0] : 1

    const assetTaskGroupId = input[Constants.FIELDS.ASSET_TASK_GROUP_ID]
    const sequelizeTransactionResponse = await sequelize.transaction(async (transaction) => {
      /**
       * Query to get task forecast
       */
      let response
      const buildGetTaskForecastQry = buildGetTaskForecastQuery(input)

      /** operation blank then pass it blank array otherwise it will pass operationId */
      const operationId: any = Array.isArray(input[Constants.FIELDS.OPERATION_ID]!)
        ? input[Constants.FIELDS.OPERATION_ID]!
        : []
      const arrTaskForecastReord = await sequelize.query<getTaskForecastListResponse>(buildGetTaskForecastQry, {
        raw: true,
        type: QueryTypes.SELECT,
        transaction,
        replacements: {
          assetTaskGroupId,
          eventTypeId: input[Constants.FIELDS.EVENT_TYPE_ID],
          taskTypeId: input[Constants.FIELDS.TASK_TYPE_ID],
          operationId,
          startYearMonth:
            input[Constants.FIELDS.START_YEAR] != undefined
              ? input[Constants.FIELDS.START_YEAR]! +
                "-" +
                new Date(startYear as number, startMonth as number, 1).getDate()
              : "",
          endYearMonth:
            input[Constants.FIELDS.END_YEAR] != undefined
              ? input[Constants.FIELDS.END_YEAR]! + "-" + new Date(endYear as number, endMonth as number, 0).getDate()
              : "",
          startYear:
            input[Constants.FIELDS.START_YEAR] != undefined ? input[Constants.FIELDS.START_YEAR]?.split("-")[0] : "",
          startMonth:
            input[Constants.FIELDS.START_YEAR] != undefined ? input[Constants.FIELDS.START_YEAR]?.split("-")[1] : "",
          endYear: input[Constants.FIELDS.END_YEAR] != undefined ? input[Constants.FIELDS.END_YEAR]?.split("-")[0] : "",
          endMonth:
            input[Constants.FIELDS.END_YEAR] != undefined ? input[Constants.FIELDS.END_YEAR]?.split("-")[1] : "",
        },
      })

      // assigned boolean value to is-operation-event-delete, is-event-type-deleted and is-task-type-deleted instead of integer
      arrTaskForecastReord.map((taskForecastElement: getTaskForecastListResponse) => {
        taskForecastElement[Constants.FIELDS.IS_EVENT_TYPE_DELETED] =
          taskForecastElement[Constants.FIELDS.IS_EVENT_TYPE_DELETED] === 0 ? Boolean(0) : Boolean(1)

        taskForecastElement[Constants.FIELDS.IS_TASK_TYPE_DELETED] =
          taskForecastElement[Constants.FIELDS.IS_TASK_TYPE_DELETED] === 0 ? Boolean(0) : Boolean(1)

        taskForecastElement[Constants.FIELDS.IS_OPERATION_EVENT_DELETED] =
          taskForecastElement[Constants.FIELDS.IS_OPERATION_EVENT_DELETED] === 1
        return true
      })

      if (input[Constants.FIELDS.PAGE_SEARCH_LIMIT] != undefined && input[Constants.FIELDS.PAGE_NO] != undefined) {
        /** return response */
        response = paggingWrapper(
          arrTaskForecastReord,
          input[Constants.FIELDS.PAGE_NO]!,
          input[Constants.FIELDS.PAGE_SEARCH_LIMIT]!,
          Constants.FIELDS.TASK_FORECAST,
        )
      } else {
        /** return response */
        response = {
          [Constants.FIELDS.TOTAL_PAGES]: 0,
          [Constants.FIELDS.CURRENT_PAGE]: 0,
          [Constants.FIELDS.TASK_FORECAST]: arrTaskForecastReord,
        }
      }

      return {
        code: 200,
        body: response,
      }
    })
    return sequelizeTransactionResponse
  } catch (err) {
    logger.warn(err)
    if (err instanceof EventTypeIdNotFoundError) {
      return send404Response(err)
    }
    if (err instanceof TaskTypeIdNotFoundError) {
      return send404Response(err)
    }
    return {
      code: 400,
      body: "Bad Request",
    }
  }
}

/* consolidate operationId request parameter */
const consolidateOperationId = (x: unknown) =>
  consolidatePossibleArray(x) ? consolidatePossibleArray(x).map((y: string) => Number(y)) : x

/* consolidate get task forecast id request parameter */
export const consolidategetTaskForecastListRequest = (
  req: Request,
): getTaskForecastListRequest | Record<string, any> => ({
  "asset-task-group-id": Number(req.query[Constants.FIELDS.ASSET_TASK_GROUP_ID]),
  "start-year": OptionalStringField(req.query[Constants.FIELDS.START_YEAR] as string),
  "end-year": req.query[Constants.FIELDS.END_YEAR],
  "page-no": OptionalNumberField(Number(req.query[Constants.FIELDS.PAGE_NO])),
  "page-search-limit": OptionalNumberField(Number(req.query[Constants.FIELDS.PAGE_SEARCH_LIMIT])),
  "event-type-id": OptionalNumberField(Number(req.query[Constants.FIELDS.EVENT_TYPE_ID])),
  "operation-id": consolidateOperationId(req.query[Constants.FIELDS.OPERATION_ID]),
  "task-type-id": OptionalNumberField(Number(req.query[Constants.FIELDS.TASK_TYPE_ID])),
})

export const getTaskForecastListController = jsonResponse(
  extractValue(consolidategetTaskForecastListRequest)(getTaskForecastList),
)
