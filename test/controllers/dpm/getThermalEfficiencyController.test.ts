// Imported from DPM-BE, commit d0e2f45544cc9890762f93cf3e8f224f15efd619
import * as E from "fp-ts/lib/Either.js"
import { Kpi003RepositoryPort } from "../../../src/application/port/repositories/dpm/Kpi003RepositoryPort.js"
import { KpiResponseCacheRepositoryPort } from "../../../src/application/port/repositories/dpm/KpiResponseCacheRepositoryPort.js"
import { Transaction } from "sequelize"
import { SnowflakeTransaction } from "../../../src/infrastructure/orm/snowflake/index.js"
import { kpi003RepositorySnowflake } from "../../../src/infrastructure/repositories/dpm/snowflake/kpi003RepositorySnowflake.js"
import { kpiResponseCacheRepositorySequelizeMySQL } from "../../../src/infrastructure/repositories/dpm/kpiResponseCacheRepositoryPortSequelizeMySQL.js"
import { closeTransaction, startTransaction } from "../../integration/sequelize/index.js"
import { rollbackSnowflakeTransaction, startSnowflakeTransaction } from "../../snowflake/index.js"
import { getTransaction, sequelize } from "../../../src/infrastructure/orm/sqlize/index.js"
import { invalidPlantCodeError } from "../../../src/application/errors/dpm/InvalidPlantCodeError.js"
import { invalidPlantAndUnitCodeError } from "../../../src/application/errors/dpm/InvalidUnitCodeError.js"
import { invalidEpochTimeStampError } from "../../../src/application/errors/dpm/InvalidEpochTimeStampError.js"
import { KPI003MeasuresGranularityKeys } from "../../helper/utils.js"
import { cleanKpi003ResponseCacheUseCase } from "../../../src/application/use_cases/dpm/cleanKpi003ResponseCacheUseCase.js"
import { expect } from "chai"
import { i18n } from "../../../src/config/dpm/i18n/i18n-utils.js"
import { getThermalEfficiencyController } from "../../../src/interface/controllers/dpm/KPI003/getThermalEfficiencyController.js"

let snowflakeRepository: Kpi003RepositoryPort
let kpiResponseCacheRepository: KpiResponseCacheRepositoryPort<Transaction>

const beforeFixture = (_t: Transaction) => async (snowflakeTransaction: SnowflakeTransaction) => {
  snowflakeRepository = await kpi003RepositorySnowflake(snowflakeTransaction)
  kpiResponseCacheRepository = await kpiResponseCacheRepositorySequelizeMySQL(sequelize)
}

