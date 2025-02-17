// Initially copied from ToT-BE, commit 545c1dd02ed8df920e315645df162212e80b2a03

import { env } from "../../env/index.js"
import { createRouter } from "./routes.js"
import cors from "cors"
import express from "express"
import { AzureLogger, setLogLevel } from "@azure/logger"
import { receiver } from "../../../interface/events/receive.js"
import { i18n } from "../../../config/dpm/i18n/i18n-utils.js"
import logger, { assignUuid, setMorgan } from "../../logger.js"

export const createServer = (): void => {
  const app = express()
  const port = env.APPSERVER_PORT

  /* Middlewares */
  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))
  app.use(cors())
  // Initially copied from DPM-BE, commit d0e2f45544cc9890762f93cf3e8f224f15efd619
  app.use(i18n.init)

  /* log Middleware */
  app.use(assignUuid)
  app.use(setMorgan)

  // this code is initial event receive
  if (env.RECEIVE_EVENTS) {
    // Azure SDKで、エラー相当のログがワーニングレベルで発行されているのでWarning以上のログを出力。
    setLogLevel("warning")
    // Azure SDKで、エラー相当のログがワーニングレベルで発行されているのでWarning以上のログをエラーログとして出力。
    AzureLogger.log = (...args) => {
      logger.error(JSON.stringify(args))
    }
    void receiver()
  }

  /* Router */
  if (env.ALLOW_API_CALL) {
    app.use("/", createRouter())
    app.use("/v1", createRouter())
  }
  app.listen(port, () => {
    logger.info(`Server app listening at http://localhost:${port}`)
  })
}
