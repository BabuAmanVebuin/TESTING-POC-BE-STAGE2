// Imported from DPM-BE, commit d0e2f45544cc9890762f93cf3e8f224f15efd619
import { Either, isLeft, right } from "fp-ts/lib/Either.js"
import { DateTime } from "luxon"
import { ApplicationError } from "../../../../application/errors/dpm/index.js"
import { generateSpreadResponseUseCase } from "../../../../application/use_cases/dpm/generateSpreadResponseUseCase.js"
import { KPI003APIRequestParams, SpreadJson } from "../../../../domain/models/dpm/KPI003/Index.js"
import { env } from "../../../../infrastructure/env/dpm/index.js"
import { Kpi003RepositoryPort } from "../../../../infrastructure/repositories/dpm/snowflake/kpi003RepositorySnowflake.js"
import { KpiResponseCacheRepositoryPort } from "../../../../application/port/repositories/dpm/KpiResponseCacheRepositoryPort.js"
import { checkKpi003MeasureValid } from "../../../services/dpm/kpi003MeasureValidation.js"
import { getCacheUseCase } from "../../../../application/use_cases/dpm/getCacheUseCase.js"
import { saveCacheUseCase } from "../../../../application/use_cases/dpm/saveCacheUseCase.js"
import { wrapInTransaction } from "../../../../infrastructure/orm/sqlize/index.js"

export const getSpreadController = async <X>(
  input: KPI003APIRequestParams,
  kpi003Repository: Kpi003RepositoryPort,
  kpiResponseCacheRepository: KpiResponseCacheRepositoryPort<X>,
  t: any,
): Promise<Either<ApplicationError, SpreadJson>> => {
  /**
   * Validation
   */
  const validationResult = checkKpi003MeasureValid(input.plantCode, input.unitCode, input.epochSeconds, t)
  if (isLeft(validationResult)) {
    return validationResult
  }

  const pointInTime = DateTime.fromSeconds(validationResult.right.epochSeconds)
    .setZone(env.TIMEZONE)
    .set({ hour: 0, minute: 0, second: 0, millisecond: 0 })

  // Retrieve or cache the data using KpiCacheRepositoryPort
  let cachedJson = await wrapInTransaction((transaction) =>
    getCacheUseCase<X, SpreadJson>(
      kpiResponseCacheRepository,
      validationResult.right.plantCode,
      validationResult.right.unitCode,
      pointInTime.toSeconds(),
      "Spread",
      transaction,
    ),
  )

  if (cachedJson === null) {
    const newCachedJson = await generateSpreadResponseUseCase(
      validationResult.right.plantCode,
      validationResult.right.unitCode,
      pointInTime.toSeconds(),
      kpi003Repository,
      t,
    )
    cachedJson = newCachedJson

    // Save the generated data to the cache
    await wrapInTransaction((transaction) =>
      saveCacheUseCase<X, SpreadJson>(
        kpiResponseCacheRepository,
        validationResult.right.plantCode,
        validationResult.right.unitCode,
        pointInTime.toSeconds(),
        "Spread",
        newCachedJson,
        DateTime.now(),
        transaction,
      ),
    )
  } else {
    cachedJson.Spread.Annual.Suffix =
      cachedJson.Spread.Monthly.Suffix =
      cachedJson.Spread.Daily.Suffix =
      cachedJson.Spread.Weekly.Suffix =
      cachedJson.Spread.Cumulative.Suffix =
        t("VALUE.SUFFIX_YEN_KWH")
  }
  return right(cachedJson)
}
