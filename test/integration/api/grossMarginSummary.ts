import express from "express"
import { expect } from "chai"
import { Transaction } from "sequelize"
import request from "supertest"
import { createRouter } from "../../../src/infrastructure/webserver/express/routes.js"
import { currentFiscalYear } from "../../../src/interface/controllers/dpm/KPI003/helper/businessPlan/businessPlanHelper.js"
import {
  startTransaction,
  closeTransaction,
  insertFixtureCmn,
  startTransactionCmn,
  closeTransactionCmn,
} from "../sequelize/index.js"
import { insertGenerationOutputForecastData, insertFuelPriceForecastData } from "./grossMarginForecastSummaryHelper.js"
import { insertGenerationOutputPlan } from "./grossMarginSummaryHelper.js"
import { grossMarginSummaryData } from "../../../src/domain/entities/dpm/grossMarginSummary.js"
import { SnowflakeTransaction } from "../../../src/infrastructure/orm/snowflake/index.js"
import { rollbackSnowflakeTransaction, startSnowflakeTransaction } from "../../snowflake/index.js"

const app = express()
app.use(express.json())
app.use("/", createRouter())

const ENDPOINT_PATH = "/grossmargin/summary"

type responseType = grossMarginSummaryData

const beforeHookFixtures = async (
  transaction: Transaction,
  cmnTransaction: Transaction,
  _snowflakeTransaction: SnowflakeTransaction,
) => {
  const fiscalYears: [number, number, number] = [
    currentFiscalYear() + 1,
    currentFiscalYear() + 2,
    currentFiscalYear() + 3,
  ]
  await Promise.all([
    insertGenerationOutputForecastData(fiscalYears, transaction),
    insertFuelPriceForecastData(fiscalYears, transaction),
    insertGenerationOutputPlan(fiscalYears, transaction),
    insertFixtureCmn("insertGrossMarginMaster.sql", cmnTransaction),
  ])
}

describe("GET gross margin summary", function () {
  this.timeout(25000)
  before(async () =>
    startTransaction((transaction) =>
      startTransactionCmn((cmnTransaction) =>
        startSnowflakeTransaction((snowflakeTransaction) =>
          beforeHookFixtures(transaction, cmnTransaction, snowflakeTransaction),
        ),
      ),
    ),
  )
  after(async () => {
    await closeTransactionCmn()
    await closeTransaction()
    await rollbackSnowflakeTransaction()
  })

  it("Valid request: get data correctly by plant id", async () => {
    const res = await request(app).get(`${ENDPOINT_PATH}`).set("accept-language", "en").query({
      "plant-id": "HE_",
    })
    const body = res.body as responseType
    expect(res.status).to.eq(200)
    expect(body).to.be.a("object")
    expect(body).keys(["plan", "forecast"])
    expect(body.plan).to.be.a("number")
    expect(body.plan).eql(0)
    expect(body.forecast).to.be.a("number")
  })

  it("Valid request: get data correctly by unit id", async () => {
    const res = await request(app).get(`${ENDPOINT_PATH}`).set("accept-language", "en").query({
      "plant-id": "HE_",
      "unit-id": "HE_A100",
    })
    const body = res.body as responseType
    expect(res.status).to.eq(200)
    expect(body).to.be.a("object")
    expect(body).keys(["plan", "forecast"])
    expect(body.plan).to.be.a("number")
    expect(body.plan).eql(0)
    expect(body.forecast).to.be.a("number")
  })

  it("Valid request: get data correctly by fiscal year", async () => {
    let res = await request(app).get(`${ENDPOINT_PATH}`).set("accept-language", "en").query({
      "plant-id": "HE_",
      "start-fiscal-year": currentFiscalYear(),
    })
    expect(res.status).to.eq(200)

    res = await request(app)
      .get(`${ENDPOINT_PATH}`)
      .set("accept-language", "en")
      .query({
        "plant-id": "HE_",
        "end-fiscal-year": currentFiscalYear() + 2,
      })
    expect(res.status).to.eq(200)
  })

  it("Valid request: get data correctly by fiscal year and return empty data", async () => {
    const res = await request(app)
      .get(`${ENDPOINT_PATH}`)
      .set("accept-language", "en")
      .query({
        "plant-id": "HE_",
        "start-fiscal-year": currentFiscalYear() + 1,
        "end-fiscal-year": currentFiscalYear() - 1,
      })
    const body = res.body as responseType
    expect(res.status).to.eq(200)
    expect(body).to.be.a("object")
    expect(body).keys(["plan", "forecast"])
    expect(body.plan).eql(null)
    expect(body.forecast).eql(null)
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
