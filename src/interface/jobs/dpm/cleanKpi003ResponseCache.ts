// Imported from DPM-BE, commit d0e2f45544cc9890762f93cf3e8f224f15efd619
import { createConnection } from "../../../infrastructure/orm/sqlize/dpm/index.js"
import { kpiResponseCacheRepositorySequelizeMySQL } from "../../../infrastructure/repositories/dpm/kpiResponseCacheRepositoryPortSequelizeMySQL.js"
import { cleanKpi003ResponseCacheUseCase } from "../../../application/use_cases/dpm/cleanKpi003ResponseCacheUseCase.js"
import { wrapInTransaction } from "../../../infrastructure/orm/sqlize/index.js"

export const cleanKpi003ResponseJob = async (): Promise<void> => {
  const connection = createConnection()
  const repository = await kpiResponseCacheRepositorySequelizeMySQL(connection)

  // Executing the cleanKpi003ResponseCacheUseCase function with the repository
  // This function will perform the use case logic to clean the KPI003 response cache
  await wrapInTransaction((transaction) => cleanKpi003ResponseCacheUseCase(repository, transaction))
}
