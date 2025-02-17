import { expect } from "chai"
import { heatRateForecastSummaryCalcTestFn } from "../../src/interface/controllers/dpm/KPI003/getHeatRateForecastSummaryController.js"
import { heatRateForecastSummaryOutput, thermalEfficienciesForecast } from "./testData/heatRateForecastSummary.js"

const testThermalEfficienciesData = thermalEfficienciesForecast

const testHeatRateForecastSummaryOutput = heatRateForecastSummaryOutput

describe("heatRate forecast summary calculation", () => {
  it("Should ensure heat rate forecast summary calculation is correct", async () => {
    const res = heatRateForecastSummaryCalcTestFn(testThermalEfficienciesData)
    expect(res).deep.equal(testHeatRateForecastSummaryOutput)
  })
})
