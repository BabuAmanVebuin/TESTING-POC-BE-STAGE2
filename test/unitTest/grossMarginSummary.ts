import { expect } from "chai"
import { grossMarginSummaryTestFn } from "../../src/interface/controllers/dpm/KPI003/getGrossMarginSummaryController.js"
import { getGrossMarginForecastSummaryResponse } from "../../src/domain/entities/dpm/grossMarginForecastSummary.js"

const testFn = grossMarginSummaryTestFn

const testSnowflakeData = [{ VALUE: 10012560000.1256 }]
const testdatabaseSummaryData: getGrossMarginForecastSummaryResponse[] = [
  {
    "fiscal-year": 2023,
    "plant-id": "HE_",
    value: 20.11,
  },
  {
    "fiscal-year": 2024,
    "plant-id": "HE_",
    value: 25.22,
  },
  {
    "fiscal-year": 2025,
    "plant-id": "HE_",
    value: 30.33,
  },
  {
    "fiscal-year": 2026,
    "plant-id": "HE_",
    value: 35.44,
  },
]
describe("ebitda forecast", () => {
  it("calculate gross margin summary", async () => {
    const res = testFn(testSnowflakeData, testdatabaseSummaryData)
    expect(res).to.eql(211.22)
  })

  it("calculate gross margin summary: no snowflake data", async () => {
    const res = testFn([], testdatabaseSummaryData)
    expect(res).to.eql(111.1)
  })

  it("calculate gross margin summary: no database data", async () => {
    const res = testFn(testSnowflakeData, [])
    expect(res).to.eql(100.12)
  })

  it("calculate gross margin summary: null response", async () => {
    const res = testFn([], [])
    expect(res).to.eql(null)
  })
})
