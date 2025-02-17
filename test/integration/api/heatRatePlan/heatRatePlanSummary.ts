import express from "express"
import { expect } from "chai"
import { Transaction } from "sequelize"
import request from "supertest"
import { createRouter } from "../../../../src/infrastructure/webserver/express/routes.js"
import {
  startTransaction,
  closeTransaction,
  insertFixture,
  closeTransactionCmn,
  startTransactionCmn,
} from "../../sequelize/index.js"
import { heatRatePlanSummaryData } from "../../../../src/domain/entities/dpm/heatRatePlanSummary.js"

const app = express()
app.use(express.json())
app.use("/", createRouter())

const ENDPOINT_PATH = "/heatrate/plan/summary"

type responseType = heatRatePlanSummaryData

const beforeHookFixtures = async (cmnTransaction: Transaction, transaction: Transaction) => {
  await insertFixture("insertPpaThermalEffeciencyForHeatRatePlan.sql", cmnTransaction)
  await insertFixture("insertGenerationOutputPlanForHeatRatePlan.sql", transaction)
}

describe("heatrate plan summary test", function () {
  before(async () =>
    startTransaction((transaction) =>
      startTransactionCmn((cmnTransaction) => beforeHookFixtures(cmnTransaction, transaction)),
    ),
  )
  after(async () => {
    await closeTransactionCmn()
    await closeTransaction()
  })

  it("Valid request: should ensure that GET has retrieved correct data", async () => {
    const res = await request(app).get(`${ENDPOINT_PATH}`).set("accept-language", "en").query({ "plant-id": "HE_" })
    expect(res.status).to.eql(200)
    expect(res.body).to.be.an("array")
    expect(res.body.length).eq(3)
    res.body.forEach((element: responseType) => {
      expect(element).to.have.keys("plant-id", "fiscal-year", "value")
      if (element["fiscal-year"] === 2024) expect(element.value).to.be.eq(4185.57)
      if (element["fiscal-year"] === 2025) expect(element.value).to.be.eq(2238.42)
      if (element["fiscal-year"] === 2026) expect(element.value).to.be.eq(5076.37)
    })
  })
  it("Valid request: should be able to filter by fiscal-year correctly", async () => {
    const res = await request(app).get(`${ENDPOINT_PATH}`).set("accept-language", "en").query({
      "plant-id": "HE_",
      "start-fiscal-year": 2028,
      "end-fiscal-year": 2030,
    })
    expect(res.status).to.eql(200)
    expect(res.body).to.be.an("array")
    expect(res.body.length).to.eq(0)

    const res2 = await request(app).get(`${ENDPOINT_PATH}`).set("accept-language", "en").query({
      "plant-id": "HE_",
      "start-fiscal-year": 2024,
      "end-fiscal-year": 2025,
    })
    expect(res2.body.length).to.eq(2)
  })
  it("Valid request: in case ppa thermal efficiency values = 0, return empty array", async () => {
    const res = await request(app).get(`${ENDPOINT_PATH}`).set("accept-language", "en").query({
      "plant-id": "ASG",
    })
    expect(res.status).to.eql(200)
    expect(res.body).to.be.an("array")
    expect(res.body.length).to.eq(0)
  })
  it("Bad request: missing required fields: plant-id", async () => {
    const res = await request(app)
      .get(`${ENDPOINT_PATH}`)
      .set("accept-language", "en")
      .query({ "start-fiscal-year": 2024, "end-fiscal-year": 2025 })
    expect(res.status).to.eql(400)
  })
  it("Bad request: start-fiscal-year and end-fiscal-year have wrong types", async () => {
    const res = await request(app).get(`${ENDPOINT_PATH}`).set("accept-language", "en").query({
      "plant-id": "HE_",
      "start-fiscal-year": "abc",
      "end-fiscal-year": "abc",
    })
    expect(res.status).to.eql(400)
  })
})
