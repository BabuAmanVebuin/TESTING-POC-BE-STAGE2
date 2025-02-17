// Imported from DPM-BE, commit d0e2f45544cc9890762f93cf3e8f224f15efd619
import { expect } from "chai"
import { DateTime } from "luxon"
import { rollbackSnowflakeTransaction, startSnowflakeTransaction } from "../../snowflake/index.js"
import { SnowflakeTransaction, transactionStorage } from "../../../src/infrastructure/orm/snowflake/index.js"
import sinon from "sinon"
import { generateBasicChargeResponseUseCase } from "../../../src/application/use_cases/dpm/generateBasicChargeResponseUseCase.js"
import { basicChargeRepositorySnowflake } from "../../../src/infrastructure/repositories/dpm/snowflake/basicChargeRepositorySnowflake.js"

const beforeFixture = async () => {
  // empty fixture
}
describe("generateBasicChargeResponseUseCase", function () {
  this.timeout(10000)
  before(async () => startSnowflakeTransaction(beforeFixture))

  after(async () => {
    await rollbackSnowflakeTransaction()
  })

  it("should be return BasicCharge Json", async () => {
    // Mocked data
    const plantCode = "HE_"
    const unitCode = "HE_A100"
    const timestamp = Math.floor(DateTime.local().toSeconds())
    const snowflakeTransaction = transactionStorage.getStore()?.transaction as SnowflakeTransaction
    const repo = await basicChargeRepositorySnowflake(snowflakeTransaction)
    const tMock = sinon.stub().onCall(0).returns("VALUE.PREFIX_YEN").onCall(1).returns("VALUE.SUFFIX_OKU")
    // Call the use case function
    const basicChargeJson = await generateBasicChargeResponseUseCase(plantCode, unitCode, timestamp, repo, tMock)

    // Assertions
    expect(basicChargeJson).is.not.eql(undefined)
    expect(basicChargeJson.PlantCode).to.equal(plantCode)
    expect(basicChargeJson.UnitCode).to.equal(unitCode)
    expect(basicChargeJson.BasicCharge).is.not.eql(undefined)

    // Additional assertions for the mocked functions
    expect(tMock.callCount).eql(2)
  })
})
