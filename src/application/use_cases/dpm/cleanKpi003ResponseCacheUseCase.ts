// Imported from DPM-BE, commit d0e2f45544cc9890762f93cf3e8f224f15efd619
import { DateTime, Duration } from "luxon"
import { KpiResponseCacheRepositoryPort } from "../../port/repositories/dpm/KpiResponseCacheRepositoryPort.js"
import { env } from "../../../infrastructure/env/dpm/index.js"
import { Transaction } from "sequelize"

export const cleanKpi003ResponseCacheUseCase = <X>(
  kpiResponseCacheRepository: KpiResponseCacheRepositoryPort<X>,
  transaction: Transaction,
): Promise<void> => {
  // Get the current date and time in JST
  const noOlderThan = DateTime.now()
    .setZone(env.TIMEZONE)
    .minus(Duration.fromObject({ hour: env.KPI003_NO_OLDER_THAN_HOUR }))
  return kpiResponseCacheRepository.cleanKpi003ResponseCacheBeforeLastTriggered(noOlderThan, transaction)
}
