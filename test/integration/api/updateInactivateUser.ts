import express from "express"
import { expect } from "chai"
import { Transaction } from "sequelize"
import request from "supertest"
import { createRouter } from "../../../src/infrastructure/webserver/express/routes.js"
import { startTransaction, insertFixture, closeTransaction, selectFixture } from "../sequelize/index.js"
import { getTransaction } from "../../../src/infrastructure/orm/sqlize/index.js"
import expectOutputAfterUpdateInactivateUser from "./data/afterUpdateInactivateUser.json" with { type: "json" }

const app = express()
app.use(express.json())
app.use("/", createRouter())

// Before each test, insert the fixtures
const beforeEachHookFixtures = async (transaction: Transaction) => {
  await insertFixture("beforeUpdateInvalidateUser.sql", transaction)
}

describe("Inactivate User", async () => {
  beforeEach(async () => startTransaction(beforeEachHookFixtures))

  afterEach(closeTransaction)

  it("All user must be moved to test powerplant whose last active status is older than 10 days", async () => {
    // Call Inactivate User API
    const res = await request(app).post("/user/ToT/inactive")

    // Expect 200 status
    expect(res.status).to.eql(200)
    expect(res.body).to.eql("OK")

    // Check if all user is moved to test powerplant
    const transaction = getTransaction()
    const inactivatedUser = await selectFixture("afterUpdateInvalidateUser.sql", transaction, {})

    // Expect all user is moved to test powerplant
    expect(inactivatedUser).to.eql(expectOutputAfterUpdateInactivateUser)
  })
})
