// Imported from DPM-BE, commit d0e2f45544cc9890762f93cf3e8f224f15efd619
import { expect } from "chai"
import { DateTime } from "luxon"
import { kpi003RepositorySnowflake } from "../../../src/infrastructure/repositories/dpm/snowflake/kpi003RepositorySnowflake.js"
import { rollbackSnowflakeTransaction, startSnowflakeTransaction } from "../../snowflake/index.js"
import { SnowflakeTransaction, transactionStorage } from "../../../src/infrastructure/orm/snowflake/index.js"
import sinon from "sinon"
import { generateEBITDAResponseUseCase } from "../../../src/application/use_cases/dpm/generateEBITDAResponseUseCase.js"

const beforeFixture = async () => {
  // empty fixture
}

describe("generateEBITDAResponseUseCase", function () {
  this.timeout(10000)
  before(async () => startSnowflakeTransaction(beforeFixture))

  after(async () => {
    await rollbackSnowflakeTransaction()
  })
  it("should be return EBITDA Json", async () => {
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
    const EBITDAJson = await generateEBITDAResponseUseCase(plantCode, unitCode, timestamp, repo, tMock)

    // Assertions
    expect(EBITDAJson).not.to.be.undefined
    expect(EBITDAJson.PlantCode).to.equal(plantCode)
    expect(EBITDAJson.UnitCode).to.equal(unitCode)
    expect(EBITDAJson.EBITDA).not.to.be.undefined

    // Additional assertions for the EBITDA section
    expect(EBITDAJson.EBITDA.Annual).not.to.be.undefined
    expect(EBITDAJson.EBITDA.Daily).not.to.be.undefined
    expect(EBITDAJson.EBITDA.Weekly).not.to.be.undefined
    expect(EBITDAJson.EBITDA.Monthly).not.to.be.undefined
    expect(EBITDAJson.EBITDA.Cumulative).not.to.be.undefined
    expect(EBITDAJson.EBITDA.ForecastCurrentYear).not.to.be.undefined
    expect(EBITDAJson.EBITDA.PlannedCurrentYear).not.to.be.undefined

    // Additional assertions for the mocked functions
    expect(tMock.callCount).eql(4)
  })
})
