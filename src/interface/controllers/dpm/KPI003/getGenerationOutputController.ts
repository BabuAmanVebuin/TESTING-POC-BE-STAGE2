// Imported from DPM-BE, commit d0e2f45544cc9890762f93cf3e8f224f15efd619
import { Either, isLeft, right } from "fp-ts/lib/Either.js"
import { DateTime } from "luxon"
import { KPI003APIRequestParams, GenerationOutputJson } from "../../../../domain/models/dpm/KPI003/Index.js"
import { Kpi003RepositoryPort } from "../../../../infrastructure/repositories/dpm/snowflake/kpi003RepositorySnowflake.js"
import { KpiResponseCacheRepositoryPort } from "../../../../application/port/repositories/dpm/KpiResponseCacheRepositoryPort.js"
import { ApplicationError } from "../../../../application/errors/dpm/index.js"
import { checkKpi003MeasureValid } from "../../../services/dpm/kpi003MeasureValidation.js"
import { env } from "../../../../infrastructure/env/dpm/index.js"
import { getCacheUseCase } from "../../../../application/use_cases/dpm/getCacheUseCase.js"
import { generateGenerationOutputResponseUseCase } from "../../../../application/use_cases/dpm/generateGenerationOutputResponseUseCase.js"
import { saveCacheUseCase } from "../../../../application/use_cases/dpm/saveCacheUseCase.js"
import { wrapInTransaction } from "../../../../infrastructure/orm/sqlize/index.js"

export const getGenerationOutputController = async <X>(
  input: KPI003APIRequestParams,
  kpi003Repository: Kpi003RepositoryPort,
  kpiResponseCacheRepository: KpiResponseCacheRepositoryPort<X>,
  t: any,
): Promise<Either<ApplicationError, GenerationOutputJson>> => {
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
    getCacheUseCase<X, GenerationOutputJson>(
      kpiResponseCacheRepository,
      validationResult.right.plantCode,
      validationResult.right.unitCode,
      pointInTime.toSeconds(),
      "GenerationOutput",
      transaction,
    ),
  )

  if (cachedJson === null) {
    const newCachedJson = await generateGenerationOutputResponseUseCase(
      validationResult.right.plantCode,
      validationResult.right.unitCode,
      pointInTime.toSeconds(),
      kpi003Repository,
      t,
    )
    cachedJson = newCachedJson

    // Save the generated data to the cache
    await wrapInTransaction((transaction) =>
      saveCacheUseCase<X, GenerationOutputJson>(
        kpiResponseCacheRepository,
        validationResult.right.plantCode,
        validationResult.right.unitCode,
        pointInTime.toSeconds(),
        "GenerationOutput",
        newCachedJson,
        DateTime.now(),
        transaction,
      ),
    )
  } else {
    cachedJson.GenerationOutput.Annual.Suffix =
      cachedJson.GenerationOutput.Monthly.Suffix =
      cachedJson.GenerationOutput.Weekly.Suffix =
      cachedJson.GenerationOutput.Cumulative.Suffix =
        t("VALUE.GWH")

    cachedJson.GenerationOutput.Daily.Suffix = t("VALUE.MWH")
  }

  // Generate the Kpi003 generationOutput JSON
  return right(cachedJson)
}
