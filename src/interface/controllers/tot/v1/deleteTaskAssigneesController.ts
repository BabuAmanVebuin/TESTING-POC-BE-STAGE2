// Initially copied from ToT-BE, commit 545c1dd02ed8df920e315645df162212e80b2a03

import { env } from "process"

import { Request } from "express"
import { BaseError, QueryTypes } from "sequelize"

import {
  deleteTaskAssigneesAPIResponse,
  deleteTaskAssigneesRequest,
} from "../../../../domain/entities/tot/v1/deleteTaskAssignees.js"
import logger from "../../../../infrastructure/logger.js"
import { sequelize } from "../../../../infrastructure/orm/sqlize/index.js"
import { extractValue, jsonOrEmptyResponse } from "../../../decorators.js"

import { handleDbError, sendDeleteTaskAssigneeNotification } from "./utils.js"

/* delete task assignee function */
export const deleteTaskAssignees = async (
  postValidationInput: deleteTaskAssigneesRequest | Array<Record<string, any>>,
): Promise<deleteTaskAssigneesAPIResponse> => {
  const input = postValidationInput as deleteTaskAssigneesRequest
  logger.info(`Delete Task Assignee Request: ${JSON.stringify(input)}`)

  /* select user by operate user id */
  const selectOperatorNameQuery = `SELECT USER_NAME FROM m_user_tot WHERE USER_ID = $operateUserId;`
  const selectTaskQuery = `SELECT TASK_ID, TASK_NAME FROM t_task WHERE TASK_ID IN (:taskIDs)`
  /* select task assignee by task id */
  const selectAssigneeQuery = `SELECT *
    FROM t_task_assignee
    WHERE
      TASK_ID = :taskId AND
      USER_ID IN (:userIds)
    FOR UPDATE;`

  /* delete task assignee */
  const deleteAssigneeQuery = `DELETE
    FROM t_task_assignee
    WHERE
      TASK_ID = :taskId AND
      USER_ID IN (:userIds);`
  const curdate = new Date()

  try {
    await sequelize.transaction(async (transaction) => {
      const operator = await sequelize.query<{ USER_NAME: string }>(selectOperatorNameQuery, {
        raw: true,
        type: QueryTypes.SELECT,
        plain: true,
        transaction,
        bind: { operateUserId: input["operate-user-id"] },
      })
      if (operator === null) {
        throw new Error("INVALID_OPERATOR")
      }

      const taskRows =
        input.assignments.length === 0
          ? []
          : await sequelize.query<{ TASK_ID: number; TASK_NAME: string }>(selectTaskQuery, {
              raw: true,
              type: QueryTypes.SELECT,
              transaction,
              replacements: {
                taskIDs: input.assignments.map((assignment) => assignment["task-id"]),
              },
            })

      const taskMap = new Map(taskRows.map(({ TASK_ID, TASK_NAME }) => [TASK_ID, TASK_NAME]))

      for (const assignment of input.assignments) {
        const userIds = assignment.assignees.map((assignee) => assignee["user-id"])
        if (userIds.length === 0) {
          continue
        }

        // Lock the assignee row
        const assignees = await sequelize.query(selectAssigneeQuery, {
          raw: true,
          type: QueryTypes.SELECT,
          transaction,
          replacements: {
            taskId: assignment["task-id"],
            userIds,
          },
        })

        if (assignees.length === 0) {
          throw new Error("NOT_FOUND")
        }

        // Delete the assignee row
        await sequelize.query(deleteAssigneeQuery, {
          raw: true,
          type: QueryTypes.DELETE,
          replacements: {
            taskId: assignment["task-id"],
            userIds,
          },
          transaction,
        })

        if (env.NTF_PUSH_NOTIFICATION_CONNECTION_STRING) {
          await sendDeleteTaskAssigneeNotification(
            userIds,
            operator.USER_NAME,
            taskMap.get(assignment["task-id"]) as string,
            curdate,
            transaction,
          )
        } else {
          logger.warn("You do not have environmental settings set to send push notifications")
        }
      }
    })
  } catch (err: any) {
    if (err instanceof BaseError) {
      handleDbError("deleteTaskAssignees", err)
    }
    if (err.message === "INVALID_OPERATOR") {
      return {
        code: 404,
        body: `Not Found - The operator ID (${input["operate-user-id"]}) was not registered in the database.`,
      }
    }

    if (err.message === "NOT_FOUND") {
      return {
        code: 404,
        body: "Not Found - Task assignees or task id were not found.",
      }
    }

    return {
      code: 400,
      body: "Bad Request",
    }
  }

  return {
    code: 200,
    body: "OK",
  }
}

/* consolidate user request parameter */
export const consolidatedeleteTaskAssigneeRequest = (req: Request): deleteTaskAssigneesRequest => ({
  "operate-user-id": req.body["operate-user-id"],
  assignments: req.body.assignments.map((assignment: Record<string, any>) => ({
    "task-id": Number(assignment["task-id"]),
    assignees: assignment.assignees.map((assignee: Record<string, any>) => ({
      "user-id": assignee["user-id"],
    })),
  })),
})

export const deleteTaskAssigneesController = jsonOrEmptyResponse(
  extractValue(consolidatedeleteTaskAssigneeRequest)(deleteTaskAssignees),
  [404],
)
