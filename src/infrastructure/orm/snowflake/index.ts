import { AsyncLocalStorage } from "async_hooks"

import snowflake, { Binds, Connection, SnowflakeError, RowStatement } from "snowflake-sdk"

import { env } from "../../env/dpm/index.js"
import logger from "../../logger.js"

/**
 * XXX: as of this writing, the @types/snowflake-sdk package says the Snowflake connector will only
 *      pass snowflake.SnowflakeError or undefined for `err`, but that's actually a lie. The Snowflake
 *      connector will pass a null when there is no error. Consequently, we need to check err against null.
 */
export const snowflakeLogger = (
  err: snowflake.SnowflakeError | null | undefined,
  stmt: snowflake.RowStatement,
): void => {
  if (err !== null && err !== undefined) {
    logger.error(`Failed to execute statement due to the following error: ${err.message}`)
  }
  logger.info(`query: ${stmt.getSqlText()}`)
}

export class SnowflakeTransaction {
  state: "STARTED" | "COMMITTED" | "ROLLED_BACK" | null
  level: number
  connection: snowflake.Connection

  constructor(connection: snowflake.Connection) {
    this.state = null
    this.level = 0
    this.connection = connection
  }

  checkState(): void {
    if (this.state === "COMMITTED") {
      throw new Error(
        "Snowflake transaction already committed. The transaction cannot continue because Snowflake does not support checkpoints/nested transactions.",
      )
    }
    if (this.state === "ROLLED_BACK") {
      throw new Error(
        "Snowflake transaction already rolled back. The transaction cannot continue because Snowflake does not support checkpoints/nested transactions.",
      )
    }
  }

  async begin(): Promise<void> {
    if (this.level === 0) {
      this.state = "STARTED"
      const statement = this.connection.execute({
        sqlText: "BEGIN;",
        complete: snowflakeLogger,
      })
      for await (const _row of statement.streamRows()) {
        /* no op */
      }
    } else {
      this.checkState()
    }
    this.level += 1
  }

  async commit(): Promise<void> {
    this.level -= 1
    this.checkState()
    if (this.level === 0) {
      const statement = this.connection.execute({
        sqlText: "COMMIT;",
        complete: snowflakeLogger,
      })
      for await (const _row of statement.streamRows()) {
        /* no op */
      }
      this.state = "COMMITTED"
    }
  }

  async rollback(): Promise<void> {
    if (this.level <= 0) {
      throw new Error("You have rolled back too many times.")
    }
    if (this.state === "COMMITTED") {
      throw new Error("In Snowflake, you cannot rollback a transaction that has already been committed.")
    }
    this.level -= 1
    if (this.state === "ROLLED_BACK") {
      return
    }
    const statement = this.connection.execute({
      sqlText: "ROLLBACK;",
      complete: snowflakeLogger,
    })
    for await (const _row of statement.streamRows()) {
      /* no op */
    }
    this.state = "ROLLED_BACK"
  }
}

export type SnowflakeExecOptions = {
  sqlText: string
  streamResult?: boolean | undefined
  binds?: Binds | undefined
  fetchAsString?: Array<"String" | "Boolean" | "Number" | "Date" | "JSON"> | undefined
  complete?: (err: SnowflakeError | undefined, stmt: RowStatement, rows: any[] | undefined) => void
}

export type SnowflakeQueryType = "select" | "insert" | "update" | "delete" | "upsert"

const snowflakeConnSelectWrapper = async <T>(conn: snowflake.Connection, options: SnowflakeExecOptions) => {
  logger.info(`binds:${options.binds}`)
  const statement = conn.execute({
    ...options,
    complete: (err, stmt, rows) => {
      snowflakeLogger(err, stmt)
      if (options.complete !== undefined) {
        options.complete(err, stmt, rows)
      }
    },
  })
  const stream = statement.streamRows()
  const ret: T[] = []
  for await (const row of stream) {
    ret.push(row)
  }
  return ret
}

export const snowflakeSelectWrapper = async <T>(
  transaction: SnowflakeTransaction,
  options: SnowflakeExecOptions,
): Promise<T[]> => {
  transaction.checkState()
  return snowflakeConnSelectWrapper<T>(transaction.connection, options)
}

export const snowflakeConnGenericWrapper = async (
  conn: snowflake.Connection,
  options: SnowflakeExecOptions,
): Promise<void> => {
  logger.info(`binds:${options.binds}`)
  const statement = conn.execute({
    ...options,
    complete: (err, stmt, rows) => {
      snowflakeLogger(err, stmt)
      if (options.complete !== undefined) {
        options.complete(err, stmt, rows)
      }
    },
  })
  const stream = statement.streamRows()
  for await (const _row of stream) {
    /* no-op */
  }
}

