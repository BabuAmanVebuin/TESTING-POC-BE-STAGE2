// Initially copied from ToT-BE, commit 545c1dd02ed8df920e315645df162212e80b2a03
import * as Process from "process"

import { Config } from "./types.js"
import { Dialect } from "sequelize"

const TOT_BE_NTF_CS =
  Process.env.NTF_PUSH_NOTIFICATION_CONNECTION_STRING ||
  "Endpoint=sb://ntf-tot-be-dev.servicebus.windows.net/;;SharedAccessKey="
const [_endPoint, sasKeyName, sasKey] = TOT_BE_NTF_CS.split(";")
const endPoint = _endPoint.endsWith("/") ? _endPoint : `${_endPoint}/`

const databaseName = Process.env.RUNNING_UNIT_TESTS ? Process.env.TEST_DB_NAME : Process.env.DB_NAME

const config: Config = {
  port: Process.env.PORT || "8000",
  env: Process.env.NODE_ENV || "development",

  logs: {
    level: Process.env.NODE_ENV === "production" ? "info" : "debug",
  },

  api: {
    prefix: `/api/${Process.env.API_VERSION ? Process.env.API_VERSION : "v1"}`,
    version: Process.env.API_VERSION || "v1",
  },

  swaggerDir: Process.env.API_DOCS_DIR || "_api-docs",
  swaggerFile: Process.env.API_DOCS_FILENAME || "JERA_OpeApp_API Definition.yaml",

  database: {
    name: databaseName || "sqldb-db",
    host: Process.env.DB_HOST || "localhost",
    user: Process.env.DB_USER || "root",
    pwd: Process.env.DB_PASS || "root",
    dialect: Process.env.DB_DIALECT as Dialect,
    sslRequired: Process.env.DB_SSL_REQUIRED === "true",
  },

  azureNotification: {
    uri: endPoint.replace(/^Endpoint=/, ""),
    saName: sasKeyName.replace(/^SharedAccessKeyName=/, ""),
    saKey: sasKey.replace(/^SharedAccessKey=/, ""),
  },
}

export default config
