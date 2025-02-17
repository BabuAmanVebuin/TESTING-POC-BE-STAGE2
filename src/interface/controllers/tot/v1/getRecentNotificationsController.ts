// Initially copied from ToT-BE, commit 545c1dd02ed8df920e315645df162212e80b2a03

import { Request } from "express"
import { QueryTypes } from "sequelize"

import {
  getRecentNotificationsRequest,
  getRecentNotificationsAPIResponse,
  getRecentNotificationsResponse,
} from "../../../../domain/entities/tot/v1/getRecentNotifications.js"
import { sequelize } from "../../../../infrastructure/orm/sqlize/index.js"
import { extractValue, jsonResponse } from "../../../decorators.js"
import { Constants } from "../../../../config/constants.js"
import { NOTIFICATION_TYPE } from "../../../controllers/tot/v1/utils.js"

/*import { handleDbError, EnumFromString, BoolFromString, DateTimeFromString, DateFromString } from "./utils";*/
/* get recent notification by user */
export const getRecentNotifications = async (
  postValidationInput: getRecentNotificationsRequest | Record<string, any>,
): Promise<getRecentNotificationsAPIResponse> => {
  const input = postValidationInput as getRecentNotificationsRequest
  let typeFilter = ""
  if (input[Constants.FIELDS.TYPE] != undefined) {
    if (input[Constants.FIELDS.TYPE] == NOTIFICATION_TYPE.NEW_ASSIGNMENT) {
      typeFilter = `AND TYPE IN (:type)`
    } else if (input[Constants.FIELDS.TYPE] == NOTIFICATION_TYPE.BEFORE_START) {
      typeFilter = `AND TYPE IN (:type)`
    }
  }
  /* get recent notification query by user id  */
  const recentNotificationQuery = `SELECT
      N1.NOTIFICATION_ID 'notification-id',
      N1.TARGET_USER_ID 'target-user-id',
      N1.MESSAGE 'message',
      N1.TASK_ID 'task-id',
      T1.TASK_NAME 'task-name',
      T1.PLANNED_DATE_TIME 'planned-date-time',
      N1.TYPE 'type',
      N1.CREATE_TIMESTAMP 'create-timestamp'
    FROM t_notification N1
    LEFT OUTER JOIN t_task T1 ON T1.TASK_ID = N1.TASK_ID
    WHERE
      N1.TARGET_USER_ID = :userId AND
      N1.CREATE_TIMESTAMP >= (NOW() - INTERVAL :searchHours HOUR)
      ${typeFilter}
    LIMIT :searchUpperLimit;
    `

  const notifications = await sequelize.query<getRecentNotificationsResponse>(recentNotificationQuery, {
    raw: true,
    type: QueryTypes.SELECT,
    replacements: {
      userId: input["user-id"],
      searchHours: input["search-hours"],
      searchUpperLimit: input["search-upper-limit"],
      type: input[Constants.FIELDS.TYPE],
    },
  })

  return {
    code: 200,
    body: notifications,
  }
}
/* consolidate user request parameter */
export const consolidategetRecentNotificationsRequest = (
  req: Request,
): getRecentNotificationsRequest | Record<string, any> => ({
  "user-id": req.query["user-id"],
  "search-hours": Number(req.query["search-hours"]),
  "search-upper-limit": Number(req.query["search-upper-limit"]),
  type: req.query[Constants.FIELDS.TYPE],
})

export const getRecentNotificationsController = jsonResponse(
  extractValue(consolidategetRecentNotificationsRequest)(getRecentNotifications),
)
