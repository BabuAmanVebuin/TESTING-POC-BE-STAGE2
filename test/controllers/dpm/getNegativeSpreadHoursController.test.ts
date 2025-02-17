// Imported from DPM-BE, commit d0e2f45544cc9890762f93cf3e8f224f15efd619
import * as E from "fp-ts/lib/Either.js"
import { rollbackSnowflakeTransaction, startSnowflakeTransaction } from "../../snowflake/index.js"
import { SnowflakeTransaction } from "../../../src/infrastructure/orm/snowflake/index.js"
import { expect } from "chai"
import { i18n } from "../../../src/config/dpm/i18n/i18n-utils.js"
import { NegativeSpreadRepositoryPort } from "../../../src/application/port/repositories/dpm/NegativeSpreadRepositoryPort.js"
import { negativeSpreadRepository } from "../../../src/infrastructure/repositories/dpm/snowflake/NegativeSpreadRepositorySnowflake.js"
import { invalidPlantCodeError } from "../../../src/application/errors/dpm/InvalidPlantCodeError.js"
import { invalidPlantAndUnitCodeError } from "../../../src/application/errors/dpm/InvalidUnitCodeError.js"
import { getNegativeSpreadHoursController } from "../../../src/interface/controllers/dpm/getNegativeSpreads/getNegativeSpreadHoursController.js"
let snowflakeRepository: NegativeSpreadRepositoryPort
const beforeFixture = async (snowflakeTransaction: SnowflakeTransaction) => {
  snowflakeRepository = await negativeSpreadRepository(snowflakeTransaction)
}
const NegativeSpreadHours = {
  CasesByHours: {
    OneHour: "number",
    TwoHours: "number",
    ThreeHours: "number",
    FourHours: "number",
    FiveHours: "number",
    SixHours: "number",
    SevenHours: "number",
    EightHours: "number",
    NineHours: "number",
    TenHours: "number",
    ElevenHours: "number",
    TwelveOrMoreHours: "number",
  },
}

const getTypesOfObject = (obj: any): any => {
  const result: any = {}

  for (const key in obj) {
    if (typeof obj[key] === "object" && obj[key] !== null && !Array.isArray(obj[key])) {
      result[key] = getTypesOfObject(obj[key])
    } else {
      result[key] = typeof obj[key]
    }
  }

  return result
}

describe("getNegativeSpreadHoursController", function () {
  this.timeout(10000)

  before(() => startSnowflakeTransaction(beforeFixture))

  after(async function () {
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
    const res = await getNegativeSpreadHoursController(req, snowflakeRepository, i18n.__)
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
    const res = await getNegativeSpreadHoursController(req, snowflakeRepository, i18n.__)
    expect(res._tag).to.equal("Left")
    if (E.isLeft(res)) {
      expect(res.left).to.deep.equal(invalidPlantAndUnitCodeError(i18n.__, req.plantCode, req.unitCode))
    }
  })

  it("should return invalidPlantCodeError when plantCode is invalid and unitCode is valid", async function () {
    // test data
    const req = {
      plantCode: "invalid plantCode",
      unitCode: "HE_A100",
      fiscalYear: "2022",
    }
    const res = await getNegativeSpreadHoursController(req, snowflakeRepository, i18n.__)
    expect(res._tag).to.equal("Left")
    if (E.isLeft(res)) {
      expect(res.left).to.deep.equal(invalidPlantCodeError(i18n.__, req.plantCode))
    }
  })

  it("should return invalidPlantAndUnitCodeError if plantCode is valid but unitCode is not valid", async function () {
    // test data
    const req = {
      plantCode: "HE_",
      unitCode: "invalid unitCode",
      fiscalYear: "2022",
    }
    const res = await getNegativeSpreadHoursController(req, snowflakeRepository, i18n.__)
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
    }
    const res = await getNegativeSpreadHoursController(req, snowflakeRepository, i18n.__)
    expect(res._tag).to.equal("Right")
    if (E.isRight(res)) {
      expect(res.right.PlantCode).to.equal(req.plantCode)
      expect(getTypesOfObject(res.right.ActualNegativeSpreadHours)).to.deep.equal(NegativeSpreadHours)
      expect(getTypesOfObject(res.right.ForecastNegativeSpreadHours)).to.deep.equal(NegativeSpreadHours)
    } else {
      throw new Error("Invalid Response")
    }
  })

  it("should return valid response for unit", async function () {
    // test data
    const req = {
      plantCode: "HE_",
      unitCode: "HE_A100",
      fiscalYear: "2022",
    }

    const res = await getNegativeSpreadHoursController(req, snowflakeRepository, i18n.__)
    expect(res._tag).to.equal("Right")
    if (E.isRight(res)) {
      expect(res.right.PlantCode).to.equal(req.plantCode)
      expect(getTypesOfObject(res.right.ActualNegativeSpreadHours)).to.deep.equal(NegativeSpreadHours)
      expect(getTypesOfObject(res.right.ForecastNegativeSpreadHours)).to.deep.equal(NegativeSpreadHours)
    } else {
      throw Error("Invalid Response")
    }
  })
})
