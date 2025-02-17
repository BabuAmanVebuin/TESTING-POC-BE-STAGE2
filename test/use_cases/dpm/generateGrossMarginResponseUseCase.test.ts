// Imported from DPM-BE, commit d0e2f45544cc9890762f93cf3e8f224f15efd619
import { expect } from "chai"
import { DateTime } from "luxon"
import { rollbackSnowflakeTransaction, startSnowflakeTransaction } from "../../snowflake/index.js"
import { SnowflakeTransaction, transactionStorage } from "../../../src/infrastructure/orm/snowflake/index.js"
import { kpi003RepositorySnowflake } from "../../../src/infrastructure/repositories/dpm/snowflake/kpi003RepositorySnowflake.js"
import { generateGrossMarginResponseUseCase } from "../../../src/application/use_cases/dpm/generateGrossMarginResponseUseCase.js"
import sinon from "sinon"

const beforeFixture = async () => {
  // empty fixture
}

describe("generateGrossMarginResponseUseCase", function () {
  this.timeout(10000)
  before(async () => startSnowflakeTransaction(beforeFixture))

  after(async () => {
    await rollbackSnowflakeTransaction()
  })

  it("should be return GrossMargin Json", async () => {
    // Mocked data
    const plantCode = "HE_"
    const unitCode = "HE_A100"
    const timestamp = Math.floor(DateTime.local().toSeconds())

    const snowflakeTransaction = transactionStorage.getStore()?.transaction as SnowflakeTransaction
    const repo = await kpi003RepositorySnowflake(snowflakeTransaction)
    const tMock = sinon.spy()

    // Call the use case function
    const GrossMarginJson = await generateGrossMarginResponseUseCase(plantCode, unitCode, timestamp, repo, tMock)

    // Assertions
    expect(GrossMarginJson).is.not.eql(undefined)
    expect(GrossMarginJson.PlantCode).eql(plantCode)
    expect(GrossMarginJson.UnitCode).eql(unitCode)
    expect(GrossMarginJson.GrossMargin).is.not.eql(undefined)

    // Additional assertions for the GrossMargin section
    expect(GrossMarginJson.GrossMargin.Annual).is.not.eql(undefined)
    expect(GrossMarginJson.GrossMargin.Daily).is.not.eql(undefined)
    expect(GrossMarginJson.GrossMargin.Weekly).is.not.eql(undefined)
    expect(GrossMarginJson.GrossMargin.Monthly).is.not.eql(undefined)
    expect(GrossMarginJson.GrossMargin.Cumulative).is.not.eql(undefined)
    expect(GrossMarginJson.GrossMargin.ForecastCurrentYear).is.not.eql(undefined)
    expect(GrossMarginJson.GrossMargin.PlannedCurrentYear).is.not.eql(undefined)

    // Additional assertions for the mocked functions
    expect(tMock.callCount).eql(4)
  })
})
