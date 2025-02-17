import { expect } from "chai"
import {
  opexDataPlan,
  opexDataForecast,
  fuelPricePlan,
  fuelPriceForecast,
  generationOutputPlan,
  generationOutputForecast,
  discountRateMasterData,
  thermalEfficiency,
  ppaMaster,
  heatRateForecast,
  heatRatePlan,
} from "./testData/lcc.js"
import {
  calculateHeatRateForecastTest,
  calculateHeatRatePlanTest,
  calculatePresentValueTest,
  getPlantWiseLccTest,
  getUnitWiseLccTest,
} from "../../src/interface/controllers/dpm/KPI003/helper/businessPlan/lifeCycleCostHelper.js"

const testCalcPresentValueFn = calculatePresentValueTest
const testPlantWiseFn = getPlantWiseLccTest
const testUnitWiseFn = getUnitWiseLccTest
const testHeatRatePlanFn = calculateHeatRatePlanTest
const testHeatRateForecastFn = calculateHeatRateForecastTest

const testOpexPlan = opexDataPlan
const testOpexForecast = opexDataForecast
const testFuelPricePlan = fuelPricePlan
const testFuelPriceForecast = fuelPriceForecast
const testGenerationOutputPlan = generationOutputPlan
const testGenerationOutoutForecast = generationOutputForecast
const testDiscountRate = discountRateMasterData
const testThermalEfficiency = thermalEfficiency
const testPpaMaster = ppaMaster

const heatRatePlanResult = heatRatePlan
const heatRateForecastResult = heatRateForecast

describe("lcc calculation", () => {
  it("plant wise", async () => {
    const [opexPlan, opexForecast, fuelPricePlan, fuelPriceForecast, generationOutputPlan, generationOutputForecast] = [
      testCalcPresentValueFn(testOpexPlan, testDiscountRate, 2023),
      testCalcPresentValueFn(testOpexForecast, testDiscountRate, 2023),
      testCalcPresentValueFn(testFuelPricePlan, testDiscountRate, 2023),
      testCalcPresentValueFn(testFuelPriceForecast, testDiscountRate, 2023),
      testCalcPresentValueFn(testGenerationOutputPlan, testDiscountRate, 2023),
      testCalcPresentValueFn(testGenerationOutoutForecast, testDiscountRate, 2023),
    ]
    const res = await testPlantWiseFn(
      opexPlan,
      fuelPricePlan,
      generationOutputPlan,
      opexForecast,
      fuelPriceForecast,
      generationOutputForecast,
    )

    expect(res).to.eql(
      {
        plan: 8.39,
        forecast: 8.27,
      },
      JSON.stringify(res),
    )
  })

  it("unit wise", async () => {
    const [opexPlan, opexForecast, fuelPricePlan, fuelPriceForecast, generationOutputPlan, generationOutputForecast] = [
      testCalcPresentValueFn(
        testOpexPlan.filter((x) => x["unit-id"] === "HE_A100"),
        testDiscountRate,
        2023,
      ),
      testCalcPresentValueFn(
        testOpexForecast.filter((x) => x["unit-id"] === "HE_A100"),
        testDiscountRate,
        2023,
      ),
      testCalcPresentValueFn(
        testFuelPricePlan.filter((x) => x["unit-id"] === "HE_A100"),
        testDiscountRate,
        2023,
      ),
      testCalcPresentValueFn(
        testFuelPriceForecast.filter((x) => x["unit-id"] === "HE_A100"),
        testDiscountRate,
        2023,
      ),
      testCalcPresentValueFn(
        testGenerationOutputPlan.filter((x) => x["unit-id"] === "HE_A100"),
        testDiscountRate,
        2023,
      ),
      testCalcPresentValueFn(
        testGenerationOutoutForecast.filter((x) => x["unit-id"] === "HE_A100"),
        testDiscountRate,
        2023,
      ),
    ]
    const res = await testUnitWiseFn(
      opexPlan,
      fuelPricePlan,
      generationOutputPlan,
      opexForecast,
      fuelPriceForecast,
      generationOutputForecast,
    )

    expect(res).to.eql(
      {
        plan: 8.38,
        forecast: 8.22,
      },
      JSON.stringify(res),
    )
  })

  it("heat rate: plan", async () => {
    const res = testHeatRatePlanFn(testGenerationOutputPlan, testPpaMaster)
    const ans = res.map((x) => ({
      ...x,
      value: Math.trunc((x.value || 0) * 10000) / 10000,
    }))
    expect(ans).to.eql(heatRatePlanResult, JSON.stringify(res))
  })

  it("heat rate: forecast", async () => {
    const res = testHeatRateForecastFn(testGenerationOutoutForecast, testThermalEfficiency)
    const ans = res.map((x) => ({
      ...x,
      value: Math.trunc((x.value || 0) * 10000) / 10000,
    }))
    expect(ans).to.eql(heatRateForecastResult, JSON.stringify(res))
  })
})
