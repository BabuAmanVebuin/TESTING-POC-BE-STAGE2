// Imported from DPM-BE, commit d0e2f45544cc9890762f93cf3e8f224f15efd619
import { expect } from "chai"
import { DateTime } from "luxon"
import { rollbackSnowflakeTransaction, startSnowflakeTransaction } from "../../snowflake/index.js"
import { SnowflakeTransaction, transactionStorage } from "../../../src/infrastructure/orm/snowflake/index.js"
import { kpi003RepositorySnowflake } from "../../../src/infrastructure/repositories/dpm/snowflake/kpi003RepositorySnowflake.js"
import sinon from "sinon"
import { generateGenerationOutputMarketResponseUseCase } from "../../../src/application/use_cases/dpm/generateGenerationOutputMarketResponseUseCase.js"

const beforeFixture = async () => {
  // empty fixture
}

describe("generateGenerationOutputMarketResponseUseCase", function () {
  this.timeout(10000)

  before(async () => startSnowflakeTransaction(beforeFixture))

  after(async () => {
    await rollbackSnowflakeTransaction()
  })

  it("should be return GenerationOutputMarket Json", async () => {
    // Mocked data
    const plantCode = "HE_"
    const unitCode = "HE_A100"
    const timestamp = Math.floor(DateTime.local().toSeconds())

    const snowflakeTransaction = transactionStorage.getStore()?.transaction as SnowflakeTransaction
    const repo = await kpi003RepositorySnowflake(snowflakeTransaction)
    const tMock = sinon.stub().onCall(0).returns("VALUE.GWH").onCall(1).returns("VALUE.MWH")
    // Call the use case function
    const generationOutputMarketJson = await generateGenerationOutputMarketResponseUseCase(
      plantCode,
      unitCode,
      timestamp,
      repo,
      tMock,
    )

    // Assertions
    expect(generationOutputMarketJson).to.be.not.undefined
    expect(generationOutputMarketJson.PlantCode).to.equal(plantCode)
    expect(generationOutputMarketJson.UnitCode).to.equal(unitCode)
    expect(generationOutputMarketJson.GenerationOutputMarket).to.be.not.undefined

    // Additional assertions for the GenerationOutputMarket section
    expect(generationOutputMarketJson.GenerationOutputMarket.Annual).to.be.not.undefined
    expect(generationOutputMarketJson.GenerationOutputMarket.Daily).to.be.not.undefined
    expect(generationOutputMarketJson.GenerationOutputMarket.Weekly).to.be.not.undefined
    expect(generationOutputMarketJson.GenerationOutputMarket.Monthly).to.be.not.undefined
    expect(generationOutputMarketJson.GenerationOutputMarket.Cumulative).to.be.not.undefined
    expect(generationOutputMarketJson.GenerationOutputMarket.ForecastCurrentYear).to.be.not.undefined
    expect(generationOutputMarketJson.GenerationOutputMarket.PlannedCurrentYear).to.be.not.undefined

    // Additional assertions for the mocked functions
    expect(tMock.callCount).to.equal(2)
  })
})
