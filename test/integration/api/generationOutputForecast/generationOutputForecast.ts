import express from "express"
import { expect } from "chai"
import { Transaction } from "sequelize"
import request from "supertest"
import { createRouter } from "../../../../src/infrastructure/webserver/express/routes.js"
import { startTransaction, closeTransaction, insertFixture } from "../../sequelize/index.js"
import { rollbackSnowflakeTransaction, startSnowflakeTransaction } from "../../../snowflake/index.js"
import { currentFiscalYear } from "../../../../src/interface/controllers/dpm/KPI003/helper/businessPlan/businessPlanHelper.js"
import { getTransaction } from "../../../../src/infrastructure/orm/sqlize/index.js"
import { beforeGenerationOutputForecastTest } from "./generationOutputForecastHelper.js"
import { getGenerationOutputForecastResponse } from "../../../../src/domain/entities/dpm/generationOutputForecast.js"

const app = express()
app.use(express.json())
app.use("/", createRouter())

type responseDataType = getGenerationOutputForecastResponse

const ENDPOINT_PATH = "/generation-output/forecast"

const beforeHookFixtures = async (transaction: Transaction) => {
  const fiscalYears: [number, number, number, number] = [
    currentFiscalYear() + 5,
    currentFiscalYear() + 10,
    currentFiscalYear() + 15,
    currentFiscalYear() + 6,
  ]
  await beforeGenerationOutputForecastTest(fiscalYears, transaction)
}

const generationOuptutForecastInputToBeInserted = [
  {
    "plant-id": "FF_",
    "unit-id": "FF_100",
    "fiscal-year": currentFiscalYear() + 5,
    value: 0,
    "correction-value": 0,
    "user-id": "person@email.com",
  },
  {
    "plant-id": "CC_",
    "unit-id": "HE_100",
    "fiscal-year": currentFiscalYear() + 5,
    value: 0,
    "correction-value": 0,
    "user-id": "person@email.com",
  },
  {
    "plant-id": "CC_",
    "unit-id": "HE_33",
    "fiscal-year": currentFiscalYear() + 6,
    value: 0,
    "correction-value": 0,
    "user-id": "person@email.com",
  },
  {
    "plant-id": "CC_",
    "unit-id": "HE_33",
    "fiscal-year": currentFiscalYear() + 5,
    value: 0,
    "correction-value": 0,
    "user-id": "person@email.com",
  },
]
const generationOuptutForecastInputToBeUpdated = [
  {
    "plant-id": "AA_",
    "unit-id": "AA_100",
    "fiscal-year": currentFiscalYear() + 5,
    value: 20,
    "correction-value": 50,
    "user-id": "person@email.com",
  },
]

