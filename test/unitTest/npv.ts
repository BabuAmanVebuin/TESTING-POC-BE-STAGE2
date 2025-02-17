import { expect } from "chai"
import { calculateNpvFn } from "../../src/interface/controllers/dpm/KPI003/getNetPresentValueController.js"
import { discountRateMasterData, ebitdaForecast, ebitdaPlan } from "./testData/npv.js"

const CURRENT_FISCAL_YEAR = 2023

const testFn = calculateNpvFn

const testEbitdaPlan = ebitdaPlan
const testEbitdaForecast = ebitdaForecast
const testDiscountRate = discountRateMasterData

describe("npv calculation", () => {
  it("plant wise", async () => {
    const res = testFn(testEbitdaPlan, testEbitdaForecast, testDiscountRate, CURRENT_FISCAL_YEAR)
    expect(res).to.eql(
      {
        plan: 18.59,
        forecast: 273.96,
      },
      JSON.stringify(res),
    )
  })

  it("unit wise", async () => {
    const res = testFn(
      testEbitdaPlan.filter((x) => x["unit-id"] === "HE_A100"),
      testEbitdaForecast.filter((x) => x["unit-id"] === "HE_A100"),
      testDiscountRate,
      CURRENT_FISCAL_YEAR,
    )
    expect(res).to.eql({
      plan: 6.16,
      forecast: 111.38,
    })
  })
})
