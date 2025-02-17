import express from "express"
import { expect } from "chai"
import { Transaction } from "sequelize"
import request from "supertest"
import { createRouter } from "../../../../src/infrastructure/webserver/express/routes.js"
import { startTransaction, closeTransaction, insertFixture } from "../../sequelize/index.js"

const app = express()
app.use(express.json())
app.use("/", createRouter())

const ENDPOINT_PATH = "/basic-charge/plan"

// Insert fixtures before each test
const beforeHookFixtures = async (transaction: Transaction) => {
  await insertFixture("beforeUpsertBasicChargePlan.sql", transaction)
}

const basicChargePlanInputToBeInserted = [
  {
    "plant-id": "KS_",
    "unit-id": "KS_A100",
    "fiscal-year": 2021,
    "operation-input": 344.34,
    "maintenance-input": 12.41,
    "user-id": "test@mail.com",
  },
]

const basicChargePlanInputToBeUpdated = [
  {
    "plant-id": "HK_",
    "unit-id": "HK_A100",
    "fiscal-year": 2021,
    "operation-input": 455.23,
    "maintenance-input": 34.21,
    "user-id": "test@mail.com",
  },
]

describe("Basic charge plan tests", function () {
  before(async () => startTransaction((transaction) => beforeHookFixtures(transaction)))

  after(async () => {
    await closeTransaction()
  })

  describe("UPSERT basic charge plan", function () {
    it("Valid request: should insert new data", async () => {
      const res = await request(app)
        .put(`${ENDPOINT_PATH}`)
        .set("accept-language", "en")
        .send(basicChargePlanInputToBeInserted)

      expect(res.status).to.eql(200)
      expect(res.body).to.be.a("string")
      expect(res.body).to.equal("OK")
    })

    it("Valid request: should update new data", async () => {
      const res = await request(app)
        .put(`${ENDPOINT_PATH}`)
        .set("accept-language", "en")
        .send(basicChargePlanInputToBeUpdated)
      expect(res.status).to.eql(200)
      expect(res.body).to.be.a("string")
      expect(res.body).to.equal("OK")
    })

    it("Bad request: missing required fields: plant-id", async () => {
      const badBasicChargePlanInput = [
        {
          "unit-id": "HE_A100",
          "fiscal-year": 2021,
          "operation-input": 344.34,
          "maintenance-input": 12.41,
          "user-id": "test@mail.com",
        },
      ]
      const res = await request(app).put(`${ENDPOINT_PATH}`).set("accept-language", "en").send(badBasicChargePlanInput)
      expect(res.status).to.eql(400)
      expect(res.body).to.include('required property "plant-id"')
    })

    it("Bad request: missing required fields: unit-id", async () => {
      const badBasicChargePlanInput = [
        {
          "plant-id": "HE_",
          "fiscal-year": 2021,
          "operation-input": 344.34,
          "maintenance-input": 12.41,
          "user-id": "test@mail.com",
        },
      ]
      const res = await request(app).put(`${ENDPOINT_PATH}`).set("accept-language", "en").send(badBasicChargePlanInput)
      expect(res.status).to.eql(400)
      expect(res.body).to.include('required property "unit-id"')
    })

    it("Bad request: missing required fields: fiscal-year", async () => {
      const badBasicChargePlanInput = [
        {
          "plant-id": "HE_",
          "unit-id": "HE_A100",
          "operation-input": 344.34,
          "maintenance-input": 12.41,
          "user-id": "test@mail.com",
        },
      ]
      const res = await request(app).put(`${ENDPOINT_PATH}`).set("accept-language", "en").send(badBasicChargePlanInput)
      expect(res.status).to.eql(400)
      expect(res.body).to.include('required property "fiscal-year"')
    })

    it("Bad request: missing required fields: operation-input", async () => {
      const badBasicChargePlanInput = [
        {
          "plant-id": "HE_",
          "unit-id": "HE_A100",
          "fiscal-year": 2021,
          "maintenance-input": 12.41,
          "user-id": "test@mail.com",
        },
      ]
      const res = await request(app).put(`${ENDPOINT_PATH}`).set("accept-language", "en").send(badBasicChargePlanInput)
      expect(res.status).to.eql(400)
      expect(res.body).to.include('required property "operation-input"')
    })

    it("Bad request: missing required fields: maintenance-input", async () => {
      const badBasicChargePlanInput = [
        {
          "plant-id": "HE_",
          "unit-id": "HE_A100",
          "fiscal-year": 2021,
          "operation-input": 344.34,
          "user-id": "test@mail.com",
        },
      ]
      const res = await request(app).put(`${ENDPOINT_PATH}`).set("accept-language", "en").send(badBasicChargePlanInput)
      expect(res.status).to.eql(400)
      expect(res.body).to.include('required property "maintenance-input"')
    })

    it("Bad request: missing required fields: user-id", async () => {
      const badBasicChargePlanInput = [
        {
          "plant-id": "HE_",
          "unit-id": "HE_A100",
          "fiscal-year": 2021,
          "operation-input": 344.34,
          "maintenance-input": 12.41,
        },
      ]
      const res = await request(app).put(`${ENDPOINT_PATH}`).set("accept-language", "en").send(badBasicChargePlanInput)
      expect(res.status).to.eql(400)
      expect(res.body).to.include('required property "user-id"')
    })
  })
  describe("GET basic charge plan", function () {
    describe("Should Ensure that UPSERT API has worked correctly", function () {
      it("Valid request: should ensure that upsert has inserted new data", async () => {
        const res = await request(app).get(`${ENDPOINT_PATH}`).set("accept-language", "en").query({ "plant-id": "KS_" })
        expect(res.status).to.eql(200)
        expect(res.body).to.be.an("array")
        expect(res.body.length).eq(1)
        expect(res.body[0]).to.have.keys(
          "plant-id",
          "unit-id",
          "fiscal-year",
          "operation-input",
          "maintenance-input",
          "sum",
        )
        expect(res.body[0]).deep.equal({
          "plant-id": "KS_",
          "unit-id": "KS_A100",
          "fiscal-year": 2021,
          "operation-input": 344.34,
          "maintenance-input": 12.41,
          sum: 356.75,
        })

        expect(res.body[0].sum).eq(
          basicChargePlanInputToBeInserted[0]["operation-input"] +
            basicChargePlanInputToBeInserted[0]["maintenance-input"],
        )
      })

      it("Valid request: should ensure that upsert has updated old data", async () => {
        const res = await request(app).get(`${ENDPOINT_PATH}`).set("accept-language", "en").query({ "plant-id": "HK_" })
        expect(res.status).to.eql(200)
        expect(res.body).to.be.an("array")
        expect(res.body[0]["operation-input"]).eq(455.23)
        expect(res.body[0]["maintenance-input"]).eq(34.21)
        expect(res.body[0].sum).eq(489.44)
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
      expect(res.body.length).to.eq(0)
      const res2 = await request(app).get(`${ENDPOINT_PATH}`).set("accept-language", "en").query({
        "plant-id": "HE_",
        "start-fiscal-year": 2020,
        "end-fiscal-year": 2022,
      })
      expect(res2.body.length).to.eq(6)
    })
    it("Valid request: should be able to filter by unit-id correctly", async () => {
      const res = await request(app).get(`${ENDPOINT_PATH}`).set("accept-language", "en").query({
        "plant-id": "HE_",
        "unit-id": "HE_A100",
      })
      expect(res.status).to.eql(200)
      expect(res.body).to.be.an("array")
      expect(res.body.length).to.eq(4)
      for (const basicCharge of res.body) {
        expect(basicCharge["unit-id"]).to.be.a("string")
        expect(basicCharge["unit-id"]).to.eq("HE_A100")
      }
    })
    it("Valid request: should be able to filter by unit-id and return empty result", async () => {
      const res = await request(app).get(`${ENDPOINT_PATH}`).set("accept-language", "en").query({
        "plant-id": "HE_",
        "unit-id": "HE_A600",
      })
      expect(res.status).to.eql(200)
      expect(res.body).to.be.an("array")
      expect(res.body.length).to.eq(0)
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
