// Imported from DPM-BE, commit d0e2f45544cc9890762f93cf3e8f224f15efd619
import { Either, isLeft, right } from "fp-ts/lib/Either.js"
import { DateTime } from "luxon"
import { KPI003APIRequestParams, GrossMarginMarketJson } from "../../../../domain/models/dpm/KPI003/Index.js"
import { Kpi003RepositoryPort } from "../../../../infrastructure/repositories/dpm/snowflake/kpi003RepositorySnowflake.js"
import { KpiResponseCacheRepositoryPort } from "../../../../application/port/repositories/dpm/KpiResponseCacheRepositoryPort.js"
import { ApplicationError } from "../../../../application/errors/dpm/index.js"
import { checkKpi003MeasureValid } from "../../../services/dpm/kpi003MeasureValidation.js"
import { env } from "../../../../infrastructure/env/dpm/index.js"
import { getCacheUseCase } from "../../../../application/use_cases/dpm/getCacheUseCase.js"
import { generateGrossMarginMarketResponseUseCase } from "../../../../application/use_cases/dpm/generateGrossMarginMarketResponseUseCase.js"
import { saveCacheUseCase } from "../../../../application/use_cases/dpm/saveCacheUseCase.js"
import { wrapInTransaction } from "../../../../infrastructure/orm/sqlize/index.js"

export const getGrossMarginMarketController = async <X>(
  input: KPI003APIRequestParams,
  kpi003Repository: Kpi003RepositoryPort,
  kpiResponseCacheRepository: KpiResponseCacheRepositoryPort<X>,
  t: any,
): Promise<Either<ApplicationError, GrossMarginMarketJson>> => {
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
    getCacheUseCase<X, GrossMarginMarketJson>(
      kpiResponseCacheRepository,
      validationResult.right.plantCode,
      validationResult.right.unitCode,
      pointInTime.toSeconds(),
      "GrossMarginMarket",
      transaction,
    ),
  )

  if (cachedJson === null) {
    const newCachedJson = await generateGrossMarginMarketResponseUseCase(
      validationResult.right.plantCode,
      validationResult.right.unitCode,
      pointInTime.toSeconds(),
      kpi003Repository,
      t,
    )
    cachedJson = newCachedJson

    // Save the generated data to the cache
    await wrapInTransaction((transaction) =>
      saveCacheUseCase<X, GrossMarginMarketJson>(
        kpiResponseCacheRepository,
        validationResult.right.plantCode,
        validationResult.right.unitCode,
        pointInTime.toSeconds(),
        "GrossMarginMarket",
        newCachedJson,
        DateTime.now(),
        transaction,
      ),
    )
  } else {
    cachedJson.GrossMarginMarket.Annual.Suffix =
      cachedJson.GrossMarginMarket.Monthly.Suffix =
      cachedJson.GrossMarginMarket.Weekly.Suffix =
      cachedJson.GrossMarginMarket.Cumulative.Suffix =
        t("VALUE.SUFFIX_OKU")
    cachedJson.GrossMarginMarket.Annual.Prefix =
      cachedJson.GrossMarginMarket.Monthly.Prefix =
      cachedJson.GrossMarginMarket.Weekly.Prefix =
      cachedJson.GrossMarginMarket.Daily.Prefix =
      cachedJson.GrossMarginMarket.Cumulative.Prefix =
        t("VALUE.PREFIX_YEN")

    cachedJson.GrossMarginMarket.Daily.Suffix = t("VALUE.SUFFIX_MAN")
  }

  // Generate the Kpi003 grossmarginMarket JSON
  return right(cachedJson)
}
