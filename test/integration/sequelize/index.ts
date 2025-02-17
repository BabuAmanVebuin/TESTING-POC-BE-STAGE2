import fs from "fs"
import path from "path"
import { BindOrReplacements, QueryTypes, Transaction } from "sequelize"
import logger from "../../../src/infrastructure/logger.js"
import {
  cmnSequelize,
  sequelize,
  transactionStorage,
  transactionStorageCmn,
} from "../../../src/infrastructure/orm/sqlize/index.js"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/**
 * This function asynchronously reads a SQL file.
 */
export const readSqlFile = async (prefix: string, fileName: string) =>
  fs.promises.readFile(path.join(__dirname, prefix, fileName), {
    encoding: "utf8",
    flag: "r",
  })

/**
 * Inserts fixtures into the database using the specified query file and transaction.
 *
 * @param {string} queryFile - The name of the query file containing the insert statements.
 * @param {Transaction} transaction - The database transaction to execute the inserts within.
 */
export const insertFixture = async (queryFile: string, transaction: Transaction) => {
  // Read the contents of the query file
  const insertQuery = await readSqlFile("inserts", queryFile)

  // Split the queries using a break delimiter
  const splitQueries = insertQuery.split("-- $break$")

  // Execute each query within the transaction
  for (const query of splitQueries) {
    await sequelize.query(query, {
      raw: true,
      type: QueryTypes.INSERT,
      transaction,
    })
  }
}

/**
 * For Common DB : DCD
 *
 * Inserts fixtures into the database using the specified query file and transaction.
 *
 * @param {string} queryFile - The name of the query file containing the insert statements.
 * @param {Transaction} transaction - The database transaction to execute the inserts within.
 */
export const insertFixtureCmn = async (queryFile: string, transaction: Transaction) => {
  // Read the contents of the query file
  const insertQuery = await readSqlFile("inserts", queryFile)

  // Split the queries using a break delimiter
  const splitQueries = insertQuery.split("-- $break$")

  // Execute each query within the transaction
  for (const query of splitQueries) {
    await cmnSequelize.query(query, {
      raw: true,
      type: QueryTypes.INSERT,
      transaction,
    })
  }
}

/**
 * Removes fixtures from the database using the specified query file and transaction.
 *
 * @param {string} queryFile - The name of the query file containing the delete statements.
 * @param {Transaction} transaction - The database transaction to execute the deletes within.
 * @returns {Promise<any>} - A promise that resolves to the result of the delete operation.
 */
export const removeFixture = async (queryFile: string, transaction: Transaction) => {
  // Read the contents of the query file
  const removeQuery = await readSqlFile("cleanups", queryFile)

  // Execute the remove query within the transaction
  return sequelize.query(removeQuery, {
    raw: true,
    type: QueryTypes.DELETE,
    transaction,
  })
}

/**
 * For Common DB : DCD
 *
 * Removes fixtures from the database using the specified query file and transaction.
 *
 * @param {string} queryFile - The name of the query file containing the delete statements.
 * @param {Transaction} transaction - The database transaction to execute the deletes within.
 * @returns {Promise<any>} - A promise that resolves to the result of the delete operation.
 */
export const removeFixtureCmn = async (queryFile: string, transaction: Transaction) => {
  // Read the contents of the query file
  const removeQuery = await readSqlFile("cleanups", queryFile)

  // Execute the remove query within the transaction
  return cmnSequelize.query(removeQuery, {
    raw: true,
    type: QueryTypes.DELETE,
    transaction,
  })
}

/**
 * Executes a select query against the database using the specified query file, transaction, and replacements.
 *
 * @param {string} queryFile - The name of the query file containing the select statement.
 * @param {Transaction} transaction - The database transaction to execute the select query within.
 * @param {BindOrReplacements} replacements - Bind parameters or replacements for the select query.
 * @returns {Promise<any>} - A promise that resolves to the result of the select query.
 */
export const selectFixture = async (queryFile: string, transaction: Transaction, replacements: BindOrReplacements) => {
  // Read the contents of the query file
  const selectQuery = await readSqlFile("selects", queryFile)

  // Execute the select query within the transaction
  return sequelize.query(selectQuery, {
    raw: true,
    type: QueryTypes.SELECT,
    transaction,
    replacements,
  })
}

/**
 * For Common DB : DCD
 *
 * Executes a select query against the database using the specified query file, transaction, and replacements.
 *
 * @param {string} queryFile - The name of the query file containing the select statement.
 * @param {Transaction} transaction - The database transaction to execute the select query within.
 * @param {BindOrReplacements} replacements - Bind parameters or replacements for the select query.
 * @returns {Promise<any>} - A promise that resolves to the result of the select query.
 */
