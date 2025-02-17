// Imported from DPM-BE, commit d0e2f45544cc9890762f93cf3e8f224f15efd619
import * as E from "fp-ts/lib/Either.js"
import { Transaction } from "sequelize"
import { expect } from "chai"

import { rollbackSnowflakeTransaction, startSnowflakeTransaction } from "../../snowflake/index.js"
import { i18n } from "../../../src/config/dpm/i18n/i18n-utils.js"
import { closeTransaction, startTransaction } from "../../integration/sequelize/index.js"
import {
  Kpi003RepositoryPort,
  kpi003RepositorySnowflake,
} from "../../../src/infrastructure/repositories/dpm/snowflake/kpi003RepositorySnowflake.js"
import { KpiResponseCacheRepositoryPort } from "../../../src/application/port/repositories/dpm/KpiResponseCacheRepositoryPort.js"
import { SnowflakeTransaction } from "../../../src/infrastructure/orm/snowflake/index.js"
import { kpiResponseCacheRepositorySequelizeMySQL } from "../../../src/infrastructure/repositories/dpm/kpiResponseCacheRepositoryPortSequelizeMySQL.js"
import { getTransaction, sequelize } from "../../../src/infrastructure/orm/sqlize/index.js"
import { getGrossMarginController } from "../../../src/interface/controllers/dpm/KPI003/getGrossMarginController.js"
import { invalidPlantCodeError } from "../../../src/application/errors/dpm/InvalidPlantCodeError.js"
import { invalidPlantAndUnitCodeError } from "../../../src/application/errors/dpm/InvalidUnitCodeError.js"
import { invalidEpochTimeStampError } from "../../../src/application/errors/dpm/InvalidEpochTimeStampError.js"
import { cleanKpi003ResponseCacheUseCase } from "../../../src/application/use_cases/dpm/cleanKpi003ResponseCacheUseCase.js"
import { KPI003MeasuresGranularityKeys } from "../../helper/utils.js"

let snowflakeRepository: Kpi003RepositoryPort
let kpiResponseCacheRepository: KpiResponseCacheRepositoryPort<Transaction>

const beforeFixture = (_t: Transaction) => async (snowflakeTransaction: SnowflakeTransaction) => {
  snowflakeRepository = await kpi003RepositorySnowflake(snowflakeTransaction)
  kpiResponseCacheRepository = await kpiResponseCacheRepositorySequelizeMySQL(sequelize)
}

