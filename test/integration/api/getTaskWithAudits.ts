import express from "express"
import { expect } from "chai"
import { Transaction } from "sequelize"
import request from "supertest"
import { createRouter } from "../../../src/infrastructure/webserver/express/routes.js"
import { startTransaction, insertFixture, closeTransaction } from "../sequelize/index.js"
const app = express()
app.use(express.json())
app.use("/", createRouter())

// Before each test, a transaction is started and fixtures are inserted
const beforeEachHookFixtures = async (transaction: Transaction) => {
  await insertFixture("beforeGetTaskWithAudits.sql", transaction)
}

describe("Get tasks with audits", async () => {
  beforeEach(async () => startTransaction(beforeEachHookFixtures))

  afterEach(closeTransaction)

  it("Must return not found team-id response for invalid team-id", async () => {
    // Prepare request data with invalid team-id
    const requestData = {
      "power-plant-id": "HE_",
      "asset-task-group-id": 1,
      "planned-date-time": "2022-01-01T00:00:00.000Z",
      "due-date-time": "2022-12-31T23:59:59.000Z",
      "team-id": 45421,
    }
    // Call get task with audits API
    const res = await request(app).get("/tasks/task-with-audits").query(requestData)

    // Expect response status 404 and response body with error message
    expect(res.status).to.eql(404)
    expect(res.body).to.eql("Not Found - Team id was not found")
  })

  it('Success API must contain boolean "is-lock" flag', async () => {
    // Prepare request data with valid data
    const requestData = {
      "power-plant-id": "HE_",
      "asset-task-group-id": 1,
      "planned-date-time": "2022-01-01T00:00:00.000Z",
      "due-date-time": "2022-12-31T23:59:59.000Z",
      "team-id": 1,
    }
    // Call get task with audits API
    const res = await request(app).get("/tasks/task-with-audits").query(requestData)

    // Expect response status 200 and response body with tasks array
    expect(res.status).to.eql(200)
    expect(res.body).have.property("tasks")
    expect(res.body["tasks"]).to.be.an("array")
    expect(res.body["tasks"]).to.have.length(2)

    // Expect each task in tasks array to have boolean "is-lock" flag
    for (const task of res.body["tasks"]) {
      expect(task["is-lock"]).to.be.a("boolean")
      if (task["task-id"] == 1) {
        expect(task["is-lock"]).to.be.false
      }
      if (task["task-id"] == 2) {
        expect(task["is-lock"]).to.be.true
      }
    }
  })
})
