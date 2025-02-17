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
import { getGrossMarginForecastSummaryResponse } from "../../../src/domain/entities/dpm/grossMarginForecastSummary.js"
import { insertGenerationOutputForecastData } from "./grossMarginForecastSummaryHelper.js"

const app = express()
app.use(express.json())
app.use("/", createRouter())

const GET_PATH = "/thermal-efficiency/forecast/summary"

type responseType = getGrossMarginForecastSummaryResponse

const fiscalYears: [number, number, number] = [
  currentFiscalYear() + 1,
  currentFiscalYear() + 2,
  currentFiscalYear() + 3,
]

const beforeHookFixtures =
  (cmnTransaction: Transaction, transaction: Transaction) => async (_snowflakeTransaction: SnowflakeTransaction) => {
    await Promise.all([
      insertGenerationOutputForecastData(fiscalYears, transaction),
      insertFixtureCmn("insertThermalEfficiencyMaster.sql", cmnTransaction),
    ])
  }

describe("thermal efficiency forecast summary", function () {
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

  it("get thermal efficiency forecast summary: snowflake only", async () => {
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
      expect(value["plant-id"]).is.eq("HE_")
    }
    const fiscalYearList = Array.from(new Set(body.map((x) => x["fiscal-year"])))
    const fiscalYears = [...new Array(currentFiscalYear() - startFiscalYear + 1)].map(
      (_, index) => startFiscalYear + index,
    )
    expect(fiscalYearList).to.members(fiscalYears)
  })

  it("get thermal efficiency forecast summary: MySQL data only", async () => {
    const res = await request(app)
      .get(`${GET_PATH}?plant-id=HE_&start-fiscal-year=${fiscalYears[0]}&end-fiscal-year=${fiscalYears[2] + 1}`)
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
    expect(fiscalYearList).to.members(fiscalYearList)
  })

  it("invalid request: no plant-id", async () => {
    const startFiscalYear = 2022
    const res = await request(app)
      .get(`${GET_PATH}?start-fiscal-year=${startFiscalYear}&end-fiscal-year=${currentFiscalYear()}`)
      .set("accept-language", "en")

    expect(res.status).to.eql(400)
  })
})
