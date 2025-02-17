import express from "express"
import { expect } from "chai"
import { Transaction } from "sequelize"
import request from "supertest"
import { createRouter } from "../../../../src/infrastructure/webserver/express/routes.js"
import { startTransaction, closeTransaction } from "../../sequelize/index.js"
import { currentFiscalYear } from "../../../../src/interface/controllers/dpm/KPI003/helper/businessPlan/businessPlanHelper.js"
import { beforeOpexSummaryTest } from "./opexSummaryHelper.js"

const app = express()
app.use(express.json())
app.use("/", createRouter())

const ENDPOINT_PATH = "/opex/summary"

const beforeHookFixtures = async (transaction: Transaction) => {
  const fiscalYears: [number, number, number] = [
    currentFiscalYear() + 1,
    currentFiscalYear() + 2,
    currentFiscalYear() + 6,
  ]
  await beforeOpexSummaryTest(fiscalYears, transaction)
}

describe("GET opex summary", function () {
  this.timeout(50000)
  before(async () => startTransaction((transaction) => beforeHookFixtures(transaction)))
  after(async () => {
    await closeTransaction()
  })
  it("Valid request: should be able to return valid result (keys and value types)", async () => {
    const plantId = "AA_"
    const res = await request(app).get(`${ENDPOINT_PATH}`).set("accept-language", "en").query({
      "plant-id": plantId,
    })
    const { body } = res
    expect(res.status).to.eq(200)
    expect(body).to.be.an("object")
    expect(body).to.have.keys("sum", "operation-cost", "maintenance-cost")
    expect(body.sum).to.have.keys("plan", "forecast")
    expect(body.sum.plan).to.be.a("number")
    expect(body.sum.forecast).to.be.a("number")
    expect(body["operation-cost"]).to.have.keys("plan", "forecast")
    expect(body["operation-cost"].plan).to.be.a("number")
    expect(body["operation-cost"].forecast).to.be.a("number")
    expect(body["maintenance-cost"]).to.have.keys("plan", "forecast")
    expect(body["maintenance-cost"].plan).to.be.a("number")
    expect(body["maintenance-cost"].forecast).to.be.a("number")
  })
  it("Valid request: should be able to return valid result when input plant-id not found in DB", async () => {
    const plantId = "CC_"
    const res = await request(app).get(`${ENDPOINT_PATH}`).set("accept-language", "en").query({
      "plant-id": plantId,
    })
    const { body } = res
    expect(res.status).to.eq(200)
    expect(body.sum.plan).to.eq(null)
    expect(body["operation-cost"].plan).to.eq(null)
    expect(body["maintenance-cost"].plan).to.eq(null)
  })
  it("Valid request: should be able to calculate plan (sum and operation-cost and maintenance-cost) with fiscal-year filter correctly", async () => {
    const plantId = "AA_"
    const startFiscalYear = 2025
    const endFiscalYear = 2030
    const res = await request(app).get(`${ENDPOINT_PATH}`).set("accept-language", "en").query({
      "plant-id": plantId,
      "start-fiscal-year": startFiscalYear,
      "end-fiscal-year": endFiscalYear,
    })
    const { body } = res
    expect(res.status).to.eq(200)
    expect(body.sum.plan).to.be.a("number")
    expect(body.sum.plan).to.eq(95.0)
    expect(body["operation-cost"].plan).to.be.a("number")
    expect(body["operation-cost"].plan).to.eq(55.0)
    expect(body["maintenance-cost"].plan).to.be.a("number")
    expect(body["maintenance-cost"].plan).to.eq(40.0)
  })
  it("Valid request: should be able to filter by fiscal-year when there is no record matches for fiscal-year", async () => {
    const res = await request(app).get(`${ENDPOINT_PATH}`).set("accept-language", "en").query({
      "plant-id": "AA_",
      "start-fiscal-year": 2015,
      "end-fiscal-year": 2019,
    })
    const { body } = res
    expect(res.status).to.eql(200)
    expect(body.sum.plan).to.eq(null)
    expect(body["operation-cost"].plan).to.eq(null)
    expect(body["maintenance-cost"].plan).to.eq(null)
  })
  it("Valid request: should be able to filter by unit-id and return valid plan sum", async () => {
    const res = await request(app).get(`${ENDPOINT_PATH}`).set("accept-language", "en").query({
      "plant-id": "AA_",
      "unit-id": "AA_100",
    })
    const { body } = res
    expect(res.status).to.eql(200)
    expect(body.sum.plan).to.be.a("number")
    expect(body.sum.plan).to.eq(35.0)
    expect(body["operation-cost"].plan).to.be.a("number")
    expect(body["operation-cost"].plan).to.eq(5.0)
    expect(body["maintenance-cost"].plan).to.be.a("number")
    expect(body["maintenance-cost"].plan).to.eq(30.0)
  })
  it("Valid request: should be able to filter fiscal-year and return valid forecast sum for SQL", async () => {
    const startFiscalYear = currentFiscalYear() + 1
    const res = await request(app).get(`${ENDPOINT_PATH}`).set("accept-language", "en").query({
      "plant-id": "AA_",
      "start-fiscal-year": startFiscalYear,
    })
    const { body } = res
    expect(res.status).to.eql(200)
    expect(body.sum.forecast).to.be.a("number")
    expect(body.sum.forecast).to.eq(40.0)
    expect(body["operation-cost"].forecast).to.be.a("number")
    expect(body["operation-cost"].forecast).to.eq(10.0)
    expect(body["maintenance-cost"].forecast).to.be.a("number")
    expect(body["maintenance-cost"].forecast).to.eq(30.0)
  })
  it("Valid request: should be able return plan (sum=null, operation-cost=null and maintenance-cost=null) when operation-cost and maintenance-cost are null", async () => {
    const startFiscalYear = currentFiscalYear() + 5
    const res = await request(app).get(`${ENDPOINT_PATH}`).set("accept-language", "en").query({
      "plant-id": "FF_",
      "start-fiscal-year": startFiscalYear,
    })
    const { body } = res
    expect(res.status).to.eql(200)
    expect(body.sum.plan).to.eq(null)
    expect(body["operation-cost"].plan).to.eq(null)
    expect(body["maintenance-cost"].plan).to.eq(null)
  })
  it("Bad request: missing required fields: plant-id", async () => {
    const res = await request(app)
      .get(`${ENDPOINT_PATH}`)
      .set("accept-language", "en")
      .query({ "start-fiscal-year": 2000, "end-fiscal-year": 2019 })
    expect(res.status).to.eql(400)
  })
  it("Bad request: start-fiscal-year and end-fiscal-year have wrong types", async () => {
    const res = await request(app).get(`${ENDPOINT_PATH}`).set("accept-language", "en").query({
      "plant-id": "BB_",
      "start-fiscal-year": "abc",
      "end-fiscal-year": "abc",
    })
    expect(res.status).to.eql(400)
  })
})
