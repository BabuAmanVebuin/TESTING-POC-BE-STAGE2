// Initially copied from ToT-BE, commit 545c1dd02ed8df920e315645df162212e80b2a03
/* eslint-disable @typescript-eslint/no-explicit-any */

import { Request } from "express"
import { QueryTypes } from "sequelize"

import {
  getTaskCountRequest,
  getTaskCountAPIResponse,
  TaskCountPlannedQueryResponse,
  TaskCountUnPlannedQueryResponse,
} from "../../../../domain/entities/tot/v1/getTaskCount.js"
import logger from "../../../../infrastructure/logger.js"
import { sequelize } from "../../../../infrastructure/orm/sqlize/index.js"
import { extractValue, jsonResponse } from "../../../decorators.js"

import { poorlyShapedRequest, BoolFromString, DateTimeFromString } from "./utils.js"

const lang = "JA"

/** build task planned date time filter */
const buildTaskPlannedDateTimeFilter = (
  fromDT: Date | undefined,
  toDT: Date | undefined,
  blankFlag: boolean | undefined,
): string => {
  if (fromDT === undefined) {
    if (toDT === undefined) {
      if (blankFlag) {
        logger.info("BLANK FLAG ONLY")
        return ""
      } else {
        logger.info("All EMPTY")
        return `T.PLANNED_DATE_TIME IS NOT NULL `
      }
    } else if (blankFlag) {
      logger.info("TO AND BLANK ONLY")
      return `(
          T.PLANNED_DATE_TIME <= :plannedDateTimeTo OR
          T.PLANNED_DATE_TIME IS NULL
        ) `
    } else {
      logger.info("TO ONLY")
      return `T.PLANNED_DATE_TIME <= :plannedDateTimeTo `
    }
  } else if (toDT === undefined) {
    if (blankFlag) {
      logger.info("FROM AND BLANK ONLY")
      return `(
            T.PLANNED_DATE_TIME >= :plannedDateTimeFrom OR
            T.PLANNED_DATE_TIME IS NULL
        ) `
    } else {
      logger.info("FROM ONLY")
      return `T.PLANNED_DATE_TIME >= :plannedDateTimeFrom `
    }
  } else if (blankFlag) {
    logger.info("TO AND FROM AND BLANK")
    return `(
        (
          T.PLANNED_DATE_TIME >= :plannedDateTimeFrom AND
          T.PLANNED_DATE_TIME <= :plannedDateTimeTo
        ) OR T.PLANNED_DATE_TIME IS NULL
      ) `
  } else {
    logger.info("TO AND FROM")
    return `(
        T.PLANNED_DATE_TIME >= :plannedDateTimeFrom AND
        T.PLANNED_DATE_TIME <= :plannedDateTimeTo
      ) `
  }
}

/**
 * This function is used to build query to get task count for planned task
 * @param input Date filter input
 * @returns planned query with date filter input
 */
const buildTaskCountPlannedQuery = (input: getTaskCountRequest): string => {
  // planned date time filter
  const taskPlannedDateTimeFilter = buildTaskPlannedDateTimeFilter(
    input["planned-date-time-from"],
    input["planned-date-time-to"],
    input["planned-date-time-blank-flag"],
  )
  const getTaskCountPlannedQuery = `
        SELECT COUNT(Distinct T.TASK_ID) 'planned-task-count'
        FROM t_task T, t_task_assignee TS
        WHERE TS.TASK_ID = T.TASK_ID
        AND T.PLANT_ID = :powerPlantId
        AND T.ASSET_TASK_GROUP_ID = :assetTaskGroupId
        AND T.TASK_STATUS_ID IN (3,4,5,6)
        ${taskPlannedDateTimeFilter != "" ? "AND " + taskPlannedDateTimeFilter : ""}`

  return getTaskCountPlannedQuery
}

/**
 * This function is used to build query to get task count for unplanned task
 * @param input Date filter input
 * @returns unplanned query with date filter input
 */
