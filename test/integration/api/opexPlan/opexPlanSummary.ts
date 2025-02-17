import express from "express"
import { expect } from "chai"
import { Transaction } from "sequelize"
import request from "supertest"
import { createRouter } from "../../../../src/infrastructure/webserver/express/routes.js"
import { startTransaction, closeTransaction, insertFixture } from "../../sequelize/index.js"
import { opexPlanSummaryData } from "../../../../src/domain/entities/dpm/opexPlanSummary.js"

const app = express()
app.use(express.json())
app.use("/", createRouter())

const ENDPOINT_PATH = "/opex/plan/summary"

type responseType = opexPlanSummaryData

const beforeHookFixtures = async (transaction: Transaction) => {
  await insertFixture("insertOpexPlanSummary.sql", transaction)
}

describe("opex plan summary tests", function () {
  before(async () => startTransaction((transaction) => beforeHookFixtures(transaction)))
  after(async () => {
    await closeTransaction()
  })
  describe("GET opex plan summary", function () {
    it("Valid request: should ensure that GET has retrieved correct data and has calculated correct sum of opeartion-cost and maintenance-cost and sum ", async () => {
      const res = await request(app).get(`${ENDPOINT_PATH}`).set("accept-language", "en").query({ "plant-id": "BB_" })
      expect(res.status).to.eql(200)
      expect(res.body).to.be.an("array")
      expect(res.body.length).eq(4)
      res.body.forEach((element: responseType) => {
        expect(element).to.have.keys("plant-id", "fiscal-year", "operation-cost", "maintenance-cost", "sum")
        expect(element["plant-id"]).to.be.a("string")
        expect(element["fiscal-year"]).to.be.a("number")
        expect(element["operation-cost"]).to.be.a("number")
        expect(element["maintenance-cost"]).to.be.a("number")
        expect(element["sum"]).to.be.a("number")
        if (element["fiscal-year"] === 2030) {
          expect(element.sum).to.be.eq(700.0)
          expect(element["operation-cost"]).to.be.eq(320.0)
          expect(element["maintenance-cost"]).to.be.eq(380.0)
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
        if (element["fiscal-year"] === 2019) {
          expect(element.sum).to.be.eq(95.0)
          expect(element["operation-cost"]).to.be.eq(25.0)
          expect(element["maintenance-cost"]).to.be.eq(70.0)
        }
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
    it("Valid request: return null value for operation-cost", async () => {
      const res = await request(app).get(`${ENDPOINT_PATH}`).set("accept-language", "en").query({
        "plant-id": "EE_",
      })
      expect(res.status).to.eql(200)
      expect(res.body).to.be.an("array")
      expect(res.body.length).to.eq(1)
      const { body } = res
      expect(body[0]["operation-cost"]).is.null
    })
    it("Valid request: return null value for maintenance-cost", async () => {
      const res = await request(app).get(`${ENDPOINT_PATH}`).set("accept-language", "en").query({
        "plant-id": "FF_",
      })
      expect(res.status).to.eql(200)
      expect(res.body).to.be.an("array")
      expect(res.body.length).to.eq(1)
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
