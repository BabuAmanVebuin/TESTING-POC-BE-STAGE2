// Imported from DPM-BE, commit d0e2f45544cc9890762f93cf3e8f224f15efd619
import * as E from "fp-ts/lib/Either.js"
import { Transaction } from "sequelize"
import { expect } from "chai"
import {
  Kpi003RepositoryPort,
  kpi003RepositorySnowflake,
} from "../../../src/infrastructure/repositories/dpm/snowflake/kpi003RepositorySnowflake.js"
import { SnowflakeTransaction } from "../../../src/infrastructure/orm/snowflake/index.js"
import { sequelize, wrapInTransaction } from "../../../src/infrastructure/orm/sqlize/index.js"
import { closeTransaction, startTransaction } from "../../integration/sequelize/index.js"
import { rollbackSnowflakeTransaction, startSnowflakeTransaction } from "../../snowflake/index.js"
import { KpiResponseCacheRepositoryPort } from "../../../src/application/port/repositories/dpm/KpiResponseCacheRepositoryPort.js"
import { kpiResponseCacheRepositorySequelizeMySQL } from "../../../src/infrastructure/repositories/dpm/kpiResponseCacheRepositoryPortSequelizeMySQL.js"
import { invalidPlantCodeError } from "../../../src/application/errors/dpm/InvalidPlantCodeError.js"
import { invalidPlantAndUnitCodeError } from "../../../src/application/errors/dpm/InvalidUnitCodeError.js"
import { i18n } from "../../../src/config/dpm/i18n/i18n-utils.js"
import { getSalesUnitPriceController } from "../../../src/interface/controllers/dpm/KPI003/getSalesUnitPriceController.js"
import { invalidEpochTimeStampError } from "../../../src/application/errors/dpm/InvalidEpochTimeStampError.js"
import { cleanKpi003ResponseCacheUseCase } from "../../../src/application/use_cases/dpm/cleanKpi003ResponseCacheUseCase.js"
import { KPI003MeasuresGranularityKeys } from "../../helper/utils.js"

let kpiResponseCacheRepository: KpiResponseCacheRepositoryPort<Transaction>
let snowflakeRepository: Kpi003RepositoryPort

