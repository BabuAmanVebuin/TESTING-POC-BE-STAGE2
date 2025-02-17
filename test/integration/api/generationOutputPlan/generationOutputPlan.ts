import express from "express"
import { expect } from "chai"
import { Transaction } from "sequelize"
import request from "supertest"
import { createRouter } from "../../../../src/infrastructure/webserver/express/routes.js"
import { startTransaction, closeTransaction, insertFixture } from "../../sequelize/index.js"

const app = express()
app.use(express.json())
app.use("/", createRouter())

const ENDPOINT_PATH = "/generation-output/plan"

const beforeHookFixtures = async (transaction: Transaction) => {
  await insertFixture("beforeUpsertGenerationOutputPlan.sql", transaction)
}

const generationOuptutPlanInputToBeInserted = [
  {
    "plant-id": "HE_",
    "unit-id": "HE_100",
    "fiscal-year": 2023,
    value: 0,
    "correction-value": 0,
    "user-id": "person@email.com",
  },
]

const generationOuptutPlanInputToBeUpdated = [
  {
    "plant-id": "AA_",
    "unit-id": "AA_100",
    "fiscal-year": 2023,
    value: 20,
    "correction-value": 50,
    "user-id": "person@email.com",
  },
]

describe("generation output plan tests", function () {
  before(async () => startTransaction((transaction) => beforeHookFixtures(transaction)))
  after(async () => {
    await closeTransaction()
  })

  describe("UPSERT generation output plan", function () {
    it("Valid request: should insert new data", async () => {
      const res = await request(app)
        .put(`${ENDPOINT_PATH}`)
        .set("accept-language", "en")
        .send(generationOuptutPlanInputToBeInserted)

      expect(res.status).to.eql(200)
      expect(res.body).to.be.a("string")
      expect(res.body).to.equal("OK")
    })

    it("Valid request: should update new data", async () => {
      const res = await request(app)
        .put(`${ENDPOINT_PATH}`)
        .set("accept-language", "en")
        .send(generationOuptutPlanInputToBeUpdated)
      expect(res.status).to.eql(200)
      expect(res.body).to.be.a("string")
      expect(res.body).to.equal("OK")
    })

    it("Bad request: missing required fields: plant-id", async () => {
      const badGenerationOuptutPlanInput = [
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
        .send(badGenerationOuptutPlanInput)
      expect(res.status).to.eql(400)
      expect(res.body).to.include('required property "plant-id"')
    })

    it("Bad request: missing required fields: unit-id", async () => {
      const badGenerationOuptutPlanInput = [
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
        .send(badGenerationOuptutPlanInput)
      expect(res.status).to.eql(400)
      expect(res.body).to.include('required property "unit-id"')
    })

    it("Bad request: missing required fields: fiscal-year", async () => {
      const badGenerationOuptutPlanInput = [
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
        .send(badGenerationOuptutPlanInput)
      expect(res.status).to.eql(400)
      expect(res.body).to.include('required property "fiscal-year"')
    })

    it("Bad request: missing required fields: value", async () => {
      const badGenerationOuptutPlanInput = [
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
        .send(badGenerationOuptutPlanInput)
      expect(res.status).to.eql(400)
      expect(res.body).to.include('required property "value"')
    })

    it("Bad request: missing required fields: correction-value", async () => {
      const badGenerationOuptutPlanInput = [
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
        .send(badGenerationOuptutPlanInput)
      expect(res.status).to.eql(400)
      expect(res.body).to.include('required property "correction-value"')
    })

    it("Bad request: missing required fields: user-id", async () => {
      const badGenerationOuptutPlanInput = [
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
        .send(badGenerationOuptutPlanInput)
      expect(res.status).to.eql(400)
      expect(res.body).to.include('required property "user-id"')
    })
  })
  describe("GET generation output plan", function () {
    describe("Should Ensure that UPSERT API has worked correctly", function () {
      it("Valid request: should ensure that upsert has inserted new data", async () => {
        const res = await request(app).get(`${ENDPOINT_PATH}`).set("accept-language", "en").query({ "plant-id": "HE_" })
        expect(res.status).to.eql(200)
        expect(res.body).to.be.an("array")
        expect(res.body.length).eq(1)
        expect(res.body[0]).to.have.keys("plant-id", "unit-id", "fiscal-year", "value", "correction-value", "sum")
        expect(res.body[0]).deep.equal({
          "plant-id": "HE_",
          "unit-id": "HE_100",
          "fiscal-year": 2023,
          value: 0.0,
          "correction-value": 0.0,
          sum: 0.0,
        })
        const { value, ["correction-value"]: correctionValue } = generationOuptutPlanInputToBeInserted[0]
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
    it("Valid request: should be able to paginate result", async () => {
      const res = await request(app)
        .get(`${ENDPOINT_PATH}`)
        .set("accept-language", "en")
        .query({ "plant-id": "BB_", limit: 2, offset: 0 })
      expect(res.status).to.eql(200)
      expect(res.body).to.be.an("array")
      expect(res.body.length).to.eq(2)
    })
    it("Valid request: should be able to filter by fiscal-year correctly", async () => {
      const res = await request(app).get(`${ENDPOINT_PATH}`).set("accept-language", "en").query({
        "plant-id": "BB_",
        "start-fiscal-year": 2000,
        "end-fiscal-year": 2019,
      })
      expect(res.status).to.eql(200)
      expect(res.body).to.be.an("array")
      expect(res.body.length).to.eq(0)
      const res2 = await request(app).get(`${ENDPOINT_PATH}`).set("accept-language", "en").query({
        "plant-id": "BB_",
        "start-fiscal-year": 2020,
        "end-fiscal-year": 2022,
      })
      expect(res2.body.length).to.eq(3)
    })
    it("Valid request: should be able to filter by unit-id correctly", async () => {
      const res = await request(app).get(`${ENDPOINT_PATH}`).set("accept-language", "en").query({
        "plant-id": "BB_",
        "unit-id": "BB_200",
      })
      expect(res.status).to.eql(200)
      expect(res.body).to.be.an("array")
      expect(res.body.length).to.eq(2)
      for (const generationOutput of res.body) {
        expect(generationOutput["unit-id"]).to.be.a("string")
        expect(generationOutput["unit-id"]).to.eq("BB_200")
      }
    })
    it("Valid request: should be able to filter by unit-id and return empty result", async () => {
      const res = await request(app).get(`${ENDPOINT_PATH}`).set("accept-language", "en").query({
        "plant-id": "BB_",
        "unit-id": "BB_500",
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
