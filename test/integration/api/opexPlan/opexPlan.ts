import express from "express"
import { expect } from "chai"
import { Transaction } from "sequelize"
import request from "supertest"
import { createRouter } from "../../../../src/infrastructure/webserver/express/routes.js"
import { startTransaction, closeTransaction, insertFixture } from "../../sequelize/index.js"

const app = express()
app.use(express.json())
app.use("/", createRouter())

const ENDPOINT_PATH = "/opex/plan"

const beforeHookFixtures = async (transaction: Transaction) => {
  await insertFixture("beforeUpsertOpexPlan.sql", transaction)
}

const opexPlanInputToBeInserted = [
  {
    "plant-id": "HE_",
    "unit-id": "HE_100",
    "fiscal-year": 2023,
    "operation-cost": "40.00",
    "maintenance-cost": "35.00",
    "user-id": "person@email.com",
  },
]

const opexPlanInputToBeUpdated = [
  {
    "plant-id": "AA_",
    "unit-id": "AA_100",
    "fiscal-year": 2023,
    "operation-cost": "20.00",
    "maintenance-cost": "50.00",
    "user-id": "person@email.com",
  },
]

describe("opex plan tests", function () {
  before(async () => startTransaction((transaction) => beforeHookFixtures(transaction)))
  after(async () => {
    await closeTransaction()
  })

  describe("UPSERT opex plan", function () {
    it("Valid request: should insert new data", async () => {
      const res = await request(app)
        .put(`${ENDPOINT_PATH}`)
        .set("accept-language", "en")
        .send(opexPlanInputToBeInserted)
      expect(res.status).to.eql(200)
      expect(res.body).to.be.a("string")
      expect(res.body).to.equal("OK")
    })
    it("Valid request: should update new data", async () => {
      const res = await request(app).put(`${ENDPOINT_PATH}`).set("accept-language", "en").send(opexPlanInputToBeUpdated)
      expect(res.status).to.eql(200)
      expect(res.body).to.be.a("string")
      expect(res.body).to.equal("OK")
    })
    it("Bad request: missing required fields: plant-id", async () => {
      const badOpexPlanInput = [
        {
          "unit-id": "AA_100",
          "fiscal-year": 2023,
          "operation-cost": 20,
          "maintenance-cost": 50,
          "user-id": "person@email.com",
        },
      ]
      const res = await request(app).put(`${ENDPOINT_PATH}`).set("accept-language", "en").send(badOpexPlanInput)
      expect(res.status).to.eql(400)
      expect(res.body).to.include('required property "plant-id"')
    })

    it("Bad request: missing required fields: unit-id", async () => {
      const badOpexPlanInput = [
        {
          "plant-id": "AA_",
          "fiscal-year": 2023,
          "operation-cost": 20,
          "maintenance-cost": 50,
          "user-id": "person@email.com",
        },
      ]
      const res = await request(app).put(`${ENDPOINT_PATH}`).set("accept-language", "en").send(badOpexPlanInput)
      expect(res.status).to.eql(400)
      expect(res.body).to.include('required property "unit-id"')
    })

    it("Bad request: missing required fields: fiscal-year", async () => {
      const badGenerationOuptutPlanInput = [
        {
          "plant-id": "AA_",
          "unit-id": "AA_100",
          "operation-cost": 20,
          "maintenance-cost": 50,
          "user-id": "person@email.com",
        },
      ]
      const res = await request(app)
        .put(`${ENDPOINT_PATH}`)
        .set("accept-language", "en")
        .send(badGenerationOuptutPlanInput)
      expect(res.status).to.eql(400)
      expect(res.body).to.include('required property "fiscal-year"')
    })

    it("Bad request: missing required fields: operation-cost", async () => {
      const badGenerationOuptutPlanInput = [
        {
          "plant-id": "AA_",
          "unit-id": "AA_100",
          "fiscal-year": 2023,
          "maintenance-cost": 50,
          "user-id": "person@email.com",
        },
      ]
      const res = await request(app)
        .put(`${ENDPOINT_PATH}`)
        .set("accept-language", "en")
        .send(badGenerationOuptutPlanInput)
      expect(res.status).to.eql(400)
      expect(res.body).to.include('required property "operation-cost"')
    })

    it("Bad request: missing required fields: maintenance-cost", async () => {
      const badGenerationOuptutPlanInput = [
        {
          "plant-id": "HE_",
          "unit-id": "HE_100",
          "fiscal-year": 2023,
          "operation-cost": 0,
          "user-id": "person@email.com",
        },
      ]
      const res = await request(app)
        .put(`${ENDPOINT_PATH}`)
        .set("accept-language", "en")
        .send(badGenerationOuptutPlanInput)
      expect(res.status).to.eql(400)
      expect(res.body).to.include('required property "maintenance-cost"')
    })

    it("Bad request: missing required fields: user-id", async () => {
      const badGenerationOuptutPlanInput = [
        {
          "plant-id": "HE_",
          "unit-id": "HE_100",
          "fiscal-year": 2023,
          "operation-cost": 0,
          "maintenance-cost": 0,
        },
      ]
      const res = await request(app)
        .put(`${ENDPOINT_PATH}`)
        .set("accept-language", "en")
        .send(badGenerationOuptutPlanInput)
      expect(res.status).to.eql(400)
      expect(res.body).to.include('required property "user-id"')
    })
  })
  describe("GET opex plan", function () {
    describe("Should Ensure that UPSERT API has worked correctly", function () {
      it("Valid request: should ensure that upsert has inserted new data", async () => {
        const res = await request(app).get(`${ENDPOINT_PATH}`).set("accept-language", "en").query({ "plant-id": "HE_" })
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
        expect(res.body[0]).deep.equal({
          "plant-id": "HE_",
          "unit-id": "HE_100",
          "fiscal-year": 2023,
          "operation-cost": 40.0,
          "maintenance-cost": 35.0,
          sum: 75.0,
        })
        const { ["operation-cost"]: operationCost, ["maintenance-cost"]: maintenanceCost } =
          opexPlanInputToBeInserted[0]
        expect(res.body[0].sum).eq(Number((Number(operationCost) + Number(maintenanceCost)).toFixed(2)))
      })

      it("Valid request: should ensure that upsert has updated old data", async () => {
        const res = await request(app).get(`${ENDPOINT_PATH}`).set("accept-language", "en").query({ "plant-id": "AA_" })
        expect(res.status).to.eql(200)
        expect(res.body).to.be.an("array")

        const { ["operation-cost"]: operationCost, ["maintenance-cost"]: maintenanceCost } = opexPlanInputToBeUpdated[0]
        expect(res.body[0]["operation-cost"]).eq(Number(operationCost))
        expect(res.body[0]["maintenance-cost"]).eq(Number(maintenanceCost))
        expect(res.body[0].sum).eq(Number((Number(operationCost) + Number(maintenanceCost)).toFixed(2)))
      })
    })
    describe("Should Ensure that GET API has worked correctly", function () {
      it("Valid request: should ensure that get has retrieved correct data", async () => {
        const res = await request(app).get(`${ENDPOINT_PATH}`).set("accept-language", "en").query({ "plant-id": "BE_" })
        expect(res.status).to.eql(200)
        expect(res.body).to.be.an("array")
        expect(res.body.length).eq(3)
        expect(res.body[0]).to.have.keys(
          "plant-id",
          "unit-id",
          "fiscal-year",
          "operation-cost",
          "maintenance-cost",
          "sum",
        )
        const res2 = await request(app)
          .get(`${ENDPOINT_PATH}`)
          .set("accept-language", "en")
          .query({ "plant-id": "DD_" })
        expect(res2.body[0]).deep.equal(
          {
            "plant-id": "DD_",
            "unit-id": "DD_100",
            "fiscal-year": 2022,
            "operation-cost": 30.0,
            "maintenance-cost": 10.0,
            sum: 40.0,
          },
          JSON.stringify(res2.body),
        )
        const { ["operation-cost"]: operationCost, ["maintenance-cost"]: maintenanceCost } = res2.body[0]
        expect(res2.body[0].sum).eq(Number((Number(operationCost) + Number(maintenanceCost)).toFixed(2)))
      })
      it("Valid request: should be able to filter by fiscal-year correctly", async () => {
        const res = await request(app).get(`${ENDPOINT_PATH}`).set("accept-language", "en").query({
          "plant-id": "BE_",
          "start-fiscal-year": 2021,
          "end-fiscal-year": 2025,
        })
        expect(res.status).to.eql(200)
        expect(res.body).to.be.an("array")
        expect(res.body.length).to.eq(2)
        const res2 = await request(app).get(`${ENDPOINT_PATH}`).set("accept-language", "en").query({
          "plant-id": "BB_",
          "start-fiscal-year": 2024,
          "end-fiscal-year": 2025,
        })
        expect(res2.body.length).to.eq(0)
      })
      it("Valid request: should be able to filter by unit-id correctly", async () => {
        const res = await request(app).get(`${ENDPOINT_PATH}`).set("accept-language", "en").query({
          "plant-id": "BE_",
          "unit-id": "BE_100",
        })
        expect(res.status).to.eql(200)
        expect(res.body).to.be.an("array")
        expect(res.body.length).to.eq(3)
        for (const opexPlan of res.body) {
          expect(opexPlan["unit-id"]).to.be.a("string")
          expect(opexPlan["unit-id"]).to.eq("BE_100")
        }
      })
      it("Valid request: return null value for maintenance-cost", async () => {
        const res = await request(app).get(`${ENDPOINT_PATH}`).set("accept-language", "en").query({
          "plant-id": "DF_",
          "unit-id": "DF_100",
        })
        expect(res.status).to.eql(200)
        expect(res.body).to.be.an("array")
        expect(res.body.length).to.eq(2)
        for (const opexPlan of res.body) {
          expect(opexPlan["maintenance-cost"]).to.be.null
        }
      })
      it("Valid request: return null value for operation-cost", async () => {
        const res = await request(app).get(`${ENDPOINT_PATH}`).set("accept-language", "en").query({
          "plant-id": "DG_",
          "unit-id": "DG_100",
        })
        expect(res.status).to.eql(200)
        expect(res.body).to.be.an("array")
        expect(res.body.length).to.eq(2)
        for (const opexPlan of res.body) {
          expect(opexPlan["operation-cost"]).to.be.null
        }
      })
      it("Valid request: should be able to filter by unit-id and return empty result", async () => {
        const res = await request(app).get(`${ENDPOINT_PATH}`).set("accept-language", "en").query({
          "plant-id": "BE_",
          "unit-id": "BE_110",
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
})
