import cron from "node-cron"

import { env } from "./src/infrastructure/env/dpm/index.js"
import logger, { uuidContextWrapper } from "./src/infrastructure/logger.js"
import { createServer } from "./src/infrastructure/webserver/express/index.js"
import { cleanKpi003ResponseJob } from "./src/interface/jobs/dpm/cleanKpi003ResponseCache.js"

const DEBUG = env.LOCAL

;(() => {
  createServer()
})()

if (!DEBUG && env.RUN_SCHEDULED_TASKS) {
  // Imported from DPM-BE, commit d0e2f45544cc9890762f93cf3e8f224f15efd619
  // タイムゾーンがUTCに設定されているので、日本時間の午前1時に実行されるよう、UTCの16時に設定
  cron.schedule("00 16 * * *", async () => {
    await uuidContextWrapper(async () => {
      logger.info(`[Worker Process] Clean kpi003 response caches (01:00) (Starting: ${new Date().toISOString()} )`)
      await cleanKpi003ResponseJob()
      logger.info(`[Worker Process] Clean kpi003 response caches (01:00) (Completed: ${new Date().toISOString()} )`)
    })
  })
}
