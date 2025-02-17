// Imported from DPM-BE, commit d0e2f45544cc9890762f93cf3e8f224f15efd619
import { either as E } from "fp-ts"
import { i18n } from "../../../src/config/dpm/i18n/i18n-utils.js"
import { rollbackSnowflakeTransaction, startSnowflakeTransaction } from "../../snowflake/index.js"
import { getSalesPriceController } from "../../../src/interface/controllers/dpm/Sales/getSalesPriceController.js"
import { SnowflakeTransaction, wrapInSnowflakeTransaction } from "../../../src/infrastructure/orm/snowflake/index.js"
import { expect } from "chai"

const beforeFixture = async () => {
  // empty fixture
}

describe("getSalesPrice", function () {
  this.timeout(10000)

  before(async () => startSnowflakeTransaction(beforeFixture))

  after(async () => {
    await rollbackSnowflakeTransaction()
  })

  it("Get a Data", async () => {
    const input = {
      plantId: "HE_",
      unitId: "HE_A100",
      fiscalYear: "2022",
    }

    const res = await wrapInSnowflakeTransaction(async (snowflakeTransaction: SnowflakeTransaction) => {
      return await getSalesPriceController(input, snowflakeTransaction, i18n.__)
    })

    expect(E.isRight(res)).to.be.true

    if (E.isRight(res)) {
      expect(res.right).not.to.be.null
      expect(res.right.PLANT_CODE).to.equal(input.plantId)
      expect(res.right.UNIT_CODE).to.equal(input.unitId)
      expect(res.right.SUFFIX).to.equal(i18n.__("VALUE.SUFFIX_YEN_KWH"))
      expect(res.right.SALES).to.be.an("array")
    }
  })

  it("Get InvalidFiscalYearError for fiscalYear is empty", async () => {
    const res = await wrapInSnowflakeTransaction(async (snowflakeTransaction: SnowflakeTransaction) => {
      return await getSalesPriceController(
        {
          plantId: "",
          unitId: "",
          fiscalYear: "",
        },
        snowflakeTransaction,
        i18n.__,
      )
    })

    expect(E.isLeft(res)).to.be.true

    if (E.isLeft(res)) {
      expect(res.left).not.to.be.null
      expect(res.left._tag).to.equal("InvalidFiscalYearError")
    }
  })

  it("Get InvalidPlantAndUnitCodeError for plantId, unitId", async () => {
    const res = await wrapInSnowflakeTransaction(async (snowflakeTransaction: SnowflakeTransaction) => {
      return await getSalesPriceController(
        {
          plantId: "<Invalid Plant code>",
          unitId: "<Invalid Plant code>",
          fiscalYear: "2002",
        },
        snowflakeTransaction,
        i18n.__,
      )
    })

    expect(E.isLeft(res)).to.be.true

    if (E.isLeft(res)) {
      expect(res.left).not.to.be.null
      expect(res.left._tag).to.equal("InvalidPlantAndUnitCodeError")
    }
  })

  it("Get InvalidFiscalYearError for Invalid fiscalYear", async () => {
    const res = await wrapInSnowflakeTransaction(async (snowflakeTransaction: SnowflakeTransaction) => {
      return await getSalesPriceController(
        {
          plantId: "HE_",
          unitId: "HE_100",
          fiscalYear: "<Invalid Year>",
        },
        snowflakeTransaction,
        i18n.__,
      )
    })

    if (E.isLeft(res)) {
      expect(res.left).not.to.be.null
      expect(res.left._tag).to.equal("InvalidFiscalYearError")
    }
  })
})
