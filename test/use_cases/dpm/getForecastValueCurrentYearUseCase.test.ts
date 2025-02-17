// Imported from DPM-BE, commit d0e2f45544cc9890762f93cf3e8f224f15efd619
import { expect } from "chai"
import sinon from "sinon"
import { getForecastValueFiscalYearUseCase } from "../../../src/application/use_cases/dpm/getForecastValueCurrentYearUseCase.js"

// Mock the Kpi003RepositoryPort implementation
const mockKpiRepository = {
  getPastAnnualTotalGrossMarginCache: sinon.stub(),
  getKpi002Data: sinon.stub(),
  getKpi003SubcacheRows: sinon.stub(),
  getAvailabilityEstimates: sinon.stub(),
  getEBITDAEstimates: sinon.stub(),
  getOPEXEstimates: sinon.stub(),
  getOperationCostEstimates: sinon.stub(),
  getMaintenanceCostEstimates: sinon.stub(),
  getBasicProfitCostEstimates: sinon.stub(),
  getThermalEfficiencyEstimates: sinon.stub(),
  getHeatRateEstimates: sinon.stub(),
  getSpreadEstimates: sinon.stub(),
  getSpreadMarketEstimates: sinon.stub(),
  getSpreadPPAEstimates: sinon.stub(),
  getGrossMarginEstimates: sinon.stub(),
  getGenerationOutputEstimates: sinon.stub(),
  getKpi003UnitWiseYearEndActualOrForecastValue: sinon.stub(),
  getKpi003PlantWiseYearEndActualOrForecastValue: sinon.stub(),
  getGrossMarginMarketEstimates: sinon.stub(),
  getGrossMarginPPAEstimates: sinon.stub(),
  getSalesUnitPriceEstimates: sinon.stub(),
}

describe("getForecastValueFiscalYearUseCase", function () {
  this.timeout(10000)
  afterEach(() => {
    sinon.restore()
  })

  it("should return the forecast value for plantCode and fiscalYear", async () => {
    const plantCode = "yourPlantCode"
    const unitCode = null
    const measure = "yourMeasure"
    const fiscalYear = 2023
    const expectedValue = 100

    // Stub the repository method for plantCode
    mockKpiRepository.getKpi003PlantWiseYearEndActualOrForecastValue.resolves({
      FORECAST_CATEGORY: "Forecast",
      value: expectedValue,
    })

    const result = await getForecastValueFiscalYearUseCase(plantCode, unitCode, measure, fiscalYear, mockKpiRepository)

    expect(result).to.equal(expectedValue)
    expect(
      mockKpiRepository.getKpi003PlantWiseYearEndActualOrForecastValue.calledWith(plantCode, measure, fiscalYear),
    ).to.equal(true)
  })

  it('should return 0 if FORECAST_CATEGORY is "Actual" for plantCode and fiscalYear', async () => {
    const plantCode = "yourPlantCode"
    const unitCode = null
    const measure = "yourMeasure"
    const fiscalYear = 2023

    // Stub the repository method for plantCode with FORECAST_CATEGORY as "Actual"
    mockKpiRepository.getKpi003PlantWiseYearEndActualOrForecastValue.resolves({
      FORECAST_CATEGORY: "Actual",
      value: 100,
    })

    const result = await getForecastValueFiscalYearUseCase(plantCode, unitCode, measure, fiscalYear, mockKpiRepository)

    expect(result).to.equal(0)
    expect(
      mockKpiRepository.getKpi003PlantWiseYearEndActualOrForecastValue.calledWith(plantCode, measure, fiscalYear),
    ).to.equal(true)
  })

  it("should return the forecast value for unitCode and fiscalYear", async () => {
    const plantCode = "yourPlantCode"
    const unitCode = "yourUnitCode"
    const measure = "yourMeasure"
    const fiscalYear = 2023
    const expectedValue = 200

    // Stub the repository method for unitCode
    mockKpiRepository.getKpi003UnitWiseYearEndActualOrForecastValue.resolves({
      FORECAST_CATEGORY: "Forecast",
      value: expectedValue,
    })

    const result = await getForecastValueFiscalYearUseCase(plantCode, unitCode, measure, fiscalYear, mockKpiRepository)

    expect(result).to.equal(expectedValue)
    expect(
      mockKpiRepository.getKpi003PlantWiseYearEndActualOrForecastValue.calledWith(plantCode, measure, fiscalYear),
    ).to.equal(true)
  })

  it('should return 0 if FORECAST_CATEGORY is "Actual" for unitCode and fiscalYear', async () => {
    const plantCode = "yourPlantCode"
    const unitCode = "yourUnitCode"
    const measure = "yourMeasure"
    const fiscalYear = 2023

    // Stub the repository method for unitCode with FORECAST_CATEGORY as "Actual"
    mockKpiRepository.getKpi003UnitWiseYearEndActualOrForecastValue.resolves({
      FORECAST_CATEGORY: "Actual",
      value: 200,
    })

    const result = await getForecastValueFiscalYearUseCase(plantCode, unitCode, measure, fiscalYear, mockKpiRepository)

    expect(result).to.equal(0)
    expect(
      mockKpiRepository.getKpi003PlantWiseYearEndActualOrForecastValue.calledWith(plantCode, measure, fiscalYear),
    ).to.equal(true)
  })
})
