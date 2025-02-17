import { expect } from "chai"

import { calculateGrossMarginSummaryTestFn } from "../../src/interface/controllers/dpm/KPI003/helper/businessPlan/grossMarginHelper.js"

import {
  fuelPrice,
  fuelUnitMaster,
  generationOutput,
  ppaMaster,
  result,
  thermalEfficiency,
} from "./testData/grossMarginForecastSummary.js"

const testFn = calculateGrossMarginSummaryTestFn

const testPPAMaster = ppaMaster
const testFuelUnitMaster = fuelUnitMaster
const testThermalEfficiency = thermalEfficiency
const testGenerationOutput = generationOutput
const testFuelPrice = fuelPrice
const testResult = result

describe("gross margin forecast summary", () => {
  it("calculate gross margin forecast", async () => {
    const plantId = "HE_"
    const unitList = ["HE_A100", "HE_A200", "HE_A300"]
    const res = await testFn(
      plantId,
      unitList,
      testGenerationOutput,
      testFuelPrice,
      [2024, 2025, 2026, 2027, 2028, 2029, 2030, 2031, 2032, 2033],
      testThermalEfficiency,
      testPPAMaster,
      testFuelUnitMaster,
    )

    expect(res).to.eql(testResult)
  })
})
