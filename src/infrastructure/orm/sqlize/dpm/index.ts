// Imported from DPM-BE, commit d0e2f45544cc9890762f93cf3e8f224f15efd619
import { env } from "../../../env/dpm/index.js"
import { Sequelize } from "sequelize"
import logger from "../../../logger.js"
import { CONST_VARIABLE } from "../../../../config/dpm/constant.js"

// As per https://github.com/sequelize/sequelize/issues/11992
// This can will sequelize to re-connect on any of these errors.
const retry = {
  max: CONST_VARIABLE.MAXIMUM_RETRY_DB_CONNECTION,
  report: (_: string | Record<string, unknown>, retryConfig: Record<string, unknown>) => {
    if (Number(retryConfig.$current) > 1) {
      logger.error(`Running in retry - ${retryConfig.$current} out of ${retryConfig.max} attempts`)
    }
  },
  match: [
    /ConnectionError/,
    /SequelizeConnectionError/,
    /SequelizeConnectionRefusedError/,
    /SequelizeHostNotFoundError/,
    /SequelizeHostNotReachableError/,
    /SequelizeInvalidConnectionError/,
    /SequelizeConnectionTimedOutError/,
    /SequelizeConnectionAcquireTimeoutError/,
    /Connection terminated unexpectedly/,
  ],
}

const dialectOptions = {
  charset: "utf8mb4",
  ssl: env.SSL_CERT === undefined ? { rejectUnauthorized: false } : { cert: env.SSL_CERT },
  supportBigNumbers: true,
  bigNumberStrings: true,
}

export const createConnection = (): Sequelize =>
  new Sequelize(env.DB_NAME || "db_dpm", env.DB_USER || "root", env.DB_PWD || "password", {
    host: env.DB_HOST,
    port: env.DB_PORT,
    dialect: "mysql",
    retry,
    logging: (msg) => {
      if (msg.includes("ERROR")) {
        return logger.error(msg)
      }
      return logger.info(msg)
    },
    dialectOptions,
  })
/**
 * function to createDCDDBConnection
 * @returns Connection
 */
export const createDCDDBConnection = (): Sequelize =>
  new Sequelize(env.CMN_DB_NAME || "db_dcd", env.CMN_DB_USER || "root", env.CMN_DB_PWD || "password", {
    host: env.CMN_DB_HOST,
    port: env.CMN_DB_PORT,
    dialect: "mysql",
    retry,
    logging: (msg) => {
      if (msg.includes("ERROR")) {
        return logger.error(msg)
      }
      return logger.info(msg)
    },
    dialectOptions,
  })
