import { RootHookObject } from "mocha"

import { snowflakeConnectionPool, transactionStorage } from "./index.js"

export const mochaHooks: RootHookObject = {
  beforeAll(done) {
    this.timeout(20000)
    const store = { transaction: null }
    transactionStorage.run(store, done)
  },
  async afterAll() {
    await snowflakeConnectionPool.drain()
    await snowflakeConnectionPool.clear()
  },
}