export const selectFixtureCmn = async (
  queryFile: string,
  transaction: Transaction,
  replacements: BindOrReplacements,
) => {
  // Read the contents of the query file
  const selectQuery = await readSqlFile("selects", queryFile)

  // Execute the select query within the transaction
  return cmnSequelize.query(selectQuery, {
    raw: true,
    type: QueryTypes.SELECT,
    transaction,
    replacements,
  })
}

/**
 * Starts a database transaction and executes a data fixture function within the transaction.
 *
 * @param {Function} dataFixture - The data fixture function to be executed within the transaction.
 * @returns {Promise<void>} - A promise that resolves when the transaction and data fixture are completed.
 * @throws {Error} - Throws an error if not in an async local storage context or if the data fixture encounters an error.
 */
export const startTransaction = async (dataFixture: (transaction: Transaction) => Promise<void>) => {
  // Retrieve the transaction store from async local storage
  const transactionStore = transactionStorage.getStore()
  if (transactionStore === undefined) {
    // Throw an error if not in an async local storage context
    throw new Error("not in async local storage context")
  } else {
    // Start a new database transaction
    const transaction = await sequelize.transaction()
    try {
      // Assign the transaction to the transaction store
      transactionStore.transaction = transaction

      // Execute the data fixture function within the transaction
      await dataFixture(transaction)
    } catch (reason) {
      // Handle any errors that occur during the data fixture execution
      if (reason instanceof Error && reason.stack !== undefined) {
        logger.debug(reason.stack)
      }
      logger.debug(reason)

      // Rollback the transaction and re-throw the error
      await transaction.rollback()
      throw reason
    }
  }
}

/**
 * For Common DB : DCD
 *
 * Starts a database transaction and executes a data fixture function within the transaction.
 *
 * @param {Function} dataFixture - The data fixture function to be executed within the transaction.
 * @returns {Promise<void>} - A promise that resolves when the transaction and data fixture are completed.
 * @throws {Error} - Throws an error if not in an async local storage context or if the data fixture encounters an error.
 */
export const startTransactionCmn = async (dataFixture: (transaction: Transaction) => Promise<void>) => {
  // Retrieve the transaction store from async local storage
  const transactionStore = transactionStorageCmn.getStore()
  if (transactionStore === undefined) {
    // Throw an error if not in an async local storage context
    throw new Error("not in async local storage context")
  } else {
    // Start a new database transaction
    const transaction = await cmnSequelize.transaction()
    try {
      // Assign the transaction to the transaction store
      transactionStore.transaction = transaction

      // Execute the data fixture function within the transaction
      await dataFixture(transaction)
    } catch (reason) {
      // Handle any errors that occur during the data fixture execution
      if (reason instanceof Error && reason.stack !== undefined) {
        logger.debug(reason.stack)
      }
      logger.debug(reason)

      // Rollback the transaction and re-throw the error
      await transaction.rollback()
      throw reason
    }
  }
}

/**
 * Closes the current database transaction by rolling it back.
 *
 * @returns {Promise<void>} - A promise that resolves when the transaction is closed.
 * @throws {Error} - Throws an error if not in an async local storage context or if there is no active transaction to close.
 */
export const closeTransaction = async () => {
  // Retrieve the transaction store from async local storage
  const transactionStore = transactionStorage.getStore()
  if (transactionStore !== undefined && transactionStore.transaction !== null) {
    // Rollback the current transaction and reset the transaction reference in the transaction store
    await transactionStore.transaction.rollback()
    transactionStore.transaction = null
  } else {
    // Throw an error if not in an async local storage context or if there is no active transaction
    throw new Error("not in async local storage context")
  }
}

/**
 * For Common DB : DCD
 *
 * Closes the current database transaction by rolling it back.
 *
 * @returns {Promise<void>} - A promise that resolves when the transaction is closed.
 * @throws {Error} - Throws an error if not in an async local storage context or if there is no active transaction to close.
 */
export const closeTransactionCmn = async () => {
  // Retrieve the transaction store from async local storage
  const transactionStore = transactionStorageCmn.getStore()
  if (transactionStore !== undefined && transactionStore.transaction !== null) {
    // Rollback the current transaction and reset the transaction reference in the transaction store
    await transactionStore.transaction.rollback()
    transactionStore.transaction = null
  } else {
    // Throw an error if not in an async local storage context or if there is no active transaction
    throw new Error("not in async local storage context")
  }
}
