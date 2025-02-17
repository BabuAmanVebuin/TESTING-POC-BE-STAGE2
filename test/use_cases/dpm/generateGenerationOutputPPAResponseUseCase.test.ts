// Imported from DPM-BE, commit d0e2f45544cc9890762f93cf3e8f224f15efd619
import { expect } from "chai"
import { DateTime } from "luxon"
import { rollbackSnowflakeTransaction, startSnowflakeTransaction } from "../../snowflake/index.js"
import { SnowflakeTransaction, transactionStorage } from "../../../src/infrastructure/orm/snowflake/index.js"
import { kpi003RepositorySnowflake } from "../../../src/infrastructure/repositories/dpm/snowflake/kpi003RepositorySnowflake.js"
import sinon from "sinon"
import { generateGenerationOutputPPAResponseUseCase } from "../../../src/application/use_cases/dpm/generateGenerationOutputPPAResponseUseCase.js"

const beforeFixture = async () => {
  // empty fixture
}

describe("generateGenerationOutputPPAResponseUseCase", function () {
  this.timeout(10000)

  before(async () => startSnowflakeTransaction(beforeFixture))

  after(async () => {
    await rollbackSnowflakeTransaction()
  })

  it("should be return GenerationOutputPPA Json", async () => {
    // Mocked data
    const plantCode = "HE_"
    const unitCode = "HE_A100"
    const timestamp = Math.floor(DateTime.local().toSeconds())

    const snowflakeTransaction = transactionStorage.getStore()?.transaction as SnowflakeTransaction
    const repo = await kpi003RepositorySnowflake(snowflakeTransaction)
    const tMock = sinon.stub().onCall(0).returns("VALUE.GWH").onCall(1).returns("VALUE.MWH")

    // Call the use case function
    const generationOutputPPAJson = await generateGenerationOutputPPAResponseUseCase(
      plantCode,
      unitCode,
      timestamp,
      repo,
      tMock,
    )

    // Assertions
    expect(generationOutputPPAJson).to.be.not.undefined
    expect(generationOutputPPAJson.PlantCode).to.equal(plantCode)
    expect(generationOutputPPAJson.UnitCode).to.equal(unitCode)
    expect(generationOutputPPAJson.GenerationOutputPPA).to.be.not.undefined

    // Additional assertions for the GenerationOutputPPA section
    expect(generationOutputPPAJson.GenerationOutputPPA.Annual).to.be.not.undefined
    expect(generationOutputPPAJson.GenerationOutputPPA.Daily).to.be.not.undefined
    expect(generationOutputPPAJson.GenerationOutputPPA.Weekly).to.be.not.undefined
    expect(generationOutputPPAJson.GenerationOutputPPA.Monthly).to.be.not.undefined
    expect(generationOutputPPAJson.GenerationOutputPPA.Cumulative).to.be.not.undefined
    expect(generationOutputPPAJson.GenerationOutputPPA.ForecastCurrentYear).to.be.not.undefined
    expect(generationOutputPPAJson.GenerationOutputPPA.PlannedCurrentYear).to.be.not.undefined

    // Additional assertions for the mocked functions
    expect(tMock.callCount).to.equal(2)
  })
})
