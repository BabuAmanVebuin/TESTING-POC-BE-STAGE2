// Imported from DPM-BE, commit d0e2f45544cc9890762f93cf3e8f224f15efd619
import { expect } from "chai"
import { DateTime } from "luxon"
import { transactionStorage, SnowflakeTransaction } from "../../../src/infrastructure/orm/snowflake/index.js"
import sinon from "sinon"
import { rollbackSnowflakeTransaction, startSnowflakeTransaction } from "../../snowflake/index.js"
import { kpi003RepositorySnowflake } from "../../../src/infrastructure/repositories/dpm/snowflake/kpi003RepositorySnowflake.js"
import { generateGenerationOutputResponseUseCase } from "../../../src/application/use_cases/dpm/generateGenerationOutputResponseUseCase.js"

const beforeFixture = async () => {
  // empty fixture
}

describe("generateGenerationOutputResponseUseCase", function () {
  this.timeout(10000)
  before(async () => startSnowflakeTransaction(beforeFixture))

  after(async () => {
    await rollbackSnowflakeTransaction()
  })

  it("should be return GenerationOutput Json", async () => {
    // Mocked data
    const plantCode = "HE_"
    const unitCode = "HE_A100"
    const timestamp = Math.floor(DateTime.local().toSeconds())
    const snowflakeTransaction = transactionStorage.getStore()?.transaction as SnowflakeTransaction
    const repo = await kpi003RepositorySnowflake(snowflakeTransaction)
    const tMock = sinon.stub().onCall(0).returns("VALUE.GWH").onCall(1).returns("VALUE.MWH")

    // Call the use case function
    const generationOutputJson = await generateGenerationOutputResponseUseCase(
      plantCode,
      unitCode,
      timestamp,
      repo,
      tMock,
    )

    // Assertions
    expect(generationOutputJson).to.be.not.null
    expect(generationOutputJson.PlantCode).to.equal(plantCode)
    expect(generationOutputJson.UnitCode).to.equal(unitCode)
    expect(generationOutputJson.GenerationOutput).to.be.not.null

    // Additional assertions for the GenerationOutput section
    expect(generationOutputJson.GenerationOutput.Annual).to.be.not.null
    expect(generationOutputJson.GenerationOutput.Daily).to.be.not.null
    expect(generationOutputJson.GenerationOutput.Weekly).to.be.not.null
    expect(generationOutputJson.GenerationOutput.Monthly).to.be.not.null
    expect(generationOutputJson.GenerationOutput.Cumulative).to.be.not.null
    expect(generationOutputJson.GenerationOutput.ForecastCurrentYear).to.be.not.null
    expect(generationOutputJson.GenerationOutput.PlannedCurrentYear).to.be.not.null

    // Additional assertions for the mocked functions
    expect(tMock.callCount).to.equal(2)
  })
})
