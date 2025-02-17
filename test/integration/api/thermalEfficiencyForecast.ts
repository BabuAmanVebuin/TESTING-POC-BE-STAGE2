import express from "express"
import { expect } from "chai"
import { Transaction } from "sequelize"
import request from "supertest"
import { createRouter } from "../../../src/infrastructure/webserver/express/routes.js"
import {
  startTransaction,
  closeTransaction,
  startTransactionCmn,
  closeTransactionCmn,
  insertFixtureCmn,
} from "../sequelize/index.js"
import { SnowflakeTransaction } from "../../../src/infrastructure/orm/snowflake/index.js"
import { rollbackSnowflakeTransaction, startSnowflakeTransaction } from "../../snowflake/index.js"
import {
  getThermalEfficiencyForecastResponse,
  putThermalEfficiencyForecastRequest,
} from "../../../src/domain/entities/dpm/thermalEfficiencyForecast.js"
import {
  currentFiscalYear,
  fixedNumber,
} from "../../../src/interface/controllers/dpm/KPI003/helper/businessPlan/businessPlanHelper.js"
import { getTransactionCmn } from "../../../src/infrastructure/orm/sqlize/index.js"

const app = express()
app.use(express.json())
app.use("/", createRouter())

const GET_PATH = "/thermal-efficiency/forecast"
const PUT_PATH = "/thermal-efficiency/forecast"

type responseType = getThermalEfficiencyForecastResponse
type putRequestType = putThermalEfficiencyForecastRequest

const beforeHookFixtures =
  (_cmnTransaction: Transaction, _transaction: Transaction) => async (_snowflakeTransaction: SnowflakeTransaction) => {
    // empty fixture
  }
