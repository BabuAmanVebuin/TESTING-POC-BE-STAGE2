import express from "express"
import { expect } from "chai"
import { Transaction } from "sequelize"
import request from "supertest"
import { createRouter } from "../../../../src/infrastructure/webserver/express/routes.js"
import { startTransaction, closeTransaction, insertFixture } from "../../sequelize/index.js"
import { getBasicChargeForecastSummaryData } from "../../../../src/domain/entities/dpm/basicChargeForecastSummary.js"

const app = express()
app.use(express.json())
app.use("/", createRouter())

const ENDPOINT_PATH = "/basic-charge/forecast/summary"

type responseType = getBasicChargeForecastSummaryData

const beforeHookFixtures = async (transaction: Transaction) => {
  await insertFixture("insertBasicChargeForecastSummary.sql", transaction)
}

describe("Basic Charge Forecast summary tests", function () {
  before(async () => startTransaction((transaction) => beforeHookFixtures(transaction)))
  after(async () => {
    await closeTransaction()
  })

  describe("GET Basic Charge Forecast summary", function () {
    it("Valid request: should ensure that GET has retrived correct data", async () => {
      const res = await request(app).get(`${ENDPOINT_PATH}`).set("accept-language", "en").query({ "plant-id": "HE_" })
      expect(res.status).to.eql(200)
      expect(res.body).to.be.an("array")
      expect(res.body.length).eq(5)
      res.body.forEach((element: responseType) => {
        expect(element).to.have.keys("plant-id", "fiscal-year", "value")
        if (element["fiscal-year"] === 2024) {
          expect(element.value).to.be.eq(2060.56)
        }
      })
    })
    it("Valid request: should be able to filter by fiscal-year correctly", async () => {
      const res = await request(app).get(`${ENDPOINT_PATH}`).set("accept-language", "en").query({
        "plant-id": "HE_",
        "start-fiscal-year": 2020,
        "end-fiscal-year": 2023,
      })
      expect(res.status).to.eql(200)
      expect(res.body).to.be.an("array")
      expect(res.body.length).to.eq(2)
      const res2 = await request(app).get(`${ENDPOINT_PATH}`).set("accept-language", "en").query({
        "plant-id": "HE_",
        "start-fiscal-year": 2024,
        "end-fiscal-year": 2025,
      })
      expect(res2.body.length).to.eq(2)
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
        "plant-id": "HE_",
        "start-fiscal-year": "abc",
        "end-fiscal-year": "abc",
      })
      expect(res.status).to.eql(400)
    })
  })
})
