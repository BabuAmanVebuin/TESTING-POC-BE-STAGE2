// Imported from DPM-BE, commit d0e2f45544cc9890762f93cf3e8f224f15efd619
import { expect } from "chai"
import { DateTime } from "luxon"
import { kpi003RepositorySnowflake } from "../../../src/infrastructure/repositories/dpm/snowflake/kpi003RepositorySnowflake.js"
import { rollbackSnowflakeTransaction, startSnowflakeTransaction } from "../../snowflake/index.js"
import { SnowflakeTransaction, transactionStorage } from "../../../src/infrastructure/orm/snowflake/index.js"
import sinon from "sinon"
import { generateSpreadMarketResponseUseCase } from "../../../src/application/use_cases/dpm/generateSpreadMarketResponseUseCase.js"

const beforeFixture = async () => {
  // empty fixture
}

describe("generateSpreadMarketResponseUseCase", function () {
  this.timeout(10000)

  before(async function () {
    await startSnowflakeTransaction(beforeFixture)
  })

  after(async function () {
    await rollbackSnowflakeTransaction()
  })

  it("should be return spreadMarket Json", async function () {
    // Mocked data
    const plantCode = "HE_"
    const unitCode = "HE_A100"
    const timestamp = Math.floor(DateTime.local().toSeconds())

    const snowflakeTransaction = transactionStorage.getStore()?.transaction as SnowflakeTransaction
    const repo = await kpi003RepositorySnowflake(snowflakeTransaction)
    const tMock = sinon.stub().onCall(0).returns("VALUE.SUFFIX_YEN_KWH")
    // Call the use case function
    const spreadMarketJson = await generateSpreadMarketResponseUseCase(plantCode, unitCode, timestamp, repo, tMock)

    // Assertions
    expect(spreadMarketJson).to.not.be.undefined
    expect(spreadMarketJson.PlantCode).to.equal(plantCode)
    expect(spreadMarketJson.UnitCode).to.equal(unitCode)
    expect(spreadMarketJson.SpreadMarket).to.not.be.undefined

    // Additional assertions for the spreadMarket section
    expect(spreadMarketJson.SpreadMarket.Annual).to.not.be.undefined
    expect(spreadMarketJson.SpreadMarket.Daily).to.not.be.undefined
    expect(spreadMarketJson.SpreadMarket.Weekly).to.not.be.undefined
    expect(spreadMarketJson.SpreadMarket.Monthly).to.not.be.undefined
    expect(spreadMarketJson.SpreadMarket.Cumulative).to.not.be.undefined
    expect(spreadMarketJson.SpreadMarket.ForecastCurrentYear).to.not.be.undefined
    expect(spreadMarketJson.SpreadMarket.PlannedCurrentYear).to.not.be.undefined

    // Additional assertions for the mocked functions
    expect(tMock.callCount).eql(2)
  })
})
