import { RootHookObject } from "mocha"
import { Transaction } from "sequelize"
import { cmnSequelize, sequelize, transactionStorage, transactionStorageCmn } from "./index.js"

/**
 * This is the Mocha root hook that enables us to wrap tests in transactions that can be rolled back.
 */
export const mochaHooks: RootHookObject = {
  beforeAll(done) {
    const store: { transaction: Transaction | null } = { transaction: null }
    const storeCmn: { transaction: Transaction | null } = { transaction: null }

    // Run the rest of the async chain within the async local storage context.
    transactionStorage.run(store, () => {
      transactionStorageCmn.run(storeCmn, done)
    })
  },
  async afterAll() {
    await sequelize.close()
    await cmnSequelize.close()
  },
}
