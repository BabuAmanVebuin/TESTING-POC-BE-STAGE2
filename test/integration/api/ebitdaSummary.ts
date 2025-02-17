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

const app = express()
app.use(express.json())
app.use("/", createRouter())

const ENDPOINT_PATH = "/ebitda/summary"

const beforeHookFixtures =
  (_cmnTransaction: Transaction, _transaction: Transaction) => async (_snowflakeTransaction: SnowflakeTransaction) => {
    const fiscalYears: [number, number, number] = [
      currentFiscalYear() + 1,
      currentFiscalYear() + 2,
      currentFiscalYear() + 3,
    ]
    await Promise.all([
      insertFixture("beforeEbitdaPlan.sql", _transaction),
      insertGenerationOutputForecastData(fiscalYears, _transaction),
      insertFuelPriceForecastData(fiscalYears, _transaction),
      insertFixtureCmn("insertGrossMarginMaster.sql", _cmnTransaction),
      insertBasicChargeForecastData(fiscalYears, _transaction),
      insertOpexForecastData(fiscalYears, _transaction),
    ])
  }

describe("ebitda summary", function () {
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
  it("get ebitda summary for plan", async () => {
    const res = await request(app).get(`${ENDPOINT_PATH}?plant-id=HE_&unit-id=HE_A100`).set("accept-language", "en")
    expect(res.status).to.eql(200)
    expect(res.body).to.an("object")
    expect(res.body).to.have.all.keys("plan", "forecast")
    expect(res.body.plan).to.be.a("number")
    expect(res.body.plan).to.eql(-19.8)
    expect(res.body.forecast).to.be.a("number")
  })
  it("get ebitda summary for forecast : MySQL Data", async () => {
    const res = await request(app)
      .get(
        `${ENDPOINT_PATH}?plant-id=HE_&unit-id=HE_A100&start-fiscal-year=${
          currentFiscalYear() + 1
        }&end-fiscal-year=${currentFiscalYear() + 4}`,
      )
      .set("accept-language", "en")
    expect(res.status).to.eql(200)
    expect(res.body).to.an("object")
    expect(res.body).to.have.all.keys("plan", "forecast")
    expect(res.body.plan).to.be.a("number")
    expect(res.body.forecast).to.be.a("number")
  })
  it("invalid request: no plant-id", async () => {
    const startFiscalYear = 2022
    const res = await request(app)
      .get(
        `${ENDPOINT_PATH}?unit-id=HE_A100&start-fiscal-year=${startFiscalYear}&end-fiscal-year=${currentFiscalYear()}`,
      )
      .set("accept-language", "en")
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
