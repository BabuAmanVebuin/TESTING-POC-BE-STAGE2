// Imported from DPM-BE, commit d0e2f45544cc9890762f93cf3e8f224f15efd619
import * as E from "fp-ts/lib/Either.js"
import { expect } from "chai"
import { invalidPlantCodeError } from "../../../src/application/errors/dpm/InvalidPlantCodeError.js"
import { invalidPlantAndUnitCodeError } from "../../../src/application/errors/dpm/InvalidUnitCodeError.js"
import { rollbackSnowflakeTransaction, startSnowflakeTransaction } from "../../snowflake/index.js"
import { SnowflakeTransaction } from "../../../src/infrastructure/orm/snowflake/index.js"
import { i18n } from "../../../src/config/dpm/i18n/i18n-utils.js"
import { StartStopCostsRepositoryPort } from "../../../src/application/port/repositories/dpm/StartStopCostsRepositoryPort.js"
import { StartStopCostsRepositorSnowflake } from "../../../src/infrastructure/repositories/dpm/snowflake/StartStopCostsRepositorySnowflake.js"
import { closeTransaction, startTransaction } from "../../integration/sequelize/index.js"
import { Transaction } from "sequelize"
import { getStartStopCostsController } from "../../../src/interface/controllers/dpm/StartStopCost/getStartStopCostsController.js"
let snowflakeRepository: StartStopCostsRepositoryPort
const beforeFixture = (_t: Transaction) => async (snowflakeTransaction: SnowflakeTransaction) => {
  snowflakeRepository = await StartStopCostsRepositorSnowflake(snowflakeTransaction)
}
describe("getStartStopCostsController", function () {
  this.timeout(10000)

  before(async () => startTransaction((transaction) => startSnowflakeTransaction(beforeFixture(transaction))))

  after(async () => {
    await closeTransaction()
    await rollbackSnowflakeTransaction()
  })

  //------------------------------------------------------------------------------------
  // should return error test
  // -----------------------------------------------------------------------------------
  it("should return invalidPlantCodeError when Plant Id is empty", async () => {
    // test data
    const req = {
      plantCode: "",
      unitCode: "HE_A100",
      fiscalYear: "2021",
      startupMode: "COLD",
    }
    const res = await getStartStopCostsController(req, snowflakeRepository, i18n.__)
    expect(res._tag).to.equal("Left")
    if (E.isLeft(res)) {
      expect(res.left).to.deep.equal(invalidPlantCodeError(i18n.__, req.plantCode))
    }
  })

  it("should return invalidPlantAndUnitCodeError when Plant Id valid but unitCode is empty", async () => {
    // test data
    const req = {
      plantCode: "HE_",
      unitCode: "",
      fiscalYear: "2021",
      startupMode: "COLD",
    }
    const res = await getStartStopCostsController(req, snowflakeRepository, i18n.__)
    expect(res._tag).to.equal("Left")
    if (E.isLeft(res)) {
      expect(res.left).to.deep.equal(invalidPlantAndUnitCodeError(i18n.__, req.plantCode, req.unitCode))
    }
  })

  it("should return invalidPlantCodeError when plantCode is invalid and unitCode is valid", async () => {
    // test data
    const req = {
      plantCode: "invalid plantCode",
      unitCode: "HE_A100",
      fiscalYear: "2021",
      startupMode: "COLD",
    }
    const res = await getStartStopCostsController(req, snowflakeRepository, i18n.__)
    expect(res._tag).to.equal("Left")
    if (E.isLeft(res)) {
      expect(res.left).to.deep.equal(invalidPlantCodeError(i18n.__, req.plantCode))
    }
  })

  it("should return invalidPlantAndUnitCodeError if plantCode is valid but unitCode is not valid", async () => {
    // test data
    const req = {
      plantCode: "HE_",
      unitCode: "invalid unitCode",
      fiscalYear: "2021",
      startupMode: "COLD",
    }
    const res = await getStartStopCostsController(req, snowflakeRepository, i18n.__)
    expect(res._tag).to.equal("Left")
    if (E.isLeft(res)) {
      expect(res.left).to.deep.equal(invalidPlantAndUnitCodeError(i18n.__, req.plantCode, req.unitCode))
    }
  })

  it("should return invalidPlantAndUnitCodeError if plantCode is valid but unitCode is not valid", async () => {
    // test data
    const req = {
      plantCode: "HE_",
      unitCode: "undefined",
      fiscalYear: "2021",
      startupMode: "COLD",
    }
    const res = await getStartStopCostsController(req, snowflakeRepository, i18n.__)
    expect(res._tag).to.equal("Left")
    if (E.isLeft(res)) {
      expect(res.left).to.deep.equal(invalidPlantAndUnitCodeError(i18n.__, req.plantCode, req.unitCode))
    }
  })

  //------------------------------------------------------------------------------------
  // should return valid response
  //------------------------------------------------------------------------------------

  it("should return valid response for Unit", async () => {
    // test data
    const req = {
      plantCode: "HE_",
      unitCode: "HE_A100",
      fiscalYear: "2021",
      startupMode: "COLD",
    }
    const res = await getStartStopCostsController(req, snowflakeRepository, i18n.__)
    expect(res._tag).to.equal("Right")
    if (E.isRight(res)) {
      expect(res.right.PlantCode).to.equal(req.plantCode)
      expect(res.right.UnitCode).to.equal(req.unitCode)
      expect(res.right.StartupMode).to.equal(req.startupMode)
      expect(res.right.FiscalYear).to.equal(Number(req.fiscalYear))

      expect(res.right.MonthlyCost.Period.length).to.be.lessThan(366)
      expect(res.right.AnnualCost.Period.length).to.be.lessThanOrEqual(12)

      // Period and cost value should be the same length
      expect(res.right.MonthlyCost.Period.length).to.equal(res.right.MonthlyCost.Cost.length)
      expect(res.right.AnnualCost.Period.length).to.equal(res.right.AnnualCost.Cost.length)

      // Period should be unique
      expect(res.right.MonthlyCost.Period.length).to.equal(new Set(res.right.MonthlyCost.Period).size)
      expect(res.right.AnnualCost.Period.length).to.equal(new Set(res.right.AnnualCost.Period).size)
    } else {
      throw new Error("getStartStopCostsController invalid response")
    }
  })
})
