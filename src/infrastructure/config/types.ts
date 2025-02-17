// Initially copied from ToT-BE, commit 545c1dd02ed8df920e315645df162212e80b2a03

import { Dialect } from "sequelize"

export interface Config {
  port: string
  env: string
  logs: { level: string }
  api: { prefix: string; version: string }
  swaggerDir: string
  swaggerFile: string
  database: DatabaseInfo
  azureNotification: {
    uri: string
    saName: string
    saKey: string
  }
}

export interface DatabaseInfo {
  name: string
  host: string
  user: string
  pwd: string
  dialect: Dialect
  sslRequired: boolean
}
