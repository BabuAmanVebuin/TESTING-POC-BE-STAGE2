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
import { getThermalEfficiencyPlanSummaryResponse } from "../../../src/domain/entities/dpm/thermalEfficiencyPlanSummary.js"

const app = express()
app.use(express.json())
app.use("/", createRouter())

const GET_PATH = "/thermal-efficiency/plan/summary"

type responseType = getThermalEfficiencyPlanSummaryResponse

const beforeHookFixtures =
  (cmnTransaction: Transaction, transaction: Transaction) => async (_snowflakeTransaction: SnowflakeTransaction) => {
    await Promise.all([
      insertFixtureCmn("insertThermalEfficiencyPlanSummaryMaster.sql", cmnTransaction),
      insertFixture("insertGenerationOutputPlanForThermalEfficiencyPlanSummary.sql", transaction),
    ])
  }

describe("thermal efficiency forecast", function () {
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

  it("get thermal efficiency plan summary", async () => {
    const getRes = await request(app).get(`${GET_PATH}?plant-id=HE_`).set("accept-language", "en")
    expect(getRes.status).to.eql(200)
    expect(getRes.body).to.a("array")

    const body = getRes.body as responseType[]
    expect(body.length).to.eql(3)

    body.forEach((x) => {
      expect(x).to.have.all.keys("plant-id", "fiscal-year", "value")
      expect(x["fiscal-year"]).is.a("number", JSON.stringify(x))
      expect(x.value).is.a("number", JSON.stringify(body))
      expect(x.value).is.eql(54.14)
    })
  })

  it("get thermal efficiency plan summary: filterd by start fiscal year", async () => {
    const getRes = await request(app)
      .get(`${GET_PATH}?plant-id=HE_&start-fiscal-year=2023`)
      .set("accept-language", "en")
    expect(getRes.status).to.eql(200)
    expect(getRes.body).to.a("array")

    const body = getRes.body as responseType[]
    expect(body.length).to.eql(2)

    body.forEach((x) => {
      expect(x).to.have.all.keys("plant-id", "fiscal-year", "value")
      expect(x["fiscal-year"]).is.a("number", JSON.stringify(x))
      expect(x["fiscal-year"]).is.oneOf([2023, 2024])
    })
  })

  it("get thermal efficiency plan summary: filterd by end fiscal year", async () => {
    const getRes = await request(app).get(`${GET_PATH}?plant-id=HE_&end-fiscal-year=2023`).set("accept-language", "en")
    expect(getRes.status).to.eql(200)
    expect(getRes.body).to.a("array")

    const body = getRes.body as responseType[]
    expect(body.length).to.eql(2)

    body.forEach((x) => {
      expect(x).to.have.all.keys("plant-id", "fiscal-year", "value")
      expect(x["fiscal-year"]).is.a("number", JSON.stringify(x))
      expect(x["fiscal-year"]).is.oneOf([2023, 2022])
    })
  })

  it("get thermal efficiency plan summary: filterd by start and end fiscal year", async () => {
    const getRes = await request(app)
      .get(`${GET_PATH}?plant-id=HE_&start-fiscal-year=2022&end-fiscal-year=2022`)
      .set("accept-language", "en")
    expect(getRes.status).to.eql(200)
    expect(getRes.body).to.a("array")

    const body = getRes.body as responseType[]
    expect(body.length).to.eql(1)

    body.forEach((x) => {
      expect(x).to.have.all.keys("plant-id", "fiscal-year", "value")
      expect(x["fiscal-year"]).is.a("number", JSON.stringify(x))
      expect(x["fiscal-year"]).is.eql(2022)
    })
  })

  it("get: invalied:  no required request", async () => {
    const getRes = await request(app).get(`${GET_PATH}?`).set("accept-language", "en")
    expect(getRes.status).to.eql(400)
  })
})
