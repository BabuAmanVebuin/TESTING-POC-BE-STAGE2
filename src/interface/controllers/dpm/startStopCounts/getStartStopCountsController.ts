// Imported from DPM-BE, commit d0e2f45544cc9890762f93cf3e8f224f15efd619
import * as E from "fp-ts/lib/Either.js"
import { ApplicationError } from "../../../../application/errors/dpm/index.js"
import { StartStopCounts, StartStopCountsAPIResponse } from "../../../../domain/models/dpm/StartStopCounts.js"
import {
  checkPlantAndUnitCodeValid,
  checkPlantCodeValid,
} from "../../../services/dpm/plantAndUnitValidation/plantAndUnitValidation.js"
import { invalidFiscalYearError } from "../../../../application/errors/dpm/InvalidFiscalYearError.js"
import { invalidPlantCodeError } from "../../../../application/errors/dpm/InvalidPlantCodeError.js"
import { invalidPlantAndUnitCodeError } from "../../../../application/errors/dpm/InvalidUnitCodeError.js"
import logger from "../../../../infrastructure/logger.js"
import { validateYear } from "../../../../application/utils.js"
import { StartStopCountRepositoryPort } from "../../../../application/port/repositories/dpm/StartStopCountRepositoryPort.js"
import { CONST_FORECAST_CATEGORY } from "../../../../config/dpm/constant.js"

export const getStartStopCountsController = async (
  input: {
    plantCode: string
    unitCode: string
    fiscalYear: string
  },
  startStopCountRepository: StartStopCountRepositoryPort,
  t: typeof i18n.__,
): Promise<E.Either<ApplicationError, StartStopCountsAPIResponse>> => {
  const { plantCode, unitCode } = input
  const fiscalYear = Number(input.fiscalYear)
  let startStopCountRecord: StartStopCounts[]
  /**
   * request input validation
   */
  // fiscalYear validation
  const isPlantCodeValid = await checkPlantCodeValid(plantCode)

  if (!validateYear(fiscalYear)) {
    logger.warn(`Request validation error - Invalid fiscal year error :${input.fiscalYear}}`)

    return E.left(invalidFiscalYearError(t, input.fiscalYear))
  }

  // plantCode unitCode validation
  if (!plantCode || !isPlantCodeValid) {
    logger.warn(`Request validation error - Invalid plant code error plantCode :${plantCode}, unitCode: ${unitCode}`)
    return E.left(invalidPlantCodeError(t, plantCode))
  }

  if (unitCode !== "undefined") {
    // unitCode unitCode validation
    // validate the combination of plant and unit code
    const isPlantAndUnitCodeValid = await checkPlantAndUnitCodeValid(plantCode, unitCode)
    if (!isPlantAndUnitCodeValid) {
      logger.warn(
        `Request validation error - Invalid plant and unit code error plantCode :${plantCode}, unitCode: ${unitCode}`,
      )
      return E.left(invalidPlantAndUnitCodeError(t, plantCode, unitCode))
    }

    startStopCountRecord = await startStopCountRepository.getUnitStartStopCounts(fiscalYear, plantCode, unitCode)
  } else {
    startStopCountRecord = await startStopCountRepository.getPlantStartStopCounts(fiscalYear, plantCode)
  }
  return E.right({
    PlantCode: plantCode,
    UnitCode: unitCode == "undefined" ? null : unitCode,
    FiscalYear: fiscalYear,
    ActualCount:
      Number(
        startStopCountRecord.find((i) => Number(i.FORECAST_CATEGORY) == CONST_FORECAST_CATEGORY.ACTUAL)?.START_COUNT,
      ) || 0,
    ForecastCount:
      Number(
        startStopCountRecord.find((i) => Number(i.FORECAST_CATEGORY) == CONST_FORECAST_CATEGORY.FORCAST)?.START_COUNT,
      ) || 0,
  })
}
