// Imported from DPM-BE, commit d0e2f45544cc9890762f93cf3e8f224f15efd619
import * as E from "fp-ts/lib/Either.js"
import { DateTime, Duration } from "luxon"

import logger from "../../../infrastructure/logger.js"
import { Kpi003RepositoryPort } from "../../../infrastructure/repositories/dpm/snowflake/kpi003RepositorySnowflake.js"
import { KpiResponseCacheRepositoryPort } from "../../../application/port/repositories/dpm/KpiResponseCacheRepositoryPort.js"
import { ApplicationError } from "../../../application/errors/dpm/index.js"
import { Kpi002Json } from "../../../domain/models/dpm/Kpi002Json.js"
import {
  checkPlantAndUnitCodeValid,
  checkPlantCodeValid,
} from "../../services/dpm/plantAndUnitValidation/plantAndUnitValidation.js"
import { generateKpi002JsonCache } from "../../../application/use_cases/dpm/generateKpi002ResponseCacheUseCase.js"
import { invalidPlantCodeError } from "../../../application/errors/dpm/InvalidPlantCodeError.js"
import { invalidPlantAndUnitCodeError } from "../../../application/errors/dpm/InvalidUnitCodeError.js"
import { wrapInTransaction } from "../../../infrastructure/orm/sqlize/index.js"

export const getKPI002Controller = async <X>(
  input: {
    plantCode: string
    unitCode: string
  },
  services: Pick<Kpi003RepositoryPort, "getPastAnnualTotalGrossMarginCache" | "getKpi002Data">,
  mysqlRepository: KpiResponseCacheRepositoryPort<X>,
  t: typeof i18n.__,
): Promise<E.Either<ApplicationError, Kpi002Json | null>> => {
  const noOlderThan = DateTime.now().minus(Duration.fromObject({ hour: 1 }))
  /**
   * Validation
   */
  const isPlantCodeValid = await checkPlantCodeValid(input.plantCode)
  if (!input.plantCode || !isPlantCodeValid) {
    logger.warn(`Request validation error - Invalid plantCode:${input.plantCode}`)
    return E.left(invalidPlantCodeError(t, input.plantCode))
  }

  if (input.unitCode && input.unitCode !== "undefined") {
    // validate the combination of plant and unit code
    const isPlantAndUnitCodeValid = await checkPlantAndUnitCodeValid(input.plantCode, input.unitCode)
    if (!isPlantAndUnitCodeValid) {
      logger.warn(
        `Request validation error - Invalid plant and unit code error plantCode :${input.plantCode}, unitCode: ${input.unitCode}`,
      )
      return E.left(invalidPlantAndUnitCodeError(t, input.plantCode, input.unitCode))
    }
  } else {
    input.unitCode = ""
  }
  let cachedJson = await wrapInTransaction(async (transaction) =>
    mysqlRepository.getKpi002JsonCache(input.plantCode, input.unitCode, noOlderThan, transaction),
  )

  if (!cachedJson) {
    logger.debug(`getKpi002JsonCache fetched record : null`)
    const newCachedJson = await generateKpi002JsonCache(input.plantCode, input.unitCode, services)

    cachedJson = newCachedJson

    await wrapInTransaction((transaction) =>
      mysqlRepository.saveKpi002JsonCache(
        input.plantCode,
        input.unitCode || "",
        newCachedJson,
        DateTime.now(),
        transaction,
      ),
    )
  }

  return E.right(setSuffixPrefixKpi002(t, cachedJson))
}
/**
 * Set suffix prefix for kpi002
 * @param t translator function
 * @param cachedJson
 * @returns cachedJson
 */
const setSuffixPrefixKpi002 = (t: any, cachedJson: Kpi002Json): Kpi002Json => {
  cachedJson.KPI.EBITDA.Suffix2 =
    cachedJson.KPI.EBITDA.Suffix =
    cachedJson.KPI.OPEXTotal.Suffix =
    cachedJson.KPI.OPEXTotal.Suffix2 =
    cachedJson.KPI.GrossMargin.Suffix =
    cachedJson.KPI.GrossMargin.Suffix2 =
    cachedJson.KPI.OPEXOperation.Suffix =
    cachedJson.KPI.OPEXOperation.Suffix2 =
    cachedJson.KPI.OPEXMaintenance.Suffix =
    cachedJson.KPI.OPEXMaintenance.Suffix2 =
    cachedJson.KPI.BasicCharge.Suffix =
    cachedJson.KPI.BasicCharge.Suffix2 =
    cachedJson.KPI.BasicProfit.Suffix =
    cachedJson.KPI.BasicProfit.Suffix2 =
    cachedJson.KPI.AnnualTotalGrossMargin.Suffix =
    cachedJson.KPI.AnnualTotalGrossMargin.Suffix2 =
      t("VALUE.SUFFIX_OKU")
  cachedJson.KPI.Spread.Suffix = t("VALUE.SUFFIX_YEN_KWH")
  return cachedJson
}
