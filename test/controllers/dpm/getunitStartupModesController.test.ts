// Imported from DPM-BE, commit d0e2f45544cc9890762f93cf3e8f224f15efd619
import * as E from "fp-ts/lib/Either.js"
import { expect } from "chai"
import { invalidPlantCodeError } from "../../../src/application/errors/dpm/InvalidPlantCodeError.js"
import { invalidPlantAndUnitCodeError } from "../../../src/application/errors/dpm/InvalidUnitCodeError.js"
import { rollbackSnowflakeTransaction, startSnowflakeTransaction } from "../../snowflake/index.js"
import { SnowflakeTransaction } from "../../../src/infrastructure/orm/snowflake/index.js"
import { i18n } from "../../../src/config/dpm/i18n/i18n-utils.js"
import { UnitStartupModesRepositoryPort } from "../../../src/application/port/repositories/dpm/UnitStartupModesRepositoryPort.js"
import { getUnitStartupModesRepositorySnowflake } from "../../../src/infrastructure/repositories/dpm/snowflake/getUnitStartupModesRepositorySnowflake.js"
import { closeTransaction, startTransaction } from "../../integration/sequelize/index.js"
import { Transaction } from "sequelize"
import { getUnitStartupModesController } from "../../../src/interface/controllers/dpm/getUnitStartupModes/getUnitStartupModesController.js"
let snowflakeRepository: UnitStartupModesRepositoryPort
const beforeFixture = (_t: Transaction) => async (snowflakeTransaction: SnowflakeTransaction) => {
  snowflakeRepository = await getUnitStartupModesRepositorySnowflake(snowflakeTransaction)
}
describe("getUnitStartupModesController", function () {
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
    }
    const res = await getUnitStartupModesController(req, snowflakeRepository, i18n.__)
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
    }
    const res = await getUnitStartupModesController(req, snowflakeRepository, i18n.__)
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
    }
    const res = await getUnitStartupModesController(req, snowflakeRepository, i18n.__)
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
    }
    const res = await getUnitStartupModesController(req, snowflakeRepository, i18n.__)
    expect(res._tag).to.equal("Left")
    if (E.isLeft(res)) {
      expect(res.left).to.deep.equal(invalidPlantAndUnitCodeError(i18n.__, req.plantCode, req.unitCode))
    }
  })

  //------------------------------------------------------------------------------------
  // should return valid response
  //------------------------------------------------------------------------------------

  it("should return valid response for plant", async () => {
    // test data
    const req = {
      plantCode: "HE_",
      unitCode: "undefined",
    }
    const res = await getUnitStartupModesController(req, snowflakeRepository, i18n.__)
    expect(res._tag).to.equal("Right")
    if (E.isRight(res)) {
      expect(res.right.PlantCode).to.equal(req.plantCode)
      res.right.StartupModes.forEach((startupModes) => {
        expect(startupModes.UnitCode).to.be.a("string")
        expect(startupModes.SartupModeCode).to.be.a("string")
        expect(startupModes.StartupModeName).to.equal(i18n.__("VALUE." + startupModes.SartupModeCode))
      })
    } else {
      throw new Error("getUnitStartupModesController invalid response")
    }
  })

  it("should return valid response for unit", async () => {
    // test data
    const req = {
      plantCode: "HE_",
      unitCode: "HE_A100",
    }

    const res = await getUnitStartupModesController(req, snowflakeRepository, i18n.__)
    expect(res._tag).to.equal("Right")
    if (E.isRight(res)) {
      expect(res.right.PlantCode).to.equal(req.plantCode)
      res.right.StartupModes.forEach((startupModes) => {
        expect(startupModes).to.deep.include({
          UnitCode: "HE_A100",
          StartupModeName: i18n.__("VALUE." + startupModes.SartupModeCode),
        })
        expect(startupModes.SartupModeCode).to.be.a("string")
      })
    } else {
      throw Error("getUnitStartupModesController invalid response")
    }
  })
})
