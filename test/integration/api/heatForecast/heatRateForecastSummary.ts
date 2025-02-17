import express from "express"
import { expect } from "chai"
import { Transaction } from "sequelize"
import request from "supertest"
import { createRouter } from "../../../../src/infrastructure/webserver/express/routes.js"
import { SnowflakeTransaction } from "../../../../src/infrastructure/orm/snowflake/index.js"
import {
  closeTransaction,
  closeTransactionCmn,
  insertFixture,
  startTransaction,
  startTransactionCmn,
} from "../../sequelize/index.js"
import { rollbackSnowflakeTransaction, startSnowflakeTransaction } from "../../../snowflake/index.js"
import { currentFiscalYear } from "../../../../src/interface/controllers/dpm/KPI003/helper/businessPlan/businessPlanHelper.js"
import { getTransaction } from "../../../../src/infrastructure/orm/sqlize/index.js"
import { insertGenerationOutputForecastDataForHeatRate, insertHeatRateForecastData } from "./heatRateForecastHelper.js"
import { heatRateForecastSummaryData } from "../../../../src/domain/entities/dpm/heatRateForecastSummary.js"

const app = express()
app.use(express.json())
app.use("/", createRouter())

const GET_PATH = "/heatrate/forecast/summary"

type responseType = heatRateForecastSummaryData

const beforeHookFixtures =
  (_cmnTransaction: Transaction, _transaction: Transaction) => async (_snowflakeTransaction: SnowflakeTransaction) => {
    await insertFixture("insertThermalEfficiencyForHeatRateForecast.sql", _cmnTransaction)
    // empty fixture
  }
describe("heatRate forecast summary", function () {
  this.timeout(10000)

  before(async () =>
    startTransaction((transaction) =>
      startTransactionCmn((cmnTransaction) =>
        startSnowflakeTransaction(beforeHookFixtures(cmnTransaction, transaction)),
      ),
    ),
  )

  after(async () => {
    await closeTransactionCmn()
    await closeTransaction()
    await rollbackSnowflakeTransaction()
  })

  it("get heatRate forecast summary: snowflake only", async () => {
    const startFiscalYear = 2022
    const res = await request(app)
      .get(`${GET_PATH}?plant-id=HE_&start-fiscal-year=${startFiscalYear}&end-fiscal-year=${currentFiscalYear()}`)
      .set("accept-language", "en")

    expect(res.status).to.eql(200)
    expect(res.body).to.a("array")
    const body = res.body as responseType[]

    for (const value of body) {
      expect(value).to.have.all.keys("plant-id", "fiscal-year", "value")
      expect(value["fiscal-year"]).is.a("number")
      expect(value.value).is.a("number")
    }
    const fiscalYearList = Array.from(new Set(body.map((x) => x["fiscal-year"])))
    const fiscalYears = [...new Array(currentFiscalYear() - startFiscalYear + 1)].map(
      (_, index) => startFiscalYear + index,
    )
    expect(fiscalYearList).to.members(fiscalYears)
  })

  it("get heatRate forecast and ensure `value` is correct: MySQL Data", async () => {
    const transaction = getTransaction()
    const fiscalYears: [number, number, number] = [
      currentFiscalYear() + 1,
      currentFiscalYear() + 2,
      currentFiscalYear() + 3,
    ]
    await insertHeatRateForecastData(fiscalYears, transaction)
    await insertGenerationOutputForecastDataForHeatRate(fiscalYears, transaction)
    const res = await request(app)
      .get(`${GET_PATH}?plant-id=HE_&start-fiscal-year=${fiscalYears[0]}&end-fiscal-year=${fiscalYears[2]}`)
      .set("accept-language", "en")

    expect(res.status).to.eql(200)
    expect(res.body).to.a("array")
    const body = res.body as responseType[]

    for (const heatRate of body) {
      expect(heatRate).to.have.all.keys("plant-id", "fiscal-year", "value")
      expect(heatRate["fiscal-year"]).is.a("number")
      expect(heatRate.value).is.a("number")
      if (heatRate["fiscal-year"] === fiscalYears[0]) expect(heatRate.value).to.eq(2150.52)
      if (heatRate["fiscal-year"] === fiscalYears[1]) expect(heatRate.value).to.eq(3122.24)
    }
    const fiscalYearList = Array.from(new Set(body.map((x) => x["fiscal-year"])))
    expect(fiscalYearList).to.members(fiscalYears)
  })
  it("Valid request: should be able to filter by fiscal-year correctly", async () => {
    const res = await request(app)
      .get(`${GET_PATH}`)
      .set("accept-language", "en")
      .query({
        "plant-id": "HE_",
        "start-fiscal-year": currentFiscalYear() + 1,
        "end-fiscal-year": currentFiscalYear() + 2,
      })
    expect(res.status).to.eql(200)
    expect(res.body).to.be.an("array")
    expect(res.body.length).to.eq(2)
  })
  it("invalid request: no plant-id", async () => {
    const startFiscalYear = 2022
    const res = await request(app)
      .get(`${GET_PATH}?start-fiscal-year=${startFiscalYear}&end-fiscal-year=${currentFiscalYear()}`)
      .set("accept-language", "en")

    expect(res.status).to.eql(400)
  })
  it("Bad request: start-fiscal-year and end-fiscal-year have wrong types", async () => {
    const res = await request(app).get(`${GET_PATH}`).set("accept-language", "en").query({
      "plant-id": "FF_",
      "start-fiscal-year": "def",
      "end-fiscal-year": "def",
    })
    expect(res.status).to.eql(400)
  })
})
