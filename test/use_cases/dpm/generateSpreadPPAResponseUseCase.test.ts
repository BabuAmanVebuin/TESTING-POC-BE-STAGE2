// Imported from DPM-BE, commit d0e2f45544cc9890762f93cf3e8f224f15efd619
import { expect } from "chai"
import { DateTime } from "luxon"
import { kpi003RepositorySnowflake } from "../../../src/infrastructure/repositories/dpm/snowflake/kpi003RepositorySnowflake.js"
import { rollbackSnowflakeTransaction, startSnowflakeTransaction } from "../../snowflake/index.js"
import { SnowflakeTransaction, transactionStorage } from "../../../src/infrastructure/orm/snowflake/index.js"
import sinon from "sinon"
import { generateSpreadPPAResponseUseCase } from "../../../src/application/use_cases/dpm/generateSpreadPPAResponseUseCase.js"

const beforeFixture = async () => {
  // empty fixture
}

describe("generateSpreadPPAResponseUseCase", function () {
  this.timeout(10000)

  before(async function () {
    await startSnowflakeTransaction(beforeFixture)
  })

  after(async function () {
    await rollbackSnowflakeTransaction()
  })

  it("should be return spreadPPA Json", async function () {
    // Mocked data
    const plantCode = "HE_"
    const unitCode = "HE_A100"
    const timestamp = Math.floor(DateTime.local().toSeconds())

    const snowflakeTransaction = transactionStorage.getStore()?.transaction as SnowflakeTransaction
    const repo = await kpi003RepositorySnowflake(snowflakeTransaction)
    const tMock = sinon.stub().onCall(0).returns("VALUE.SUFFIX_YEN_KWH")
    // Call the use case function
    const spreadPPAJson = await generateSpreadPPAResponseUseCase(plantCode, unitCode, timestamp, repo, tMock)

    // Assertions
    expect(spreadPPAJson).to.not.be.undefined
    expect(spreadPPAJson.PlantCode).to.equal(plantCode)
    expect(spreadPPAJson.UnitCode).to.equal(unitCode)
    expect(spreadPPAJson.SpreadPPA).to.not.be.undefined

    // Additional assertions for the spreadPPA section
    expect(spreadPPAJson.SpreadPPA.Annual).to.not.be.undefined
    expect(spreadPPAJson.SpreadPPA.Daily).to.not.be.undefined
    expect(spreadPPAJson.SpreadPPA.Weekly).to.not.be.undefined
    expect(spreadPPAJson.SpreadPPA.Monthly).to.not.be.undefined
    expect(spreadPPAJson.SpreadPPA.Cumulative).to.not.be.undefined
    expect(spreadPPAJson.SpreadPPA.ForecastCurrentYear).to.not.be.undefined
    expect(spreadPPAJson.SpreadPPA.PlannedCurrentYear).to.not.be.undefined

    // Additional assertions for the mocked functions
    expect(tMock.callCount).to.equal(2)
  })
})