const buildTaskCountUnPlannedQuery = (input: getTaskCountRequest): string => {
  const taskPlannedDateTimeFilter = buildTaskPlannedDateTimeFilter(
    input["planned-date-time-from"],
    input["planned-date-time-to"],
    input["planned-date-time-blank-flag"],
  )
  const getTaskCountUnPlannedQuery = `
        SELECT COUNT(DISTINCT T.TASK_ID) 'unplanned-task-count'
        FROM t_task T
        WHERE
        NOT EXISTS( SELECT TASK_ID
                    FROM t_task_assignee TS
                    WHERE TS.TASK_ID = T.TASK_ID )
        AND T.PLANT_ID = :powerPlantId
        AND T.ASSET_TASK_GROUP_ID = :assetTaskGroupId
        AND T.TASK_STATUS_ID IN (2 , 3)
        ${taskPlannedDateTimeFilter != "" ? "AND " + taskPlannedDateTimeFilter : ""}`

  return getTaskCountUnPlannedQuery
}

/**
 * This is the main controller function where data is fetched from the database and response send back to the client
 * @param postValidationInput Request parameter
 * @returns response body for the request, either data or bad request
 */
const getTaskCount = async (
  postValidationInput: getTaskCountRequest | Record<string, any>,
): Promise<getTaskCountAPIResponse> => {
  try {
    const input = postValidationInput as getTaskCountRequest

    /**
     * building quries for planned and un planned task
     */
    const taskCountPlannedQuery = buildTaskCountPlannedQuery(input)
    const taskCountUnPlannedQuery = buildTaskCountUnPlannedQuery(input)

    /**
     * Triggering query to get planned task
     */
    const plannedTaskCountDB = await sequelize.query<TaskCountPlannedQueryResponse>(taskCountPlannedQuery, {
      type: QueryTypes.SELECT,
      raw: true,
      replacements: {
        lang,
        plannedDateTimeTo: input["planned-date-time-to"],
        plannedDateTimeFrom: input["planned-date-time-from"],
        powerPlantId: input["power-plant-id"],
        assetTaskGroupId: input["asset-task-group-id"],
      },
    })

    /**
     * Triggering query to get unplanned task
     */
    const unPlannedTaskCountDB = await sequelize.query<TaskCountUnPlannedQueryResponse>(taskCountUnPlannedQuery, {
      type: QueryTypes.SELECT,
      raw: true,
      replacements: {
        lang,
        plannedDateTimeTo: input["planned-date-time-to"],
        plannedDateTimeFrom: input["planned-date-time-from"],
        powerPlantId: input["power-plant-id"],
        assetTaskGroupId: input["asset-task-group-id"],
      },
    })

    const plannedTaskCount = plannedTaskCountDB[0]["planned-task-count"]
    const unPlannedTaskCount = unPlannedTaskCountDB[0]["unplanned-task-count"]

    return {
      code: 200,
      body: {
        "planned-task-count": plannedTaskCount,
        "unplanned-task-count": unPlannedTaskCount,
      },
    }
  } catch (e) {
    logger.error(e)
    return {
      code: 400,
      body: "Bad Request",
    }
  }
}

/* consolidate user request parameter */
export const consolidateGetTaskCountRequest = (req: Request): getTaskCountRequest | poorlyShapedRequest => ({
  "planned-date-time-to": DateTimeFromString(req.query["planned-date-time-to"] as string),
  "planned-date-time-from": DateTimeFromString(req.query["planned-date-time-from"] as string),
  "planned-date-time-blank-flag": BoolFromString(req.query["planned-date-time-blank-flag"] as string),
  "power-plant-id": req.query["power-plant-id"],
  "asset-task-group-id": req.query["asset-task-group-id"],
})

export const getGetTaskCountController = jsonResponse(extractValue(consolidateGetTaskCountRequest)(getTaskCount))
