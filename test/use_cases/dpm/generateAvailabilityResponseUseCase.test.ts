// Imported from DPM-BE, commit d0e2f45544cc9890762f93cf3e8f224f15efd619
import { expect } from "chai"
import { DateTime } from "luxon"
import { kpi003RepositorySnowflake } from "../../../src/infrastructure/repositories/dpm/snowflake/kpi003RepositorySnowflake.js"
import { rollbackSnowflakeTransaction, startSnowflakeTransaction } from "../../snowflake/index.js"
import { SnowflakeTransaction, transactionStorage } from "../../../src/infrastructure/orm/snowflake/index.js"
import sinon from "sinon"
import { generateAvailabilityResponseUseCase } from "../../../src/application/use_cases/dpm/generateAvailabilityResponseUseCase.js"

const beforeFixture = async () => {
  // empty fixture
}
describe("generateAvailabilityResponseUseCase", function () {
  this.timeout(10000)
  before(async () => startSnowflakeTransaction(beforeFixture))

  after(async () => {
    await rollbackSnowflakeTransaction()
  })
  it("should be return Availability Json", async () => {
    // Mocked data
    const plantCode = "HE_"
    const unitCode = "HE_A100"
    const timestamp = Math.floor(DateTime.local().toSeconds())
    const snowflakeTransaction = transactionStorage.getStore()?.transaction as SnowflakeTransaction
    const repo = await kpi003RepositorySnowflake(snowflakeTransaction)
    const tMock = sinon.stub().onCall(0).returns("VALUE.SUFFIX_PERCENTAGE")

    // Call the use case function
    const AvailabilityJson = await generateAvailabilityResponseUseCase(plantCode, unitCode, timestamp, repo, tMock)

    // Assertions
    expect(AvailabilityJson).to.not.be.undefined
    expect(AvailabilityJson.PlantCode).to.equal(plantCode)
    expect(AvailabilityJson.UnitCode).to.equal(unitCode)
    expect(AvailabilityJson.Availability).to.not.be.undefined

    // Additional assertions for the Availability section
    expect(AvailabilityJson.Availability.Annual).to.not.be.undefined
    expect(AvailabilityJson.Availability.Daily).to.not.be.undefined
    expect(AvailabilityJson.Availability.Weekly).to.not.be.undefined
    expect(AvailabilityJson.Availability.Monthly).to.not.be.undefined
    expect(AvailabilityJson.Availability.Cumulative).to.not.be.undefined
    expect(AvailabilityJson.Availability.ForecastCurrentYear).to.not.be.undefined
    expect(AvailabilityJson.Availability.PlannedCurrentYear).to.not.be.undefined

    // Additional assertions for the mocked functions
    expect(tMock.callCount).to.equal(2)
  })
})
