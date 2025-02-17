import { expect } from "chai"
import { basicChargeData, grossMargingData, opexData, result } from "./testData/ebitdaForecast.js"
import { testCalcEbitda } from "../../src/interface/controllers/dpm/KPI003/helper/businessPlan/ebitdaHelper.js"
import { basicChargeForecastType } from "../../src/domain/entities/dpm/ebitdaForecast.js"
import { getOpexForecastResponse } from "../../src/domain/entities/dpm/opexForecast.js"

const testFn = testCalcEbitda

const testResult = result

const testBasicCharge = basicChargeData
const testOpex = opexData
const testGrossMargin = grossMargingData

describe("ebitda forecast", () => {
  it("calculate ebitda forecast", async () => {
    const res = testFn(testGrossMargin, testBasicCharge, testOpex)
    expect(res).to.eql(testResult)
  })

  it("calculate ebitda forecast: there are null data", async () => {
    const testGrossMarginNull = testGrossMargin.filter((x) => x["fiscal-year"] !== 2030)
    testBasicCharge["HE_A100:2028"] = undefined as unknown as basicChargeForecastType

    let res = testFn(testGrossMarginNull, testBasicCharge, testOpex)
    expect(Array.from(new Set(res.map((x) => x["fiscal-year"])))).to.members([
      2024, 2025, 2026, 2027, 2028, 2029, 2031, 2032, 2033,
    ])

    testBasicCharge["HE_A200:2028"] = undefined as unknown as basicChargeForecastType
    testBasicCharge["HE_A300:2028"] = undefined as unknown as basicChargeForecastType
    res = testFn(testGrossMarginNull, testBasicCharge, testOpex)
    expect(Array.from(new Set(res.map((x) => x["fiscal-year"])))).to.members([
      2024, 2025, 2026, 2027, 2029, 2031, 2032, 2033,
    ])

    testOpex["HE_A100:2027"] = undefined as unknown as getOpexForecastResponse
    testOpex["HE_A200:2027"] = undefined as unknown as getOpexForecastResponse
    testOpex["HE_A300:2027"] = undefined as unknown as getOpexForecastResponse
    res = testFn(testGrossMarginNull, testBasicCharge, testOpex)
    expect(Array.from(new Set(res.map((x) => x["fiscal-year"])))).to.members([2024, 2025, 2026, 2029, 2031, 2032, 2033])
  })
})
