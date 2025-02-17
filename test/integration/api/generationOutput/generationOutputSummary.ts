import express from "express"
import { expect } from "chai"
import { Transaction } from "sequelize"
import request from "supertest"
import { createRouter } from "../../../../src/infrastructure/webserver/express/routes.js"
import { startTransaction, closeTransaction } from "../../sequelize/index.js"
import { currentFiscalYear } from "../../../../src/interface/controllers/dpm/KPI003/helper/businessPlan/businessPlanHelper.js"
import { beforeGenerationOutputSummaryTest } from "./generationOutputSummaryHelper.js"

const app = express()
app.use(express.json())
app.use("/", createRouter())

const ENDPOINT_PATH = "/generation-output/summary"

const beforeHookFixtures = async (transaction: Transaction) => {
  const fiscalYears: [number, number, number] = [
    currentFiscalYear() + 1,
    currentFiscalYear() + 2,
    currentFiscalYear() + 6,
  ]
  await beforeGenerationOutputSummaryTest(fiscalYears, transaction)
}

describe("GET generation output summary", function () {
  this.timeout(25000)
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
    expect(body).to.have.keys("plan", "forecast")
    expect(body.plan).to.be.a("number")
    expect(body.forecast).to.be.a("number")
  })
  it("Valid request: should be able to return valid result when input plant-id not found in DB", async () => {
    const plantId = "CC_"
    const res = await request(app).get(`${ENDPOINT_PATH}`).set("accept-language", "en").query({
      "plant-id": plantId,
    })
    const { body } = res
    expect(res.status).to.eq(200)
    expect(body.plan).to.eq(null)
  })
  it("Valid request: should be able to calculate plan sum with fiscal-year filter correctly", async () => {
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
    expect(body.plan).to.eq(95.0)
  })
  it("Valid request: should be able to filter by fiscal-year when there is no record matches for fiscal-year", async () => {
    const res = await request(app).get(`${ENDPOINT_PATH}`).set("accept-language", "en").query({
      "plant-id": "AA_",
      "start-fiscal-year": 2015,
      "end-fiscal-year": 2019,
    })
    const { body } = res
    expect(res.status).to.eql(200)
    expect(body.plan).to.eq(null)
  })
  it("Valid request: should be able to filter by unit-id and return valid plan sum", async () => {
    const res = await request(app).get(`${ENDPOINT_PATH}`).set("accept-language", "en").query({
      "plant-id": "AA_",
      "unit-id": "AA_100",
    })
    const { body } = res
    expect(res.status).to.eql(200)
    expect(body.plan).to.eq(35.0)
  })
  it("Valid request: should be able to filter fiscal-year and return valid forecast sum for SQL", async () => {
    const startFiscalYear = currentFiscalYear() + 1
    const res = await request(app).get(`${ENDPOINT_PATH}`).set("accept-language", "en").query({
      "plant-id": "AA_",
      "start-fiscal-year": startFiscalYear,
    })
    const { body } = res
    expect(res.status).to.eql(200)
    expect(body.forecast).to.eq(40)
  })
  it("Valid request: should be able return sum=null when correction-value and value = null", async () => {
    const startFiscalYear = currentFiscalYear() + 5
    const res = await request(app).get(`${ENDPOINT_PATH}`).set("accept-language", "en").query({
      "plant-id": "FF_",
      "start-fiscal-year": startFiscalYear,
    })
    const { body } = res
    expect(res.status).to.eql(200)
    expect(body.forecast).to.eq(null)
    expect(body.plan).to.eq(null)
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
