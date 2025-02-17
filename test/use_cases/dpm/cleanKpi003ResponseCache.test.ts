// Imported from DPM-BE, commit d0e2f45544cc9890762f93cf3e8f224f15efd619
import { expect } from "chai"
import { Sequelize, Transaction } from "sequelize"
import { KpiResponseCacheRepositoryPort } from "../../../src/application/port/repositories/dpm/KpiResponseCacheRepositoryPort.js"
import { createConnection } from "../../../src/infrastructure/orm/sqlize/dpm/index.js"
import { kpiResponseCacheRepositorySequelizeMySQL } from "../../../src/infrastructure/repositories/dpm/kpiResponseCacheRepositoryPortSequelizeMySQL.js"
import { cleanKpi003ResponseCacheUseCase } from "../../../src/application/use_cases/dpm/cleanKpi003ResponseCacheUseCase.js"
import { closeTransaction, startTransaction } from "../../integration/sequelize/index.js"
import { getTransaction } from "../../../src/infrastructure/orm/sqlize/index.js"

let connection: Sequelize
let repository: KpiResponseCacheRepositoryPort<Transaction>

const beforeEachHookFixtures = async () => {
  // empty fixture
}

describe("cleanKpi003ResponseCacheUseCase", () => {
  beforeEach(async () => {
    connection = createConnection()
    repository = await kpiResponseCacheRepositorySequelizeMySQL(connection)
    await startTransaction(beforeEachHookFixtures)
  })

  afterEach(closeTransaction)
  it("should delete ResponseCache in the database ", async () => {
    const transaction = getTransaction()
    const result = await cleanKpi003ResponseCacheUseCase(repository, transaction)

    expect(result).eql(void 0)
  })
})
