// Imported from DPM-BE, commit d0e2f45544cc9890762f93cf3e8f224f15efd619
import * as E from "fp-ts/lib/Either.js"
import { rollbackSnowflakeTransaction, startSnowflakeTransaction } from "../../snowflake/index.js"
import { SnowflakeTransaction } from "../../../src/infrastructure/orm/snowflake/index.js"
import { expect } from "chai"
import { i18n } from "../../../src/config/dpm/i18n/i18n-utils.js"
import { getSpreadNegativeOperationController } from "../../../src/interface/controllers/dpm/getNegativeSpreads/getNegativeSpreadsController.js"
import { NegativeSpreadRepositoryPort } from "../../../src/application/port/repositories/dpm/NegativeSpreadRepositoryPort.js"
import { negativeSpreadRepository } from "../../../src/infrastructure/repositories/dpm/snowflake/NegativeSpreadRepositorySnowflake.js"
import { closeTransaction, startTransaction } from "../../integration/sequelize/index.js"
import { invalidPlantCodeError } from "../../../src/application/errors/dpm/InvalidPlantCodeError.js"
import { invalidPlantAndUnitCodeError } from "../../../src/application/errors/dpm/InvalidUnitCodeError.js"
import { Transaction } from "sequelize"

let snowflakeRepository: NegativeSpreadRepositoryPort
const beforeFixture = (_t: Transaction) => async (snowflakeTransaction: SnowflakeTransaction) => {
  snowflakeRepository = await negativeSpreadRepository(snowflakeTransaction)
}
function testNegativedSpread(negativeSpread: any) {
  expect(negativeSpread)
    .to.be.an("object")
    .that.includes.all.keys(
      "AverageGeneratorOutput",
      "Duration",
      "AverageSpread",
      "EndTime",
      "StartTime",
      "GeneratorName",
      "TotalGrossMargin",
    )

  expect(negativeSpread.AverageGeneratorOutput).to.be.a("number")
  expect(negativeSpread.Duration).to.be.a("number")
  expect(negativeSpread.AverageSpread).to.be.a("number")
  expect(negativeSpread.EndTime).to.be.a("string")
  expect(negativeSpread.StartTime).to.be.a("string")
  expect(negativeSpread.GeneratorName).to.be.a("string")
  expect(negativeSpread.TotalGrossMargin).to.be.a("number")
}

describe("getSpreadNegativeOperationController", function () {
  this.timeout(10000)

  before(async function () {
    await startTransaction((transaction) => startSnowflakeTransaction(beforeFixture(transaction)))
  })

  after(async function () {
    await closeTransaction()
    await rollbackSnowflakeTransaction()
  })

  // -------------------------------------------------------------------------------------
  // should return error test
  // -------------------------------------------------------------------------------------
  it("should return invalidPlantCodeError when Plant Id is empty", async function () {
    // test data
    const req = {
      plantCode: "",
      unitCode: "HE_A100",
      fiscalYear: "2022",
    }
    const res = await getSpreadNegativeOperationController(req, snowflakeRepository, i18n.__)
    expect(res._tag).to.equal("Left")
    if (E.isLeft(res)) {
      expect(res.left).to.deep.equal(invalidPlantCodeError(i18n.__, req.plantCode))
    }
  })

  it("should return invalidPlantAndUnitCodeError when Plant Id valid but unitCode is empty", async function () {
    // test data
    const req = {
      plantCode: "HE_",
      unitCode: "",
      fiscalYear: "2022",
    }
    const res = await getSpreadNegativeOperationController(req, snowflakeRepository, i18n.__)
    expect(res._tag).to.equal("Left")
    if (E.isLeft(res)) {
      expect(res.left).to.deep.equal(invalidPlantAndUnitCodeError(i18n.__, req.plantCode, req.unitCode))
    }
  })

  it("should return invalidPlantCodeError when plantCode invalid and unitCode is valid ", async function () {
    // test data
    const req = {
      plantCode: "invalid plantCode",
      unitCode: "HE_A100",
      fiscalYear: "2022",
    }
    const res = await getSpreadNegativeOperationController(req, snowflakeRepository, i18n.__)
    expect(res._tag).to.equal("Left")
    if (E.isLeft(res)) {
      expect(res.left).to.deep.equal(invalidPlantCodeError(i18n.__, req.plantCode))
    }
  })

  it("should return invalidPlantAndUnitCodeError if plantCode valid but unitCode is not valid ", async function () {
    // test data
    const req = {
      plantCode: "HE_",
      unitCode: "invalid unitCode",
      fiscalYear: "2022",
    }
    const res = await getSpreadNegativeOperationController(req, snowflakeRepository, i18n.__)
    expect(res._tag).to.equal("Left")
    if (E.isLeft(res)) {
      expect(res.left).to.deep.equal(invalidPlantAndUnitCodeError(i18n.__, req.plantCode, req.unitCode))
    }
  })

  // -------------------------------------------------------------------------------------
  // should return valid response
  // -------------------------------------------------------------------------------------

  it("should return valid response for plant", async function () {
    // test data
    const req = {
      plantCode: "HE_",
      unitCode: "undefined",
      fiscalYear: "2022",
      forecastCategory: 2,
    }
    const res = await getSpreadNegativeOperationController(req, snowflakeRepository, i18n.__)
    expect(res._tag).to.equal("Right")
    if (E.isRight(res)) {
      expect(res.right.PlantCode).to.equal(req.plantCode)
      expect(res.right.FiscalYear).to.equal(Number(req.fiscalYear))
      expect(res.right.ActualNegativeSpreads.length).to.be.lessThan(21)
      expect(res.right.ForecastNegativeSpreads.length).to.be.lessThan(21)
      res.right.ActualNegativeSpreads.forEach(testNegativedSpread)
      res.right.ForecastNegativeSpreads.forEach(testNegativedSpread)
    } else {
      throw new Error("Invalid getSpreadNegativeOperationController response")
    }
  })

  it("should return valid response for unit", async function () {
    // test data
    const req = {
      plantCode: "HE_",
      unitCode: "HE_A100",
      fiscalYear: "2022",
    }
    const res = await getSpreadNegativeOperationController(req, snowflakeRepository, i18n.__)
    expect(res._tag).to.equal("Right")
    if (E.isRight(res)) {
      expect(res.right.PlantCode).to.equal(req.plantCode)
      expect(res.right.FiscalYear).to.equal(Number(req.fiscalYear))
      expect(res.right.ActualNegativeSpreads.length).to.be.lessThan(21)
      expect(res.right.ForecastNegativeSpreads.length).to.be.lessThan(21)
      res.right.ActualNegativeSpreads.forEach(testNegativedSpread)
      res.right.ForecastNegativeSpreads.forEach(testNegativedSpread)
    } else {
      throw new Error("Invalid getSpreadNegativeOperationController response")
    }
  })
})
