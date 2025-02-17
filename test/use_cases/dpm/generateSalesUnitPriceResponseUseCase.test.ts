// Imported from DPM-BE, commit d0e2f45544cc9890762f93cf3e8f224f15efd619
import { expect } from "chai"
import { DateTime } from "luxon"
import { kpi003RepositorySnowflake } from "../../../src/infrastructure/repositories/dpm/snowflake/kpi003RepositorySnowflake.js"
import { generateSalesUnitPriceResponseUseCase } from "../../../src/application/use_cases/dpm/generateSalesUnitPriceResponseUseCase.js"
import { SnowflakeTransaction, transactionStorage } from "../../../src/infrastructure/orm/snowflake/index.js"
import sinon from "sinon"
import { rollbackSnowflakeTransaction, startSnowflakeTransaction } from "../../snowflake/index.js"

const beforeFixture = async () => {
  // empty fixture
}

describe("generateSalesUnitPriceResponseUseCase", function () {
  this.timeout(10000)
  before(async () => startSnowflakeTransaction(beforeFixture))

  after(async () => {
    await rollbackSnowflakeTransaction()
  })
  it("should be return SalesUnitPrice Json", async () => {
    // Mocked data
    const plantCode = "HE_"
    const unitCode = "HE_A100"
    const timestamp = Math.floor(DateTime.local().toSeconds())

    const snowflakeTransaction = transactionStorage.getStore()?.transaction as SnowflakeTransaction
    const repo = await kpi003RepositorySnowflake(snowflakeTransaction)

    const tMock = sinon.spy()

    // Call the use case function
    const SalesUnitPriceJson = await generateSalesUnitPriceResponseUseCase(plantCode, unitCode, timestamp, repo, tMock)

    // Assertions
    expect(SalesUnitPriceJson).to.exist
    expect(SalesUnitPriceJson.PlantCode).to.equal(plantCode)
    expect(SalesUnitPriceJson.UnitCode).to.equal(unitCode)
    expect(SalesUnitPriceJson.SalesUnitPrice).to.exist

    // Additional assertions for the SalesUnitPrice section
    expect(SalesUnitPriceJson.SalesUnitPrice.Annual).to.exist
    expect(SalesUnitPriceJson.SalesUnitPrice.Daily).to.exist
    expect(SalesUnitPriceJson.SalesUnitPrice.Weekly).to.exist
    expect(SalesUnitPriceJson.SalesUnitPrice.Monthly).to.exist
    expect(SalesUnitPriceJson.SalesUnitPrice.Cumulative).to.exist
    expect(SalesUnitPriceJson.SalesUnitPrice.ForecastCurrentYear).to.exist
    expect(SalesUnitPriceJson.SalesUnitPrice.PlannedCurrentYear).to.exist

    // Additional assertions for the mocked functions
    expect(tMock.callCount).to.equal(2)
  })
})
