// Imported from DPM-BE, commit d0e2f45544cc9890762f93cf3e8f224f15efd619
import * as E from "fp-ts/lib/Either.js"
import { expect } from "chai"
import { invalidPlantCodeError } from "../../../src/application/errors/dpm/InvalidPlantCodeError.js"
import { invalidPlantAndUnitCodeError } from "../../../src/application/errors/dpm/InvalidUnitCodeError.js"
import { rollbackSnowflakeTransaction, startSnowflakeTransaction } from "../../snowflake/index.js"
import { SnowflakeTransaction } from "../../../src/infrastructure/orm/snowflake/index.js"
import { i18n } from "../../../src/config/dpm/i18n/i18n-utils.js"
import { getStartStopCountsController } from "../../../src/interface/controllers/dpm/startStopCounts/getStartStopCountsController.js"
import { StartStopCountRepositoryPort } from "../../../src/application/port/repositories/dpm/StartStopCountRepositoryPort.js"
import { StartStopCountRepository } from "../../../src/infrastructure/repositories/dpm/snowflake/StartStopCountRepositorySnowflake.js"
import { closeTransaction, startTransaction } from "../../integration/sequelize/index.js"
import { Transaction } from "sequelize"

let snowflakeRepository: StartStopCountRepositoryPort

const beforeFixture = (_t: Transaction) => async (snowflakeTransaction: SnowflakeTransaction) => {
  snowflakeRepository = await StartStopCountRepository(snowflakeTransaction)
}

describe("getStartStopCountsController", function () {
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
    const res = await getStartStopCountsController(req, snowflakeRepository, i18n.__)
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
    const res = await getStartStopCountsController(req, snowflakeRepository, i18n.__)
    expect(res._tag).to.equal("Left")
    if (E.isLeft(res)) {
      expect(res.left).to.deep.equal(invalidPlantAndUnitCodeError(i18n.__, req.plantCode, req.unitCode))
    }
  })

  it("should return invalidPlantCodeError when plantCode invalid and unitCode is valid", async () => {
    // test data
    const req = {
      plantCode: "invalid plantCode",
      unitCode: "HE_A100",
      fiscalYear: "2021",
      startupMode: "COLD",
    }
    const res = await getStartStopCountsController(req, snowflakeRepository, i18n.__)
    expect(res._tag).to.equal("Left")
    if (E.isLeft(res)) {
      expect(res.left).to.deep.equal(invalidPlantCodeError(i18n.__, req.plantCode))
    }
  })

  it("should return invalidPlantAndUnitCodeError if plantCode valid but unitCode is not valid", async () => {
    // test data
    const req = {
      plantCode: "HE_",
      unitCode: "invalid unitCode",
      fiscalYear: "2021",
      startupMode: "COLD",
    }
    const res = await getStartStopCountsController(req, snowflakeRepository, i18n.__)
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
    }
    const res = await getStartStopCountsController(req, snowflakeRepository, i18n.__)
    expect(res._tag).to.equal("Right")
    if (E.isRight(res)) {
      expect(res.right).to.deep.include({
        PlantCode: req.plantCode,
        UnitCode: req.unitCode,
        FiscalYear: +req.fiscalYear,
      })
      expect(res.right).to.include.keys("ActualCount", "ForecastCount")
      expect(res.right.ActualCount).to.be.a("number")
      expect(res.right.ForecastCount).to.be.a("number")
    } else {
      throw new Error("getStartStopCountsController invalid response")
    }
  })

  it("should return valid response for Plant", async () => {
    // test data
    const req = {
      plantCode: "HE_",
      unitCode: "undefined",
      fiscalYear: "2021",
    }
    const res = await getStartStopCountsController(req, snowflakeRepository, i18n.__)
    expect(res._tag).to.equal("Right")
    if (E.isRight(res)) {
      expect(res.right).to.deep.include({
        PlantCode: req.plantCode,
        UnitCode: null,
        FiscalYear: Number(req.fiscalYear),
      })
      expect(res.right).to.include.keys("ActualCount", "ForecastCount")
      expect(res.right.ActualCount).to.be.a("number")
      expect(res.right.ForecastCount).to.be.a("number")
    } else {
      throw Error("getStartStopCountsController invalid response")
    }
  })
})
