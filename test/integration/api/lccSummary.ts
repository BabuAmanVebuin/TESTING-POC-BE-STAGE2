import express from "express"
import { expect } from "chai"
import { Transaction } from "sequelize"
import request from "supertest"
import { createRouter } from "../../../src/infrastructure/webserver/express/routes.js"
import {
  startTransaction,
  closeTransaction,
  startTransactionCmn,
  closeTransactionCmn,
  insertFixtureCmn,
} from "../sequelize/index.js"
import { SnowflakeTransaction } from "../../../src/infrastructure/orm/snowflake/index.js"
import { rollbackSnowflakeTransaction, startSnowflakeTransaction } from "../../snowflake/index.js"
import { currentFiscalYear } from "../../../src/interface/controllers/dpm/KPI003/helper/businessPlan/businessPlanHelper.js"
import {
  insertGenerationOutputForecastData,
  insertFuelPriceForecastData,
  insertGenerationOutputPlanData,
  insertFuelPricePlanData,
  insertOpexPlanData,
} from "./lccSummaryHelper.js"
import { insertOpexForecastData } from "./ebitdaForecastHelper.js"
import { lifeCycleCostData } from "../../../src/domain/entities/dpm/lifeCycleCost.js"

const app = express()
app.use(express.json())
app.use("/", createRouter())

const fiscalYearsForForecast: [number, number, number] = [
  currentFiscalYear() + 1,
  currentFiscalYear() + 2,
  currentFiscalYear() + 3,
]
const fiscalYearsForPlan: [number, number, number] = [
  currentFiscalYear() - 1,
  currentFiscalYear() - 2,
  currentFiscalYear() - 3,
]

const GET_PATH = "/life-cycle-cost/summary"

type responseType = lifeCycleCostData

const beforeHookFixtures =
  (cmnTransaction: Transaction, transaction: Transaction) => async (_snowflakeTransaction: SnowflakeTransaction) => {
    await Promise.all([
      insertGenerationOutputForecastData(fiscalYearsForForecast, transaction),
      insertFuelPriceForecastData(fiscalYearsForForecast, transaction),
      insertOpexForecastData(fiscalYearsForForecast, transaction),
      insertFixtureCmn("insertLifeCycleCostMaster.sql", cmnTransaction),
      insertGenerationOutputPlanData(fiscalYearsForPlan, transaction),
      insertFuelPricePlanData(fiscalYearsForPlan, transaction),
      insertOpexPlanData(fiscalYearsForPlan, transaction),
    ])
  }
