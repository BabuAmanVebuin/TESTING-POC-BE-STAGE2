import express from "express"
import { expect } from "chai"
import { Transaction } from "sequelize"
import request from "supertest"
import { createRouter } from "../../../src/infrastructure/webserver/express/routes.js"
import { insertFixture, startTransaction, closeTransaction } from "../sequelize/index.js"
import { getEbitdaPlanRequest, getEbitdaPlanResponse } from "../../../src/domain/entities/dpm/ebitdaPlan.js"

const app = express()
app.use(express.json())
app.use("/", createRouter())

const ENDPOINT_PATH = "/ebitda/plan"
type requestType = getEbitdaPlanRequest
type responseDataType = getEbitdaPlanResponse

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
      "unit-id": "HE_A100",
    }
    const res = await request(app).get(`${ENDPOINT_PATH}`).set("accept-language", "en").query(input)

    expect(res.status).to.eql(200)
    expect(res.body).to.be.a("array")
    expect(res.body.length).eql(3)
    const body = res.body as responseDataType[]

    const fiscalYears = body.map((x) => x["fiscal-year"])
    expect(fiscalYears).members([2024, 2025, 2026])

    for (const data of body) {
      expect(data).have.keys(["plant-id", "unit-id", "fiscal-year", "value"])
      expect(data["fiscal-year"]).is.a("number")
      expect(data.value).is.a("number")
      expect(data["plant-id"]).eql("HE_")
      expect(data["unit-id"]).eql("HE_A100")

      if (data["fiscal-year"] === 2024) {
        expect(data.value).eql(10.4)
      }
      if (data["fiscal-year"] === 2025) {
        expect(data.value).eql(-10)
      }
      if (data["fiscal-year"] === 2026) {
        expect(data.value).eql(-20.2)
      }
    }
  })

  it("Valid request: filterd by start-fiscal-year", async () => {
    const input: requestType = {
      "plant-id": "HE_",
      "unit-id": "HE_A100",
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
      "unit-id": "HE_A100",
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

  it("Valid request: do not retrieve null opex data", async () => {
    const input: requestType = {
      "plant-id": "HE_",
      "unit-id": "HE_A200",
    }
    const res = await request(app).get(`${ENDPOINT_PATH}`).set("accept-language", "en").query(input)

    expect(res.status).to.eql(200)
    expect(res.body).to.be.a("array")
    expect(res.body.length).eql(2)
    const body = res.body as responseDataType[]

    const fiscalYears = body.map((x) => x["fiscal-year"])
    expect(fiscalYears).members([2024, 2026])
  })

  it("Valid request: do not retrieve null basic charge data", async () => {
    const input: requestType = {
      "plant-id": "HE_",
      "unit-id": "HE_A300",
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

  it("Bad request: missing required fields: unit-id", async () => {
    const input = {
      "plant-id": "HE_",
    }
    const res = await request(app).get(`${ENDPOINT_PATH}`).set("accept-language", "en").query(input)
    expect(res.status).to.eql(400)
    expect(res.body).to.include('required property "unit-id"')
  })
})
