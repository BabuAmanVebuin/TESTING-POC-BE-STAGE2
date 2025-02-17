// Imported from DPM-BE, commit d0e2f45544cc9890762f93cf3e8f224f15efd619
import { Either, isLeft, right } from "fp-ts/lib/Either.js"
import { DateTime } from "luxon"
import { KPI003APIRequestParams, GrossMarginPPAJson } from "../../../../domain/models/dpm/KPI003/Index.js"
import { Kpi003RepositoryPort } from "../../../../infrastructure/repositories/dpm/snowflake/kpi003RepositorySnowflake.js"
import { KpiResponseCacheRepositoryPort } from "../../../../application/port/repositories/dpm/KpiResponseCacheRepositoryPort.js"
import { ApplicationError } from "../../../../application/errors/dpm/index.js"
import { checkKpi003MeasureValid } from "../../../services/dpm/kpi003MeasureValidation.js"
import { env } from "../../../../infrastructure/env/dpm/index.js"
import { getCacheUseCase } from "../../../../application/use_cases/dpm/getCacheUseCase.js"
import { generateGrossMarginPPAResponseUseCase } from "../../../../application/use_cases/dpm/generateGrossMarginPPAResponseUseCase.js"
import { saveCacheUseCase } from "../../../../application/use_cases/dpm/saveCacheUseCase.js"
import { wrapInTransaction } from "../../../../infrastructure/orm/sqlize/index.js"

export const getGrossMarginPPAController = async <X>(
  input: KPI003APIRequestParams,
  kpi003Repository: Kpi003RepositoryPort,
  kpiResponseCacheRepository: KpiResponseCacheRepositoryPort<X>,
  t: any,
): Promise<Either<ApplicationError, GrossMarginPPAJson>> => {
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
    getCacheUseCase<X, GrossMarginPPAJson>(
      kpiResponseCacheRepository,
      validationResult.right.plantCode,
      validationResult.right.unitCode,
      pointInTime.toSeconds(),
      "GrossMarginPPA",
      transaction,
    ),
  )

  if (cachedJson === null) {
    const newCachedJson = await generateGrossMarginPPAResponseUseCase(
      validationResult.right.plantCode,
      validationResult.right.unitCode,
      pointInTime.toSeconds(),
      kpi003Repository,
      t,
    )

    cachedJson = newCachedJson

    // Save the generated data to the cache
    await wrapInTransaction((transaction) =>
      saveCacheUseCase<X, GrossMarginPPAJson>(
        kpiResponseCacheRepository,
        validationResult.right.plantCode,
        validationResult.right.unitCode,
        pointInTime.toSeconds(),
        "GrossMarginPPA",
        newCachedJson,
        DateTime.now(),
        transaction,
      ),
    )
  } else {
    cachedJson.GrossMarginPPA.Annual.Suffix =
      cachedJson.GrossMarginPPA.Monthly.Suffix =
      cachedJson.GrossMarginPPA.Weekly.Suffix =
      cachedJson.GrossMarginPPA.Cumulative.Suffix =
        t("VALUE.SUFFIX_OKU")

    cachedJson.GrossMarginPPA.Annual.Prefix =
      cachedJson.GrossMarginPPA.Monthly.Prefix =
      cachedJson.GrossMarginPPA.Weekly.Prefix =
      cachedJson.GrossMarginPPA.Daily.Prefix =
      cachedJson.GrossMarginPPA.Cumulative.Prefix =
        t("VALUE.PREFIX_YEN")

    cachedJson.GrossMarginPPA.Daily.Suffix = t("VALUE.SUFFIX_MAN")
  }

  // Generate the Kpi003 grossmarginPPA JSON
  return right(cachedJson)
}