describe("getGrossMarginController", function () {
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
    const res = await getGrossMarginController(req, snowflakeRepository, kpiResponseCacheRepository, i18n.__)
    expect(res._tag).eql("Left")
    if (E.isLeft(res)) {
      expect(res.left).deep.eq(invalidPlantCodeError(i18n.__, req.plantCode))
    }
  })

  it("should return Left if plantCode invalid and unitCode is valid ", async () => {
    /**
     * Test Data
     */
    const req = {
      plantCode: "<------------------------invalidPlantCode---------------------------->",
      unitCode: "HE_A100",
      epochSeconds: new Date().getTime() / 1000,
    }
    const res = await getGrossMarginController(req, snowflakeRepository, kpiResponseCacheRepository, i18n.__)
    expect(res._tag).eql("Left")
    if (E.isLeft(res)) {
      expect(res.left).deep.eq(invalidPlantCodeError(i18n.__, req.plantCode))
    }
  })

  it("should return Left if plantCode valid but unitCode is not valid ", async () => {
    /**
     * Test Data
     */
    const req = {
      plantCode: "HE_",
      unitCode: "<------------------------invalidUnitCode---------------------------->",
      epochSeconds: new Date().getTime() / 1000,
    }
    const res = await getGrossMarginController(req, snowflakeRepository, kpiResponseCacheRepository, i18n.__)
    expect(res._tag).eql("Left")
    if (E.isLeft(res)) {
      expect(res.left).deep.eq(invalidPlantAndUnitCodeError(i18n.__, req.plantCode, req.unitCode))
    }
  })

  it("should return Left if epochSeconds invalid numbers ", async () => {
    /**
     * Test Data
     */
    const req = {
      plantCode: "HE_",
      unitCode: "HE_A100",
      epochSeconds: Number("<- Invalid ->"),
    }
    const res = await getGrossMarginController(req, snowflakeRepository, kpiResponseCacheRepository, i18n.__)
    expect(res._tag).eql("Left")
    if (E.isLeft(res)) {
      expect(res.left).deep.eq(invalidEpochTimeStampError(i18n.__, req.epochSeconds))
    }
  })

  // -------------------------------------------------------------------------------------
  //  should return data test case
  // -------------------------------------------------------------------------------------
  it("should return valid response for unit", async () => {
    const req = {
      plantCode: "HE_",
      unitCode: "HE_A100",
      epochSeconds: new Date().getTime() / 1000,
    }
    const res = await getGrossMarginController(req, snowflakeRepository, kpiResponseCacheRepository, i18n.__)
    expect(E.isRight(res)).eql(true)
    if (E.isRight(res)) {
      const responseData = res.right
      // Assert the structure and expectations for responseData
      expect(responseData.PlantCode).eql(req.plantCode)
      expect(responseData.UnitCode).eql(req.unitCode)
      expect(Object.keys(responseData.GrossMargin)).to.have.members(KPI003MeasuresGranularityKeys)
      // Suffix response
      expect(responseData.GrossMargin.Annual.Suffix).eql(i18n.__("VALUE.SUFFIX_OKU"))
      expect(responseData.GrossMargin.Monthly.Suffix).eql(i18n.__("VALUE.SUFFIX_OKU"))
      expect(responseData.GrossMargin.Weekly.Suffix).eql(i18n.__("VALUE.SUFFIX_OKU"))
      expect(responseData.GrossMargin.Daily.Suffix).eql(i18n.__("VALUE.SUFFIX_MAN"))
      // Prefix response
      expect(responseData.GrossMargin.Annual.Prefix).eql(i18n.__("VALUE.PREFIX_YEN"))
      expect(responseData.GrossMargin.Monthly.Prefix).eql(i18n.__("VALUE.PREFIX_YEN"))
      expect(responseData.GrossMargin.Weekly.Prefix).eql(i18n.__("VALUE.PREFIX_YEN"))
      expect(responseData.GrossMargin.Daily.Prefix).eql(i18n.__("VALUE.PREFIX_YEN"))
    } else {
      throw new Error("getGrossMarginController invalid response")
    }
  })

  it("should return valid response for plant", async () => {
    const req = {
      plantCode: "HE_",
      unitCode: null,
      epochSeconds: new Date().getTime() / 1000,
    }
    const res = await getGrossMarginController(req, snowflakeRepository, kpiResponseCacheRepository, i18n.__)
    expect(E.isRight(res)).eql(true)
    if (E.isRight(res)) {
      const responseData = res.right
      // Assert the structure and expectations for responseData
      expect(responseData.PlantCode).eql(req.plantCode)
      expect(responseData.UnitCode).eql(req.unitCode)
      expect(Object.keys(responseData.GrossMargin)).to.have.members(KPI003MeasuresGranularityKeys)
      // Suffix response
      expect(responseData.GrossMargin.Annual.Suffix).eql(i18n.__("VALUE.SUFFIX_OKU"))
      expect(responseData.GrossMargin.Monthly.Suffix).eql(i18n.__("VALUE.SUFFIX_OKU"))
      expect(responseData.GrossMargin.Weekly.Suffix).eql(i18n.__("VALUE.SUFFIX_OKU"))
      expect(responseData.GrossMargin.Daily.Suffix).eql(i18n.__("VALUE.SUFFIX_MAN"))
      // Prefix response
      expect(responseData.GrossMargin.Annual.Prefix).eql(i18n.__("VALUE.PREFIX_YEN"))
      expect(responseData.GrossMargin.Monthly.Prefix).eql(i18n.__("VALUE.PREFIX_YEN"))
      expect(responseData.GrossMargin.Weekly.Prefix).eql(i18n.__("VALUE.PREFIX_YEN"))
      expect(responseData.GrossMargin.Daily.Prefix).eql(i18n.__("VALUE.PREFIX_YEN"))
    } else {
      throw new Error("getGrossMarginController invalid response")
    }
  })

  it("should generate GrossMargin response when ResponseCache is empty", async () => {
    const transaction = getTransaction()
    await cleanKpi003ResponseCacheUseCase(kpiResponseCacheRepository, transaction)
    const res = await getGrossMarginController(
      {
        plantCode: "HE_",
        unitCode: String(undefined),
        epochSeconds: new Date().getTime() / 1000,
      },
      snowflakeRepository,
      kpiResponseCacheRepository,
      i18n.__,
    )
    expect(E.isRight(res)).eql(true)
    if (E.isRight(res)) {
      expect(res.right).not.eql(null)
    }
  })
})
