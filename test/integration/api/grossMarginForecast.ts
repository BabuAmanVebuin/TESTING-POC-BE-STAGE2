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
import { getGrossMarginForecastResponse } from "../../../src/domain/entities/dpm/grossMarginForecast.js"
import { getTransaction, getTransactionCmn } from "../../../src/infrastructure/orm/sqlize/index.js"
import { insertGenerationOutputForecastData, insertFuelPriceForecastData } from "./grossMarginForecastSummaryHelper.js"

const app = express()
app.use(express.json())
app.use("/", createRouter())

const GET_PATH = "/grossmargin/forecast"

type responseType = getGrossMarginForecastResponse

const beforeHookFixtures =
  (_cmnTransaction: Transaction, _transaction: Transaction) => async (_snowflakeTransaction: SnowflakeTransaction) => {
    // empty fixture
  }
describe("gross margin forecast", function () {
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

  it("get gross margin forecast: snowflake only", async () => {
    const startFiscalYear = 2022
    const res = await request(app)
      .get(
        `${GET_PATH}?plant-id=HE_&unit-id=HE_A100&start-fiscal-year=${startFiscalYear}&end-fiscal-year=${currentFiscalYear()}`,
      )
      .set("accept-language", "en")

    expect(res.status).to.eql(200)
    expect(res.body).to.a("array")
    const body = res.body as responseType[]

    for (const value of body) {
      expect(value).to.have.all.keys("plant-id", "unit-id", "fiscal-year", "value")
      expect(value["fiscal-year"]).is.a("number")
      expect(value.value).is.a("number")
    }
    const fiscalYearList = Array.from(new Set(body.map((x) => x["fiscal-year"])))
    const fiscalYears = [...new Array(currentFiscalYear() - startFiscalYear + 1)].map(
      (_, index) => startFiscalYear + index,
    )
    expect(fiscalYearList).to.members(fiscalYears)
  })

  it("get gross margin forecast summary: MySQL Data", async () => {
    const transaction = getTransaction()
    const cmnTransaction = getTransactionCmn()
    const fiscalYears: [number, number, number] = [
      currentFiscalYear() + 1,
      currentFiscalYear() + 2,
      currentFiscalYear() + 3,
    ]
    await Promise.all([
      insertGenerationOutputForecastData(fiscalYears, transaction),
      insertFuelPriceForecastData(fiscalYears, transaction),
      insertFixtureCmn("insertGrossMarginMaster.sql", cmnTransaction),
    ])
    const res = await request(app)
      .get(
        `${GET_PATH}?plant-id=HE_&unit-id=HE_A100&start-fiscal-year=${
          fiscalYears[0]
        }&end-fiscal-year=${fiscalYears[2] + 1}`,
      )
      .set("accept-language", "en")

    expect(res.status).to.eql(200)
    expect(res.body).to.a("array")
    const body = res.body as responseType[]

    for (const value of body) {
      expect(value).to.have.all.keys("plant-id", "unit-id", "fiscal-year", "value")
      expect(value["fiscal-year"]).is.a("number")
      expect(value.value).is.a("number")
    }
    const fiscalYearList = Array.from(new Set(body.map((x) => x["fiscal-year"])))
    expect(fiscalYearList).to.members(fiscalYears)
  })

  it("invalid request: no plant-id", async () => {
    const startFiscalYear = 2022
    const res = await request(app)
      .get(`${GET_PATH}?unit-id=HE_A100&start-fiscal-year=${startFiscalYear}&end-fiscal-year=${currentFiscalYear()}`)
      .set("accept-language", "en")

    expect(res.status).to.eql(400)
  })

  it("invalid request: no unit-id", async () => {
    const startFiscalYear = 2022
    const res = await request(app)
      .get(`${GET_PATH}?plant-id=HE_&start-fiscal-year=${startFiscalYear}&end-fiscal-year=${currentFiscalYear()}`)
      .set("accept-language", "en")

    expect(res.status).to.eql(400)
  })
})
