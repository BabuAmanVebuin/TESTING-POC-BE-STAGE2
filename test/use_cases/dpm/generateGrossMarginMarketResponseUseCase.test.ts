// Imported from DPM-BE, commit d0e2f45544cc9890762f93cf3e8f224f15efd619
import { expect } from "chai"
import { DateTime } from "luxon"
import { kpi003RepositorySnowflake } from "../../../src/infrastructure/repositories/dpm/snowflake/kpi003RepositorySnowflake.js"
import { rollbackSnowflakeTransaction, startSnowflakeTransaction } from "../../snowflake/index.js"
import { SnowflakeTransaction, transactionStorage } from "../../../src/infrastructure/orm/snowflake/index.js"
import sinon from "sinon"
import { generateGrossMarginMarketResponseUseCase } from "../../../src/application/use_cases/dpm/generateGrossMarginMarketResponseUseCase.js"

const beforeFixture = async () => {
  // empty fixture
}

describe("generateGrossMarginMarketResponseUseCase", function () {
  this.timeout(10000)

  before(async function () {
    await startSnowflakeTransaction(beforeFixture)
  })

  after(async function () {
    await rollbackSnowflakeTransaction()
  })

  it("should be return GrossMarginMarket Json", async function () {
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
    const GrossMarginMarketJson = await generateGrossMarginMarketResponseUseCase(
      plantCode,
      unitCode,
      timestamp,
      repo,
      tMock,
    )

    // Assertions
    expect(GrossMarginMarketJson).to.not.be.undefined
    expect(GrossMarginMarketJson.PlantCode).to.equal(plantCode)
    expect(GrossMarginMarketJson.UnitCode).to.equal(unitCode)
    expect(GrossMarginMarketJson.GrossMarginMarket).to.not.be.undefined

    // Additional assertions for the GrossMarginMarket section
    expect(GrossMarginMarketJson.GrossMarginMarket.Annual).to.not.be.undefined
    expect(GrossMarginMarketJson.GrossMarginMarket.Daily).to.not.be.undefined
    expect(GrossMarginMarketJson.GrossMarginMarket.Weekly).to.not.be.undefined
    expect(GrossMarginMarketJson.GrossMarginMarket.Monthly).to.not.be.undefined
    expect(GrossMarginMarketJson.GrossMarginMarket.Cumulative).to.not.be.undefined
    expect(GrossMarginMarketJson.GrossMarginMarket.ForecastCurrentYear).to.not.be.undefined
    expect(GrossMarginMarketJson.GrossMarginMarket.PlannedCurrentYear).to.not.be.undefined

    // Additional assertions for the mocked functions
    expect(tMock.callCount).to.equal(4)
  })
})
