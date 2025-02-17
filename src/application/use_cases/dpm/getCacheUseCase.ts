// Imported from DPM-BE, commit d0e2f45544cc9890762f93cf3e8f224f15efd619
import { Transaction } from "sequelize"
import { Measures } from "../../../domain/models/dpm/Kpi003Cache.js"
import { env } from "../../../infrastructure/env/dpm/index.js"
import { KpiResponseCacheRepositoryPort } from "../../port/repositories/dpm/KpiResponseCacheRepositoryPort.js"
import { DateTime, Duration } from "luxon"

export const getCacheUseCase = <X, R>(
  kpiResponseCacheRepository: KpiResponseCacheRepositoryPort<X>,
  plantCode: string,
  unitCode: string | null,
  pointInTime: number,
  measure: Measures,
  transaction: Transaction,
): Promise<R | null> => {
  const noOlderThan = DateTime.now().minus(Duration.fromObject({ hour: env.KPI003_NO_OLDER_THAN_HOUR }))

  return kpiResponseCacheRepository.getCommonJsonCache<R>(
    plantCode,
    unitCode || "",
    pointInTime,
    measure,
    noOlderThan,
    transaction,
  )
}
