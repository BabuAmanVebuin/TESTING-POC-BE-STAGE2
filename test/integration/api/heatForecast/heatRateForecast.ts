import express from "express"
import { expect } from "chai"
import { Transaction } from "sequelize"
import request from "supertest"
import { getHeatRateForecastResponse } from "../../../../src/domain/entities/dpm/heatRateForecast.js"
import { createRouter } from "../../../../src/infrastructure/webserver/express/routes.js"
import { SnowflakeTransaction } from "../../../../src/infrastructure/orm/snowflake/index.js"
import { closeTransaction, startTransaction } from "../../sequelize/index.js"
import { rollbackSnowflakeTransaction, startSnowflakeTransaction } from "../../../snowflake/index.js"
import { currentFiscalYear } from "../../../../src/interface/controllers/dpm/KPI003/helper/businessPlan/businessPlanHelper.js"
import { getTransaction } from "../../../../src/infrastructure/orm/sqlize/index.js"
import { insertGenerationOutputForecastDataForHeatRate, insertHeatRateForecastData } from "./heatRateForecastHelper.js"

const app = express()
app.use(express.json())
app.use("/", createRouter())

const GET_PATH = "/heatrate/forecast"

type responseType = getHeatRateForecastResponse

const beforeHookFixtures = (_transaction: Transaction) => async (_snowflakeTransaction: SnowflakeTransaction) => {
  // empty fixture
}
describe("heatRate forecast", function () {
  this.timeout(10000)

  before(async () => startTransaction((transaction) => startSnowflakeTransaction(beforeHookFixtures(transaction))))

  after(async () => {
    await closeTransaction()
    await rollbackSnowflakeTransaction()
  })

  it("get heatRate forecast: snowflake only", async () => {
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

  it("get heatRate forecast: MySQL Data they are retrieved when exist generation output", async () => {
    const transaction = getTransaction()
    const fiscalYears: [number, number, number] = [
      currentFiscalYear() + 1,
      currentFiscalYear() + 2,
      currentFiscalYear() + 3,
    ]
    await insertHeatRateForecastData(fiscalYears, transaction)
    await insertGenerationOutputForecastDataForHeatRate(fiscalYears, transaction)
    const res = await request(app)
      .get(
        `${GET_PATH}?plant-id=HE_&unit-id=HE_A100&start-fiscal-year=${fiscalYears[0]}&end-fiscal-year=${fiscalYears[2]}`,
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

  it("Valid request: should be able to filter by unit-id correctly", async () => {
    const resUnitId = await request(app)
      .get(`${GET_PATH}`)
      .set("accept-language", "en")
      .query({
        "plant-id": "HE_",
        "unit-id": "HE_A100",
        "start-fiscal-year": currentFiscalYear() + 1,
      })
    expect(resUnitId.status).to.eql(200)
    expect(resUnitId.body).to.be.an("array")
    expect(resUnitId.body.length).to.eql(3, JSON.stringify(resUnitId.body))
    resUnitId.body.forEach((element: any) => {
      expect(element["unit-id"]).to.eq("HE_A100")
    })
  })
  it("Valid request: should be able to filter by unit-id and return empty result", async () => {
    const resUnitId = await request(app).get(`${GET_PATH}`).set("accept-language", "en").query({
      "plant-id": "HE_",
      "unit-id": "DD_100",
    })
    expect(resUnitId.status).to.eql(200)
    expect(resUnitId.body).to.be.an("array")
    expect(resUnitId.body.length).to.eq(0)
  })

  it("Valid request: should be able to filter by fiscal-year correctly", async () => {
    const res = await request(app)
      .get(`${GET_PATH}`)
      .set("accept-language", "en")
      .query({
        "plant-id": "HE_",
        "unit-id": "HE_A100",
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
