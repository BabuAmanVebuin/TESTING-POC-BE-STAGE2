import express from "express"
import { expect } from "chai"
import { Transaction } from "sequelize"
import request from "supertest"
import { createRouter } from "../../../../src/infrastructure/webserver/express/routes.js"
import { startTransaction, closeTransaction } from "../../sequelize/index.js"
import { currentFiscalYear } from "../../../../src/interface/controllers/dpm/KPI003/helper/businessPlan/businessPlanHelper.js"
import { fiscalYearsArrayType, insertFuelPriceForecast } from "./fuelPriceForecastHelper.js"
import { rollbackSnowflakeTransaction, startSnowflakeTransaction } from "../../../snowflake/index.js"

const app = express()
app.use(express.json())
app.use("/", createRouter())

const ENDPOINT_PATH = "/fuel-cost/forecast"

// Insert fixtures before each test
const beforeHookFixtures = async (transaction: Transaction) => {
  const fiscalYears: fiscalYearsArrayType = [
    currentFiscalYear() + 1,
    currentFiscalYear() + 2,
    currentFiscalYear() + 5,
    currentFiscalYear() + 6,
    currentFiscalYear() + 8,
    currentFiscalYear() + 10,
    currentFiscalYear() + 13,
    currentFiscalYear() + 15,
    currentFiscalYear() + 18,
    currentFiscalYear() + 20,
  ]
  await insertFuelPriceForecast(fiscalYears, transaction)
}

const fuelPriceForecastInputToBeInserted = [
  {
    "plant-id": "KS_",
    "fiscal-year": currentFiscalYear() + 74,
    value: 344,
    "user-id": "test@mail.com",
  },
]

const fuelPriceForecastInputToBeUpdated = [
  {
    "plant-id": "HK_",
    "fiscal-year": currentFiscalYear() + 75,
    value: 455,
    "user-id": "test@mail.com",
  },
]

const nullFuelPriceForecastInputToBeInserted = [
  {
    "plant-id": "N__",
    "fiscal-year": currentFiscalYear() + 31,
    value: null,
    "user-id": "test@mail.com",
  },
]

