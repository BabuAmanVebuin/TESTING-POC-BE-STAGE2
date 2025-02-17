import express from "express"
import { expect } from "chai"
import { Transaction } from "sequelize"
import request from "supertest"
import { createRouter } from "../../../../src/infrastructure/webserver/express/routes.js"
import {
  startTransaction,
  closeTransaction,
  startTransactionCmn,
  closeTransactionCmn,
  insertFixture,
} from "../../sequelize/index.js"
import { currentFiscalYear } from "../../../../src/interface/controllers/dpm/KPI003/helper/businessPlan/businessPlanHelper.js"
import { SnowflakeTransaction } from "../../../../src/infrastructure/orm/snowflake/index.js"
import { rollbackSnowflakeTransaction, startSnowflakeTransaction } from "../../../snowflake/index.js"
import {
  insertGenerationOutputForecastDataForHeatRate,
  insertHeatRateForecastData,
} from "../heatForecast/heatRateForecastHelper.js"

const app = express()
app.use(express.json())
app.use("/", createRouter())

const ENDPOINT_PATH = "/heatrate/summary"

const beforeHookFixtures =
  (_cmnTransaction: Transaction, _transaction: Transaction) => async (_snowflakeTransaction: SnowflakeTransaction) => {
    const fiscalYears: [number, number, number] = [
      currentFiscalYear() + 1,
      currentFiscalYear() + 2,
      currentFiscalYear() + 3,
    ]
    // Insert fixtures in t_thermal_efficiency_forecast table
    await insertHeatRateForecastData(fiscalYears, _transaction)
    // Insert fixtures in t_generation_output_forecast table
    await insertGenerationOutputForecastDataForHeatRate(fiscalYears, _transaction)
    // Insert fixtures in t_generation_output_plan table
    await insertFixture("insertGenerationOutputPlanForHeatRatePlan.sql", _transaction)
    // Insert fixtures in m_unitmaster table
    await insertFixture("insertThermalEfficiencyForHeatRateForecast.sql", _cmnTransaction)
  }

describe("GET heat rate summary", function () {
  this.timeout(20000)
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
  it("Valid request: should be able to return valid result (keys and value types)", async () => {
    const plantId = "HE_"
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
    expect(body.forecast).to.eq(null)
  })
  it("Valid request: should be able to calculate plan with fiscal-year filter correctly", async () => {
    const plantId = "HE_"
    const startFiscalYear = 2025
    const endFiscalYear = 2030
    const res = await request(app).get(`${ENDPOINT_PATH}`).set("accept-language", "en").query({
      "plant-id": plantId,
      "start-fiscal-year": startFiscalYear,
      "end-fiscal-year": endFiscalYear,
    })
    const { body } = res
    expect(res.status).to.eq(200)
    expect(body.plan).to.be.a("number")
    expect(body.plan).to.eq(7516.29)
  })
  it("Valid request: should be able to filter by fiscal-year when there is no record matches for fiscal-year", async () => {
    const res = await request(app)
      .get(`${ENDPOINT_PATH}`)
      .set("accept-language", "en")
      .query({
        "plant-id": "HE_",
        "start-fiscal-year": currentFiscalYear() + 15,
        "end-fiscal-year": currentFiscalYear() + 16,
      })
    const { body } = res
    expect(res.status).to.eql(200)
    expect(body.plan).to.eq(null)
    expect(body.forecast).to.eq(null)
  })
  it("Valid request: should be able to filter by unit-id and return valid response", async () => {
    const res = await request(app)
      .get(`${ENDPOINT_PATH}`)
      .set("accept-language", "en")
      .query({
        "plant-id": "HE_",
        "start-fiscal-year": currentFiscalYear() + 1,
        "unit-id": "HE_A100",
      })
    const { body } = res
    expect(res.status).to.eql(200)
    expect(body.plan).to.be.a("number")
    expect(body.forecast).to.be.a("number")
    expect(body.plan).to.eq(6649.43)
    expect(body.forecast).to.eq(8708.2)
  })
  it("Valid request: should be able to filter fiscal-year and return valid forecast for SQL", async () => {
    const startFiscalYear = currentFiscalYear() + 1
    const res = await request(app).get(`${ENDPOINT_PATH}`).set("accept-language", "en").query({
      "plant-id": "HE_",
      "start-fiscal-year": startFiscalYear,
    })
    const { body } = res
    expect(res.status).to.eql(200)
    expect(body.forecast).to.be.a("number")
    expect(body.forecast).to.eq(2822.1)
  })
  it("Valid request: in case ppa thermal efficiency = 0, return plan: null", async () => {
    const res = await request(app).get(`${ENDPOINT_PATH}`).set("accept-language", "en").query({
      "plant-id": "ASG",
    })
    const { body } = res
    expect(res.status).to.eql(200)
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
