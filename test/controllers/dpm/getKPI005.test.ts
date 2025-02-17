// Imported from DPM-BE, commit d0e2f45544cc9890762f93cf3e8f224f15efd619
import * as E from "fp-ts/lib/Either.js"
import * as t from "io-ts"
import { expect } from "chai"
import { getKPI005Controller } from "../../../src/interface/controllers/dpm/KPI005/getKPI005Controller.js"
import { invalidPlantCodeError } from "../../../src/application/errors/dpm/InvalidPlantCodeError.js"
import { invalidPlantAndUnitCodeError } from "../../../src/application/errors/dpm/InvalidUnitCodeError.js"
import { invalidFiscalYearError } from "../../../src/application/errors/dpm/InvalidFiscalYearError.js"
import { rollbackSnowflakeTransaction, startSnowflakeTransaction } from "../../snowflake/index.js"
import { SnowflakeTransaction, wrapInSnowflakeTransaction } from "../../../src/infrastructure/orm/snowflake/index.js"
import { KPI005ResponseData } from "../../../src/domain/models/dpm/Kpi005.js"
import { i18n } from "../../../src/config/dpm/i18n/i18n-utils.js"

const beforeFixture = async () => {
  // Empty fixture
}

describe("getKPI005Controller", function () {
  this.timeout(10000)

  before(async () => startSnowflakeTransaction(beforeFixture))

  after(async () => {
    await rollbackSnowflakeTransaction()
  })

  // -------------------------------------------------------------------------------------
  // Should return error test cases
  // -------------------------------------------------------------------------------------

  it("should return invalidPlantCodeError when Plant Id is empty", async () => {
    const req = {
      plantCode: "",
      unitCode: "HE_A100",
      fiscalYear: "2022",
    }

    const res = await wrapInSnowflakeTransaction(async (snowflakeTransaction: SnowflakeTransaction) => {
      return await getKPI005Controller(req, snowflakeTransaction, i18n.__)
    })

    expect(res._tag).to.equal("Left")
    if (E.isLeft(res)) {
      expect(res.left).to.deep.equal(invalidPlantCodeError(i18n.__, req.plantCode))
    }
  })

  it("should return invalidPlantAndUnitCodeError when Plant Id is valid but unitCode is empty", async () => {
    const req = {
      plantCode: "HE_",
      unitCode: "",
      fiscalYear: "2022",
    }

    const res = await wrapInSnowflakeTransaction(async (snowflakeTransaction: SnowflakeTransaction) => {
      return await getKPI005Controller(req, snowflakeTransaction, i18n.__)
    })

    expect(res._tag).to.equal("Left")
    if (E.isLeft(res)) {
      expect(res.left).to.deep.equal(invalidPlantAndUnitCodeError(i18n.__, req.plantCode, req.unitCode))
    }
  })

  it("should return invalidPlantCodeError when plantCode is invalid and unitCode is valid", async () => {
    const req = {
      plantCode: "invalid plantCode",
      unitCode: "HE_A100",
      fiscalYear: "2022",
    }

    const res = await wrapInSnowflakeTransaction(async (snowflakeTransaction: SnowflakeTransaction) => {
      return await getKPI005Controller(req, snowflakeTransaction, i18n.__)
    })

    expect(res._tag).to.equal("Left")
    if (E.isLeft(res)) {
      expect(res.left).to.deep.equal(invalidPlantCodeError(i18n.__, req.plantCode))
    }
  })

  it("should return invalidPlantAndUnitCodeError if plantCode is valid but unitCode is not valid", async () => {
    const req = {
      plantCode: "HE_",
      unitCode: "invalid unitCode",
      fiscalYear: "2022",
    }

    const res = await wrapInSnowflakeTransaction(async (snowflakeTransaction: SnowflakeTransaction) => {
      return await getKPI005Controller(req, snowflakeTransaction, i18n.__)
    })

    expect(res._tag).to.equal("Left")
    if (E.isLeft(res)) {
      expect(res.left).to.deep.equal(invalidPlantAndUnitCodeError(i18n.__, req.plantCode, req.unitCode))
    }
  })

  it("should return invalidFiscalYearError if fiscalYear is wrong", async () => {
    const req = {
      plantCode: "HE_",
      unitCode: "HE_A100",
      fiscalYear: "-2022",
    }

    const res = await wrapInSnowflakeTransaction(async (snowflakeTransaction: SnowflakeTransaction) => {
      return await getKPI005Controller(req, snowflakeTransaction, i18n.__)
    })

    expect(res._tag).to.equal("Left")
    if (E.isLeft(res)) {
      expect(res.left).to.deep.equal(invalidFiscalYearError(i18n.__, req.fiscalYear))
    }
  })

  // -------------------------------------------------------------------------------------
  // Should return data test cases
  // -------------------------------------------------------------------------------------

  it("should return data when it exists in the database", async () => {
    const res = await wrapInSnowflakeTransaction(async (snowflakeTransaction: SnowflakeTransaction) => {
      return await getKPI005Controller(
        {
          plantCode: "HE_",
          unitCode: "HE_A100",
          fiscalYear: "2022",
        },
        snowflakeTransaction,
        i18n.__,
      )
    })

    expect(E.isRight(res)).to.be.true
    if (E.isRight(res)) {
      expect(res.right).not.to.be.null
      expect(validKpi005Response(res.right)).to.be.true
    }
  })
})

/**
 * Function to validate Kpi005Response
 * @param data
 */
function validKpi005Response(data: KPI005ResponseData) {
  const Annual = t.type({
    Plan: t.union([t.number, t.null]),
    ActualOrForcast: t.union([t.number, t.null]),
  })

  const NegativeOperationGrossMargin = t.type({
    Prefix: t.literal("¥"),
    Suffix: t.literal("Oku"),
    Annual: Annual,
    YearStartToPresent: Annual,
    PresentToYearEnd: Annual,
  })

  const NegativeOperationTime = t.type({
    Suffix: t.string,
    Annual: Annual,

    YearStartToPresent: Annual,
    PresentToYearEnd: Annual,
  })

  const Today = t.type({
    NegativeOperationGrossMargin: NegativeOperationGrossMargin,
    NegativeOperationTime: NegativeOperationTime,
    NegativeOperationAvgSpread: NegativeOperationTime,
  })

  const Data = t.type({
    PlantCode: t.string,
    UnitCode: t.string,
    Today: Today,
    PreviousDay: Today,
  })

  return E.isRight(Data.decode(data))
}
