// Initially copied from ToT-BE, commit 545c1dd02ed8df920e315645df162212e80b2a03
import { env } from "process"

import { Request } from "express"
import { QueryTypes } from "sequelize"

import {
  updateTakeoverInfoAPIResponse,
  updateTakeoverInfoRequest,
} from "../../../../domain/entities/tot/v1/updateTakeoverInfo.js"
import logger from "../../../../infrastructure/logger.js"
import { sequelize } from "../../../../infrastructure/orm/sqlize/index.js"
import { emptyResponse, extractValue } from "../../../decorators.js"

import { sendDeleteTaskAssigneeNotification } from "./utils.js"

/* update take over info function */
const updateTakeoverInfo = async (
  postValidationInput: updateTakeoverInfoRequest | Record<string, any>,
): Promise<updateTakeoverInfoAPIResponse> => {
  try {
    const input = postValidationInput as updateTakeoverInfoRequest
    const curdate = new Date()

    const returnValue = await sequelize.transaction<updateTakeoverInfoAPIResponse>(async (transaction) => {
      /*select user query */
      const selectOperateUser = "SELECT USER_NAME, TEAM_ID FROM m_user_tot WHERE USER_ID = :operateUserId;"
      const operator = await sequelize.query<{
        USER_NAME: string
        TEAM_ID: number
      }>(selectOperateUser, {
        replacements: { operateUserId: input["operate-user-id"] },
        raw: true,
        plain: true,
        type: QueryTypes.SELECT,
        transaction,
      })

      if (operator === null) {
        logger.warn("[updateTakeoverInfo] Operate user ID does not exist")
        return {
          code: 404,
          body: "Operate user ID does not exist",
        }
      }

      // Make sure we have no task where the status is '4'
      const countQuery = `SELECT COUNT(1) 'COUNT'
    FROM t_task
    WHERE
      PLANT_ID = :powerPlantId AND
      ASSET_TASK_GROUP_ID = :assetTaskGroupId AND
      DATE(PLANNED_DATE_TIME) < DATE_ADD(DATE(:curdate), INTERVAL 1 DAY) AND
      TASK_STATUS_ID = '4' FOR UPDATE;`

      const result: any = await sequelize.query<{ COUNT: number }>(countQuery, {
        raw: true,
        plain: true,
        type: QueryTypes.SELECT,
        transaction,
        replacements: {
          powerPlantId: input["power-plant-id"],
          assetTaskGroupId: input["asset-task-group-id"],
          curdate,
        },
      })
      if (result.COUNT > 0) {
        logger.warn("[updateTakeoverInfo] Precondition Failed")
        return {
          code: 412,
          body: "Precondition Failed",
        }
      }

      // Select the tasks for updating
      const selectTaskQuery = `SELECT TASK_ID, TASK_NAME
      FROM t_task
      WHERE
        PLANT_ID = :powerPlantId AND
        ASSET_TASK_GROUP_ID = :assetTaskGroupId AND
        TASK_STATUS_ID = '5'
      FOR UPDATE;`
      const tasks = await sequelize.query<{
        TASK_ID: number
        TASK_NAME: string
      }>(selectTaskQuery, {
        raw: true,
        type: QueryTypes.SELECT,
        replacements: {
          powerPlantId: input["power-plant-id"],
          assetTaskGroupId: input["asset-task-group-id"],
          curdate,
        },
        transaction,
      })

      if (tasks.length > 0) {
        // Update the tasks
        const updateTaskQuery = `UPDATE t_task
        SET TASK_STATUS_ID = '6', UPDATE_TIMESTAMP = :curdate
        WHERE TASK_ID IN (:taskIds);`
        await sequelize.query(updateTaskQuery, {
          raw: true,
          type: QueryTypes.UPDATE,
          replacements: {
            taskIds: tasks.map((task) => task.TASK_ID),
            curdate,
          },
          transaction,
        })

        // Add the task audit records
        const insertTaskAuditQuery = `INSERT INTO t_task_audit (
          TASK_ID,
          PRE_TASK_STATUS_ID,
          POST_TASK_STATUS_ID,
          TEAM_ID,
          OPERATE_USER_ID,
          OPERATE_TIMESTAMP
        ) VALUES ?;`
        await sequelize.query(insertTaskAuditQuery, {
          raw: true,
          type: QueryTypes.INSERT,
          transaction,
          replacements: [
            tasks.map((task) => [task.TASK_ID, 5, 6, operator.TEAM_ID, input["operate-user-id"], curdate]),
          ],
        })
      }

      /* select task for status 3 */
      const selectTaskQuery2 = `SELECT TASK_ID, TASK_NAME
      FROM t_task 
      WHERE
        PLANT_ID = :powerPlantId AND
        ASSET_TASK_GROUP_ID = :assetTaskGroupId AND
        TASK_STATUS_ID = '3' AND
        TAKEOVER_TEAM_ID IS NOT NULL;`

      const tasksToDeassign = await sequelize.query<{
        TASK_ID: number
        TASK_NAME: string
      }>(selectTaskQuery2, {
        replacements: {
          powerPlantId: input["power-plant-id"],
          assetTaskGroupId: input["asset-task-group-id"],
        },
        raw: true,
        transaction,
        type: QueryTypes.SELECT,
      })

      if (tasksToDeassign.length > 0) {
        const taskIds = tasksToDeassign.map((t) => t.TASK_ID)
        /* select task assignee for task id */
        const selectAssigneesQuery = `SELECT TASK_ID, USER_ID FROM t_task_assignee WHERE TASK_ID IN (?);`
        const assignees = await sequelize.query<{
          TASK_ID: number
          USER_ID: string
        }>(selectAssigneesQuery, {
          replacements: [taskIds],
          raw: true,
          type: QueryTypes.SELECT,
          transaction,
        })
        const assigneeMap = new Map<number, Set<string>>()
        assignees.forEach((assignee) => {
          if (!assigneeMap.has(assignee.TASK_ID)) {
            assigneeMap.set(assignee.TASK_ID, new Set<string>())
          }
          const assigneeSet = assigneeMap.get(assignee.TASK_ID) as Set<string>
          assigneeSet.add(assignee.USER_ID)
        })

        // Delete assignees for tasks where status is '3'.
        // Note that this part is simplified, relative to what's described in the process document
        // because we can't do push notification yet anyway.
        const deleteAssigneesQuery = `DELETE FROM t_task_assignee WHERE TASK_ID IN (?);`
        await sequelize.query(deleteAssigneesQuery, {
          raw: true,
          type: QueryTypes.DELETE,
          transaction,
          replacements: [taskIds],
        })

        const taskMap = new Map<number, string>(tasksToDeassign.map((t) => [t.TASK_ID, t.TASK_NAME]))
        if (env.NTF_PUSH_NOTIFICATION_CONNECTION_STRING) {
          for (const [taskId, assigneeSet] of assigneeMap) {
            const taskName = taskMap.get(taskId) as string
            await sendDeleteTaskAssigneeNotification(
              [...assigneeSet],
              operator.USER_NAME,
              taskName,
              curdate,
              transaction,
            )
          }
        } else {
          logger.warn(
            "[updateTakeoverInfoController] You do not have environmental settings set to send push notifications",
          )
        }
      }

      return {
        code: 200,
        body: "OK",
      }
    })
    return returnValue
  } catch (err) {
    logger.error(err)
    return {
      code: 400,
      body: "Bad Request",
    }
  }
}

/* consolidate user request parameter */
export const consolidateupdateTakeoverInfoRequest = (
  req: Request,
): updateTakeoverInfoRequest | Record<string, any> => ({
  "power-plant-id": req.body["power-plant-id"],
  "asset-task-group-id": Number(req.body["asset-task-group-id"]),
  "operate-user-id": req.body["operate-user-id"],
})

export const updateTakeoverInfoController = emptyResponse(
  extractValue(consolidateupdateTakeoverInfoRequest)(updateTakeoverInfo),
)