describe("getThermalEfficiencyController", function () {
  this.timeout(10000)

  before(async () => startTransaction((transaction) => startSnowflakeTransaction(beforeFixture(transaction))))

  after(async () => {
    await closeTransaction()
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
      epochSeconds: new Date().getTime() / 1000,
    }
    const res = await getThermalEfficiencyController(req, snowflakeRepository, kpiResponseCacheRepository, i18n.__)
    expect(res._tag).to.equal("Left")
    if (E.isLeft(res)) {
      expect(res.left).to.eql(invalidPlantCodeError(i18n.__, req.plantCode))
    }
  })

  it("should return Left if plantCode is invalid and unitCode is valid", async () => {
    /**
     * Test Data
     */
    const req = {
      plantCode: "<------------------------invalidPlantCode---------------------------->",
      unitCode: "HE_A100",
      epochSeconds: new Date().getTime() / 1000,
    }
    const res = await getThermalEfficiencyController(req, snowflakeRepository, kpiResponseCacheRepository, i18n.__)
    expect(res._tag).to.equal("Left")
    if (E.isLeft(res)) {
      expect(res.left).to.eql(invalidPlantCodeError(i18n.__, req.plantCode))
    }
  })

  it("should return Left if plantCode is valid but unitCode is not valid", async () => {
    /**
     * Test Data
     */
    const req = {
      plantCode: "HE_",
      unitCode: "<------------------------invalidUnitCode---------------------------->",
      epochSeconds: new Date().getTime() / 1000,
    }
    const res = await getThermalEfficiencyController(req, snowflakeRepository, kpiResponseCacheRepository, i18n.__)
    expect(res._tag).to.equal("Left")
    if (E.isLeft(res)) {
      expect(res.left).to.eql(invalidPlantAndUnitCodeError(i18n.__, req.plantCode, req.unitCode))
    }
  })

  it("should return Left if epochSeconds are invalid numbers", async () => {
    /**
     * Test Data
     */
    const req = {
      plantCode: "HE_",
      unitCode: "HE_A100",
      epochSeconds: Number("<- Invalid ->"),
    }
    const res = await getThermalEfficiencyController(req, snowflakeRepository, kpiResponseCacheRepository, i18n.__)
    expect(res._tag).to.equal("Left")
    if (E.isLeft(res)) {
      expect(res.left).to.eql(invalidEpochTimeStampError(i18n.__, req.epochSeconds))
    }
  })

  // -------------------------------------------------------------------------------------
  // should return data test case
  // -------------------------------------------------------------------------------------
  it("should return valid response for unit", async () => {
    const req = {
      plantCode: "HE_",
      unitCode: "HE_A100",
      epochSeconds: new Date().getTime() / 1000,
    }
    const res = await getThermalEfficiencyController(req, snowflakeRepository, kpiResponseCacheRepository, i18n.__)
    expect(E.isRight(res)).to.be.true
    if (E.isRight(res)) {
      const responseData = res.right
      // Assert the structure and expectations for responseData
      expect(responseData.PlantCode).to.equal(req.plantCode)
      expect(responseData.UnitCode).to.equal(req.unitCode)
      expect(Object.keys(responseData.ThermalEfficiency)).to.include.members(KPI003MeasuresGranularityKeys)
      // Suffix response
      expect(responseData.ThermalEfficiency.Annual.Suffix).to.equal(i18n.__("VALUE.SUFFIX_PERCENTAGE"))
      expect(responseData.ThermalEfficiency.Monthly.Suffix).to.equal(i18n.__("VALUE.SUFFIX_PERCENTAGE"))
      expect(responseData.ThermalEfficiency.Weekly.Suffix).to.equal(i18n.__("VALUE.SUFFIX_PERCENTAGE"))
      expect(responseData.ThermalEfficiency.Daily.Suffix).to.equal(i18n.__("VALUE.SUFFIX_PERCENTAGE"))
      // Prefix response
      expect(responseData.ThermalEfficiency.Annual.Prefix).to.be.null
      expect(responseData.ThermalEfficiency.Monthly.Prefix).to.be.null
      expect(responseData.ThermalEfficiency.Weekly.Prefix).to.be.null
      expect(responseData.ThermalEfficiency.Daily.Prefix).to.be.null
    } else {
      throw new Error("getThermalEfficiencyController invalid response")
    }
  })

  it("should return valid response for plant", async () => {
    const req = {
      plantCode: "HE_",
      unitCode: null,
      epochSeconds: new Date().getTime() / 1000,
    }
    const res = await getThermalEfficiencyController(req, snowflakeRepository, kpiResponseCacheRepository, i18n.__)
    expect(E.isRight(res)).to.be.true
    if (E.isRight(res)) {
      const responseData = res.right
      // Assert the structure and expectations for responseData
      expect(responseData.PlantCode).to.equal(req.plantCode)
      expect(responseData.UnitCode).to.be.null
      expect(Object.keys(responseData.ThermalEfficiency)).to.include.members(KPI003MeasuresGranularityKeys)
      // Prefix response
      expect(responseData.ThermalEfficiency.Annual.Suffix).to.equal(i18n.__("VALUE.SUFFIX_PERCENTAGE"))
      expect(responseData.ThermalEfficiency.Monthly.Suffix).to.equal(i18n.__("VALUE.SUFFIX_PERCENTAGE"))
      expect(responseData.ThermalEfficiency.Weekly.Suffix).to.equal(i18n.__("VALUE.SUFFIX_PERCENTAGE"))
      expect(responseData.ThermalEfficiency.Daily.Suffix).to.equal(i18n.__("VALUE.SUFFIX_PERCENTAGE"))
      // Prefix response
      expect(responseData.ThermalEfficiency.Annual.Prefix).to.be.null
      expect(responseData.ThermalEfficiency.Monthly.Prefix).to.be.null
      expect(responseData.ThermalEfficiency.Weekly.Prefix).to.be.null
      expect(responseData.ThermalEfficiency.Daily.Prefix).to.be.null
    } else {
      throw new Error("getThermalEfficiencyController invalid response")
    }
  })

  it("should generate ThermalEfficiency response when ResponseCache is empty", async () => {
    const transaction = getTransaction()
    await cleanKpi003ResponseCacheUseCase(kpiResponseCacheRepository, transaction)
    const res = await getThermalEfficiencyController(
      {
        plantCode: "HE_",
        unitCode: String(undefined),
        epochSeconds: new Date().getTime() / 1000,
      },
      snowflakeRepository,
      kpiResponseCacheRepository,
      i18n.__,
    )
    expect(E.isRight(res)).to.be.true
    if (E.isRight(res)) {
      expect(res.right).not.to.be.null
    }
  })
})
