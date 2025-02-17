// Imported from DPM-BE, commit d0e2f45544cc9890762f93cf3e8f224f15efd619
import * as E from "fp-ts/lib/Either.js"
import logger from "../../../../infrastructure/logger.js"
import { ApplicationError } from "../../../../application/errors/dpm/index.js"
import {
  kpiNegativeSpreadRecord,
  NegativeSpreads,
  negativeSpreadsResponse,
} from "../../../../domain/models/dpm/negativeSpreadOperation.js"
import {
  checkPlantAndUnitCodeValid,
  checkPlantCodeValid,
} from "../../../services/dpm/plantAndUnitValidation/plantAndUnitValidation.js"
import { formatDateWithTimeZone, validateYear } from "../../../../application/utils.js"
import { invalidFiscalYearError } from "../../../../application/errors/dpm/InvalidFiscalYearError.js"
import { invalidPlantCodeError } from "../../../../application/errors/dpm/InvalidPlantCodeError.js"
import { invalidPlantAndUnitCodeError } from "../../../../application/errors/dpm/InvalidUnitCodeError.js"

import { CONST_FORECAST_CATEGORY } from "../../../../config/dpm/constant.js"
import { NegativeSpreadRepositoryPort } from "../../../../application/port/repositories/dpm/NegativeSpreadRepositoryPort.js"

/**
 * Controller get Negative Spread Controller
 * @param input request inputs
 * @param connection
 */
export const getSpreadNegativeOperationController = async (
  input: {
    plantCode: string
    unitCode: string
    fiscalYear: string
  },
  negativeSpreadRepository: NegativeSpreadRepositoryPort,
  t: typeof i18n.__,
): Promise<E.Either<ApplicationError, negativeSpreadsResponse>> => {
  const { plantCode, unitCode, fiscalYear } = input
  let actualNegativeSpreadRecords: kpiNegativeSpreadRecord[] = []
  let forecastNegativeSpreadRecords: kpiNegativeSpreadRecord[] = []
  if (!validateYear(parseInt(fiscalYear))) {
    logger.warn(`Request validation error - Invalid fiscal year error :${fiscalYear}}`)
    return E.left(invalidFiscalYearError(t, fiscalYear))
  }

  const isPlantCodeValid = await checkPlantCodeValid(plantCode)
  if (!plantCode || !isPlantCodeValid) {
    logger.warn(`Request validation error - Invalid plant code error plantCode :${plantCode}, unitCode: ${unitCode}`)
    return E.left(invalidPlantCodeError(t, plantCode))
  }

  if (unitCode !== "undefined") {
    // validate the combination of plant and unit code
    const isPlantAndUnitCodeValid = await checkPlantAndUnitCodeValid(plantCode, unitCode)
    if (!isPlantAndUnitCodeValid) {
      logger.warn(
        `Request validation error - Invalid plant and unit code error plantCode :${plantCode}, unitCode: ${unitCode}`,
      )
      return E.left(invalidPlantAndUnitCodeError(t, plantCode, unitCode))
    }
    /**
     * Get Negative spread data from repository
     */
    ;[actualNegativeSpreadRecords, forecastNegativeSpreadRecords] = await Promise.all([
      negativeSpreadRepository.getTop20NegativeSpreadOperation(
        plantCode,
        CONST_FORECAST_CATEGORY.ACTUAL,
        parseInt(fiscalYear),
        unitCode,
      ),

      negativeSpreadRepository.getTop20NegativeSpreadOperation(
        plantCode,
        CONST_FORECAST_CATEGORY.FORCAST,
        parseInt(fiscalYear),
        unitCode,
      ),
    ])
  } else {
    /**
     * Get Negative spread data from repository
     */
    ;[actualNegativeSpreadRecords, forecastNegativeSpreadRecords] = await Promise.all([
      negativeSpreadRepository.getTop20NegativeSpreadOperation(
        plantCode,
        CONST_FORECAST_CATEGORY.ACTUAL,
        parseInt(fiscalYear),
      ),

      negativeSpreadRepository.getTop20NegativeSpreadOperation(
        plantCode,
        CONST_FORECAST_CATEGORY.FORCAST,
        parseInt(fiscalYear),
      ),
    ])
  }
  logger.debug(`Actual Negative spread records count : ${actualNegativeSpreadRecords.length}`)
  logger.debug(`forcast Negative spread records count : ${actualNegativeSpreadRecords.length}`)

  return E.right({
    PlantCode: plantCode,
    FiscalYear: Number(fiscalYear),
    ForecastNegativeSpreads: mapNegativeSpread(forecastNegativeSpreadRecords),
    ActualNegativeSpreads: mapNegativeSpread(actualNegativeSpreadRecords),
  })
}

function mapNegativeSpread(negativeSpreadRecords: kpiNegativeSpreadRecord[]): NegativeSpreads[] {
  return negativeSpreadRecords.map((e) => {
    return {
      GeneratorName: e.UNIT_NAME,
      Duration: e.HOURS,
      StartTime: formatDateWithTimeZone(e.START_TIME),
      EndTime: formatDateWithTimeZone(e.END_TIME),
      AverageGeneratorOutput: e.AVG_GENERATION_OUTPUT,
      AverageSpread: e.AVG_SPREAD,
      TotalGrossMargin: e.GROSS_MARGIN,
    }
  })
}
