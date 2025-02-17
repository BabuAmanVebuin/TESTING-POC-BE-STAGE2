import express from "express"
import { expect } from "chai"
import { Transaction } from "sequelize"
import request from "supertest"
import { createRouter } from "../../../src/infrastructure/webserver/express/routes.js"
import { startTransaction, insertFixture, closeTransaction } from "../sequelize/index.js"

const app = express()
app.use(express.json())
app.use("/", createRouter())

// Before each test, insert the fixtures
const beforeEachHookFixtures = async (transaction: Transaction) => {
  await insertFixture("beforeGetToTUserPreference.sql", transaction)
}

describe("Get user preference", async () => {
  beforeEach(async () => startTransaction(beforeEachHookFixtures))

  afterEach(closeTransaction)

  it("Must return 404 error for invalid user", async () => {
    // Call get user preference API with invalid user
    const res = await request(app).get("/user/ToT/invalid@user.com")
    // Expect 404 error
    expect(res.status).to.eql(404)
  })

  it("Success Request", async () => {
    // Call get user preference API with valid user
    const res = await request(app).get("/user/ToT/test@user.com")
    // Expect 200 status
    expect(res.status).to.eql(200)
  })
})