describe("LCC", function () {
  this.timeout(100000)

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

  it("get LCC: plant wise data", async () => {
    const res = await request(app).get(`${GET_PATH}?plant-id=HE_`).set("accept-language", "en")

    expect(res.status).to.eql(200)
    expect(res.body).to.a("object")
    const body = res.body as responseType

    expect(body).to.have.all.keys("plan", "forecast")
    expect(body.plan).is.a("number", JSON.stringify(body))
    expect(body.forecast).is.a("number")
  })

  it("get LCC: unit wise data", async () => {
    const res = await request(app).get(`${GET_PATH}?plant-id=HE_&HE_A100`).set("accept-language", "en")

    expect(res.status).to.eql(200)
    expect(res.body).to.a("object")
    const body = res.body as responseType

    expect(body).to.have.all.keys("plan", "forecast")
    expect(body.plan).is.a("number")
    expect(body.forecast).is.a("number")
  })

  it("get LCC plant wise: filterd by start-fiscal-year and end-fiscal-year", async () => {
    const res = await request(app)
      .get(
        `${GET_PATH}?plant-id=HE_&start-fiscal-year=${fiscalYearsForForecast[0]}&end-fiscal-year=${fiscalYearsForForecast[1]}`,
      )
      .set("accept-language", "en")

    expect(res.status).to.eql(200)
    expect(res.body).to.a("object")
    const body = res.body as responseType

    expect(body).to.have.all.keys("plan", "forecast")
    expect(body.plan).is.null
    expect(body.forecast).is.a("number")
  })

  it("get LCC unit wise: filterd by start-fiscal-year and end-fiscal-year", async () => {
    const res = await request(app)
      .get(
        `${GET_PATH}?plant-id=HE_&unit-id=HE_A100&start-fiscal-year=${fiscalYearsForForecast[0]}&end-fiscal-year=${fiscalYearsForForecast[1]}`,
      )
      .set("accept-language", "en")

    expect(res.status).to.eql(200)
    expect(res.body).to.a("object")
    const body = res.body as responseType

    expect(body).to.have.all.keys("plan", "forecast")
    expect(body.plan).is.null
    expect(body.forecast).is.a("number")
  })

  it("get LCC plant wise: filtered by start-fisca-year", async () => {
    const res = await request(app)
      .get(`${GET_PATH}?plant-id=HE_&start-fiscal-year=${currentFiscalYear()}`)
      .set("accept-language", "en")

    expect(res.status).to.eql(200)
    expect(res.body).to.a("object")
    const body = res.body as responseType

    expect(body).to.have.all.keys("plan", "forecast")
    expect(body.plan).is.null
    expect(body.forecast).is.a("number")
  })

  it("get LCC unit wise: filtered by start-fisca-year", async () => {
    const res = await request(app)
      .get(`${GET_PATH}?plant-id=HE_&unit-id=HE_A100&start-fiscal-year=${currentFiscalYear()}`)
      .set("accept-language", "en")

    expect(res.status).to.eql(200)
    expect(res.body).to.a("object")
    const body = res.body as responseType

    expect(body).to.have.all.keys("plan", "forecast")
    expect(body.plan).is.null
    expect(body.forecast).is.a("number")
  })

  it("get LCC plant wise: filtered by end-fisca-year", async () => {
    const res = await request(app)
      .get(`${GET_PATH}?plant-id=HE_&end-fiscal-year=${currentFiscalYear() - 1}`)
      .set("accept-language", "en")

    expect(res.status).to.eql(200)
    expect(res.body).to.a("object")
    const body = res.body as responseType

    expect(body).to.have.all.keys("plan", "forecast")
    expect(body.plan).is.a("number")
    expect(body.forecast).is.a("number")
  })

  it("get LCC unit wise: filtered by end-fisca-year", async () => {
    const res = await request(app)
      .get(`${GET_PATH}?plant-id=HE_&unit-id=HE_A100&end-fiscal-year=${currentFiscalYear() - 1}`)
      .set("accept-language", "en")

    expect(res.status).to.eql(200)
    expect(res.body).to.a("object")
    const body = res.body as responseType

    expect(body).to.have.all.keys("plan", "forecast")
    expect(body.plan).is.a("number")
    expect(body.forecast).is.a("number")
  })

  it("get LCC plant wise: get null when got no data", async () => {
    const res = await request(app)
      .get(
        `${GET_PATH}?plant-id=HE_&start-fiscal-year=${
          currentFiscalYear() + 10
        }&end-fiscal-year=${currentFiscalYear() + 1}`,
      )
      .set("accept-language", "en")

    expect(res.status).to.eql(200)
    expect(res.body).to.a("object")
    const body = res.body as responseType

    expect(body).to.have.all.keys("plan", "forecast")
    expect(body.plan).is.null
    expect(body.forecast).is.null
  })

  it("get LCC unit wise: get null when got no data", async () => {
    const res = await request(app)
      .get(
        `${GET_PATH}?plant-id=HE_&unit-id=HE_A100&start-fiscal-year=${
          currentFiscalYear() + 10
        }&end-fiscal-year=${currentFiscalYear() + 1}`,
      )
      .set("accept-language", "en")

    expect(res.status).to.eql(200)
    expect(res.body).to.a("object")
    const body = res.body as responseType

    expect(body).to.have.all.keys("plan", "forecast")
    expect(body.plan).is.null
    expect(body.forecast).is.null
  })

  it("invalid request: no plant-id", async () => {
    const startFiscalYear = 2022
    const res = await request(app)
      .get(`${GET_PATH}?unit-id=HE_A100&start-fiscal-year=${startFiscalYear}&end-fiscal-year=${currentFiscalYear()}`)
      .set("accept-language", "en")

    expect(res.status).to.eql(400)
  })
})
