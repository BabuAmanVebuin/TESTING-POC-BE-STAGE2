import { expect } from "chai"
import { calcHeatRatePlanSummary } from "../../src/interface/controllers/dpm/KPI003/getHeatRatePlanSummaryController.js"
import {
  generationOutputPlan,
  generationOutputPlanSummary,
  heatRatePlanSummaryOutput,
  ppaThermalEfficiencies,
} from "./testData/heatRatePlanSummary.js"

const testPpaThermalEfficiencies = ppaThermalEfficiencies
const testGenerationOutputPlanData = generationOutputPlan
const testGenerationOutputPlanSummaryData = generationOutputPlanSummary

const testHeatRatePlanSummaryOutput = heatRatePlanSummaryOutput

describe("heatRate plan summary calculation", () => {
  it("Should ensure heat rate plan summary calculation is correct", async () => {
    const res = calcHeatRatePlanSummary(
      testPpaThermalEfficiencies,
      testGenerationOutputPlanData,
      testGenerationOutputPlanSummaryData,
    )
    expect(res).deep.equal(testHeatRatePlanSummaryOutput)
  })
})
