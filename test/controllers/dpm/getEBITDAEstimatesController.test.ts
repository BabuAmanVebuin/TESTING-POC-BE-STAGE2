// Imported from DPM-BE, commit d0e2f45544cc9890762f93cf3e8f224f15efd619
import * as E from "fp-ts/lib/Either.js"
import { rollbackSnowflakeTransaction, startSnowflakeTransaction } from "../../snowflake/index.js"
import { SnowflakeTransaction } from "../../../src/infrastructure/orm/snowflake/index.js"
import { expect } from "chai"
import { i18n } from "../../../src/config/dpm/i18n/i18n-utils.js"
import { getEBITDAEstimatesController } from "../../../src/interface/controllers/dpm/KPI003/getEBITDAEstimatesController.js"
import { invalidPlantCodeError } from "../../../src/application/errors/dpm/InvalidPlantCodeError.js"
import { invalidPlantAndUnitCodeError } from "../../../src/application/errors/dpm/InvalidUnitCodeError.js"
import { closeTransaction, startTransaction } from "../../integration/sequelize/index.js"
import { Transaction } from "sequelize"
import { Kpi003EstimationRepositoryPort } from "../../../src/application/port/repositories/dpm/Kpi003EstimationRepositoryPort.js"
import { KPI003EstimationRepositorySnowflake } from "../../../src/infrastructure/repositories/dpm/snowflake/Kpi003EstimationRepositorySnowflake.js"
import { invalidForecastCategoryError } from "../../../src/application/errors/dpm/InvalidForecastCategoryError.js"
import { invalidGranularityCategoryError } from "../../../src/application/errors/dpm/InvalidGranularityCategoryError.js"

let snowflakeRepository: Kpi003EstimationRepositoryPort<Transaction>

// eslint-disable-nsnowflakeRepository-line @typescript-eslint/no-unused-vars
const beforeFixture = (_t: Transaction) => async (snowflakeTransaction: SnowflakeTransaction) => {
  snowflakeRepository = await KPI003EstimationRepositorySnowflake(snowflakeTransaction)
}
describe("getEBITDAEstimatesController", function () {
  this.timeout(10000)
  before(async () => startTransaction((transaction) => startSnowflakeTransaction(beforeFixture(transaction))))

  after(async () => {
    await closeTransaction()
    await rollbackSnowflakeTransaction()
  })

  //------------------------------------------------------------------------------------
  // should return error test
  //-----------------------------------------------------------------------------------

  it("should return invalidPlantCodeError when Plant Id is empty", async () => {
    // test data
    const req = {
      plantCode: "",
      unitCode: "undefined",
      forecastCategory: "1",
      granularity: "annual",
    }

    const res = await getEBITDAEstimatesController(req, snowflakeRepository, i18n.__)
    expect(res._tag).to.equal("Left")
    if (E.isLeft(res)) {
      expect(res.left).to.eql(invalidPlantCodeError(i18n.__, req.plantCode))
    }
  })

  it("should return invalidPlantAndUnitCodeError when Plant Id valid but unitCode is empty", async () => {
    // test data
    const req = {
      plantCode: "HE_",
      unitCode: "",
      forecastCategory: "1",
      granularity: "annual",
    }
    const res = await getEBITDAEstimatesController(req, snowflakeRepository, i18n.__)
    expect(res._tag).to.equal("Left")
    if (E.isLeft(res)) {
      expect(res.left).to.eql(invalidPlantAndUnitCodeError(i18n.__, req.plantCode, req.unitCode))
    }
  })

  it("should return invalidPlantAndUnitCodeError when plantCode invalid and unitCode is valid ", async () => {
    // test data
    const req = {
      plantCode: "InvalidplantCode",
      unitCode: "HE_A100",
      forecastCategory: "1",
      granularity: "annual",
    }
    const res = await getEBITDAEstimatesController(req, snowflakeRepository, i18n.__)
    expect(res._tag).to.equal("Left")
    if (E.isLeft(res)) {
      expect(res.left).to.eql(invalidPlantAndUnitCodeError(i18n.__, req.plantCode, req.unitCode))
    }
  })

  it("should return invalidPlantAndUnitCodeError if plantCode valid but unitCode is not valid ", async () => {
    // test data
    const req = {
      plantCode: "HE_",
      unitCode: "invalid unitCode",
      forecastCategory: "1",
      granularity: "annual",
    }
    const res = await getEBITDAEstimatesController(req, snowflakeRepository, i18n.__)
    expect(res._tag).to.equal("Left")
    if (E.isLeft(res)) {
      expect(res.left).to.eql(invalidPlantAndUnitCodeError(i18n.__, req.plantCode, req.unitCode))
    }
  })

  it("should return invalidForecastCategoryError if forecastCategory is not valid ", async () => {
    // test data
    const req = {
      plantCode: "HE_",
      unitCode: "HE_A100",
      forecastCategory: "5",
      granularity: "annual",
    }
    const res = await getEBITDAEstimatesController(req, snowflakeRepository, i18n.__)
    expect(res._tag).to.equal("Left")
    if (E.isLeft(res)) {
      expect(res.left).to.eql(invalidForecastCategoryError(i18n.__, req.forecastCategory))
    }
  })

  it("should return invalidGranularityCategoryError if granularity is not valid ", async () => {
    // test data
    const req = {
      plantCode: "HE_",
      unitCode: "HE_A100",
      forecastCategory: "1",
      granularity: "invalid",
    }
    const res = await getEBITDAEstimatesController(req, snowflakeRepository, i18n.__)
    expect(res._tag).to.equal("Left")
    if (E.isLeft(res)) {
      expect(res.left).to.eql(invalidGranularityCategoryError(i18n.__, req.granularity))
    }
  })

  //------------------------------------------------------------------------------------
  // should return valid response
  //-----------------------------------------------------------------------------------

  it("should return valid response for plant", async () => {
    // test data
    const req = {
      plantCode: "HE_",
      unitCode: "undefined",
      forecastCategory: "1",
      granularity: "annual",
    }
    const res = await getEBITDAEstimatesController(req, snowflakeRepository, i18n.__)
    expect(res._tag).to.equal("Right")
    if (E.isRight(res)) {
      expect(res.right.PlantCode).to.equal(req.plantCode)
      res.right.EBITDA.forEach((record) => {
        expect(record.FiscalYear).to.be.a("number")
        expect(record.Value).to.be.a("number")
      })
    } else {
      throw new Error("getEBITDAController invalid response")
    }
  })

  it("should return valid response for unit", async () => {
    // test data
    const req = {
      plantCode: "HE_",
      unitCode: "HE_A100",
      forecastCategory: "1",
      granularity: "annual",
    }

    const res = await getEBITDAEstimatesController(req, snowflakeRepository, i18n.__)
    expect(res._tag).to.equal("Right")
    if (E.isRight(res)) {
      expect(res.right.PlantCode).to.equal(req.plantCode)
      expect(res.right.UnitCode).to.equal(req.unitCode)
      expect(res.right.ForecastCategory).to.equal(req.forecastCategory)
      res.right.EBITDA.forEach((record) => {
        expect(record.FiscalYear).to.be.a("number")
        expect(record.Value).to.be.a("number")
      })
    } else {
      throw new Error("getEBITDAEstimatesController invalid response")
    }
  })
})
