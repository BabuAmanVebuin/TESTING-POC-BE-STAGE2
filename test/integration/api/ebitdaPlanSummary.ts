import express from "express"
import { expect } from "chai"
import { Transaction } from "sequelize"
import request from "supertest"
import { createRouter } from "../../../src/infrastructure/webserver/express/routes.js"
import { insertFixture, startTransaction, closeTransaction } from "../sequelize/index.js"
import {
  getEbitdaPlanSummaryRequest,
  getEbitdaPlanSummaryResponse,
} from "../../../src/domain/entities/dpm/ebitdaPlanSummary.js"

const app = express()
app.use(express.json())
app.use("/", createRouter())

const ENDPOINT_PATH = "/ebitda/plan/summary"
type requestType = getEbitdaPlanSummaryRequest
type responseDataType = getEbitdaPlanSummaryResponse

const beforeHookFixtures = async (transaction: Transaction) => {
  await insertFixture("beforeEbitdaPlan.sql", transaction)
}

describe("get EBITDA plan data tests", function () {
  before(async () => startTransaction((transaction) => beforeHookFixtures(transaction)))
  after(async () => {
    await closeTransaction()
  })

  it("Valid request: get all unit data", async () => {
    const input: requestType = {
      "plant-id": "HE_",
    }
    const res = await request(app).get(`${ENDPOINT_PATH}`).set("accept-language", "en").query(input)

    expect(res.status).to.eql(200)
    expect(res.body).to.be.a("array")
    expect(res.body.length).eql(3)
    const body = res.body as responseDataType[]

    const fiscalYears = body.map((x) => x["fiscal-year"])
    expect(fiscalYears).members([2024, 2025, 2026])

    for (const data of body) {
      expect(data).have.keys(["plant-id", "fiscal-year", "value"])
      expect(data["fiscal-year"]).is.a("number")
      expect(data.value).is.a("number")
      expect(data["plant-id"]).eql("HE_")

      if (data["fiscal-year"] === 2024) {
        expect(data.value).eql(30.4, JSON.stringify(body))
      }
      if (data["fiscal-year"] === 2025) {
        expect(data.value).eql(40.8)
      }
      if (data["fiscal-year"] === 2026) {
        expect(data.value).eql(-10.2)
      }
    }
  })

  it("Valid request: filterd by start-fiscal-year", async () => {
    const input: requestType = {
      "plant-id": "HE_",
      "start-fiscal-year": 2025,
    }
    const res = await request(app).get(`${ENDPOINT_PATH}`).set("accept-language", "en").query(input)

    expect(res.status).to.eql(200)
    expect(res.body).to.be.a("array")
    expect(res.body.length).eql(2)
    const body = res.body as responseDataType[]

    const fiscalYears = body.map((x) => x["fiscal-year"])
    expect(fiscalYears).members([2025, 2026])
  })

  it("Valid request: filterd by end-fiscal-year", async () => {
    const input: requestType = {
      "plant-id": "HE_",
      "end-fiscal-year": 2025,
    }
    const res = await request(app).get(`${ENDPOINT_PATH}`).set("accept-language", "en").query(input)

    expect(res.status).to.eql(200)
    expect(res.body).to.be.a("array")
    expect(res.body.length).eql(2)
    const body = res.body as responseDataType[]

    const fiscalYears = body.map((x) => x["fiscal-year"])
    expect(fiscalYears).members([2024, 2025])
  })

  it("Bad request: missing required fields: plant-id", async () => {
    const input = {
      "unit-id": "HE_A300",
    }
    const res = await request(app).get(`${ENDPOINT_PATH}`).set("accept-language", "en").query(input)
    expect(res.status).to.eql(400)
    expect(res.body).to.include('required property "plant-id"')
  })
})
