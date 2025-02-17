// Initially copied from ToT-BE, commit 545c1dd02ed8df920e315645df162212e80b2a03
import { QueryTypes, Transaction } from "sequelize"
import { sequelize } from "../../../../infrastructure/orm/sqlize/index.js"
import { jsonResponse } from "../../../decorators.js"
import logger from "../../../../infrastructure/logger.js"
import { Constants } from "../../../../config/constants.js"
import { AssigneeData } from "../../../../domain/entities/tot/v1/getTaskById.js"
import { handleDbError, NOTIFICATION_TYPE, sendTaskReminderNotification, TASK_STATUS } from "./utils.js"
import { Duration } from "../../../../infrastructure/config/enum.js"
import { env } from "process"
import { notificationAPIResponse } from "../../../../domain/entities/tot/v1/notification.js"

/** get assignee function */
const getAssignees = async (taskId: string): Promise<AssigneeData[]> => {
  const assigneeQuery = `SELECT
        T1.USER_ID 'user-id',
        T1.TASK_ID 'task-id',
        T2.USER_NAME 'user-name'
      FROM
        t_task_assignee T1
        JOIN m_user_tot T2 ON T1.USER_ID = T2.USER_ID
      WHERE T1.TASK_ID = :taskId
      ORDER BY T2.USER_NAME ASC;`

  return sequelize.query<AssigneeData>(assigneeQuery, {
    raw: true,
    type: QueryTypes.SELECT,
    replacements: { taskId },
  })
}

/** Send Notification before 10min */
const NotificationReminder = async (taskData: any, transaction: Transaction) => {
  const currentTimestamp = new Date()
  let statusCode: any = Constants.ERROR_CODES.BAD_REQUEST
  for (const task of taskData) {
    if (env.NTF_PUSH_NOTIFICATION_CONNECTION_STRING) {
      const plannedDatetimeArray = task[Constants.FIELDS.PLANNED_DATE_TIME]
        ? task[Constants.FIELDS.PLANNED_DATE_TIME].split("T")
        : ""
      const plannedDate = plannedDatetimeArray ? plannedDatetimeArray[0].substring(0, 10) : ""
      const plannedTime = plannedDatetimeArray ? plannedDatetimeArray[1].substring(0, 8) : ""
      //Get userId for fetching assignee
      const user_assigneesArray: AssigneeData[] = await getAssignees(task[Constants.FIELDS.TASK_ID])
      const user_assignees = user_assigneesArray

      const concatePlannedDateTime = `${plannedDate} ${plannedTime}`
      //Send task reminder before 10 min
      await sendTaskReminderNotification(
        user_assignees.map((assignee: any) => assignee[Constants.FIELDS.USER_ID]),
        task[Constants.FIELDS.REMARKS],
        task[Constants.FIELDS.TASK_NAME],
        concatePlannedDateTime,
        currentTimestamp,
        transaction,
        NOTIFICATION_TYPE.BEFORE_START,
        task[Constants.FIELDS.TASK_ID],
      )
      statusCode = Constants.STATUS_CODES.SUCCESS_CODE
    } else {
      logger.warn("[sendTaskReminder] You do not have environmental settings set to send push notifications")
      statusCode = Constants.ERROR_CODES.BAD_REQUEST
    }
  }
  return statusCode
}

/* notification function */
export const Notification = async (): Promise<any> => {
  const date = new Date()
  const options: any = { timeZone: "Asia/Tokyo" }

  const curdate: any = date.toLocaleDateString("ja-JP", options).split("/")
  const curtime = date.toLocaleTimeString("ja-JP", options).split(" ")

  const year = `${curdate[0]}`
  const month = `${curdate[1] < 10 ? 0 + curdate[1] : curdate[1]}`
  const day = `${curdate[2] < 10 ? 0 + curdate[2] : curdate[2]}`

  const nowTime: any = curtime[0]

  const nowDate = `${year}-${month}-${day}`
  try {
    const result = await sequelize.transaction<unknown>(async (transaction: Transaction) => {
      /**Get task which is on waiting status and
       * task gap 10 min after substract current date time
       *  to planned date time
       */
      const getTaskQuery = `select
           t.TASK_ID  'task-id',
           t.TASK_NAME 'task-name',
           t.TASK_ID 'task-id',
           t.PLANNED_DATE_TIME 'planned-date-time',
           t.REMARKS 'remarks'
           from t_task t
           where t.TASK_STATUS_ID = ${TASK_STATUS.WAITING}
           AND TIMEDIFF(t.PLANNED_DATE_TIME, '${nowDate} ${nowTime}') >= '${Duration.TIME_START}'
           AND TIMEDIFF(t.PLANNED_DATE_TIME, '${nowDate} ${nowTime}') <= '${Duration.TIME_END}' `

      /**
            *  t.TASK_ID NOT IN (
           select DISTINCT(ta1.TASK_ID)
           from t_task_audit ta1
           where ta1.POST_TASK_STATUS_ID > ${TASK_STATUS.WAITING})
           AND 
            * 
            */
      const tasks = await sequelize.query<any>(getTaskQuery, {
        raw: true,
        type: QueryTypes.SELECT,
        replacements: {},
        transaction,
      })
      logger.info(tasks.length > 0 ? JSON.stringify(tasks, null, 4) : "task not found")
      const taskArray = JSON.parse(JSON.stringify(tasks, null, 4))
      const taskData: any = taskArray.length > 0 ? taskArray : []

      /** Getting task then send notification before 10min
       *
       */
      await NotificationReminder(taskData, transaction)
      // If no task found for sending push notification then also send status code 200
      return responseStatus(Constants.STATUS_CODES.SUCCESS_CODE)
    })
    return result
  } catch (error: any) {
    logger.error(error)
    handleDbError("notification", error)
    return responseStatus(Constants.ERROR_CODES.BAD_REQUEST)
  }
}

//response status for the sendnotificationAPIResponse
const responseStatus = (val: number): notificationAPIResponse => {
  switch (val) {
    case Constants.STATUS_CODES.SUCCESS_CODE:
      return {
        code: Constants.STATUS_CODES.SUCCESS_CODE,
        body: Constants.SUCCESS_MESSAGES.SUCCESS,
      }

    case Constants.ERROR_CODES.BAD_REQUEST:
      return {
        code: Constants.ERROR_CODES.BAD_REQUEST,
        body: Constants.ERROR_MESSAGES.BAD_REQUEST,
      }
    case Constants.ERROR_CODES.NOT_FOUND_CODE:
      return {
        code: Constants.ERROR_CODES.NOT_FOUND_CODE,
        body: Constants.ERROR_MESSAGES.DATA_NOT_FOUND,
      }
    default:
      return {
        code: Constants.ERROR_CODES.BAD_REQUEST,
        body: Constants.ERROR_MESSAGES.BAD_REQUEST,
      }
  }
}
export const notificationsController = jsonResponse(Notification)
