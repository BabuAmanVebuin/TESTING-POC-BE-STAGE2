// Imported from DPM-BE, commit d0e2f45544cc9890762f93cf3e8f224f15efd619
import * as E from "fp-ts/lib/Either.js"
import { Transaction } from "sequelize"
import { expect } from "chai"
import {
  Kpi003RepositoryPort,
  kpi003RepositorySnowflake,
} from "../../../src/infrastructure/repositories/dpm/snowflake/kpi003RepositorySnowflake.js"
import { SnowflakeTransaction } from "../../../src/infrastructure/orm/snowflake/index.js"
import { sequelize } from "../../../src/infrastructure/orm/sqlize/index.js"
import { closeTransaction, startTransaction } from "../../integration/sequelize/index.js"
import { rollbackSnowflakeTransaction, startSnowflakeTransaction } from "../../snowflake/index.js"
import { KpiResponseCacheRepositoryPort } from "../../../src/application/port/repositories/dpm/KpiResponseCacheRepositoryPort.js"
import { kpiResponseCacheRepositorySequelizeMySQL } from "../../../src/infrastructure/repositories/dpm/kpiResponseCacheRepositoryPortSequelizeMySQL.js"
import { getKPI002Controller } from "../../../src/interface/controllers/dpm/getKPI002Controller.js"
import { invalidPlantCodeError } from "../../../src/application/errors/dpm/InvalidPlantCodeError.js"
import { invalidPlantAndUnitCodeError } from "../../../src/application/errors/dpm/InvalidUnitCodeError.js"
import { i18n } from "../../../src/config/dpm/i18n/i18n-utils.js"
let mySqlRepository: KpiResponseCacheRepositoryPort<Transaction>
let snowflakeRepository: Kpi003RepositoryPort

const beforeFixture = (_t: Transaction) => async (snowflakeTransaction: SnowflakeTransaction) => {
  snowflakeRepository = await kpi003RepositorySnowflake(snowflakeTransaction)
  mySqlRepository = await kpiResponseCacheRepositorySequelizeMySQL(sequelize)
}

describe("getKPI002Controller", function () {
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
    }

    const res = await getKPI002Controller(req, snowflakeRepository, mySqlRepository, i18n.__)

    expect(res._tag).to.equal("Left")

    if (E.isLeft(res)) {
      expect(res.left).to.deep.equal(invalidPlantCodeError(i18n.__, req.plantCode))
    }
  })

  it("should return Left if plantCode invalid and unitCode is valid", async () => {
    /**
     * Test Data
     */
    const req = {
      plantCode: "invalid plantCode",
      unitCode: "HE_A100",
    }

    const res = await getKPI002Controller(req, snowflakeRepository, mySqlRepository, i18n.__)

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
      unitCode: "invalidunitCodeinvalidunitCodeinvalidunitCodeinvalidunitCode",
    }

    const res = await getKPI002Controller(req, snowflakeRepository, mySqlRepository, i18n.__)

    expect(res._tag).to.equal("Left")

    if (E.isLeft(res)) {
      expect(res.left).to.deep.equal(invalidPlantAndUnitCodeError(i18n.__, req.plantCode, req.unitCode))
    }
  })

  // -------------------------------------------------------------------------------------
  // should return data test case
  // -------------------------------------------------------------------------------------
  it("should return Data for unit", async () => {
    const res = await getKPI002Controller(
      {
        plantCode: "HE_",
        unitCode: "HE_A100",
      },
      snowflakeRepository,
      mySqlRepository,
      i18n.__,
    )

    expect(E.isRight(res)).to.equal(true)

    if (E.isRight(res)) {
      expect(res.right).to.not.be.null
      // check res type is valid
      expect(true).to.equal(true)
    }
  })

  it("should return Data for plant", async () => {
    const res = await getKPI002Controller(
      {
        plantCode: "HE_",
        unitCode: String(undefined),
      },
      snowflakeRepository,
      mySqlRepository,
      i18n.__,
    )

    expect(E.isRight(res)).to.equal(true)

    if (E.isRight(res)) {
      expect(res.right).to.not.be.null
    }
  })
})
