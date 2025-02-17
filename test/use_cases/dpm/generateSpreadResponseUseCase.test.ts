// Imported from DPM-BE, commit d0e2f45544cc9890762f93cf3e8f224f15efd619
import { expect } from "chai"
import { DateTime } from "luxon"
import { kpi003RepositorySnowflake } from "../../../src/infrastructure/repositories/dpm/snowflake/kpi003RepositorySnowflake.js"
import { generateSpreadResponseUseCase } from "../../../src/application/use_cases/dpm/generateSpreadResponseUseCase.js"
import { rollbackSnowflakeTransaction, startSnowflakeTransaction } from "../../snowflake/index.js"
import { SnowflakeTransaction, transactionStorage } from "../../../src/infrastructure/orm/snowflake/index.js"
import sinon from "sinon"

const beforeFixture = async () => {
  // Empty fixture
}

describe("generateSpreadResponseUseCase", function () {
  this.timeout(10000)

  before(async () => startSnowflakeTransaction(beforeFixture))

  after(async () => {
    await rollbackSnowflakeTransaction()
  })

  it("should be return spread Json", async () => {
    // Mocked data
    const plantCode = "HE_"
    const unitCode = "HE_A100"
    const timestamp = Math.floor(DateTime.local().toSeconds())

    const snowflakeTransaction = transactionStorage.getStore()?.transaction as SnowflakeTransaction
    const repo = await kpi003RepositorySnowflake(snowflakeTransaction)
    const tMock = sinon.stub().onCall(0).returns("VALUE.SUFFIX_YEN_KWH")

    // Call the use case function
    const spreadJson = await generateSpreadResponseUseCase(plantCode, unitCode, timestamp, repo, tMock)

    // Assertions
    expect(spreadJson).to.be.not.undefined
    expect(spreadJson.PlantCode).to.equal(plantCode)
    expect(spreadJson.UnitCode).to.equal(unitCode)
    expect(spreadJson.Spread).to.be.not.undefined

    // Additional assertions for the spread section
    expect(spreadJson.Spread.Annual).to.be.not.undefined
    expect(spreadJson.Spread.Daily).to.be.not.undefined
    expect(spreadJson.Spread.Weekly).to.be.not.undefined
    expect(spreadJson.Spread.Monthly).to.be.not.undefined
    expect(spreadJson.Spread.Cumulative).to.be.not.undefined
    expect(spreadJson.Spread.ForecastCurrentYear).to.be.not.undefined
    expect(spreadJson.Spread.PlannedCurrentYear).to.be.not.undefined

    // Additional assertions for the mocked functions
    expect(tMock.callCount).to.equal(2)
  })
})
