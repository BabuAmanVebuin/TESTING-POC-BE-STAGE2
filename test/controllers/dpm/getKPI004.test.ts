// Imported from DPM-BE, commit d0e2f45544cc9890762f93cf3e8f224f15efd619
import * as E from "fp-ts/lib/Either.js"
import * as t from "io-ts"
import { getKPI004Controller } from "../../../src/interface/controllers/dpm/KPI004/getKPI004Controller.js"
import { invalidPlantCodeError } from "../../../src/application/errors/dpm/InvalidPlantCodeError.js"
import { invalidPlantAndUnitCodeError } from "../../../src/application/errors/dpm/InvalidUnitCodeError.js"
import { invalidFiscalYearError } from "../../../src/application/errors/dpm/InvalidFiscalYearError.js"
import { KPI004Response } from "../../../src/domain/models/dpm/Kpi004.js"
import { rollbackSnowflakeTransaction, startSnowflakeTransaction } from "../../snowflake/index.js"
import { SnowflakeTransaction, wrapInSnowflakeTransaction } from "../../../src/infrastructure/orm/snowflake/index.js"
import { expect } from "chai"
import { i18n } from "../../../src/config/dpm/i18n/i18n-utils.js"

const beforeFixture = async () => {
  // empty fixture
}

describe("getKPI004Controller", function () {
  this.timeout(10000)

  before(async () => startSnowflakeTransaction(beforeFixture))

  after(async () => {
    await rollbackSnowflakeTransaction()
  })

  // -------------------------------------------------------------------------------------
  // should return error test case
  // -------------------------------------------------------------------------------------
  it("should return Left when Plant Id is empty", async () => {
    /**
     * Test Data
     */
    const req = {
      plantCode: "",
      unitCode: "HE_A100",
      fiscalYear: "2023",
    }
    const res = await wrapInSnowflakeTransaction(async (snowflakeTransaction: SnowflakeTransaction) => {
      return await getKPI004Controller(req, snowflakeTransaction, i18n.__)
    })

    expect(res._tag).to.equal("Left")

    if (E.isLeft(res)) {
      expect(res.left).to.deep.equal(invalidPlantCodeError(i18n.__, req.plantCode))
    }
  })

  it("should return Left Plant Id valid but unitCode is empty", async () => {
    /**
     * Test Data
     */
    const req = {
      plantCode: "HE_",
      unitCode: "",
      fiscalYear: "2025",
    }
    const res = await wrapInSnowflakeTransaction(async (snowflakeTransaction: SnowflakeTransaction) => {
      return await getKPI004Controller(req, snowflakeTransaction, i18n.__)
    })

    expect(res._tag).to.equal("Left")

    if (E.isLeft(res)) {
      expect(res.left).to.deep.equal(invalidPlantAndUnitCodeError(i18n.__, req.plantCode, req.unitCode))
    }
  })

  it("should return Left if plantCode invalid and unitCode is valid", async () => {
    /**
     * Test Data
     */
    const req = {
      plantCode: "invalid plantCode",
      unitCode: "HE_A100",
      fiscalYear: "2025",
    }
    const res = await wrapInSnowflakeTransaction(async (snowflakeTransaction: SnowflakeTransaction) => {
      return await getKPI004Controller(req, snowflakeTransaction, i18n.__)
    })

    expect(res._tag).to.equal("Left")

    if (E.isLeft(res)) {
      expect(res.left).to.deep.equal(invalidPlantCodeError(i18n.__, req.plantCode))
    }
  })

  it("should return Left if plantCode valid but unitCode is not valid", async () => {
    /**
     * Test Data
     */
    const req = {
      plantCode: "HE_",
      unitCode: "invalid unitCode",
      fiscalYear: "2025",
    }
    const res = await wrapInSnowflakeTransaction(async (snowflakeTransaction: SnowflakeTransaction) => {
      return await getKPI004Controller(req, snowflakeTransaction, i18n.__)
    })

    expect(res._tag).to.equal("Left")

    if (E.isLeft(res)) {
      expect(res.left).to.deep.equal(invalidPlantAndUnitCodeError(i18n.__, req.plantCode, req.unitCode))
    }
  })

  it("should return Left if plantCode valid but unitCode is not valid", async () => {
    /**
     * Test Data
     */
    const req = {
      plantCode: "HE_",
      unitCode: "invalid unitCode",
      fiscalYear: "",
    }
    const res = await wrapInSnowflakeTransaction(async (snowflakeTransaction: SnowflakeTransaction) => {
      return await getKPI004Controller(req, snowflakeTransaction, i18n.__)
    })

    expect(res._tag).to.equal("Left")

    if (E.isLeft(res)) {
      expect(res.left).to.deep.equal(invalidFiscalYearError(i18n.__, req.fiscalYear))
    }
  })

  // -------------------------------------------------------------------------------------
  // should return data test case
  // -------------------------------------------------------------------------------------
  it("should return Data if exist in the database", async () => {
    const res = await wrapInSnowflakeTransaction(async (snowflakeTransaction: SnowflakeTransaction) => {
      return await getKPI004Controller(
        {
          plantCode: "HE_",
          unitCode: "HE_A100",
          fiscalYear: "2025",
        },
        snowflakeTransaction,
        i18n.__,
      )
    })

    expect(E.isRight(res)).to.be.true

    if (E.isRight(res)) {
      expect(res.right).to.not.be.null
      // check res type is valid
      expect(checkGetKpi004Output(res.right)).to.be.true
    }
  })
})

