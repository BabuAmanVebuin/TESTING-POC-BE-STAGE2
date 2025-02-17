import express from "express"
import { expect } from "chai"
import { Transaction } from "sequelize"
import request from "supertest"
import { createRouter } from "../../../../src/infrastructure/webserver/express/routes.js"
import { startTransaction, closeTransaction, insertFixture } from "../../sequelize/index.js"
import { GenerationOutputPlanSummaryData } from "../../../../src/domain/entities/dpm/generationOutputPlanSummary.js"

const app = express()
app.use(express.json())
app.use("/", createRouter())

const ENDPOINT_PATH = "/generation-output/plan/summary"

type responseType = GenerationOutputPlanSummaryData

const beforeHookFixtures = async (transaction: Transaction) => {
  await insertFixture("insertGenerationOutputPlanSummary.sql", transaction)
}

describe("generation output plan summary tests", function () {
  before(async () => startTransaction((transaction) => beforeHookFixtures(transaction)))
  after(async () => {
    await closeTransaction()
  })

  describe("GET generation output plan summary", function () {
    it("Valid request: should ensure that GET has retrived correct data", async () => {
      const res = await request(app).get(`${ENDPOINT_PATH}`).set("accept-language", "en").query({ "plant-id": "BB_" })
      expect(res.status).to.eql(200)
      expect(res.body).to.be.an("array")
      expect(res.body.length).eq(4)
      res.body.forEach((element: responseType) => {
        expect(element).to.have.keys("plant-id", "fiscal-year", "value")
        if (element["fiscal-year"] === 2030) expect(element.value).to.be.eq(700.0)
      })
    })
    it("Valid request: should be able to filter by fiscal-year correctly", async () => {
      const res = await request(app).get(`${ENDPOINT_PATH}`).set("accept-language", "en").query({
        "plant-id": "BB_",
        "start-fiscal-year": 2000,
        "end-fiscal-year": 2019,
      })
      expect(res.status).to.eql(200)
      expect(res.body).to.be.an("array")
      expect(res.body.length).to.eq(0)
      const res2 = await request(app).get(`${ENDPOINT_PATH}`).set("accept-language", "en").query({
        "plant-id": "BB_",
        "start-fiscal-year": 2020,
        "end-fiscal-year": 2022,
      })
      expect(res2.body.length).to.eq(3)
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
