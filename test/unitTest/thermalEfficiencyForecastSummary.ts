import { expect } from "chai"

import { thermalEfficiencyForecastSummaryCalcTestFn } from "../../src/interface/controllers/dpm/KPI003/getThermalEfficiencyForecastSummaryController.js"
import {
  generationOutputData,
  generationOutputSummaryRecord,
  result,
  thermalEfficiencyRecord,
} from "./testData/thermalEfficiencyForecastSummary.js"

const testFn = thermalEfficiencyForecastSummaryCalcTestFn

const testGenerationOutput = generationOutputData
const testGenerationOutputSummary = generationOutputSummaryRecord
const testThermalEfficiency = thermalEfficiencyRecord

const testResult = result

describe("thermal efficiency forecast summary", () => {
  it("calculate thermal efficiency forecast summary", async () => {
    const res = await testFn(testGenerationOutput, testThermalEfficiency, testGenerationOutputSummary)

    expect(res).to.eql(testResult)
  })
  it("calculate thermal efficiency forecast summary", async () => {
    const newGenerationOutput = testGenerationOutput.filter((x) => x["fiscal-year"] <= 2029)
    const res = await testFn(newGenerationOutput, testThermalEfficiency, testGenerationOutputSummary)

    expect(res.map((x) => x["fiscal-year"])).to.members([2024, 2025, 2026, 2027, 2028, 2029])
  })
})
