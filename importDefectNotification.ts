// Initially copied from DPM-BE, commit d0e2f45544cc9890762f93cf3e8f224f15efd619
import fs from "fs/promises"
import path from "path"
import logger from "./src/infrastructure/logger.js"
import { QueryTypes } from "sequelize"
// self invoke function
import { NotificationType } from "./src/config/dpm/enums.js"
import { formateUnitCode } from "./src/interface/services/dpm/helper.js"
import { createConnection } from "./src/infrastructure/orm/sqlize/dpm/index.js"
void (async () => {
  type Notification = {
    "notification-no": string
    "notification-type": NotificationType
    "notification-date": string
    "notification-time": string
    "system-status": string
    "short-text": string
    "plan-plant": string
    "plan-group": string
    "functional-location": string
    "required-start-date": string
    "required-start-time": string
    "required-end-date": string
    "required-end-time": string
    "functional-location-description": string
    "failure-start-date": string
    "failure-start-time": string
    "failure-end-date": string
    "failure-end-time": string
    downtime: string
    "downtime-unit": string
    "order-no": string
    "user-status": string
    "priority-text": string | null
  }
  const dir = "initial_data/defect"
  const dpmDb = await createConnection()
  for await (const file of await fs.readdir(dir)) {
    try {
      logger.debug(`start importing file: ${file}`)
      const filePath = path.join(dir, file)
      const stat = await fs.stat(filePath)
      if (stat.isDirectory()) {
        continue
      }

      const jsonText = await fs.readFile(filePath, {
        encoding: "utf8",
        flag: "r",
      })

      const notificationJson = JSON.parse(jsonText) as {
        data: Notification[]
      }
      logger.debug(`Importing file records length: ${notificationJson.data.length}`)

      const records = notificationJson.data.map((notification) => ({
        notificationNo: notification["notification-no"],
        notificationType: notification["notification-type"],
        notificationDate: notification["notification-date"],
        notificationTime: notification["notification-time"],
        shortText: notification["short-text"],
        plantCode: notification["plan-plant"] && formateUnitCode(notification["plan-plant"]),
        assetCode: notification["functional-location"] || null,
        assetName: notification["functional-location-description"] || null,
        planGroup: notification["plan-group"] || null,
        planGroupText: null,
        userStatus: notification["user-status"],
        userStatusName: "",
        priority: notification["priority-text"] || null,
      }))

      for (const record of records) {
        try {
          logger.debug(JSON.stringify(record))
          if (record.notificationType == NotificationType.ZH) {
            const result = await dpmDb.query(
              `UPDATE t_defect_notification SET NOTIFICATION_TIME = :notificationTime, PRIORITY= :priority ,ASSET_CODE= :assetCode,ASSET_NAME= :assetName WHERE NOTIFICATION_NO = :notificationNo`,
              {
                replacements: {
                  notificationTime: record.notificationTime,
                  priority: record.priority,
                  assetCode: record.assetCode,
                  assetName: record.assetName,
                  notificationNo: record.notificationNo,
                },
                type: QueryTypes.UPDATE,
              },
            )
            logger.debug(`Updated notification_no: ${record.notificationNo}, result : ${JSON.stringify(result)}`)
          }
        } catch (error) {
          logger.error(error)
        }
      }
      logger.debug(`Complete importing file: ${file}`)
    } catch (error) {
      logger.error(error)
    }
  }
})()