describe("thermal efficiency forecast", function () {
  this.timeout(10000)

  before(async () =>
    startTransaction((transaction) =>
      startTransactionCmn((cmnTransaction) =>
        startSnowflakeTransaction(beforeHookFixtures(cmnTransaction, transaction)),
      ),
    ),
  )

  after(async () => {
    await closeTransactionCmn()
    await closeTransaction()
    await rollbackSnowflakeTransaction()
  })

  it("get thermal efficiency forecast: snowflake only", async () => {
    const startFiscalYear = 2022
    const res = await request(app)
      .get(`${GET_PATH}?plant-id=HE_&start-fiscal-year=${startFiscalYear}&end-fiscal-year=${currentFiscalYear()}`)
      .set("accept-language", "en")

    // Expect 200 status
    expect(res.status).to.eql(200)
    expect(res.body).to.a("array")
    const body = res.body as responseType[]

    for (const value of body) {
      expect(value).to.have.all.keys("plant-id", "unit-id", "fiscal-year", "value", "correction-value", "sum")
      expect(value["fiscal-year"]).is.a("number")
      expect(value["correction-value"]).is.null
      expect(value.value).is.null
      expect(value.sum).is.a("number")
    }
    const fiscalYearList = Array.from(new Set(body.map((x) => x["fiscal-year"])))
    const fiscalYears = [...new Array(currentFiscalYear() - startFiscalYear + 1)].map(
      (_, index) => startFiscalYear + index,
    )
    expect(fiscalYearList).to.eql(fiscalYears)
  })

  it("get thermal efficiency forecast: snowflake and calculated data", async () => {
    const cmnTransaction = getTransactionCmn()
    await insertFixtureCmn("insertThermalEfficiencyMaster.sql", cmnTransaction)
    const startFiscalYear = 2022
    const res = await request(app)
      .get(`${GET_PATH}?plant-id=HE_&start-fiscal-year=${startFiscalYear}&end-fiscal-year=${currentFiscalYear() + 1}`)
      .set("accept-language", "en")

    expect(res.status).to.eql(200)
    expect(res.body).to.a("array")
    const body = res.body as responseType[]

    for (const value of body) {
      if (value["fiscal-year"] === currentFiscalYear() + 1) {
        expect(value).to.have.all.keys("plant-id", "unit-id", "fiscal-year", "value", "correction-value", "sum")
        expect(value["fiscal-year"]).is.a("number")
        expect(value["correction-value"]).is.null
        expect(value.value).is.a("number")
        expect(value.sum).is.a("number")
      }
    }
    const fiscalYearList = Array.from(new Set(body.map((x) => x["fiscal-year"])))
    const fiscalYears = [...new Array(currentFiscalYear() - startFiscalYear + 2)].map(
      (_, index) => startFiscalYear + index,
    )
    expect(fiscalYearList).to.eql(fiscalYears)
  })

  it("insert thermal efficiency forecast", async () => {
    const input: putRequestType = [
      {
        "plant-id": "HE_",
        "unit-id": "HE_A100",
        "fiscal-year": currentFiscalYear() + 1,
        "correction-value": 0.13,
        "user-id": "put test",
      },
      {
        "plant-id": "HE_",
        "unit-id": "HE_A100",
        "fiscal-year": currentFiscalYear() + 2,
        "correction-value": 0.44,
        "user-id": "put test",
      },
    ]
    const insertRes = await request(app).put(PUT_PATH).set("accept-language", "en").send(input)

    expect(insertRes.status).to.eql(200, JSON.stringify(insertRes.body))
    const getRes = await request(app).get(`${GET_PATH}?plant-id=HE_`).set("accept-language", "en")
    const body = getRes.body as responseType[]

    for (const value of body) {
      if (value["fiscal-year"] === currentFiscalYear() + 1 && value["unit-id"] === "HE_A100") {
        const sumAns = (value["correction-value"] || 0) + (value.value || 0)
        expect(value["correction-value"]).is.eql(0.13)
        expect(value.sum).be.eql(fixedNumber(sumAns, 2), JSON.stringify(value))
      }
      if (value["fiscal-year"] === currentFiscalYear() + 2 && value["unit-id"] === "HE_A100") {
        const sumAns = (value["correction-value"] || 0) + (value.value || 0)
        expect(value["correction-value"]).is.eql(0.44)
        expect(value.sum).be.eql(fixedNumber(sumAns, 2), JSON.stringify(value))
      }
    }
    const fiscalYearList = Array.from(new Set(body.map((x) => x["fiscal-year"])))
    expect(fiscalYearList).include(currentFiscalYear() + 1)
    expect(fiscalYearList).include(currentFiscalYear() + 2)
  })

  it("upsert thermal efficiency forecast", async () => {
    const input: putRequestType = [
      {
        "plant-id": "HE_",
        "unit-id": "HE_A100",
        "fiscal-year": currentFiscalYear() + 1,
        "correction-value": 0.2,
        "user-id": "put test",
      },
      {
        "plant-id": "HE_",
        "unit-id": "HE_A100",
        "fiscal-year": currentFiscalYear() + 3,
        "correction-value": 0.36,
        "user-id": "put test",
      },
    ]
    const upsertRes = await request(app).put(PUT_PATH).set("accept-language", "en").send(input)

    expect(upsertRes.status).to.eql(200)
    const getRes = await request(app).get(`${GET_PATH}?plant-id=HE_`).set("accept-language", "en")
    const body = getRes.body as responseType[]

    for (const value of body) {
      if (value["fiscal-year"] === currentFiscalYear() + 1 && value["unit-id"] === "HE_A100") {
        const sumAns = (value["correction-value"] || 0) + (value.value || 0)
        expect(value["correction-value"]).is.eql(0.2)
        expect(value.sum).be.eql(fixedNumber(sumAns, 2), JSON.stringify(value))
      }
      if (value["fiscal-year"] === currentFiscalYear() + 3 && value["unit-id"] === "HE_A100") {
        const sumAns = (value["correction-value"] || 0) + (value.value || 0)
        expect(value["correction-value"]).is.eql(0.36)
        expect(value.sum).be.eql(fixedNumber(sumAns, 2))
      }
    }
    const fiscalYearList = Array.from(new Set(body.map((x) => x["fiscal-year"])))
    expect(fiscalYearList).include(currentFiscalYear() + 1)
    expect(fiscalYearList).include(currentFiscalYear() + 3)
  })

  it("valid: no current thermal efficiency", async () => {
    const input: putRequestType = [
      {
        "plant-id": "XX_",
        "unit-id": "XX_A100",
        "fiscal-year": currentFiscalYear() + 1,
        "correction-value": 0.2,
        "user-id": "put test",
      },
      {
        "plant-id": "XX_",
        "unit-id": "XX_A100",
        "fiscal-year": currentFiscalYear() + 3,
        "correction-value": 0.36,
        "user-id": "put test",
      },
    ]
    const upsertRes = await request(app).put(PUT_PATH).set("accept-language", "en").send(input)

    expect(upsertRes.status).to.eql(200)
    const getRes = await request(app).get(`${GET_PATH}?plant-id=XX_`).set("accept-language", "en")
    expect(getRes.status).to.eql(200)
    expect(getRes.body.length).to.eql(0)
  })

  it("put: invalied: no required request", async () => {
    let input: putRequestType = [
      {
        "unit-id": "XX_A100",
        "fiscal-year": currentFiscalYear() + 1,
        "correction-value": 0.2,
        "user-id": "put test",
      },
    ] as putRequestType
    let upsertRes = await request(app).put(PUT_PATH).set("accept-language", "en").send(input)
    expect(upsertRes.status).to.eql(400)

    input = [
      {
        "plant-id": "XX_",
        "fiscal-year": currentFiscalYear() + 1,
        "correction-value": 0.2,
        "user-id": "put test",
      },
    ] as putRequestType
    upsertRes = await request(app).put(PUT_PATH).set("accept-language", "en").send(input)
    expect(upsertRes.status).to.eql(400)

    input = [
      {
        "plant-id": "XX_",
        "unit-id": "XX_A100",
        "correction-value": 0.2,
        "user-id": "put test",
      },
    ] as putRequestType
    upsertRes = await request(app).put(PUT_PATH).set("accept-language", "en").send(input)
    expect(upsertRes.status).to.eql(400)

    input = [
      {
        "plant-id": "XX_",
        "unit-id": "XX_A100",
        "fiscal-year": currentFiscalYear() + 1,
        "user-id": "put test",
      },
    ] as putRequestType
    upsertRes = await request(app).put(PUT_PATH).set("accept-language", "en").send(input)
    expect(upsertRes.status).to.eql(400)

    input = [
      {
        "plant-id": "XX_",
        "unit-id": "XX_A100",
        "fiscal-year": currentFiscalYear() + 1,
        "correction-value": 0.2,
      },
    ] as putRequestType
    upsertRes = await request(app).put(PUT_PATH).set("accept-language", "en").send(input)
    expect(upsertRes.status).to.eql(400)
  })

  it("get: invalied:  no required request", async () => {
    const getRes = await request(app).get(`${GET_PATH}?`).set("accept-language", "en")
    expect(getRes.status).to.eql(400)
  })
})
