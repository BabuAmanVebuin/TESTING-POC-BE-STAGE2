import { expect } from "chai"
import { calcHeatRateSummary } from "../../src/interface/controllers/dpm/KPI003/getHeatRateSummaryController.js"
import {
  generationOutputForecast,
  generationOutputForecastSf,
  generationOutputForecastSummaryTotal,
  generationOutputPlan,
  heatRateSummaryForecastOutput,
  heatRateSummaryPlanOutput,
  ppaThermalEfficienciesPlan,
  thermalEfficienciesForecast,
  thermalEfficienciesForecastSf,
} from "./testData/heatRateSummary.js"

const testGenerationOutputPlan = generationOutputPlan
const testPpaThermalEfficienciesPlanData = ppaThermalEfficienciesPlan
const testGenerationOutputForecastSf = generationOutputForecastSf
const testThermalEfficienciesForecastSf = thermalEfficienciesForecastSf
const testGenerationOutputForecastData = generationOutputForecast
const testThermalEfficienciesForecast = thermalEfficienciesForecast
const testGenerationOutputForecastSummaryTotal = generationOutputForecastSummaryTotal

const testHeatRatePlanOutput = heatRateSummaryPlanOutput
const testHeatRateForecastOutput = heatRateSummaryForecastOutput

describe("heatRate summary calculation", () => {
  it("unit 1: Should ensure heat rate summary calculation is correct for both plan and forecast", async () => {
    const res = calcHeatRateSummary(
      testGenerationOutputPlan.filter((elem) => elem["unit-id"] === "HE_A100"),
      testPpaThermalEfficienciesPlanData.filter((elem) => elem["unit-id"] === "HE_A100"),
      testGenerationOutputForecastSf.filter((elem) => elem["unit-id"] === "HE_A100"),
      testThermalEfficienciesForecastSf.filter((elem) => elem["unit-id"] === "HE_A100"),
      testGenerationOutputForecastData.filter((elem) => elem["unit-id"] === "HE_A100"),
      testThermalEfficienciesForecast.filter((elem) => elem["unit-id"] === "HE_A100"),
      testGenerationOutputForecastSummaryTotal[0],
    )
    expect(res.plan).deep.equal(testHeatRatePlanOutput[0])
    expect(res.forecast).deep.equal(testHeatRateForecastOutput[0])
  })
  it("unit 2: Should ensure heat rate summary calculation is correct for both plan and forecast", async () => {
    const res = calcHeatRateSummary(
      testGenerationOutputPlan.filter((elem) => elem["unit-id"] === "HE_A200"),
      testPpaThermalEfficienciesPlanData.filter((elem) => elem["unit-id"] === "HE_A200"),
      testGenerationOutputForecastSf.filter((elem) => elem["unit-id"] === "HE_A200"),
      testThermalEfficienciesForecastSf.filter((elem) => elem["unit-id"] === "HE_A200"),
      testGenerationOutputForecastData.filter((elem) => elem["unit-id"] === "HE_A200"),
      testThermalEfficienciesForecast.filter((elem) => elem["unit-id"] === "HE_A200"),
      testGenerationOutputForecastSummaryTotal[1],
    )
    expect(res.plan).deep.equal(testHeatRatePlanOutput[1])
    expect(res.forecast).deep.equal(testHeatRateForecastOutput[1])
  })
  it("unit 3: Should ensure heat rate summary calculation is correct for both plan and forecast", async () => {
    const res = calcHeatRateSummary(
      testGenerationOutputPlan.filter((elem) => elem["unit-id"] === "HE_A300"),
      testPpaThermalEfficienciesPlanData.filter((elem) => elem["unit-id"] === "HE_A300"),
      testGenerationOutputForecastSf.filter((elem) => elem["unit-id"] === "HE_A300"),
      testThermalEfficienciesForecastSf.filter((elem) => elem["unit-id"] === "HE_A300"),
      testGenerationOutputForecastData.filter((elem) => elem["unit-id"] === "HE_A300"),
      testThermalEfficienciesForecast.filter((elem) => elem["unit-id"] === "HE_A300"),
      testGenerationOutputForecastSummaryTotal[2],
    )
    expect(res.plan).deep.equal(testHeatRatePlanOutput[2])
    expect(res.forecast).deep.equal(testHeatRateForecastOutput[2])
  })
  it("plant summary: Should ensure heat rate summary calculation is correct for both plan and forecast", async () => {
    const res = calcHeatRateSummary(
      testGenerationOutputPlan,
      testPpaThermalEfficienciesPlanData,
      testGenerationOutputForecastSf,
      testThermalEfficienciesForecastSf,
      testGenerationOutputForecastData,
      testThermalEfficienciesForecast,
      testGenerationOutputForecastSummaryTotal[3],
    )
    expect(res.plan).deep.equal(testHeatRatePlanOutput[3])
    expect(res.forecast).deep.equal(testHeatRateForecastOutput[3])
  })
})