const beforeFixture = (_t: Transaction) => async (snowflakeTransaction: SnowflakeTransaction) => {
  snowflakeRepository = await kpi003RepositorySnowflake(snowflakeTransaction)
  kpiResponseCacheRepository = await kpiResponseCacheRepositorySequelizeMySQL(sequelize)
}
describe("getSalesUnitPriceController", function () {
  this.timeout(10000)
  before(async () => startTransaction((transaction) => startSnowflakeTransaction(beforeFixture(transaction))))
  after(async () => {
    await closeTransaction()
    await rollbackSnowflakeTransaction()
  })

  it("should return Left when Plant Id is empty", async () => {
    const req = {
      plantCode: "",
      unitCode: "HE_A100",
      epochSeconds: new Date().getTime() / 1000,
    }
    const res = await getSalesUnitPriceController(req, snowflakeRepository, kpiResponseCacheRepository, i18n.__)
    expect(res._tag).to.equal("Left")
    if (E.isLeft(res)) {
      expect(res.left).to.deep.equal(invalidPlantCodeError(i18n.__, req.plantCode))
    }
  })

  it("should return Left if plantCode is invalid and unitCode is valid", async () => {
    const req = {
      plantCode: "<------------------------invalidPlantCode---------------------------->",
      unitCode: "HE_A100",
      epochSeconds: new Date().getTime() / 1000,
    }
    const res = await getSalesUnitPriceController(req, snowflakeRepository, kpiResponseCacheRepository, i18n.__)
    expect(res._tag).to.equal("Left")
    if (E.isLeft(res)) {
      expect(res.left).to.deep.equal(invalidPlantCodeError(i18n.__, req.plantCode))
    }
  })

  it("should return Left if plantCode is valid but unitCode is not valid", async () => {
    const req = {
      plantCode: "HE_",
      unitCode: "<------------------------invalidUnitCode---------------------------->",
      epochSeconds: new Date().getTime() / 1000,
    }
    const res = await getSalesUnitPriceController(req, snowflakeRepository, kpiResponseCacheRepository, i18n.__)
    expect(res._tag).to.equal("Left")
    if (E.isLeft(res)) {
      expect(res.left).to.deep.equal(invalidPlantAndUnitCodeError(i18n.__, req.plantCode, req.unitCode))
    }
  })

  it("should return Left if epochSeconds are invalid numbers", async () => {
    const req = {
      plantCode: "HE_",
      unitCode: "HE_A100",
      epochSeconds: Number("<- Invalid ->"),
    }
    const res = await getSalesUnitPriceController(req, snowflakeRepository, kpiResponseCacheRepository, i18n.__)
    expect(res._tag).to.equal("Left")
    if (E.isLeft(res)) {
      expect(res.left).to.deep.equal(invalidEpochTimeStampError(i18n.__, req.epochSeconds))
    }
  })

  it("should return valid response for unit", async () => {
    const req = {
      plantCode: "HE_",
      unitCode: "HE_A100",
      epochSeconds: new Date().getTime() / 1000,
    }
    const res = await getSalesUnitPriceController(req, snowflakeRepository, kpiResponseCacheRepository, i18n.__)
    expect(E.isRight(res)).to.be.true
    if (E.isRight(res)) {
      const responseData = res.right
      expect(responseData.PlantCode).to.equal(req.plantCode)
      expect(responseData.UnitCode).to.equal(req.unitCode)
      expect(Object.keys(responseData.SalesUnitPrice)).to.include.members(KPI003MeasuresGranularityKeys)
      expect(responseData.SalesUnitPrice.Annual.Suffix).to.equal(i18n.__("VALUE.SUFFIX_YEN_KWH"))
      expect(responseData.SalesUnitPrice.Monthly.Suffix).to.equal(i18n.__("VALUE.SUFFIX_YEN_KWH"))
      expect(responseData.SalesUnitPrice.Weekly.Suffix).to.equal(i18n.__("VALUE.SUFFIX_YEN_KWH"))
      expect(responseData.SalesUnitPrice.Daily.Suffix).to.equal(i18n.__("VALUE.SUFFIX_YEN_KWH"))
      expect(responseData.SalesUnitPrice.Annual.Prefix).to.be.null
      expect(responseData.SalesUnitPrice.Monthly.Prefix).to.be.null
      expect(responseData.SalesUnitPrice.Weekly.Prefix).to.be.null
      expect(responseData.SalesUnitPrice.Daily.Prefix).to.be.null
    }
  })

  it("should return valid response for plant", async () => {
    const req = {
      plantCode: "HE_",
      unitCode: null,
      epochSeconds: new Date().getTime() / 1000,
    }
    const res = await getSalesUnitPriceController(req, snowflakeRepository, kpiResponseCacheRepository, i18n.__)
    expect(E.isRight(res)).to.be.true
    if (E.isRight(res)) {
      const responseData = res.right
      expect(responseData.PlantCode).to.equal(req.plantCode)
      expect(responseData.UnitCode).to.equal(req.unitCode)
      expect(Object.keys(responseData.SalesUnitPrice)).to.include.members(KPI003MeasuresGranularityKeys)
      expect(responseData.SalesUnitPrice.Annual.Suffix).to.equal(i18n.__("VALUE.SUFFIX_YEN_KWH"))
      expect(responseData.SalesUnitPrice.Monthly.Suffix).to.equal(i18n.__("VALUE.SUFFIX_YEN_KWH"))
      expect(responseData.SalesUnitPrice.Weekly.Suffix).to.equal(i18n.__("VALUE.SUFFIX_YEN_KWH"))
      expect(responseData.SalesUnitPrice.Daily.Suffix).to.equal(i18n.__("VALUE.SUFFIX_YEN_KWH"))
      expect(responseData.SalesUnitPrice.Annual.Prefix).to.be.null
      expect(responseData.SalesUnitPrice.Monthly.Prefix).to.be.null
      expect(responseData.SalesUnitPrice.Weekly.Prefix).to.be.null
      expect(responseData.SalesUnitPrice.Daily.Prefix).to.be.null
    }
  })

  it("should generate SalesUnitPrice response when ResponseCache is empty", async () => {
    await wrapInTransaction(async (transaction) => {
      return await cleanKpi003ResponseCacheUseCase(kpiResponseCacheRepository, transaction)
    })
    const res = await getSalesUnitPriceController(
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
