// Initially copied from DPM-BE, commit d0e2f45544cc9890762f93cf3e8f224f15efd619
import fs from "fs/promises"
import _ from "lodash"
import path from "path"
import logger from "./src/infrastructure/logger.js"
import { formateUnitCode } from "./src/interface/services/dpm/helper.js"
import { createConnection } from "./src/infrastructure/orm/sqlize/dpm/index.js"
import { receiveMaintenancePlanController } from "./src/interface/controllers/dpm/receiveMaintenancePlanController.js"

// self invoke function
void (async () => {
  const dir = "initial_data/maintenance_plan"
  const chunkLimit = 10000

  const connection = await createConnection()
  for await (const file of await fs.readdir(dir)) {
    try {
      logger.debug(`start importing file: ${file}`)
      const filePath = path.join(dir, file)
      const stat = await fs.stat(filePath)
      if (stat.isDirectory()) {
        logger.warn(`Not found file -: ${filePath}`)
        continue
      }
      logger.debug(`reading file`)
      const jsonText = await fs.readFile(filePath, {
        encoding: "utf8",
        flag: "r",
      })
      const initialData = JSON.parse(jsonText) as {
        data: any[]
      }
      logger.debug(`reading file complete`)
      logger.debug(`file's records length: ${initialData.data.length}`)

      if (initialData?.data && initialData?.data.length > 0) {
        for (const checkRecord of _.chunk(
          initialData.data.map((item: any) => {
            return {
              maintenancePlanId: item["maintenance-plan-id"],
              maintenancePlanName: item["maintenance-plan-title"],
              assetCode: item["asset-code"],
              plantCode: item["plan-plant"] && formateUnitCode(item["plan-plant"]),
              intervals: item["intervals"] || [],
              isDeleted: item["is-deleted"] || null,
            }
          }),
          chunkLimit,
        )) {
          await receiveMaintenancePlanController(checkRecord, {
            dpmDb: connection,
          })
        }
      }
      logger.debug(`Complete importing file: ${file}`)
    } catch (error) {
      logger.error(error)
    }
  }

  await connection.close()
})()
