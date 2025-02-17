// Imported from DPM-BE, commit d0e2f45544cc9890762f93cf3e8f224f15efd619
import { rollbackSnowflakeTransaction, startSnowflakeTransaction } from "../../snowflake/index.js"
import { SnowflakeTransaction, wrapInSnowflakeTransaction } from "../../../src/infrastructure/orm/snowflake/index.js"
import { getStoppageController } from "../../../src/interface/controllers/dpm/Stoppage/stoppageController.js"
import { expect } from "chai"
import { i18n } from "../../../src/config/dpm/i18n/i18n-utils.js"

const beforeFixture = async () => {
  // empty fixture
}

describe("getStoppageController", function () {
  this.timeout(10000)

  before(async () => startSnowflakeTransaction(beforeFixture))

  after(async () => {
    await rollbackSnowflakeTransaction()
  })

  it("Get data", async () => {
    const res = await wrapInSnowflakeTransaction(async (snowflakeTransaction: SnowflakeTransaction) => {
      return await getStoppageController(
        {
          plantCode: "HE_",
          unitCode: "HE_A100",
          fiscalYear: "2021",
        },
        snowflakeTransaction,
        i18n.__,
      )
    })
    expect(res._tag).to.equal("Right")
  })

  it("Get Bad request for Plant Id length = 0", async () => {
    const res = await wrapInSnowflakeTransaction(async (snowflakeTransaction: SnowflakeTransaction) => {
      return await getStoppageController(
        {
          plantCode: "",
          unitCode: "",
          fiscalYear: "2021",
        },
        snowflakeTransaction,
        i18n.__,
      )
    })
    expect(res._tag).to.equal("Left")
  })

  it("Get Bad request for invalid unit code format", async () => {
    const res = await wrapInSnowflakeTransaction(async (snowflakeTransaction: SnowflakeTransaction) => {
      return await getStoppageController(
        {
          plantCode: "HE_",
          unitCode: "InvalidUnitCodeInvalidUnitCodeInvalidUnitCode",
          fiscalYear: "2021",
        },
        snowflakeTransaction,
        i18n.__,
      )
    })
    expect(res._tag).to.equal("Left")
  })

  it("Get Bad request on invalid combination", async () => {
    const res = await wrapInSnowflakeTransaction(async (snowflakeTransaction: SnowflakeTransaction) => {
      return await getStoppageController(
        {
          plantCode: "InvalidPlantCodeInvalidPlantCode",
          unitCode: "InvalidUnitCodeInvalidUnitCodeInvalidUnitCodeInvalidUnitCode",
          fiscalYear: "2021",
        },
        snowflakeTransaction,
        i18n.__,
      )
    })
    expect(res._tag).to.equal("Left")
  })

  it("Get Bad request on invalid fiscalYear", async () => {
    const res = await wrapInSnowflakeTransaction(async (snowflakeTransaction: SnowflakeTransaction) => {
      return await getStoppageController(
        {
          plantCode: "HE_",
          unitCode: "A710",
          fiscalYear: "",
        },
        snowflakeTransaction,
        i18n.__,
      )
    })
    expect(res._tag).to.equal("Left")
  })
})
