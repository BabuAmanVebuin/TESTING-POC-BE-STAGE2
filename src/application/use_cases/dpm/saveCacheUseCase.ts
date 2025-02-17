// Imported from DPM-BE, commit d0e2f45544cc9890762f93cf3e8f224f15efd619
import { Measures } from "../../../domain/models/dpm/Kpi003Cache.js"
import { KpiResponseCacheRepositoryPort } from "../../port/repositories/dpm/KpiResponseCacheRepositoryPort.js"
import { DateTime } from "luxon"
import { Transaction } from "sequelize"

export const saveCacheUseCase = <X, R>(
  kpiResponseCacheRepository: KpiResponseCacheRepositoryPort<X>,
  plantCode: string,
  unitCode: string | null,
  pointInTime: number,
  measure: Measures,
  cachedJson: R,
  DateTime: DateTime,
  transaction: Transaction,
): Promise<void> => {
  return kpiResponseCacheRepository.saveCommonJsonCache<R>(
    plantCode,
    unitCode || "",
    pointInTime,
    measure,
    cachedJson,
    DateTime,
    transaction,
  )
}
