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
  insertFixture,
} from "../sequelize/index.js"
import { SnowflakeTransaction } from "../../../src/infrastructure/orm/snowflake/index.js"
import { rollbackSnowflakeTransaction, startSnowflakeTransaction } from "../../snowflake/index.js"
import { currentFiscalYear } from "../../../src/interface/controllers/dpm/KPI003/helper/businessPlan/businessPlanHelper.js"
import { insertGenerationOutputForecastData, insertFuelPriceForecastData } from "./grossMarginForecastSummaryHelper.js"
import { insertBasicChargeForecastData, insertOpexForecastData } from "./ebitdaForecastHelper.js"
import { netPresentValueData } from "../../../src/domain/entities/dpm/netPresentValue.js"

const app = express()
app.use(express.json())
app.use("/", createRouter())

const GET_PATH = "/net-present-value/summary"

type responseType = netPresentValueData

const beforeHookFixtures =
  (cmnTransaction: Transaction, transaction: Transaction) => async (_snowflakeTransaction: SnowflakeTransaction) => {
    const fiscalYears: [number, number, number] = [
      currentFiscalYear() + 1,
      currentFiscalYear() + 2,
      currentFiscalYear() + 3,
    ]
    await Promise.all([
      insertGenerationOutputForecastData(fiscalYears, transaction),
      insertFuelPriceForecastData(fiscalYears, transaction),
      insertFixtureCmn("insertNetPresentValueMaster.sql", cmnTransaction),
      insertBasicChargeForecastData(fiscalYears, transaction),
      insertOpexForecastData(fiscalYears, transaction),
      insertFixture("beforeEbitdaPlan.sql", transaction),
    ])
  }
describe("NPV", function () {
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

  it("get NPV: plant wise data", async () => {
    const res = await request(app).get(`${GET_PATH}?plant-id=HE_`).set("accept-language", "en")

    expect(res.status).to.eql(200)
    expect(res.body).to.a("object")
    const body = res.body as responseType

    expect(body).to.have.all.keys("plan", "forecast")
    expect(body.plan).is.a("number")
    expect(body.forecast).is.a("number")
  })

  it("get NPV: unit wise data", async () => {
    const res = await request(app).get(`${GET_PATH}?plant-id=HE_&HE_A100`).set("accept-language", "en")

    expect(res.status).to.eql(200)
    expect(res.body).to.a("object")
    const body = res.body as responseType

    expect(body).to.have.all.keys("plan", "forecast")
    expect(body.plan).is.a("number")
    expect(body.forecast).is.a("number")
  })

  it("get NPV: filterd by start-fiscal-year and end-fiscal-year", async () => {
    const res = await request(app)
      .get(`${GET_PATH}?plant-id=HE_&start-fiscal-year=2022&end-fiscal-year=2023`)
      .set("accept-language", "en")

    expect(res.status).to.eql(200)
    expect(res.body).to.a("object")
    const body = res.body as responseType

    expect(body).to.have.all.keys("plan", "forecast")
    expect(body.plan).is.null
    expect(body.forecast).is.a("number")
  })

  it("get npv: filtered by start-fisca-year", async () => {
    const res = await request(app)
      .get(`${GET_PATH}?plant-id=HE_&start-fiscal-year=${currentFiscalYear()}`)
      .set("accept-language", "en")

    expect(res.status).to.eql(200)
    expect(res.body).to.a("object")
    const body = res.body as responseType

    expect(body).to.have.all.keys("plan", "forecast")
    expect(body.plan).is.a("number")
    expect(body.forecast).is.a("number")
  })

  it("get npv: filtered by end-fisca-year", async () => {
    const res = await request(app)
      .get(`${GET_PATH}?plant-id=HE_&end-fiscal-year=${currentFiscalYear() + 10}`)
      .set("accept-language", "en")

    expect(res.status).to.eql(200)
    expect(res.body).to.a("object")
    const body = res.body as responseType

    expect(body).to.have.all.keys("plan", "forecast")
    expect(body.plan).is.a("number")
    expect(body.forecast).is.a("number")
  })

  it("get npv: get null when got no data", async () => {
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

  it("invalid request: no plant-id", async () => {
    const startFiscalYear = 2022
    const res = await request(app)
      .get(`${GET_PATH}?unit-id=HE_A100&start-fiscal-year=${startFiscalYear}&end-fiscal-year=${currentFiscalYear()}`)
      .set("accept-language", "en")

    expect(res.status).to.eql(400)
  })
})
