// Initially copied from DPM-BE, commit d0e2f45544cc9890762f93cf3e8f224f15efd619
import { DateTime } from "luxon"
import { Kpi002Json } from "../../../../domain/models/dpm/Kpi002Json.js"
import { Measures } from "../../../../domain/models/dpm/Kpi003Cache.js"
import { Transaction } from "sequelize"

export type KpiResponseCacheRepositoryPort<WorkUnitCtx> = {
  wrapInWorkUnitCtx: <X>(fn: (workUnitCtx: WorkUnitCtx) => Promise<X>) => Promise<X>
  saveKpi002JsonCache: (
    plantCode: string,
    unitCode: string,
    kpi002Json: Kpi002Json,
    lastTriggered: DateTime,
    transaction: Transaction,
  ) => Promise<void>
  getKpi002JsonCache: (
    plantCode: string,
    unitCode: string,
    noOlderThan: DateTime,
    transaction: Transaction,
  ) => Promise<Kpi002Json | null>
  getCommonJsonCache: <R>(
    plantCode: string,
    unitCode: string,
    epochTimestamp: number,
    measure: Measures,
    noOlderThan: DateTime,
    transaction: Transaction,
  ) => Promise<R | null>
  saveCommonJsonCache: <R>(
    plantCode: string,
    unitCode: string,
    epochTimestamp: number,
    measure: Measures,
    CacheJson: R,
    lastTriggered: DateTime,
    transaction: Transaction,
  ) => Promise<void>
  cleanKpi003ResponseCacheBeforeLastTriggered: (noOlderThan: DateTime, transaction: Transaction) => Promise<void>
}
