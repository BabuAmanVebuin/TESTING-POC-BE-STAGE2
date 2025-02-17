// Imported from DPM-BE, commit d0e2f45544cc9890762f93cf3e8f224f15efd619
import * as E from "fp-ts/lib/Either.js"
import logger from "../../../../infrastructure/logger.js"
import { invalidPlantCodeError } from "../../../../application/errors/dpm/InvalidPlantCodeError.js"
import { EBITDAResponseType, YearlyEstimation } from "../../../../domain/models/dpm/kpi003Estimations.js"
import {
  checkPlantAndUnitCodeValid,
  checkPlantCodeValid,
} from "../../../services/dpm/plantAndUnitValidation/plantAndUnitValidation.js"
import { invalidPlantAndUnitCodeError } from "../../../../application/errors/dpm/InvalidUnitCodeError.js"
import { ApplicationError } from "../../../../application/errors/dpm/index.js"
import { isValidForecastCategory } from "../../../../application/utils.js"
import { invalidGranularityCategoryError } from "../../../../application/errors/dpm/InvalidGranularityCategoryError.js"
import { invalidForecastCategoryError } from "../../../../application/errors/dpm/InvalidForecastCategoryError.js"
import { Kpi003EstimationRepositoryPort } from "../../../../application/port/repositories/dpm/Kpi003EstimationRepositoryPort.js"

/**
 * Controller get EBITDA Controller estimation
 * @param input request inputs
 * @param connection
 */
export const getEBITDAEstimatesController = async <X>(
  input: {
    plantCode: string
    unitCode: string
    forecastCategory: string
    granularity: string
  },
  kpi003EstimationRepositorySnowflake: Kpi003EstimationRepositoryPort<X>,
  t: typeof i18n.__,
): Promise<E.Either<ApplicationError, EBITDAResponseType>> => {
  const { plantCode, forecastCategory, granularity } = input
  let unitCode = null
  let EBITDARecords: YearlyEstimation[] = []

  if (!(granularity === "annual")) {
    logger.warn(`Request validation error - Invalid for granularity error granularity: ${granularity}`)
    return E.left(invalidGranularityCategoryError(t, granularity))
  }
  if (!isValidForecastCategory(forecastCategory)) {
    logger.warn(`Request validation error - Invalid for forecastCategory error forecastCategory: ${forecastCategory}`)
    return E.left(invalidForecastCategoryError(t, forecastCategory))
  }
  if (input.unitCode === "undefined") {
    const isPlantCodeValid = await checkPlantCodeValid(plantCode)
    if (!plantCode || !isPlantCodeValid) {
      logger.warn(`Request validation error - Invalid plant code error plantCode :${plantCode}, unitCode: ${unitCode}`)
      return E.left(invalidPlantCodeError(t, plantCode))
    }
    // plant wise get records
    EBITDARecords = await kpi003EstimationRepositorySnowflake.getEBITDAEstimates<YearlyEstimation>(
      plantCode,
      null,
      "plant",
      "annual",
      forecastCategory,
      null,
    )
  } else {
    unitCode = input.unitCode
    // validate the combination of plant and unit code
    const isPlantAndUnitCodeValid = await checkPlantAndUnitCodeValid(plantCode, unitCode)
    if (!isPlantAndUnitCodeValid) {
      logger.warn(
        `Request validation error - Invalid plant and unit code error plantCode :${plantCode}, unitCode: ${unitCode}`,
      )
      return E.left(invalidPlantAndUnitCodeError(t, plantCode, unitCode))
    }
    // unit wise  get records
    EBITDARecords = await kpi003EstimationRepositorySnowflake.getEBITDAEstimates<YearlyEstimation>(
      plantCode,
      unitCode,
      "unit",
      "annual",
      forecastCategory,
      null,
    )
  }

  return E.right({
    PlantCode: plantCode,
    UnitCode: unitCode,
    ForecastCategory: forecastCategory,
    UOM: t("VALUE.SUFFIX_OKU"),
    EBITDA: EBITDARecords.map((i) => ({
      FiscalYear: i.FISCAL_YEAR,
      Value: i.VALUE / 100_000_000,
    })),
  })
}