describe("fuel price forecast tests", function () {
  this.timeout(20000)
  before(async () =>
    startSnowflakeTransaction((_) => startTransaction((transaction) => beforeHookFixtures(transaction))),
  )
  after(async () => {
    await closeTransaction()
    await rollbackSnowflakeTransaction()
  })

  describe("UPSERT fuel price forecast", function () {
    it("Valid request: should insert new data", async () => {
      const res = await request(app)
        .put(`${ENDPOINT_PATH}`)
        .set("accept-language", "en")
        .send(fuelPriceForecastInputToBeInserted)

      expect(res.status).to.eql(200)
      expect(res.body).to.be.a("string")
      expect(res.body).to.equal("OK")
    })

    it("Valid request: should be able to insert null value", async () => {
      const res = await request(app)
        .put(`${ENDPOINT_PATH}`)
        .set("accept-language", "en")
        .send(nullFuelPriceForecastInputToBeInserted)

      expect(res.status).to.eql(200)
      expect(res.body).to.be.a("string")
      expect(res.body).to.equal("OK")
    })

    it("Valid request: should update new data", async () => {
      const res = await request(app)
        .put(`${ENDPOINT_PATH}`)
        .set("accept-language", "en")
        .send(fuelPriceForecastInputToBeUpdated)
      expect(res.status).to.eql(200)
      expect(res.body).to.be.a("string")
      expect(res.body).to.equal("OK")
    })

    it("Bad request: missing required fields: plant-id", async () => {
      const badFuelPriceForecastInput = [
        {
          "fiscal-year": 2021,
          value: 344,
          "user-id": "test@mail.com",
        },
      ]
      const res = await request(app)
        .put(`${ENDPOINT_PATH}`)
        .set("accept-language", "en")
        .send(badFuelPriceForecastInput)
      expect(res.status).to.eql(400)
      expect(res.body).to.include('required property "plant-id"')
    })

    it("Bad request: missing required fields: fiscal-year", async () => {
      const badFuelPriceForecastInput = [
        {
          "plant-id": "HE_",
          value: 344,
          "user-id": "test@mail.com",
        },
      ]
      const res = await request(app)
        .put(`${ENDPOINT_PATH}`)
        .set("accept-language", "en")
        .send(badFuelPriceForecastInput)
      expect(res.status).to.eql(400)
      expect(res.body).to.include('required property "fiscal-year"')
    })

    it("Bad request: missing required fields: value", async () => {
      const badFuelPriceForecastInput = [
        {
          "plant-id": "HE_",
          "fiscal-year": 2021,
          "user-id": "test@mail.com",
        },
      ]
      const res = await request(app)
        .put(`${ENDPOINT_PATH}`)
        .set("accept-language", "en")
        .send(badFuelPriceForecastInput)
      expect(res.status).to.eql(400)
      expect(res.body).to.include('required property "value"')
    })
  })

  describe("GET fuel price forecast", function () {
    describe("Should Ensure that UPSERT API has worked correctly", function () {
      it("Valid request: should ensure that upsert has inserted new data", async () => {
        const res = await request(app)
          .get(`${ENDPOINT_PATH}`)
          .set("accept-language", "en")
          .query({
            "plant-id": "KS_",
            "start-fiscal-year": currentFiscalYear() + 2,
          })
        expect(res.status).to.eql(200)
        expect(res.body).to.be.an("array")
        expect(res.body.length).eq(1)
        expect(res.body[0]).to.have.keys("plant-id", "fiscal-year", "value")
        expect(res.body[0]).deep.equal({
          "plant-id": "KS_",
          "fiscal-year": currentFiscalYear() + 74,
          value: 344,
        })
      })
      it("Valid request: should ensure that upsert has updated old data", async () => {
        const res = await request(app).get(`${ENDPOINT_PATH}`).set("accept-language", "en").query({ "plant-id": "HE_" })
        expect(res.status).to.eql(200)
        expect(res.body).to.be.an("array")
        expect(res.body[0]["value"]).eq(100)
      })
      it("Valid request: should ensure that null value is not coming in response", async () => {
        const res = await request(app).get(`${ENDPOINT_PATH}`).set("accept-language", "en").query({ "plant-id": "N__" })
        expect(res.status).to.eql(200)
        expect(res.body).to.be.an("array")
      })
    })
    it("Valid request: get fuel price forecast: snowflake only", async () => {
      const startFiscalYear = 2022
      const res = await request(app).get(`${ENDPOINT_PATH}`).set("accept-language", "en").query({
        "plant-id": "HE_",
        "start-fiscal-year": startFiscalYear,
        "end-fiscal-year": currentFiscalYear(),
      })
      const fiscalYearList = Array.from(new Set(res.body.map((x: { [x: string]: any }) => x["fiscal-year"])))
      const fiscalYears = [...new Array(currentFiscalYear() - startFiscalYear + 1)].map(
        (_, index) => startFiscalYear + index,
      )
      expect(fiscalYearList).to.eql(fiscalYears)
    })
    it("Valid request: should be able to filter by fiscal-year correctly", async () => {
      const res = await request(app)
        .get(`${ENDPOINT_PATH}`)
        .set("accept-language", "en")
        .query({
          "plant-id": "HE_",
          "start-fiscal-year": currentFiscalYear() + 21,
          "end-fiscal-year": currentFiscalYear() + 25,
        })
      expect(res.status).to.eql(200)
      expect(res.body).to.be.an("array")
      expect(res.body.length).to.eq(0)
      const res2 = await request(app)
        .get(`${ENDPOINT_PATH}`)
        .set("accept-language", "en")
        .query({
          "plant-id": "HE_",
          "start-fiscal-year": currentFiscalYear() + 1,
          "end-fiscal-year": currentFiscalYear() + 30,
        })
      expect(res2.body.length).to.eq(9)
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
