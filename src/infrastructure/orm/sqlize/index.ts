// Initially copied from ToT-BE, commit 545c1dd02ed8df920e315645df162212e80b2a03
import { Sequelize, Transaction } from "sequelize"

import Logger from "../../logger.js"
import { env } from "../../env/index.js"
import { AsyncLocalStorage } from "async_hooks"

import fs from "fs"
import path from "path"
// As per https://github.com/sequelize/sequelize/issues/11992
// This can will sequelize to re-connect on any of these errors.
const retry = {
  max: Infinity,
  report: (msg: string | Record<string, unknown>) => {
    Logger.silly("Attempting DB Connection.")
    Logger.debug(msg)
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
  multipleStatements: true,
  // ssl:
  //   env.SSL_CERT === undefined
  //     ? { rejectUnauthorized: false }
  //     : { cert: env.SSL_CERT },
} as Record<string, unknown>

dialectOptions.ssl = env.DB_SSL_REQUIRED
  ? {
      cert: fs.readFileSync(path.resolve("./certs/DigiCertGlobalRootCA.crt.pem")),
    }
  : {
      rejectUnauthorized: false,
    }

//Configuration of PTM Database
export const sequelize: Sequelize = new Sequelize(env.DB_NAME, env.DB_USER, env.DB_PWD, {
  host: env.DB_HOST,
  port: env.DB_PORT,
  dialect: "mysql",
  retry,
  logging: (msg) => {
    if (msg.includes("ERROR")) {
      return Logger.error(msg)
    }
    return Logger.info(msg)
  },
  dialectOptions,
  // This is used by Sequelize to setup the DB Connection / handle things like setting timezone for NOW() et al.
})

//Configuration of DCD database
export const cmnSequelize: Sequelize = new Sequelize(env.CMN_DB_NAME, env.CMN_DB_USER, env.CMN_DB_PWD, {
  host: env.CMN_DB_HOST,
  port: env.CMN_DB_PORT,
  dialect: "mysql",
  retry,
  logging: (msg) => {
    if (msg.includes("ERROR")) {
      return Logger.error(msg)
    }
    return Logger.info(msg)
  },
  dialectOptions,
  // This is used by Sequelize to setup the DB Connection / handle things like setting timezone for NOW() et al.
})

void Promise.all([sequelize.authenticate(), cmnSequelize.authenticate()])

/**
 * Represents an instance of asynchronous local storage for storing transaction data.
 */
export const transactionStorage = new AsyncLocalStorage<{
  transaction: Transaction | null
}>()

/**
 * For Common DB : DCD
 *
 * Represents an instance of asynchronous local storage for storing transaction data.
 */
export const transactionStorageCmn = new AsyncLocalStorage<{
  transaction: Transaction | null
}>()

/**
 * Retrieves the current transaction from the asynchronous local storage.
 * Throws an error if the transaction is not found or if the storage context is not available.
 */
export const getTransaction = (): Transaction => {
  // Retrieve the transaction from the async local storage
  const transaction = transactionStorage.getStore()?.transaction
  if (transaction === undefined || transaction === null) {
    throw new Error("not in async local storage context")
  }
  return transaction
}

/**
 * For Common DB : DCD
 *
 * Retrieves the current transaction from the asynchronous local storage.
 * Throws an error if the transaction is not found or if the storage context is not available.
 */
export const getTransactionCmn = (): Transaction => {
  // Retrieve the transaction from the async local storage
  const transaction = transactionStorageCmn.getStore()?.transaction
  if (transaction === undefined || transaction === null) {
    throw new Error("not in async local storage context")
  }
  return transaction
}

/**
 * This function wraps the provided function in a transaction using Sequelize.
 * If there is no transaction in the async local storage, a new transaction is started.
 * If there is a transaction in the async local storage, that transaction is continued.
 */
export const wrapInTransaction = async <X>(fn: (transaction: Transaction) => Promise<X>): Promise<X> => {
  // Retrieve the transaction store from the async local storage
  const transactionStore = transactionStorage.getStore()
  if (transactionStore === undefined || transactionStore.transaction === null) {
    // There is no transaction in async local storage, so we just start a new tranaction like we did before.
    return sequelize.transaction(fn)
  }

  // There is a transaction in async local storage, so we take that and continue with it.
  return sequelize.transaction({ transaction: transactionStore.transaction }, fn)
}

/**
 * For Common DB : DCD
 *
 * This function wraps the provided function in a transaction using Sequelize.
 * If there is no transaction in the async local storage, a new transaction is started.
 * If there is a transaction in the async local storage, that transaction is continued.
 */
export const wrapInTransactionCmn = async <X>(fn: (transaction: Transaction) => Promise<X>): Promise<X> => {
  // Retrieve the transaction store from the async local storage
  const transactionStore = transactionStorageCmn.getStore()
  if (transactionStore === undefined || transactionStore.transaction === null) {
    // There is no transaction in async local storage, so we just start a new tranaction like we did before.
    return cmnSequelize.transaction(fn)
  }

  // There is a transaction in async local storage, so we take that and continue with it.
  return cmnSequelize.transaction({ transaction: transactionStore.transaction }, fn)
}

export const ORM = {
  sequelize,
}
