import express from "express"
import { expect } from "chai"
import { Transaction } from "sequelize"
import request from "supertest"
import { createRouter } from "../../../../src/infrastructure/webserver/express/routes.js"
import { startTransaction, closeTransaction, readSqlFile } from "../../sequelize/index.js"
import { currentFiscalYear } from "../../../../src/interface/controllers/dpm/KPI003/helper/businessPlan/businessPlanHelper.js"
import { getOpexForecastSummaryResponse } from "../../../../src/domain/entities/dpm/opexForecastSummary.js"
import { opexForecastTest } from "./opexForecastHelper.js"
import { getTransaction } from "../../../../src/infrastructure/orm/sqlize/index.js"

const app = express()
app.use(express.json())
app.use("/", createRouter())

const ENDPOINT_PATH = "/opex/forecast/summary"

const insertOpexQuery = readSqlFile("inserts", "insertOpexForecastSummary.sql")
const insertOpexForecastSfQuery = readSqlFile("inserts", "insertOpexForecast.sql")

type responseType = getOpexForecastSummaryResponse

const beforeHookFixtures = async (transaction: Transaction) => {
  const fiscalYears: number[] = [currentFiscalYear() + 7, currentFiscalYear() + 10, currentFiscalYear() + 5]
  await opexForecastTest(insertOpexQuery, fiscalYears, transaction)
}

describe("opex forecast summary tests", function () {
  this.timeout(25000)
  before(async () => startTransaction((transaction) => beforeHookFixtures(transaction)))
  after(async () => {
    await closeTransaction()
  })
  describe("GET opex forecast summary", function () {
    it("Valid request: should ensure that GET has retrieved correct data and has calculated correct sum of opeartion-cost and maintenance-cost and sum ", async () => {
      const res = await request(app).get(`${ENDPOINT_PATH}`).set("accept-language", "en").query({ "plant-id": "BB_" })
      expect(res.body.length).eq(3)
      expect(res.status).to.eql(200)
      expect(res.body).to.be.an("array")
      res.body.forEach((element: responseType) => {
        expect(element).to.have.keys("plant-id", "fiscal-year", "operation-cost", "maintenance-cost", "sum")
        expect(element["plant-id"]).to.be.a("string")
        expect(element["fiscal-year"]).to.be.a("number")
        expect(element["operation-cost"]).to.be.a("number")
        expect(element["maintenance-cost"]).to.be.a("number")
        expect(element["sum"]).to.be.a("number")
        if (element["fiscal-year"] === currentFiscalYear() + 10) {
          expect(element["operation-cost"]).to.be.eq(10.0)
          expect(element["maintenance-cost"]).to.be.eq(40.0)
          expect(element.sum).to.be.eq(50.0)
        }
      })
    })
    it("Valid request: should ensure that GET has calculated correct sum of opeartion-cost and maintenance-cost and sum in case of some values are null", async () => {
      const res = await request(app).get(`${ENDPOINT_PATH}`).set("accept-language", "en").query({ "plant-id": "BE_" })
      expect(res.status).to.eql(200)
      expect(res.body).to.be.an("array")
      expect(res.body.length).eq(1)
      res.body.forEach((element: responseType) => {
        expect(element).to.have.keys("plant-id", "fiscal-year", "operation-cost", "maintenance-cost", "sum")
        expect(element["operation-cost"]).to.be.eq(20.0)
        expect(element["maintenance-cost"]).to.be.eq(12.0)
        expect(element.sum).to.be.eq(32.0)
      })
    })
    it("Valid request: should ensure that GET has return empty result because all values of (operation and maintenance)-cost are null", async () => {
      const res = await request(app).get(`${ENDPOINT_PATH}`).set("accept-language", "en").query({ "plant-id": "DE_" })
      expect(res.status).to.eql(200)
      expect(res.body).to.be.an("array")
      expect(res.body.length).eq(0)
    })
    it("Valid request: should be able to filter by fiscal-year correctly", async () => {
      const res = await request(app).get(`${ENDPOINT_PATH}`).set("accept-language", "en").query({
        "plant-id": "BB_",
        "start-fiscal-year": 2000,
        "end-fiscal-year": 2010,
      })
      expect(res.status).to.eql(200)
      expect(res.body).to.be.an("array")
      expect(res.body.length).to.eq(0)
      const res2 = await request(app)
        .get(`${ENDPOINT_PATH}`)
        .set("accept-language", "en")
        .query({
          "plant-id": "BB_",
          "start-fiscal-year": currentFiscalYear(),
          "end-fiscal-year": currentFiscalYear() + 5,
        })
      expect(res2.body.length).to.eq(1)
    })
    it("Valid request: get opex forecast summary: snowflake only", async () => {
      const startFiscalYear = 2022
      const res = await request(app).get(`${ENDPOINT_PATH}`).set("accept-language", "en").query({
        "plant-id": "HE_",
        "start-fiscal-year": startFiscalYear,
        "end-fiscal-year": currentFiscalYear(),
      })
      const body = res.body as responseType[]
      for (const value of body) {
        expect(value).to.have.keys("plant-id", "fiscal-year", "operation-cost", "maintenance-cost", "sum")
      }
      const fiscalYearList = Array.from(new Set(body.map((x) => x["fiscal-year"]))).sort()
      const fiscalYears = [...new Array(currentFiscalYear() - startFiscalYear + 1)].map(
        (_, index) => startFiscalYear + index,
      )
      expect(fiscalYearList).to.eql(fiscalYears)
    })
    it("Valid request: get opex forecast summary: snowflake and calculated data from SQL", async () => {
      const transaction = getTransaction()
      // We only want to pass one fiscal year (1 bind in sql query)
      const insertFiscalYears: number[] = [currentFiscalYear() + 1]
      await opexForecastTest(insertOpexForecastSfQuery, insertFiscalYears, transaction)
      const startFiscalYear = 2022
      const res = await request(app)
        .get(`${ENDPOINT_PATH}`)
        .set("accept-language", "en")
        .query({
          "plant-id": "HE_",
          "start-fiscal-year": startFiscalYear,
          "end-fiscal-year": currentFiscalYear() + 1,
        })
      const { body } = res
      for (const value of body) {
        if (value["fiscal-year"] === currentFiscalYear() + 1) {
          expect(value).to.have.all.keys("plant-id", "fiscal-year", "operation-cost", "maintenance-cost", "sum")
        }
      }
      const fiscalYearList = Array.from(new Set(body.map((x: { [x: string]: any }) => x["fiscal-year"]))).sort()
      const fiscalYears = [...new Array(currentFiscalYear() - startFiscalYear + 2)].map(
        (_, index) => startFiscalYear + index,
      )
      expect(fiscalYearList).to.eql(fiscalYears)
    })
    it("Valid request: get opex forecast summary: return null value for operation-cost", async () => {
      const res = await request(app)
        .get(`${ENDPOINT_PATH}`)
        .set("accept-language", "en")
        .query({
          "plant-id": "CC_",
          "start-fiscal-year": currentFiscalYear() + 7,
          "end-fiscal-year": currentFiscalYear() + 7,
        })
      const { body } = res
      expect(body[0]["operation-cost"]).is.null
    })
    it("Valid request: get opex forecast: summary return null value for maintenance-cost", async () => {
      const res = await request(app)
        .get(`${ENDPOINT_PATH}`)
        .set("accept-language", "en")
        .query({
          "plant-id": "DD_",
          "start-fiscal-year": currentFiscalYear() + 7,
          "end-fiscal-year": currentFiscalYear() + 7,
        })
      const { body } = res
      expect(body[0]["maintenance-cost"]).is.null
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
})
