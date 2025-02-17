import express from "express"
import { expect } from "chai"
import { Transaction } from "sequelize"
import request from "supertest"
import { createRouter } from "../../../../src/infrastructure/webserver/express/routes.js"
import { startTransaction, closeTransaction, insertFixture } from "../../sequelize/index.js"
import { currentFiscalYear } from "../../../../src/interface/controllers/dpm/KPI003/helper/businessPlan/businessPlanHelper.js"
import { getTransaction } from "../../../../src/infrastructure/orm/sqlize/index.js"
import { getGenerationOutputForecastSummaryResponse } from "../../../../src/domain/entities/dpm/generationOutputForecastSummary.js"
import { beforeGenerationOutputForecastSummaryTest } from "./generationOutputSummaryHelper.js"

const app = express()
app.use(express.json())
app.use("/", createRouter())

const ENDPOINT_PATH = "/generation-output/forecast/summary"

type responseType = getGenerationOutputForecastSummaryResponse

const beforeHookFixtures = async (transaction: Transaction) => {
  const fiscalYears: [number, number, number, number] = [
    currentFiscalYear() + 5,
    currentFiscalYear() + 10,
    currentFiscalYear() + 2,
    currentFiscalYear() + 15,
  ]
  await beforeGenerationOutputForecastSummaryTest(fiscalYears, transaction)
}

describe("GET generation output forecast summary", function () {
  this.timeout(25000)
  before(async () =>
    startTransaction(async (transaction) => {
      await beforeHookFixtures(transaction)
    }),
  )
  after(async () => {
    await closeTransaction()
  })
  it("Valid request: should be able to filter by fiscal-year correctly", async () => {
    const plantId = "BB_"
    const startFiscalYear = 2022
    const endFiscalYear = currentFiscalYear() + 7
    const res = await request(app).get(`${ENDPOINT_PATH}`).set("accept-language", "en").query({
      "plant-id": plantId,
      "start-fiscal-year": startFiscalYear,
      "end-fiscal-year": endFiscalYear,
    })
    const { body } = res
    expect(res.status).to.eq(200)
    expect(body).to.be.an("array")
    expect(body.length).to.eq(2)
    for (const generationOutput of body) {
      expect(generationOutput).to.have.all.keys("plant-id", "fiscal-year", "value")
      expect(generationOutput["plant-id"]).is.eq(plantId)
    }
  })
  it("Valid request: should be able to filter by fiscal-year correctly and return empty result", async () => {
    const res = await request(app)
      .get(`${ENDPOINT_PATH}`)
      .set("accept-language", "en")
      .query({
        "plant-id": "BB_",
        "start-fiscal-year": 2020,
        "end-fiscal-year": currentFiscalYear() + 1,
      })
    expect(res.status).to.eql(200)
    expect(res.body).to.be.an("array")
    expect(res.body.length).to.eq(0)
  })
  it("Valid request: get generation output forecast summary: snowflake only", async () => {
    const startFiscalYear = 2022
    const res = await request(app).get(`${ENDPOINT_PATH}`).set("accept-language", "en").query({
      "plant-id": "HE_",
      "start-fiscal-year": startFiscalYear,
      "end-fiscal-year": currentFiscalYear(),
    })
    const body = res.body as responseType[]
    for (const value of body) {
      expect(value).to.have.all.keys("plant-id", "fiscal-year", "value")
    }
    const fiscalYearList = Array.from(new Set(body.map((x) => x["fiscal-year"]))).sort()
    const fiscalYears = [...new Array(currentFiscalYear() - startFiscalYear + 1)].map(
      (_, index) => startFiscalYear + index,
    )
    expect(fiscalYearList).to.eql(fiscalYears)
  })

  it("Valid request: get generation output forecast: snowflake and calculated data", async () => {
    const transaction = getTransaction()
    await insertFixture("insertGenerationOutputForecastSummary.sql", transaction)
    const startFiscalYear = 2022
    const res = await request(app)
      .get(`${ENDPOINT_PATH}`)
      .set("accept-language", "en")
      .query({
        "plant-id": "HE_",
        "start-fiscal-year": startFiscalYear,
        "end-fiscal-year": currentFiscalYear() + 1,
      })
    const body = res.body as responseType[]
    for (const value of body) {
      if (value["fiscal-year"] === currentFiscalYear() + 1) {
        expect(value).to.have.all.keys("plant-id", "fiscal-year", "value")
      }
    }
    const fiscalYearList = Array.from(new Set(body.map((x) => x["fiscal-year"]))).sort()
    const fiscalYears = [...new Array(currentFiscalYear() - startFiscalYear + 1)].map(
      (_, index) => startFiscalYear + index,
    )
    expect(fiscalYearList).to.eql(fiscalYears)
  })
  it("Valid request: cannot get value and correction value are null data", async () => {
    const res = await request(app).get(`${ENDPOINT_PATH}`).set("accept-language", "en").query({
      "plant-id": "CC_",
    })
    expect(res.status).to.eql(200)
    expect(res.body).to.be.an("array")
    expect(res.body.length).to.eq(1)
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
