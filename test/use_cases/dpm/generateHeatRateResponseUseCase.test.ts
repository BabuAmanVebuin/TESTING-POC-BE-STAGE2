// Imported from DPM-BE, commit d0e2f45544cc9890762f93cf3e8f224f15efd619
import { expect } from "chai"
import { DateTime } from "luxon"
import { kpi003RepositorySnowflake } from "../../../src/infrastructure/repositories/dpm/snowflake/kpi003RepositorySnowflake.js"
import { rollbackSnowflakeTransaction, startSnowflakeTransaction } from "../../snowflake/index.js"
import { SnowflakeTransaction, transactionStorage } from "../../../src/infrastructure/orm/snowflake/index.js"
import sinon from "sinon"
import { generateHeatRateResponseUseCase } from "../../../src/application/use_cases/dpm/generateHeatRateResponseUseCase.js"

const beforeFixture = async () => {
  // empty fixture
}

describe("generateHeatRateResponseUseCase", function () {
  this.timeout(10000)
  before(async () => startSnowflakeTransaction(beforeFixture))

  after(async () => {
    await rollbackSnowflakeTransaction()
  })

  it("should be return HeatRate Json", async () => {
    // Mocked data
    const plantCode = "HE_"
    const unitCode = "HE_A100"
    const timestamp = Math.floor(DateTime.local().toSeconds())

    const snowflakeTransaction = transactionStorage.getStore()?.transaction as SnowflakeTransaction
    const repo = await kpi003RepositorySnowflake(snowflakeTransaction)
    const tMock = sinon.stub().onCall(0).returns("SUFFIX_KJ_KWh.PREFIX_YEN")
    // Call the use case function
    const HeatRateJson = await generateHeatRateResponseUseCase(plantCode, unitCode, timestamp, repo, tMock)

    // Assertions
    expect(HeatRateJson).is.not.eql(undefined)
    expect(HeatRateJson.PlantCode).to.equal(plantCode)
    expect(HeatRateJson.UnitCode).to.equal(unitCode)
    expect(HeatRateJson.HeatRate).is.not.eql(undefined)

    // Additional assertions for the HeatRate section
    expect(HeatRateJson.HeatRate.Annual).is.not.eql(undefined)
    expect(HeatRateJson.HeatRate.Daily).is.not.eql(undefined)
    expect(HeatRateJson.HeatRate.Weekly).is.not.eql(undefined)
    expect(HeatRateJson.HeatRate.Monthly).is.not.eql(undefined)
    expect(HeatRateJson.HeatRate.Cumulative).is.not.eql(undefined)
    expect(HeatRateJson.HeatRate.ForecastCurrentYear).is.not.eql(undefined)
    expect(HeatRateJson.HeatRate.PlannedCurrentYear).is.not.eql(undefined)

    // Additional assertions for the mocked functions
    expect(tMock.callCount).eql(2)
  })
})
