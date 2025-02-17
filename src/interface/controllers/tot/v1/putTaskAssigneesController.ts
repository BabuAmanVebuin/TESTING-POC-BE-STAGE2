// Initially copied from ToT-BE, commit 545c1dd02ed8df920e315645df162212e80b2a03
import { env } from "process"

import { Request } from "express"
import { QueryTypes } from "sequelize"

import {
  putTaskAssigneesAPIResponse,
  putTaskAssigneesRequest,
} from "../../../../domain/entities/tot/v1/putTaskAssignees.js"
import logger from "../../../../infrastructure/logger.js"
import { sequelize } from "../../../../infrastructure/orm/sqlize/index.js"
import { extractValue, jsonOrEmptyResponse } from "../../../decorators.js"

import { sendCreateTaskAssigneeNotification, sendDeleteTaskAssigneeNotification } from "./utils.js"

/* select user by operate user id */
const selectOperateUserName = `SELECT USER_NAME FROM m_user_tot WHERE USER_ID = :operateUserId;`
/* select task by task id */
const lockTasks = `SELECT TASK_ID FROM t_task WHERE TASK_ID IN (?) FOR UPDATE;`
/* select task assignee */
const selectExistingAssignments = `SELECT TASK_ID, USER_ID FROM t_task_assignee WHERE TASK_ID IN (?);`
/* select user by user id for update */
const findExistentUsers = `SELECT USER_ID FROM m_user_tot WHERE USER_ID IN (?) FOR UPDATE;`
/* insert task assignee */
const insertAssignees = `INSERT INTO t_task_assignee (TASK_ID, USER_ID) VALUES ?;`
/* delete task assignee */
const deleteAssignees = `DELETE FROM t_task_assignee WHERE TASK_ID = :taskId AND USER_ID IN (:userIds);`
/* select task priority */
const selectTaskQuery = `SELECT
    T1.TASK_NAME,
    T1.PLANNED_DATE_TIME,
    T2.TASK_PRIORITY_NAME
  FROM
    t_task T1 LEFT OUTER JOIN
    m_task_priority T2 ON T1.TASK_PRIORITY_ID = T2.TASK_PRIORITY_ID
  WHERE TASK_ID = :taskId;`
/* select task by status 2 */
const selectTasksToUpdate = `SELECT TASK_ID FROM t_task WHERE TASK_STATUS_ID = 2 AND TASK_ID IN (?);`
/* update task status 3 */
const updateTaskStatus = `UPDATE t_task
  SET
    TASK_STATUS_ID = 3,
    UPDATE_TIMESTAMP = :curdate
  WHERE
    TASK_ID IN (:taskIds);`
/* insert task audit */
const insertTaskAuditRecords = `INSERT INTO t_task_audit (
    TASK_ID,
    PRE_TASK_STATUS_ID,
    POST_TASK_STATUS_ID,
    OPERATE_USER_ID,
    OPERATE_TIMESTAMP
  ) VALUES ?;`
class AssigneeNotFound extends Error {
  invalidValues: string[]
  constructor(invalidValues: string[], ...params: any) {
    super(...params)
    this.invalidValues = invalidValues
  }
}

class OperatorNotFound extends Error {}
class TaskNotFound extends Error {
  invalidValues: number[]
  constructor(invalidValues: number[], ...params: any) {
    super(...params)
    this.invalidValues = invalidValues
  }
}

type Assignee = {
  TASK_ID: number
  USER_ID: string
}

type Task = {
  TASK_NAME: string
  PLANNED_DATE_TIME: Date
  TASK_PRIORITY_NAME: string
}

