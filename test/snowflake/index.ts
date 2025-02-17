import fs from "fs"
import path from "path"

import snowflake, { Binds, Connection } from "snowflake-sdk"

import logger from "../../src/infrastructure/logger.js"
import {
  snowflakeConfig,
  snowflakeInsertWrapper,
  snowflakeSelectWrapper,
  SnowflakeTransaction,
  transactionStorage,
} from "../../src/infrastructure/orm/snowflake/index.js"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const readSqlFile = async (prefix: string, fileName: string) =>
  fs.promises.readFile(path.join(__dirname, prefix, fileName), {
    encoding: "utf8",
    flag: "r",
  })

export const insertFixture = async (
  queryFile: string,
  transaction: SnowflakeTransaction,
  binds?: Binds,
): Promise<void> => {
  const insertQuery = await readSqlFile("inserts", queryFile)
  const splitQueries = insertQuery.split("-- $break$")
  for (const sqlText of splitQueries) {
    await snowflakeInsertWrapper(transaction, { sqlText, binds })
  }
}

export const selectFixture = async <X>(
  queryFile: string,
  transaction: SnowflakeTransaction,
  binds?: Binds,
): Promise<X[]> => {
  const sqlText = await readSqlFile("selects", queryFile)
  return snowflakeSelectWrapper<X>(transaction, { sqlText, binds })
}

export const startSnowflakeTransaction = async (
  dataFixture: (transaction: SnowflakeTransaction) => Promise<void>,
  preTransaction?: (conn: Connection) => Promise<void>,
): Promise<void> => {
  const transactionStore = transactionStorage.getStore()
  if (transactionStore === undefined) {
    throw new Error("not in async local storage context")
  } else {
    const transactionRollback = async (transaction: SnowflakeTransaction, reason: any) => {
      await transaction.rollback()
      throw reason
    }

    const conn = snowflake.createConnection(snowflakeConfig)
    await new Promise((resolve) =>
      conn.connect((err, conn) => {
        if (err) {
          logger.error(`Unable to connect: ${err.message}`)
        } else {
          logger.debug("Successfully connected to Snowflake.")
          resolve(conn)
        }
      }),
    )

    if (preTransaction !== undefined) {
      await preTransaction(conn)
    }

    try {
      const transaction = new SnowflakeTransaction(conn)
      await transaction.begin()
      const sessionIdStmt = await conn.execute({
        sqlText: 'SELECT CURRENT_SESSION() as "session-id";',
      })
      for await (const row of sessionIdStmt.streamRows()) {
        logger.debug(`Snowflake session ID: ${row["session-id"]}`)
      }
      const transactionIdStmt = await conn.execute({
        sqlText: 'SELECT CURRENT_TRANSACTION() AS "transaction-id";',
      })
      for await (const row of transactionIdStmt.streamRows()) {
        logger.debug(`Snowflake transaction ID: ${row["transaction-id"]}`)
      }
      await dataFixture(transaction)
      transactionStore.transaction = transaction
    } catch (reason) {
      if (reason instanceof Error && reason.stack !== undefined) {
        logger.debug(reason.stack)
      }
      logger.debug(reason)
      const transaction = transactionStore.transaction
      if (transaction === null) {
        throw reason
      } else {
        await transactionRollback(transaction, reason)
      }
    }
  }
}

export const rollbackSnowflakeTransaction = async (): Promise<void> => {
  const transactionStore = transactionStorage.getStore()
  if (transactionStore !== undefined && transactionStore.transaction !== null) {
    await transactionStore.transaction.rollback()
    transactionStore.transaction.connection.destroy((err, _conn) => {
      if (err !== undefined && err !== null) {
        logger.debug(err)
      }
    })
    transactionStore.transaction = null
  } else {
    throw new Error("not in async local storage context")
  }
}