export const snowflakeDeleteWrapper = async (
  transaction: SnowflakeTransaction,
  options: SnowflakeExecOptions,
): Promise<void> => {
  transaction.checkState()
  await snowflakeConnGenericWrapper(transaction.connection, options)
}

export const snowflakeUpdateWrapper = async (
  transaction: SnowflakeTransaction,
  options: SnowflakeExecOptions,
): Promise<void> => {
  transaction.checkState()
  await snowflakeConnGenericWrapper(transaction.connection, options)
}

export const snowflakeInsertWrapperWithReturnedData = async <T>(
  transaction: SnowflakeTransaction,
  options: SnowflakeExecOptions,
): Promise<T[]> => {
  transaction.checkState()
  return snowflakeConnSelectWrapper<T>(transaction.connection, options)
}

export const snowflakeInsertWrapper = async (
  transaction: SnowflakeTransaction,
  options: SnowflakeExecOptions,
): Promise<void> => {
  transaction.checkState()
  await snowflakeConnGenericWrapper(transaction.connection, options)
}

export const snowflakeUpsertWrapper = async (
  transaction: SnowflakeTransaction,
  options: SnowflakeExecOptions,
): Promise<void> => {
  transaction.checkState()
  await snowflakeConnGenericWrapper(transaction.connection, options)
}

export const snowflakeConfig: snowflake.ConnectionOptions = {
  account: env.SNOWFLAKE_ACCOUNT,
  username: env.SNOWFLAKE_USERNAME,
  password: env.SNOWFLAKE_PASSWORD,
  warehouse: env.SNOWFLAKE_WAREHOUSE,
  database: env.SNOWFLAKE_DATABASE,
  application: env.SNOWFLAKE_APPLICATION,
  role: env.SNOWFLAKE_ROLE,
  clientSessionKeepAlive: true,
  schema: "RFZ_OPE_AND_MTE",
}

export const snowflakeConnectionPool = snowflake.createPool(
  snowflakeConfig,
  // pool options
  {
    max: 10, // specifies the maximum number of connections in the pool
    min: 0, // specifies the minimum number of connections in the pool
  },
)

export const transactionStorage = new AsyncLocalStorage<{
  transaction: SnowflakeTransaction | null
}>()

const workUnitCtxCallbackFactory =
  <X>(fn: (transaction: SnowflakeTransaction) => Promise<X>) =>
  async (conn: Connection) => {
    await snowflakeConnGenericWrapper(conn, {
      sqlText: "USE SCHEMA RFZ_OPE_AND_MTE;",
    })
    await snowflakeConnGenericWrapper(conn, {
      sqlText: `ALTER SESSION SET TIMEZONE = "${env.TIMEZONE}";`,
    })

    const transactionStore = transactionStorage.getStore()
    let transaction: SnowflakeTransaction

    if (transactionStore === undefined || transactionStore.transaction === null) {
      transaction = new SnowflakeTransaction(conn)
    } else {
      if (transactionStore.transaction.connection !== conn) {
        throw new Error("Transaction in async storage is using a different connection")
      }
      transaction = transactionStore.transaction
    }

    await transaction.begin()
    logger.info("TRANSACTION STARTED")

    try {
      const results = await fn(transaction)
      await transaction.commit()
      return results
    } catch (error) {
      await transaction.rollback()
      throw error
    }
  }

export const wrapInSnowflakeTransaction = async <X>(
  fn: (transaction: SnowflakeTransaction) => Promise<X>,
  conn?: Connection,
): Promise<X> => {
  if (conn === undefined) {
    /**
     * Check whether we are in a test run. If we're in a test run, use the connection from
     * the transaction in async storage.
     */

    if (process.env.RUNNING_UNIT_TESTS === "1") {
      const _conn = transactionStorage.getStore()?.transaction?.connection
      if (_conn === undefined) {
        return snowflakeConnectionPool.use(workUnitCtxCallbackFactory(fn))
      }
      return workUnitCtxCallbackFactory(fn)(_conn)
    } else {
      return snowflakeConnectionPool.use(workUnitCtxCallbackFactory(fn))
    }
  } else {
    return workUnitCtxCallbackFactory(fn)(conn)
  }
}

export const gatArrayFromStatement = async <T>(statement: RowStatement): Promise<T[]> => {
  const stream = statement.streamRows()
  const ret: T[] = []
  for await (const row of stream) {
    ret.push(row)
  }
  return ret
}