describe("generation output forecast tests", function () {
  this.timeout(20000)
  before(async () =>
    startSnowflakeTransaction((_) => startTransaction((transaction) => beforeHookFixtures(transaction))),
  )
  after(async () => {
    await closeTransaction()
    await rollbackSnowflakeTransaction()
  })

  describe("UPSERT generation output forecast", function () {
    it("Valid request: should insert new data", async () => {
      const res = await request(app)
        .put(`${ENDPOINT_PATH}`)
        .set("accept-language", "en")
        .send(generationOuptutForecastInputToBeInserted)

      expect(res.status).to.eql(200)
      expect(res.body).to.be.a("string")
      expect(res.body).to.equal("OK")
    })

    it("Valid request: should update new data", async () => {
      const res = await request(app)
        .put(`${ENDPOINT_PATH}`)
        .set("accept-language", "en")
        .send(generationOuptutForecastInputToBeUpdated)
      expect(res.status).to.eql(200)
      expect(res.body).to.be.a("string")
      expect(res.body).to.equal("OK")
    })

    it("Bad request: missing required fields: plant-id", async () => {
      const badGenerationOuptutForecastInput = [
        {
          "unit-id": "AA_100",
          "fiscal-year": 2023,
          value: 20,
          "correction-value": 50,
          "user-id": "person@email.com",
        },
      ]
      const res = await request(app)
        .put(`${ENDPOINT_PATH}`)
        .set("accept-language", "en")
        .send(badGenerationOuptutForecastInput)
      expect(res.status).to.eql(400)
      expect(res.body).to.include('required property "plant-id"')
    })

    it("Bad request: missing required fields: unit-id", async () => {
      const badGenerationOuptutForecastInput = [
        {
          "plant-id": "AA_",
          "fiscal-year": 2023,
          value: 20,
          "correction-value": 50,
          "user-id": "person@email.com",
        },
      ]
      const res = await request(app)
        .put(`${ENDPOINT_PATH}`)
        .set("accept-language", "en")
        .send(badGenerationOuptutForecastInput)
      expect(res.status).to.eql(400)
      expect(res.body).to.include('required property "unit-id"')
    })

    it("Bad request: missing required fields: fiscal-year", async () => {
      const badGenerationOuptutForecastInput = [
        {
          "plant-id": "AA_",
          "unit-id": "AA_100",
          value: 20,
          "correction-value": 50,
          "user-id": "person@email.com",
        },
      ]
      const res = await request(app)
        .put(`${ENDPOINT_PATH}`)
        .set("accept-language", "en")
        .send(badGenerationOuptutForecastInput)
      expect(res.status).to.eql(400)
      expect(res.body).to.include('required property "fiscal-year"')
    })

    it("Bad request: missing required fields: value", async () => {
      const badGenerationOuptutForecastInput = [
        {
          "plant-id": "AA_",
          "unit-id": "AA_100",
          "fiscal-year": 2023,
          "correction-value": 50,
          "user-id": "person@email.com",
        },
      ]
      const res = await request(app)
        .put(`${ENDPOINT_PATH}`)
        .set("accept-language", "en")
        .send(badGenerationOuptutForecastInput)
      expect(res.status).to.eql(400)
      expect(res.body).to.include('required property "value"')
    })

    it("Bad request: missing required fields: correction-value", async () => {
      const badGenerationOuptutForecastInput = [
        {
          "plant-id": "HE_",
          "unit-id": "HE_100",
          "fiscal-year": 2023,
          value: 0,
          "user-id": "person@email.com",
        },
      ]
      const res = await request(app)
        .put(`${ENDPOINT_PATH}`)
        .set("accept-language", "en")
        .send(badGenerationOuptutForecastInput)
      expect(res.status).to.eql(400)
      expect(res.body).to.include('required property "correction-value"')
    })

    it("Bad request: missing required fields: user-id", async () => {
      const badGenerationOuptutForecastInput = [
        {
          "plant-id": "HE_",
          "unit-id": "HE_100",
          "fiscal-year": 2023,
          value: 0,
          "correction-value": 0,
        },
      ]
      const res = await request(app)
        .put(`${ENDPOINT_PATH}`)
        .set("accept-language", "en")
        .send(badGenerationOuptutForecastInput)
      expect(res.status).to.eql(400)
      expect(res.body).to.include('required property "user-id"')
    })
  })
  describe("GET generation output forecast", function () {
    describe("Should Ensure that UPSERT API has worked correctly", function () {
      it("Valid request: should ensure that upsert has inserted new data", async () => {
        const res = await request(app).get(`${ENDPOINT_PATH}`).set("accept-language", "en").query({ "plant-id": "FF_" })
        expect(res.status).to.eql(200)
        expect(res.body).to.be.an("array")
        expect(res.body.length).eq(1)
        expect(res.body[0]).to.have.keys("plant-id", "unit-id", "fiscal-year", "value", "correction-value", "sum")
        expect(res.body[0]).deep.equal({
          "plant-id": "FF_",
          "unit-id": "FF_100",
          "fiscal-year": currentFiscalYear() + 5,
          value: 0.0,
          "correction-value": 0.0,
          sum: 0.0,
        })
        const { value, ["correction-value"]: correctionValue } = generationOuptutForecastInputToBeInserted[0]
        expect(res.body[0].sum).eq(value + correctionValue)
      })

      it("Valid request: should ensure that upsert has updated old data", async () => {
        const res = await request(app).get(`${ENDPOINT_PATH}`).set("accept-language", "en").query({ "plant-id": "AA_" })
        expect(res.status).to.eql(200)
        expect(res.body).to.be.an("array")
        expect(res.body[0].value).eq(20.0)
        expect(res.body[0]["correction-value"]).eq(50.0)
        expect(res.body[0].sum).eq(70.0)
      })
    })

    it("Valid request: get generation output forecast: snowflake only", async () => {
      const startFiscalYear = 2022
      const res = await request(app).get(`${ENDPOINT_PATH}`).set("accept-language", "en").query({
        "plant-id": "HE_",
        "start-fiscal-year": startFiscalYear,
        "end-fiscal-year": currentFiscalYear(),
      })
      const body = res.body as responseDataType[]
      const fiscalYearList = Array.from(new Set(body.map((x) => x["fiscal-year"])))
      const fiscalYears = [...new Array(currentFiscalYear() - startFiscalYear + 1)].map(
        (_, index) => startFiscalYear + index,
      )
      expect(fiscalYearList).to.eql(fiscalYears)
    })

    it("Valid request: get generation output forecast: snowflake and calculated data", async () => {
      const transaction = getTransaction()
      await insertFixture("insertGenerationOutputForecast.sql", transaction)
      const startFiscalYear = 2022
      const res = await request(app)
        .get(`${ENDPOINT_PATH}`)
        .set("accept-language", "en")
        .query({
          "plant-id": "HE_",
          "start-fiscal-year": startFiscalYear,
          "end-fiscal-year": currentFiscalYear(),
        })
      const body = res.body as responseDataType[]
      for (const value of body) {
        if (value["fiscal-year"] === currentFiscalYear() + 1) {
          expect(value).to.have.all.keys("plant-id", "unit-id", "fiscal-year", "value", "correction-value", "sum")
        }
      }
      const fiscalYearList = Array.from(new Set(body.map((x) => x["fiscal-year"]))).sort()
      const fiscalYears = [...new Array(currentFiscalYear() - startFiscalYear + 1)].map(
        (_, index) => startFiscalYear + index,
      )
      expect(fiscalYearList).to.eql(fiscalYears)
    })
    it("Valid request: should be able to filter by unit-id correctly", async () => {
      const resUnitId = await request(app).get(`${ENDPOINT_PATH}`).set("accept-language", "en").query({
        "plant-id": "CC_",
        "unit-id": "HE_33",
      })
      expect(resUnitId.status).to.eql(200)
      expect(resUnitId.body).to.be.an("array")
      const body = resUnitId.body as responseDataType[]
      body.forEach((element) => {
        expect(element["unit-id"]).to.eq("HE_33")
      })
      expect(resUnitId.body.length).to.eq(2)
    })
    it("Valid request: should be able to filter by unit-id and return empty result", async () => {
      const resUnitId2 = await request(app).get(`${ENDPOINT_PATH}`).set("accept-language", "en").query({
        "plant-id": "HE_",
        "unit-id": "HE_5",
      })
      expect(resUnitId2.status).to.eql(200)
      expect(resUnitId2.body).to.be.an("array")
      expect(resUnitId2.body.length).to.eq(0)
    })

    it("Valid request: should be able to filter by fiscal-year correctly", async () => {
      const res = await request(app)
        .get(`${ENDPOINT_PATH}`)
        .set("accept-language", "en")
        .query({
          "plant-id": "BB_",
          "start-fiscal-year": 2020,
          "end-fiscal-year": currentFiscalYear() + 1,
        })
      expect(res.status).to.eql(200)
      expect(res.body).to.be.an("array")
      expect(res.body.length).to.eq(0)
      const res2 = await request(app)
        .get(`${ENDPOINT_PATH}`)
        .set("accept-language", "en")
        .query({
          "plant-id": "BB_",
          "start-fiscal-year": currentFiscalYear() + 5,
          "end-fiscal-year": currentFiscalYear() + 15,
        })
      expect(res2.body.length).to.eq(3)
    })
    it("Valid request: cannot get value and correction value are null data", async () => {
      const resUnitId = await request(app).get(`${ENDPOINT_PATH}`).set("accept-language", "en").query({
        "plant-id": "CC_",
        "unit-id": "CC_100",
      })
      expect(resUnitId.status).to.eql(200)
      expect(resUnitId.body).to.be.an("array")
      expect(resUnitId.body.length).to.eq(1)
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
