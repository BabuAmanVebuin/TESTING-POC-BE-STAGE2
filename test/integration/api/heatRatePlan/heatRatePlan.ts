import express from "express"
import { expect } from "chai"
import { Transaction } from "sequelize"
import request from "supertest"
import { createRouter } from "../../../../src/infrastructure/webserver/express/routes.js"
import {
  startTransaction,
  closeTransaction,
  insertFixture,
  startTransactionCmn,
  closeTransactionCmn,
} from "../../sequelize/index.js"

const app = express()
app.use(express.json())
app.use("/", createRouter())

const ENDPOINT_PATH = "/heatrate/plan"

const beforeHookFixtures = async (cmnTransaction: Transaction, transaction: Transaction) => {
  await insertFixture("insertPpaThermalEffeciencyForHeatRatePlan.sql", cmnTransaction)
  await insertFixture("insertGenerationOutputPlanForHeatRatePlan.sql", transaction)
}

describe("GET heatrate plan", function () {
  before(async () =>
    startTransaction((transaction) =>
      startTransactionCmn((cmnTransaction) => beforeHookFixtures(cmnTransaction, transaction)),
    ),
  )

  after(async () => {
    await closeTransactionCmn()
    await closeTransaction()
  })
  it("Valid request: should be able to return valid types and keys", async () => {
    const res = await request(app).get(`${ENDPOINT_PATH}`).set("accept-language", "en").query({
      "plant-id": "HE_",
      "unit-id": "HE_A100",
    })
    expect(res.status).to.eql(200)
    expect(res.body).to.be.an("array")
    expect(res.body.length).to.eq(3)
    for (const heatRatePlan of res.body) {
      expect(heatRatePlan).to.have.all.keys("plant-id", "unit-id", "fiscal-year", "value")
      expect(heatRatePlan["plant-id"]).to.be.a("string")
      expect(heatRatePlan["unit-id"]).to.be.a("string")
      expect(heatRatePlan["fiscal-year"]).to.be.a("number")
      expect(heatRatePlan["value"]).to.be.a("number")
    }
  })
  it("Valid request: should be able to return valid result (calculate valid `value`(ppa thermal effeciency) )", async () => {
    const res = await request(app).get(`${ENDPOINT_PATH}`).set("accept-language", "en").query({
      "plant-id": "HE_",
      "unit-id": "HE_A100",
      "start-fiscal-year": 2024,
      "end-fiscal-year": 2024,
    })
    expect(res.status).to.eql(200)
    expect(res.body).to.be.an("array")
    expect(res.body.length).to.eq(1)
    expect(res.body[0].value).to.be.a("number")
    expect(res.body[0].value).to.eq(6649.43)
  })
  it("Valid request: should be able to return valid result (calculate valid `value`(ppa thermal effeciency) with value = 0 )", async () => {
    const res = await request(app).get(`${ENDPOINT_PATH}`).set("accept-language", "en").query({
      "plant-id": "HE_",
      "unit-id": "HE_A400",
    })
    expect(res.status).to.eql(200)
    expect(res.body).to.be.an("array")
    expect(res.body.length).to.eq(1)
    expect(res.body[0].value).to.eq(null)
  })
  it("Valid request: should be able to return valid result when `value` is not null and `correction-value` is null", async () => {
    const res = await request(app).get(`${ENDPOINT_PATH}`).set("accept-language", "en").query({
      "plant-id": "HE_",
      "unit-id": "HE_A100",
    })
    expect(res.status).to.eql(200)
    expect(res.body).to.be.an("array")
    expect(res.body.length).to.eq(3)
  })
  it("Valid request: should be able to return valid result when `value` is null and `correction-value` is not null", async () => {
    const res = await request(app).get(`${ENDPOINT_PATH}`).set("accept-language", "en").query({
      "plant-id": "HE_",
      "unit-id": "HE_A200",
    })
    expect(res.status).to.eql(200)
    expect(res.body).to.be.an("array")
    expect(res.body.length).to.eq(3)
  })
  it("Valid request: should be able to return valid result when `value` and `correction-value` are both null", async () => {
    const res = await request(app).get(`${ENDPOINT_PATH}`).set("accept-language", "en").query({
      "plant-id": "HE_",
      "unit-id": "HE_A300",
    })
    expect(res.status).to.eql(200)
    expect(res.body).to.be.an("array")
    expect(res.body.length).to.eq(2)
  })
  it("Valid request: should be able to filter by `plant-id` and `unit-id` correctly", async () => {
    const res = await request(app).get(`${ENDPOINT_PATH}`).set("accept-language", "en").query({
      "plant-id": "HE_",
      "unit-id": "HE_A100",
    })
    expect(res.status).to.eql(200)
    expect(res.body).to.be.an("array")
    for (const heatRatePlan of res.body) {
      expect(heatRatePlan["plant-id"]).to.be.a("string")
      expect(heatRatePlan["plant-id"]).to.eq("HE_")
      expect(heatRatePlan["unit-id"]).to.be.a("string")
      expect(heatRatePlan["unit-id"]).to.eq("HE_A100")
    }
  })
  it("Valid request: should be able to filter by `fiscal-year` correctly", async () => {
    const res = await request(app).get(`${ENDPOINT_PATH}`).set("accept-language", "en").query({
      "plant-id": "HE_",
      "unit-id": "HE_A100",
      "start-fiscal-year": 2019,
      "end-fiscal-year": 2021,
    })
    expect(res.status).to.eql(200)
    expect(res.body).to.be.an("array")
    expect(res.body.length).to.eq(0)

    const res2 = await request(app).get(`${ENDPOINT_PATH}`).set("accept-language", "en").query({
      "plant-id": "HE_",
      "unit-id": "HE_A100",
      "start-fiscal-year": 2025,
      "end-fiscal-year": 2026,
    })
    expect(res2.body.length).to.eq(2)
  })
  it("Bad request: missing required fields: `plant-id`", async () => {
    const res = await request(app).get(`${ENDPOINT_PATH}`).set("accept-language", "en").query({
      "unit-id": "HE_A100",
      "start-fiscal-year": 2024,
      "end-fiscal-year": 2025,
    })
    expect(res.status).to.eql(400)
  })
  it("Bad request: missing required fields: unit-id", async () => {
    const res = await request(app).get(`${ENDPOINT_PATH}`).set("accept-language", "en").query({
      "plant-id": "HE_",
      "start-fiscal-year": 2024,
      "end-fiscal-year": 2025,
    })
    expect(res.status).to.eql(400)
  })
  it("Bad request: `start-fiscal-year` and `end-fiscal-year` have wrong types", async () => {
    const res = await request(app).get(`${ENDPOINT_PATH}`).set("accept-language", "en").query({
      "plant-id": "BB_",
      "start-fiscal-year": "abc",
      "end-fiscal-year": "abc",
    })
    expect(res.status).to.eql(400)
  })
})
