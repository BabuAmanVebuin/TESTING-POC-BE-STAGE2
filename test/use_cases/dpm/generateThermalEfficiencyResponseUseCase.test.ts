// Imported from DPM-BE, commit d0e2f45544cc9890762f93cf3e8f224f15efd619
import { expect } from "chai"
import { DateTime } from "luxon"
import { kpi003RepositorySnowflake } from "../../../src/infrastructure/repositories/dpm/snowflake/kpi003RepositorySnowflake.js"
import { rollbackSnowflakeTransaction, startSnowflakeTransaction } from "../../snowflake/index.js"
import { SnowflakeTransaction, transactionStorage } from "../../../src/infrastructure/orm/snowflake/index.js"
import sinon from "sinon"
import { generateThermalEfficiencyResponseUseCase } from "../../../src/application/use_cases/dpm/generateThermalEfficiencyResponseUseCase.js"

const beforeFixture = async () => {
  // empty fixture
}

describe("generateThermalEfficiencyResponseUseCase", function () {
  this.timeout(10000)
  before(async () => startSnowflakeTransaction(beforeFixture))

  after(async () => {
    await rollbackSnowflakeTransaction()
  })

  it("should be return ThermalEfficiency Json", async () => {
    // Mocked data
    const plantCode = "HE_"
    const unitCode = "HE_A100"
    const timestamp = Math.floor(DateTime.local().toSeconds())

    const snowflakeTransaction = transactionStorage.getStore()?.transaction as SnowflakeTransaction
    const repo = await kpi003RepositorySnowflake(snowflakeTransaction)
    const tMock = sinon.stub().onCall(0).returns("VALUE.SUFFIX_PERCENTAGE")

    // Call the use case function
    const ThermalEfficiencyJson = await generateThermalEfficiencyResponseUseCase(
      plantCode,
      unitCode,
      timestamp,
      repo,
      tMock,
    )

    // Assertions
    expect(ThermalEfficiencyJson).is.not.eql(undefined)
    expect(ThermalEfficiencyJson.PlantCode).to.equal(plantCode)
    expect(ThermalEfficiencyJson.UnitCode).to.equal(unitCode)
    expect(ThermalEfficiencyJson.ThermalEfficiency).is.not.eql(undefined)

    // Additional assertions for the ThermalEfficiency section
    expect(ThermalEfficiencyJson.ThermalEfficiency.Annual).is.not.eql(undefined)
    expect(ThermalEfficiencyJson.ThermalEfficiency.Daily).is.not.eql(undefined)
    expect(ThermalEfficiencyJson.ThermalEfficiency.Weekly).is.not.eql(undefined)
    expect(ThermalEfficiencyJson.ThermalEfficiency.Monthly).is.not.eql(undefined)
    expect(ThermalEfficiencyJson.ThermalEfficiency.Cumulative).is.not.eql(undefined)
    expect(ThermalEfficiencyJson.ThermalEfficiency.ForecastCurrentYear).is.not.eql(undefined)
    expect(ThermalEfficiencyJson.ThermalEfficiency.PlannedCurrentYear).is.not.eql(undefined)

    // Additional assertions for the mocked functions
    expect(tMock.callCount).eql(2)
  })
})