/**
 * Function to validate checkGetKpi004Output
 * @param res getKPI004Controller res
 */
function checkGetKpi004Output(res: KPI004Response): boolean {
  const Annual = t.type({
    ActualOrForcastHours: t.union([t.null, t.number]),
    PlanHours: t.union([t.null, t.number]),
    PositveImpactHours: t.union([t.null, t.number]),
    NagetiveImpactHours: t.union([t.null, t.number]),
  })

  const GrossMarginImpactAnnual = t.type({
    PluseImpact: t.union([t.null, t.number]),
    MinuseImpact: t.number,
  })

  const SellingPriceAtOutageAnnual = t.type({
    PlannedPlanAvgPrice: t.union([t.null, t.number]),
    PlannedActualOrForcastAvgPrice: t.union([t.null, t.number]),
    UnplannedAvgPrice: t.number,
  })

  const GrossMarginImpact = t.type({
    Prefix: t.literal("¥"),
    Suffix: t.literal(i18n.__("VALUE.SUFFIX_OKU")),
    Annual: GrossMarginImpactAnnual,
    YearStartToPresent: GrossMarginImpactAnnual,
    PresentToYearEnd: GrossMarginImpactAnnual,
  })

  const SellingPriceAtOutageYearStartToPresent = t.type({
    PlannedPlanAvgPrice: t.union([t.null, t.number]),
    PlannedPlanRecords: t.union([t.null, t.number]),
    PlannedActualOrForcastAvgPrice: t.union([t.null, t.number]),
    PlannedActualOrForcastRecords: t.union([t.null, t.number]),
    UnplannedAvgPrice: t.number,
    UnplannedRecords: t.union([t.null, t.number]),
  })

  const SellingPriceAtOutage = t.type({
    Suffix: t.literal(i18n.__("VALUE.SUFFIX_YEN_KWH")),
    Annual: SellingPriceAtOutageAnnual,
    YearStartToPresent: SellingPriceAtOutageYearStartToPresent,
    PresentToYearEnd: SellingPriceAtOutageYearStartToPresent,
  })
  const YearStartToPresent = t.type({
    ActualOrForcastHours: t.union([t.null, t.number]),
    PlanHours: t.union([t.null, t.number]),
    PlannedDecreseHours: t.union([t.null, t.number]),
    PlannedDecreseRecords: t.union([t.null, t.Int]),
    PlannedIncreseHours: t.union([t.null, t.number]),
    PlannedIncreseRecords: t.union([t.null, t.Int]),
    CancledHours: t.union([t.null, t.number]),
    CancledRecords: t.union([t.null, t.Int]),
    UnplannedHours: t.union([t.null, t.number]),
    UnplannedRecords: t.union([t.null, t.Int]),
  })
  const StoppageTime = t.type({
    Annual: Annual,
    YearStartToPresent: YearStartToPresent,
    PresentToYearEnd: YearStartToPresent,
  })

  const Today = t.type({
    StoppageTime: StoppageTime,
    GrossMarginImpact: GrossMarginImpact,
    SellingPriceAtOutage: SellingPriceAtOutage,
  })

  const RootInterface = t.type({
    PlantCode: t.string,
    UnitCode: t.string,
    Today: Today,
    PreviousDay: Today,
  })

  return E.isRight(RootInterface.decode(res))
}
