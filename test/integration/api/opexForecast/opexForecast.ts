import express from "express"
import { expect } from "chai"
import { Transaction } from "sequelize"
import request from "supertest"
import { createRouter } from "../../../../src/infrastructure/webserver/express/routes.js"
import { startTransaction, closeTransaction, readSqlFile } from "../../sequelize/index.js"
import { rollbackSnowflakeTransaction, startSnowflakeTransaction } from "../../../snowflake/index.js"
import { currentFiscalYear } from "../../../../src/interface/controllers/dpm/KPI003/helper/businessPlan/businessPlanHelper.js"
import { getTransaction } from "../../../../src/infrastructure/orm/sqlize/index.js"
import { opexForecastTest } from "./opexForecastHelper.js"

const app = express()
app.use(express.json())
app.use("/", createRouter())

const ENDPOINT_PATH = "/opex/forecast"

const upsertOpexQuery = readSqlFile("inserts", "beforeUpsertOpexForecast.sql")
const insertOpexQuery = readSqlFile("inserts", "insertOpexForecast.sql")

const beforeHookFixtures = async (transaction: Transaction) => {
  const fiscalYears: number[] = [
    currentFiscalYear() + 7,
    currentFiscalYear() + 12,
    currentFiscalYear() + 17,
    currentFiscalYear() + 7,
  ]
  await opexForecastTest(upsertOpexQuery, fiscalYears, transaction)
}

const opexForecastInputToBeInserted = [
  {
    "plant-id": "FF_",
    "unit-id": "FF_100",
    "fiscal-year": currentFiscalYear() + 7,
    "operation-cost": "20.00",
    "maintenance-cost": "40.00",
    "user-id": "person@email.com",
  },
  {
    "plant-id": "CC_",
    "unit-id": "HE_100",
    "fiscal-year": currentFiscalYear() + 7,
    "operation-cost": "0.00",
    "maintenance-cost": "30.00",
    "user-id": "person@email.com",
  },
  {
    "plant-id": "CC_",
    "unit-id": "HE_33",
    "fiscal-year": currentFiscalYear() + 8,
    "operation-cost": "15.00",
    "maintenance-cost": "20.00",
    "user-id": "person@email.com",
  },
  {
    "plant-id": "CC_",
    "unit-id": "HE_33",
    "fiscal-year": currentFiscalYear() + 7,
    "operation-cost": "1.00",
    "maintenance-cost": "12.00",
    "user-id": "person@email.com",
  },
]
const opexForecastInputToBeUpdated = [
  {
    "plant-id": "AA_",
    "unit-id": "AA_100",
    "fiscal-year": currentFiscalYear() + 7,
    "operation-cost": "20.00",
    "maintenance-cost": "50.00",
    "user-id": "person@email.com",
  },
]

