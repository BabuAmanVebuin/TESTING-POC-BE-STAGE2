// Imported from DPM-BE, commit d0e2f45544cc9890762f93cf3e8f224f15efd619
import { expect } from "chai"
import { DateTime } from "luxon"
import { kpi003RepositorySnowflake } from "../../../src/infrastructure/repositories/dpm/snowflake/kpi003RepositorySnowflake.js"
import { generateOPEXResponseUseCase } from "../../../src/application/use_cases/dpm/generateOPEXResponseUseCase.js"
import { rollbackSnowflakeTransaction, startSnowflakeTransaction } from "../../snowflake/index.js"
import { SnowflakeTransaction, transactionStorage } from "../../../src/infrastructure/orm/snowflake/index.js"
import sinon from "sinon"

const beforeFixture = async () => {
  // empty fixture
}

describe("generateOPEXResponseUseCase", function () {
  this.timeout(10000)
  before(async () => startSnowflakeTransaction(beforeFixture))

  after(async () => {
    await rollbackSnowflakeTransaction()
  })

  it("should be return O Json", async () => {
    // Mocked data
    const plantCode = "HE_"
    const unitCode = "HE_A100"
    const timestamp = Math.floor(DateTime.local().toSeconds())

    const snowflakeTransaction = transactionStorage.getStore()?.transaction as SnowflakeTransaction
    const repo = await kpi003RepositorySnowflake(snowflakeTransaction)
    const tMock = sinon
      .stub()
      .onCall(0)
      .returns("VALUE.PREFIX_YEN")
      .onCall(1)
      .returns("VALUE.SUFFIX_OKU")
      .onCall(2)
      .returns("VALUE.SUFFIX_MAN")

    // Call the use case function
    const MaintenanceCostJson = await generateOPEXResponseUseCase(plantCode, unitCode, timestamp, repo, tMock)

    // Assertions
    expect(MaintenanceCostJson).to.be.exist
    expect(MaintenanceCostJson.PlantCode).to.equal(plantCode)
    expect(MaintenanceCostJson.UnitCode).to.equal(unitCode)
    expect(MaintenanceCostJson.OPEX).to.be.exist

    // Additional assertions for the OPEX section
    expect(MaintenanceCostJson.OPEX.Annual).to.be.exist
    expect(MaintenanceCostJson.OPEX.Daily).to.be.exist
    expect(MaintenanceCostJson.OPEX.Weekly).to.be.exist
    expect(MaintenanceCostJson.OPEX.Monthly).to.be.exist
    expect(MaintenanceCostJson.OPEX.Cumulative).to.be.exist
    expect(MaintenanceCostJson.OPEX.ForecastCurrentYear).to.be.exist
    expect(MaintenanceCostJson.OPEX.PlannedCurrentYear).to.be.exist

    // Additional assertions for the mocked functions
    expect(tMock.callCount).eql(4)
  })
})
