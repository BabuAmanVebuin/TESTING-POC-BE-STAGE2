import { expect } from "chai"
import { basicChargeData, grossMargingData, opexData, result } from "./testData/ebitdaForecastSummary.js"
import { testCalcEbitdaSummary } from "../../src/interface/controllers/dpm/KPI003/getEBITDAForecastSummaryController.js"

const testFn = testCalcEbitdaSummary

const testResult = result

const testBasicCharge = basicChargeData
const testOpex = opexData
const testGrossMargin = grossMargingData

describe("ebitda forecast summary", () => {
  it("calculate ebitda forecast summary", async () => {
    const res = testFn(testGrossMargin, testBasicCharge, testOpex)
    expect(res).to.eql(testResult)
  })

  it("calculate ebitda forecast summary: there are null data", async () => {
    const testGrossMarginNull = testGrossMargin.filter((x) => x["fiscal-year"] !== 2030)

    let res = testFn(testGrossMarginNull, testBasicCharge, testOpex)
    expect(Array.from(new Set(res.map((x) => x["fiscal-year"])))).to.members([
      2024, 2025, 2026, 2027, 2028, 2029, 2031, 2032, 2033,
    ])
    testBasicCharge

    res = testFn(
      testGrossMarginNull,
      testBasicCharge.filter((x) => x["fiscal-year"] !== 2028),
      testOpex,
    )
    expect(Array.from(new Set(res.map((x) => x["fiscal-year"])))).to.members([
      2024, 2025, 2026, 2027, 2029, 2031, 2032, 2033,
    ])

    res = testFn(
      testGrossMarginNull,
      testBasicCharge,
      testOpex.filter((x) => x["fiscal-year"] !== 2027),
    )
    expect(Array.from(new Set(res.map((x) => x["fiscal-year"])))).to.members([
      2024, 2025, 2026, 2028, 2029, 2031, 2032, 2033,
    ])
  })
})
