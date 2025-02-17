import { expect } from "chai"
import { calcThermalEfficiencyHeatRateFn } from "../../src/interface/controllers/dpm/KPI003/getHeatRateForecastController.js"
import { heatRateForecastInputData, heatRateForecastOutputData } from "./testData/heatRateForecast.js"

const testHeatRateForecastInput = heatRateForecastInputData
const testHeatRateForecastOutput = heatRateForecastOutputData

describe("heatRate calculation", () => {
  it("unit 1 : should ensure thermal effeciency calculation is correct", async () => {
    const res = calcThermalEfficiencyHeatRateFn(testHeatRateForecastInput).filter((x) => x["unit-id"] === "HE_A100")
    expect(res).deep.equal(testHeatRateForecastOutput.filter((x) => x["unit-id"] === "HE_A100"))
  })
  it("unit 2 : should ensure thermal effeciency calculation is correct", async () => {
    const res = calcThermalEfficiencyHeatRateFn(testHeatRateForecastInput).filter((x) => x["unit-id"] === "HE_A200")
    expect(res).deep.equal(testHeatRateForecastOutput.filter((x) => x["unit-id"] === "HE_A200"))
  })
  it("unit 3 : should ensure thermal effeciency calculation is correct", async () => {
    const res = calcThermalEfficiencyHeatRateFn(testHeatRateForecastInput.filter((x) => x["unit-id"] === "HE_A300"))
    expect(res).deep.equal(testHeatRateForecastOutput.filter((x) => x["unit-id"] === "HE_A300"))
  })
})