const putTaskAssignees = async (
  postValidationInput: putTaskAssigneesRequest | Record<string, any>[],
): Promise<putTaskAssigneesAPIResponse> => {
  const input = postValidationInput as putTaskAssigneesRequest

  if (input.assignments.length === 0) {
    return {
      code: 200,
      body: "OK",
    }
  }

  try {
    await sequelize.transaction(async (transaction) => {
      const curdate = new Date()

      // Get the operate user name
      const operateUser = await sequelize.query<{ USER_NAME: string }>(selectOperateUserName, {
        replacements: { operateUserId: input["operate-user-id"] },
        type: QueryTypes.SELECT,
        raw: true,
        plain: true,
        transaction,
      })

      if (operateUser === null) {
        throw new OperatorNotFound()
      }

      const operateUserName = operateUser.USER_NAME

      const inputAssigneeMap = new Map<number, Set<string>>()
      input.assignments.forEach((assignment) => {
        inputAssigneeMap.set(
          assignment["task-id"],
          new Set(assignment.assignees.map((assignee) => assignee["user-id"])),
        )
      })

      // Lock the task rows
      const taskIds = [...inputAssigneeMap.keys()]
      const tasks = await sequelize.query<{ TASK_ID: number }>(lockTasks, {
        replacements: [taskIds],
        raw: true,
        type: QueryTypes.SELECT,
        transaction,
      })
      const existingTaskIdSet = new Set(tasks.map((t) => t.TASK_ID))
      const inexistentTaskIds = new Set<number>()
      for (const taskId of inputAssigneeMap.keys()) {
        if (!existingTaskIdSet.has(taskId)) {
          inexistentTaskIds.add(taskId)
        }
      }
      if (inexistentTaskIds.size > 0) {
        throw new TaskNotFound([...inexistentTaskIds])
      }

      // Fetch existing assignments
      const existingAssignments = await sequelize.query<Assignee>(selectExistingAssignments, {
        replacements: [taskIds],
        type: QueryTypes.SELECT,
        raw: true,
        transaction,
      })

      const existingAssignmentMap = new Map<number, Set<string>>()
      existingAssignments.forEach((assignment) => {
        let userIdSet = existingAssignmentMap.get(assignment.TASK_ID)
        if (userIdSet === undefined) {
          userIdSet = new Set<string>()
          existingAssignmentMap.set(assignment.TASK_ID, userIdSet)
        }
        userIdSet.add(assignment.USER_ID)
      })

      const newAssigneeMap = new Map<number, Set<string>>()
      const deleteAssigneeMap = new Map<number, Set<string>>()

      // Determine the new assignments to create
      const allNewAssigneeSet = new Set<string>()
      input.assignments.forEach((assignment) => {
        const newAssigneeSet = new Set<string>()

        const existingAssigneeSet = existingAssignmentMap.get(assignment["task-id"]) || new Set<string>()

        assignment.assignees.forEach((assignee) => {
          if (existingAssigneeSet.has(assignee["user-id"])) {
            return
          }
          newAssigneeSet.add(assignee["user-id"])
          allNewAssigneeSet.add(assignee["user-id"])
        })

        if (newAssigneeSet.size > 0) {
          newAssigneeMap.set(assignment["task-id"], newAssigneeSet)
        }
      })

      // Check for inexistent users
      const existentUsers =
        allNewAssigneeSet.size === 0
          ? []
          : await sequelize.query<{ USER_ID: string }>(findExistentUsers, {
              replacements: [[...allNewAssigneeSet]],
              type: QueryTypes.SELECT,
              raw: true,
              transaction,
            })
      const existentUserIdSet = new Set(existentUsers.map((user) => user.USER_ID))
      const inexistentUserIdSet = new Set<string>()
      allNewAssigneeSet.forEach((assignee) => {
        if (!existentUserIdSet.has(assignee)) {
          inexistentUserIdSet.add(assignee)
        }
      })
      if (inexistentUserIdSet.size > 0) {
        throw new AssigneeNotFound([...inexistentUserIdSet])
      }

      // Determine the assignments to delete
      existingAssignmentMap.forEach((existingAssigneeSet, taskId) => {
        const deleteAssigneeSet = new Set<string>()

        const inputAssigneeSet = inputAssigneeMap.get(taskId) as Set<string>

        existingAssigneeSet.forEach((userId) => {
          if (!inputAssigneeSet.has(userId)) {
            deleteAssigneeSet.add(userId)
          }
        })

        if (deleteAssigneeSet.size > 0) {
          deleteAssigneeMap.set(taskId, deleteAssigneeSet)
        }
      })

      // Insert the new assignments and update task status as needed
      for (const [taskId, assignees] of newAssigneeMap) {
        const insertValues = [...assignees].map((userId) => [taskId, userId])
        await sequelize.query(insertAssignees, {
          replacements: [insertValues],
          type: QueryTypes.INSERT,
          raw: true,
          transaction,
        })
      }
      const tasksWithNewAssignees = [...newAssigneeMap.keys()]
      const tasksToUpdate =
        tasksWithNewAssignees.length === 0
          ? []
          : await sequelize.query<{ TASK_ID: number }>(selectTasksToUpdate, {
              replacements: [tasksWithNewAssignees],
              type: QueryTypes.SELECT,
              raw: true,
              transaction,
            })
      // Update the task records
      if (tasksToUpdate.length > 0) {
        await sequelize.query(updateTaskStatus, {
          replacements: {
            curdate,
            taskIds: tasksToUpdate.map((t) => t.TASK_ID),
          },
          type: QueryTypes.UPDATE,
          raw: true,
          transaction,
        })
        // Insert task audit records
        await sequelize.query(insertTaskAuditRecords, {
          replacements: [tasksToUpdate.map((t) => [t.TASK_ID, 2, 3, input["operate-user-id"], curdate])],
          type: QueryTypes.INSERT,
          raw: true,
          transaction,
        })
      }

      // Delete assignments
      for (const [taskId, assignees] of deleteAssigneeMap) {
        await sequelize.query(deleteAssignees, {
          replacements: {
            taskId,
            userIds: [...assignees],
          },
          type: QueryTypes.DELETE,
          raw: true,
          transaction,
        })
      }

      // Prepare notifications
      const insertNotifications: { task: Task; assignees: Set<string> }[] = []
      for (const [taskId, assignees] of newAssigneeMap) {
        const task: any = await sequelize.query<Task>(selectTaskQuery, {
          raw: true,
          type: QueryTypes.SELECT,
          transaction,
          plain: true,
          replacements: { taskId },
        })

        insertNotifications.push({ task, assignees })
      }

      const deleteNotifications: { task: Task; assignees: Set<string> }[] = []
      for (const [taskId, assignees] of deleteAssigneeMap) {
        const task: any = await sequelize.query<Task>(selectTaskQuery, {
          raw: true,
          type: QueryTypes.SELECT,
          transaction,
          plain: true,
          replacements: { taskId },
        })

        deleteNotifications.push({ task, assignees })
      }

      // Send notifications
      if (env.NTF_PUSH_NOTIFICATION_CONNECTION_STRING) {
        for (const { task, assignees } of insertNotifications) {
          const dateString = task.PLANNED_DATE_TIME ? task.PLANNED_DATE_TIME.toLocaleString("ja-JP") : "N/A"
          const priorityNameString = task.TASK_PRIORITY_NAME ? task.TASK_PRIORITY_NAME : "N/A"
          await sendCreateTaskAssigneeNotification(
            [...assignees],
            operateUserName,
            task.TASK_NAME,
            dateString,
            priorityNameString,
            curdate,
            transaction,
          )
        }

        for (const { task, assignees } of deleteNotifications) {
          await sendDeleteTaskAssigneeNotification(
            [...assignees],
            operateUserName,
            task.TASK_NAME,
            curdate,
            transaction,
          )
        }
      } else {
        logger.warn("You do not have environmental settings set to send push notifications")
      }
    })
    return {
      code: 200,
      body: "OK",
    }
  } catch (err) {
    if (err instanceof OperatorNotFound) {
      return {
        code: 404,
        body: { errors: [{ "error-type": "NOT_FOUND_OPERATE_USER_ID" }] },
      }
    }

    if (err instanceof TaskNotFound) {
      return {
        code: 404,
        body: {
          errors: [
            {
              "error-type": "NOT_FOUND_TASK_ID",
              "invalid-values": err.invalidValues,
            },
          ],
        },
      }
    }

    if (err instanceof AssigneeNotFound) {
      return {
        code: 404,
        body: {
          errors: [
            {
              "error-type": "NOT_FOUND_USER_ID",
              "invalid-values": err.invalidValues,
            },
          ],
        },
      }
    }

    throw err
  }
}

/* consolidate user request parameter */
export const consolidateputTaskAssigneesRequest = (req: Request): putTaskAssigneesRequest => ({
  "operate-user-id": req.body["operate-user-id"],
  assignments: req.body.assignments.map((assignment: Record<string, any>) => ({
    "task-id": Number(assignment["task-id"]),
    assignees: assignment.assignees.map((assignee: Record<string, any>) => ({
      "user-id": assignee["user-id"],
    })),
  })),
})

export const putTaskAssigneesController = jsonOrEmptyResponse(
  extractValue(consolidateputTaskAssigneesRequest)(putTaskAssignees),
  [404],
)
