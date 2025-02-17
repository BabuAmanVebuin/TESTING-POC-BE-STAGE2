import express from "express"
import { expect } from "chai"
import { Transaction } from "sequelize"
import request from "supertest"
import { createRouter } from "../../../../src/infrastructure/webserver/express/routes.js"
import { startTransaction, closeTransaction, insertFixture } from "../../sequelize/index.js"

const app = express()
app.use(express.json())
app.use("/", createRouter())

const ENDPOINT_PATH = "/fuel-cost/plan"

// Insert fixtures before each test
const beforeHookFixtures = async (transaction: Transaction) => {
  await insertFixture("beforeUpsertFuelPricePlan.sql", transaction)
}

const fuelPricePlanInputToBeInserted = [
  {
    "plant-id": "KS_",
    "fiscal-year": 2098,
    value: 344,
    "user-id": "test@mail.com",
  },
]

const fuelPricePlanInputToBeUpdated = [
  {
    "plant-id": "HK_",
    "fiscal-year": 2099,
    value: 455,
    "user-id": "test@mail.com",
  },
]

const nullFuelPricePlanInputToBeInserted = [
  {
    "plant-id": "N__",
    "fiscal-year": 2055,
    value: null,
    "user-id": "test@mail.com",
  },
]

describe("fuel price plan tests", function () {
  before(async () => startTransaction((transaction) => beforeHookFixtures(transaction)))

  after(async () => {
    await closeTransaction()
  })

  describe("UPSERT fuel price plan", function () {
    it("Valid request: should insert new data", async () => {
      const res = await request(app)
        .put(`${ENDPOINT_PATH}`)
        .set("accept-language", "en")
        .send(fuelPricePlanInputToBeInserted)

      expect(res.status).to.eql(200)
      expect(res.body).to.be.a("string")
      expect(res.body).to.equal("OK")
    })

    it("Valid request: should be able to insert null value", async () => {
      const res = await request(app)
        .put(`${ENDPOINT_PATH}`)
        .set("accept-language", "en")
        .send(nullFuelPricePlanInputToBeInserted)

      expect(res.status).to.eql(200)
      expect(res.body).to.be.a("string")
      expect(res.body).to.equal("OK")
    })

    it("Valid request: should update new data", async () => {
      const res = await request(app)
        .put(`${ENDPOINT_PATH}`)
        .set("accept-language", "en")
        .send(fuelPricePlanInputToBeUpdated)
      expect(res.status).to.eql(200)
      expect(res.body).to.be.a("string")
      expect(res.body).to.equal("OK")
    })

    it("Bad request: missing required fields: plant-id", async () => {
      const badFuelPricePlanInput = [
        {
          "fiscal-year": 2021,
          value: 344,
          "user-id": "test@mail.com",
        },
      ]
      const res = await request(app).put(`${ENDPOINT_PATH}`).set("accept-language", "en").send(badFuelPricePlanInput)
      expect(res.status).to.eql(400)
      expect(res.body).to.include('required property "plant-id"')
    })

    it("Bad request: missing required fields: fiscal-year", async () => {
      const badFuelPricePlanInput = [
        {
          "plant-id": "HE_",
          value: 344,
          "user-id": "test@mail.com",
        },
      ]
      const res = await request(app).put(`${ENDPOINT_PATH}`).set("accept-language", "en").send(badFuelPricePlanInput)
      expect(res.status).to.eql(400)
      expect(res.body).to.include('required property "fiscal-year"')
    })

    it("Bad request: missing required fields: value", async () => {
      const badFuelPricePlanInput = [
        {
          "plant-id": "HE_",
          "fiscal-year": 2021,
          "user-id": "test@mail.com",
        },
      ]
      const res = await request(app).put(`${ENDPOINT_PATH}`).set("accept-language", "en").send(badFuelPricePlanInput)
      expect(res.status).to.eql(400)
      expect(res.body).to.include('required property "value"')
    })
  })

  describe("GET fuel price plan", function () {
    describe("Should Ensure that UPSERT API has worked correctly", function () {
      it("Valid request: should ensure that upsert has inserted new data", async () => {
        const res = await request(app).get(`${ENDPOINT_PATH}`).set("accept-language", "en").query({ "plant-id": "KS_" })
        expect(res.status).to.eql(200)
        expect(res.body).to.be.an("array")
        expect(res.body.length).eq(1)
        expect(res.body[0]).to.have.keys("plant-id", "fiscal-year", "value")
        expect(res.body[0]).deep.equal({
          "plant-id": "KS_",
          "fiscal-year": 2098,
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
        expect(res.body.length).to.eq(0)
      })
    })
    it("Valid request: should be able to filter by fiscal-year correctly", async () => {
      const res = await request(app).get(`${ENDPOINT_PATH}`).set("accept-language", "en").query({
        "plant-id": "HE_",
        "start-fiscal-year": 2000,
        "end-fiscal-year": 2019,
      })
      expect(res.status).to.eql(200)
      expect(res.body).to.be.an("array")
      expect(res.body.length).to.eq(2)
      const res2 = await request(app).get(`${ENDPOINT_PATH}`).set("accept-language", "en").query({
        "plant-id": "HE_",
        "start-fiscal-year": 2020,
        "end-fiscal-year": 3000,
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
