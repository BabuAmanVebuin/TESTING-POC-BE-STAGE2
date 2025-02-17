// Imported from DPM-BE, commit d0e2f45544cc9890762f93cf3e8f224f15efd619
import { Kpi003RepositoryPort } from "../../../src/application/port/repositories/dpm/Kpi003RepositoryPort.js"
import { KpiResponseCacheRepositoryPort } from "../../../src/application/port/repositories/dpm/KpiResponseCacheRepositoryPort.js"
import { Transaction } from "sequelize"
import { SnowflakeTransaction } from "../../../src/infrastructure/orm/snowflake/index.js"
import { kpi003RepositorySnowflake } from "../../../src/infrastructure/repositories/dpm/snowflake/kpi003RepositorySnowflake.js"
import { kpiResponseCacheRepositorySequelizeMySQL } from "../../../src/infrastructure/repositories/dpm/kpiResponseCacheRepositoryPortSequelizeMySQL.js"
import { getTransaction, sequelize } from "../../../src/infrastructure/orm/sqlize/index.js"
import { expect } from "chai"
import { i18n } from "../../../src/config/dpm/i18n/i18n-utils.js"
import { DateTime } from "luxon"
import { generateAvailabilityResponseUseCase } from "../../../src/application/use_cases/dpm/generateAvailabilityResponseUseCase.js"
import { getCacheUseCase } from "../../../src/application/use_cases/dpm/getCacheUseCase.js"
import { saveCacheUseCase } from "../../../src/application/use_cases/dpm/saveCacheUseCase.js"
import { AvailabilityJson } from "../../../src/domain/models/dpm/KPI003/Index.js"
import { cleanKpi003ResponseCacheUseCase } from "../../../src/application/use_cases/dpm/cleanKpi003ResponseCacheUseCase.js"
import { env } from "../../../src/infrastructure/env/dpm/index.js"
import { rollbackSnowflakeTransaction, startSnowflakeTransaction } from "../../snowflake/index.js"
import { closeTransaction, startTransaction } from "../../integration/sequelize/index.js"
let snowflakeRepository: Kpi003RepositoryPort
let kpiResponseCacheRepository: KpiResponseCacheRepositoryPort<Transaction>
const beforeFixture = (_t: Transaction) => async (snowflakeTransaction: SnowflakeTransaction) => {
  snowflakeRepository = await kpi003RepositorySnowflake(snowflakeTransaction)
  kpiResponseCacheRepository = await kpiResponseCacheRepositorySequelizeMySQL(sequelize)
}

describe("saveCacheUseCase", function () {
  this.timeout(10000)
  before(async function () {
    await startTransaction((transaction) => startSnowflakeTransaction(beforeFixture(transaction)))
  })
  after(async function () {
    await closeTransaction()
    await rollbackSnowflakeTransaction()
  })
  it("should save response in the database", async () => {
    const transaction = getTransaction()
    await cleanKpi003ResponseCacheUseCase(kpiResponseCacheRepository, transaction)
    const setPointInTime = DateTime.local().setZone(env.TIMEZONE).set({ hour: 0, minute: 0, second: 0, millisecond: 0 })
    const plantCode = "HE_"
    const unitCode = ""
    const pointInTime = setPointInTime
    const measure = "Availability"
    // generateAvailabilityResponseUseCase
    const cachedJson = await generateAvailabilityResponseUseCase(
      plantCode,
      unitCode,
      pointInTime.toSeconds(),
      snowflakeRepository,
      i18n.__,
    )
    // save in saveCache
    const SaveData = await saveCacheUseCase<Transaction, AvailabilityJson>(
      kpiResponseCacheRepository,
      plantCode,
      unitCode,
      pointInTime.toSeconds(),
      measure,
      cachedJson,
      DateTime.now(),
      transaction,
    )
    // get saved Cache
    const SavedData = await getCacheUseCase<Transaction, AvailabilityJson>(
      kpiResponseCacheRepository,
      plantCode,
      unitCode,
      pointInTime.toSeconds(),
      "Availability",
      transaction,
    )
    expect(SaveData).not.to.be.null
    expect(SavedData?.Availability).to.exist
    expect(SavedData?.PlantCode).to.equal(plantCode)
    expect(SavedData?.UnitCode).to.equal(unitCode)
  })
})
