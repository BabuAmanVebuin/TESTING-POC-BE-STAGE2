// Imported from DPM-BE, commit d0e2f45544cc9890762f93cf3e8f224f15efd619
import { Either, isLeft, right } from "fp-ts/lib/Either.js"
import { DateTime } from "luxon"
import { ApplicationError } from "../../../../application/errors/dpm/index.js"
import { AvailabilityJson, KPI003APIRequestParams } from "../../../../domain/models/dpm/KPI003/Index.js"
import { env } from "../../../../infrastructure/env/dpm/index.js"
import { Kpi003RepositoryPort } from "../../../../application/port/repositories/dpm/Kpi003RepositoryPort.js"
import { checkKpi003MeasureValid } from "../../../services/dpm/kpi003MeasureValidation.js"
import { generateAvailabilityResponseUseCase } from "../../../../application/use_cases/dpm/generateAvailabilityResponseUseCase.js"
import { KpiResponseCacheRepositoryPort } from "../../../../application/port/repositories/dpm/KpiResponseCacheRepositoryPort.js"
import { getCacheUseCase } from "../../../../application/use_cases/dpm/getCacheUseCase.js"
import { saveCacheUseCase } from "../../../../application/use_cases/dpm/saveCacheUseCase.js"
import { wrapInTransaction } from "../../../../infrastructure/orm/sqlize/index.js"

export const getAvailabilityController = async <X>(
  input: KPI003APIRequestParams,
  kpi003Repository: Kpi003RepositoryPort,
  kpiResponseCacheRepository: KpiResponseCacheRepositoryPort<X>,
  t: any,
): Promise<Either<ApplicationError, AvailabilityJson>> => {
  /**
   * Validation
   */
  const validationResult = checkKpi003MeasureValid(input.plantCode, input.unitCode, input.epochSeconds, t)
  if (isLeft(validationResult)) {
    return validationResult
  }

  // Validation passed, Calculate the point in time for the request
  const pointInTime = DateTime.fromSeconds(validationResult.right.epochSeconds)
    .setZone(env.TIMEZONE)
    .set({ hour: 0, minute: 0, second: 0, millisecond: 0 })

  // Retrieve or cache the data using KpiCacheRepositoryPort
  let cachedJson = await wrapInTransaction((transaction) =>
    getCacheUseCase<X, AvailabilityJson>(
      kpiResponseCacheRepository,
      validationResult.right.plantCode,
      validationResult.right.unitCode,
      pointInTime.toSeconds(),
      "Availability",
      transaction,
    ),
  )

  if (cachedJson === null) {
    const newCachedJson = await generateAvailabilityResponseUseCase(
      validationResult.right.plantCode,
      validationResult.right.unitCode,
      pointInTime.toSeconds(),
      kpi003Repository,
      t,
    )
    cachedJson = newCachedJson

    // Save the generated data to the cache
    await wrapInTransaction((transaction) =>
      saveCacheUseCase<X, AvailabilityJson>(
        kpiResponseCacheRepository,
        validationResult.right.plantCode,
        validationResult.right.unitCode,
        pointInTime.toSeconds(),
        "Availability",
        newCachedJson,
        DateTime.now(),
        transaction,
      ),
    )
  } else {
    cachedJson.Availability.Annual.Suffix =
      cachedJson.Availability.Monthly.Suffix =
      cachedJson.Availability.Daily.Suffix =
      cachedJson.Availability.Weekly.Suffix =
      cachedJson.Availability.Cumulative.Suffix =
        t("VALUE.SUFFIX_PERCENTAGE")
  }
  cachedJson

  // Generate the Kpi003 Availability JSON
  return right(cachedJson)
}
