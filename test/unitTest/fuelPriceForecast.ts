import { expect } from "chai"
import {
  fuelConsumptionActualDataForecastInputData,
  fuelCostForecastInputData,
  fuelCostPerUnitTotalForecastOutputData,
  fuelUnitsCalorificForecastInputData,
  generationOutputForecastInputData,
  thermalEfficienciesForecastInputData,
} from "./testData/fuelPriceForecast.js"
import {
  calcFuelPriceForecast,
  ceilFuelCost,
} from "../../src/interface/controllers/dpm/KPI003/getFuelPriceForecastController.js"

const testFuelUnitsCalorificForecastInputData = fuelUnitsCalorificForecastInputData
const testFuelCostForecastInputData = fuelCostForecastInputData
const testFuelConsumptionActualDataForecastInputData = fuelConsumptionActualDataForecastInputData
const testGenerationOutputForecastInputData = generationOutputForecastInputData
const testThermalEfficienciesForecastInputData = thermalEfficienciesForecastInputData

const testFuelCostPerUnitTotalForecastOutputData = fuelCostPerUnitTotalForecastOutputData

describe("fuel price forecast calculation", () => {
  it("Should ensure fuel price forecast calculation is correct", async () => {
    const res = calcFuelPriceForecast(
      testFuelUnitsCalorificForecastInputData,
      testFuelCostForecastInputData,
      testFuelConsumptionActualDataForecastInputData,
      testGenerationOutputForecastInputData,
      testThermalEfficienciesForecastInputData,
    )
    expect(ceilFuelCost(res)).deep.equal(testFuelCostPerUnitTotalForecastOutputData)
  })
})