describe("opex forecast tests", function () {
  this.timeout(25000)
  before(async () =>
    startSnowflakeTransaction((_) => startTransaction((transaction) => beforeHookFixtures(transaction))),
  )
  after(async () => {
    await closeTransaction()
    await rollbackSnowflakeTransaction()
  })

  describe("UPSERT opex forecast", function () {
    it("Valid request: should insert new data", async () => {
      const res = await request(app)
        .put(`${ENDPOINT_PATH}`)
        .set("accept-language", "en")
        .send(opexForecastInputToBeInserted)
      expect(res.status).to.eql(200)
      expect(res.body).to.be.a("string")
      expect(res.body).to.equal("OK")
    })

    it("Valid request: should update new data", async () => {
      const res = await request(app)
        .put(`${ENDPOINT_PATH}`)
        .set("accept-language", "en")
        .send(opexForecastInputToBeUpdated)
      expect(res.status).to.eql(200)
      expect(res.body).to.be.a("string")
      expect(res.body).to.equal("OK")
    })

    it("Bad request: missing required fields: plant-id", async () => {
      const badOpexForecastInput = [
        {
          "unit-id": "AA_100",
          "fiscal-year": currentFiscalYear(),
          "operation-cost": "20.00",
          "maintenance-cost": "50.00",
          "user-id": "person@email.com",
        },
      ]
      const res = await request(app).put(`${ENDPOINT_PATH}`).set("accept-language", "en").send(badOpexForecastInput)
      expect(res.status).to.eql(400)
      expect(res.body).to.include('required property "plant-id"')
    })

    it("Bad request: missing required fields: unit-id", async () => {
      const badOpexForecastInput = [
        {
          "plant-id": "AA_",
          "fiscal-year": currentFiscalYear(),
          "operation-cost": "20.00",
          "maintenance-cost": "50.00",
          "user-id": "person@email.com",
        },
      ]
      const res = await request(app).put(`${ENDPOINT_PATH}`).set("accept-language", "en").send(badOpexForecastInput)
      expect(res.status).to.eql(400)
      expect(res.body).to.include('required property "unit-id"')
    })

    it("Bad request: missing required fields: fiscal-year", async () => {
      const badOpexForecastInput = [
        {
          "plant-id": "AA_",
          "unit-id": "AA_100",
          "operation-cost": "20.00",
          "maintenance-cost": "50.00",
          "user-id": "person@email.com",
        },
      ]
      const res = await request(app).put(`${ENDPOINT_PATH}`).set("accept-language", "en").send(badOpexForecastInput)
      expect(res.status).to.eql(400)
      expect(res.body).to.include('required property "fiscal-year"')
    })

    it("Bad request: missing required fields: operation-cost", async () => {
      const badOpexForecastInput = [
        {
          "plant-id": "AA_",
          "unit-id": "AA_100",
          "fiscal-year": currentFiscalYear(),
          "maintenance-cost": "50.00",
          "user-id": "person@email.com",
        },
      ]
      const res = await request(app).put(`${ENDPOINT_PATH}`).set("accept-language", "en").send(badOpexForecastInput)
      expect(res.status).to.eql(400)
      expect(res.body).to.include('required property "operation-cost"')
    })

    it("Bad request: missing required fields: maintenance-cost", async () => {
      const badOpexForecastInput = [
        {
          "plant-id": "HE_",
          "unit-id": "HE_100",
          "fiscal-year": currentFiscalYear(),
          "operation-cost": "0.00",
          "user-id": "person@email.com",
        },
      ]
      const res = await request(app).put(`${ENDPOINT_PATH}`).set("accept-language", "en").send(badOpexForecastInput)
      expect(res.status).to.eql(400)
      expect(res.body).to.include('required property "maintenance-cost"')
    })

    it("Bad request: missing required fields: user-id", async () => {
      const badOpexForecastInput = [
        {
          "plant-id": "HE_",
          "unit-id": "HE_100",
          "fiscal-year": currentFiscalYear(),
          "operation-cost": "0.00",
          "maintenance-cost": "0.00",
        },
      ]
      const res = await request(app).put(`${ENDPOINT_PATH}`).set("accept-language", "en").send(badOpexForecastInput)
      expect(res.status).to.eql(400)
      expect(res.body).to.include('required property "user-id"')
    })
  })
  describe("GET opex forecast", function () {
    describe("Should Ensure that UPSERT API has worked correctly", function () {
      it("Valid request: should ensure that upsert has inserted new data", async () => {
        const res = await request(app).get(`${ENDPOINT_PATH}`).set("accept-language", "en").query({ "plant-id": "FF_" })
        expect(res.status).to.eql(200)
        expect(res.body).to.be.an("array")
        expect(res.body.length).eq(1)
        expect(res.body[0]).to.have.keys(
          "plant-id",
          "unit-id",
          "fiscal-year",
          "operation-cost",
          "maintenance-cost",
          "sum",
        )
        expect(res.body[0]["plant-id"]).to.be.a("string")
        expect(res.body[0]["unit-id"]).to.be.a("string")
        expect(res.body[0]["fiscal-year"]).to.be.a("number")
        expect(res.body[0]["operation-cost"]).to.be.a("number")
        expect(res.body[0]["maintenance-cost"]).to.be.a("number")
        expect(res.body[0]["sum"]).to.be.a("number")
        expect(res.body[0]).deep.equal({
          "plant-id": "FF_",
          "unit-id": "FF_100",
          "fiscal-year": currentFiscalYear() + 7,
          "operation-cost": 20.0,
          "maintenance-cost": 40.0,
          sum: 60.0,
        })
        const { ["operation-cost"]: operationCost, ["maintenance-cost"]: maintenanceCost } =
          opexForecastInputToBeInserted[0]
        expect(res.body[0].sum).eq(Number((Number(operationCost) + Number(maintenanceCost)).toFixed(2)))
      })

      it("Valid request: should ensure that upsert has updated old data", async () => {
        const res = await request(app)
          .get(`${ENDPOINT_PATH}`)
          .set("accept-language", "en")
          .query({
            "plant-id": "AA_",
            "unit-id": "AA_100",
            "start-fiscal-year": currentFiscalYear() + 7,
            "end-fiscal-year": currentFiscalYear() + 7,
          })
        const { ["operation-cost"]: operationCost, ["maintenance-cost"]: maintenanceCost } = res.body[0]
        expect(res.status).to.eql(200)
        expect(res.body).to.be.an("array")
        expect(res.body[0]["operation-cost"]).eq(20.0)
        expect(res.body[0]["maintenance-cost"]).eq(50.0)
        expect(res.body[0].sum).eq(Number((Number(operationCost) + Number(maintenanceCost)).toFixed(2)))
      })
    })
    describe("Should Ensure that GET API has worked correctly", function () {
      it("Valid request: get opex forecast: snowflake only", async () => {
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
      it("Valid request: get opex forecast: snowflake and calculated data from SQL", async () => {
        const transaction = getTransaction()
        // We only want to pass one fiscal year (1 bind in sql query)
        const insertFiscalYears: number[] = [currentFiscalYear() + 1]
        await opexForecastTest(insertOpexQuery, insertFiscalYears, transaction)
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
            expect(value).to.have.all.keys(
              "plant-id",
              "unit-id",
              "fiscal-year",
              "operation-cost",
              "maintenance-cost",
              "sum",
            )
          }
        }
        const fiscalYearList = Array.from(new Set(body.map((x: { [x: string]: any }) => x["fiscal-year"]))).sort()
        const fiscalYears = [...new Array(currentFiscalYear() - startFiscalYear + 2)].map(
          (_, index) => startFiscalYear + index,
        )
        expect(fiscalYearList).to.eql(fiscalYears)
      })
      it("Valid request: get opex forecast: return null value for operation-cost", async () => {
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
      it("Valid request: get opex forecast: return null value for maintenance-cost", async () => {
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
      it("Valid request: should be able to filter by unit-id correctly", async () => {
        const resUnitId = await request(app).get(`${ENDPOINT_PATH}`).set("accept-language", "en").query({
          "plant-id": "CC_",
          "unit-id": "HE_33",
        })
        expect(resUnitId.status).to.eql(200)
        expect(resUnitId.body).to.be.an("array")
        resUnitId.body.forEach((element: any) => {
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
            "start-fiscal-year": currentFiscalYear() + 7,
            "end-fiscal-year": currentFiscalYear() + 17,
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
})
