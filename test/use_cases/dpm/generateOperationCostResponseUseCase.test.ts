// Imported from DPM-BE, commit d0e2f45544cc9890762f93cf3e8f224f15efd619
import { expect } from "chai"
import { DateTime } from "luxon"
import { kpi003RepositorySnowflake } from "../../../src/infrastructure/repositories/dpm/snowflake/kpi003RepositorySnowflake.js"
import { rollbackSnowflakeTransaction, startSnowflakeTransaction } from "../../snowflake/index.js"
import { SnowflakeTransaction, transactionStorage } from "../../../src/infrastructure/orm/snowflake/index.js"
import sinon from "sinon"
import { generateOperationCostResponseUseCase } from "../../../src/application/use_cases/dpm/generateOperationCostResponseUseCase.js"

const beforeFixture = async () => {
  // empty fixture
}
describe("generateOperationCostResponseUseCase", function () {
  this.timeout(10000)
  before(async () => startSnowflakeTransaction(beforeFixture))

  after(async () => {
    await rollbackSnowflakeTransaction()
  })

  it("should be return OperationCost Json", async () => {
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
    const OperationCostJson = await generateOperationCostResponseUseCase(plantCode, unitCode, timestamp, repo, tMock)

    // Assertions
    expect(OperationCostJson).is.not.eql(undefined)
    expect(OperationCostJson.PlantCode).to.equal(plantCode)
    expect(OperationCostJson.UnitCode).to.equal(unitCode)
    expect(OperationCostJson.OperationCost).is.not.eql(undefined)

    // Additional assertions for the OperationCost section
    expect(OperationCostJson.OperationCost.Annual).is.not.eql(undefined)
    expect(OperationCostJson.OperationCost.Daily).is.not.eql(undefined)
    expect(OperationCostJson.OperationCost.Weekly).is.not.eql(undefined)
    expect(OperationCostJson.OperationCost.Monthly).is.not.eql(undefined)
    expect(OperationCostJson.OperationCost.Cumulative).is.not.eql(undefined)
    expect(OperationCostJson.OperationCost.ForecastCurrentYear).is.not.eql(undefined)
    expect(OperationCostJson.OperationCost.PlannedCurrentYear).is.not.eql(undefined)

    // Additional assertions for the mocked functions
    expect(tMock.callCount).eql(4)
  })
})
