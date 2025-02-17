// Imported from DPM-BE, commit d0e2f45544cc9890762f93cf3e8f224f15efd619
import * as E from "fp-ts/lib/Either.js"
import logger from "../../../../infrastructure/logger.js"
import { ApplicationError } from "../../../../application/errors/dpm/index.js"
import {
  getNegativeSpreadHoursResponse,
  kpiNegativeSpreadCountsRecord,
} from "../../../../domain/models/dpm/negativeSpreadOperation.js"
import {
  checkPlantAndUnitCodeValid,
  checkPlantCodeValid,
} from "../../../services/dpm/plantAndUnitValidation/plantAndUnitValidation.js"
import { validateYear } from "../../../../application/utils.js"
import { invalidFiscalYearError } from "../../../../application/errors/dpm/InvalidFiscalYearError.js"
import { invalidPlantCodeError } from "../../../../application/errors/dpm/InvalidPlantCodeError.js"
import { invalidPlantAndUnitCodeError } from "../../../../application/errors/dpm/InvalidUnitCodeError.js"

import { CONST_FORECAST_CATEGORY } from "../../../../config/dpm/constant.js"
import { NegativeSpreadRepositoryPort } from "../../../../application/port/repositories/dpm/NegativeSpreadRepositoryPort.js"

/**
 * Controller get Negative Spread hours Controller
 * @param input request inputs
 * @param connection
 */
export const getNegativeSpreadHoursController = async (
  input: {
    plantCode: string
    unitCode: string
    fiscalYear: string
  },
  negativeSpreadRepository: NegativeSpreadRepositoryPort,
  t: typeof i18n.__,
): Promise<E.Either<ApplicationError, getNegativeSpreadHoursResponse>> => {
  const { plantCode, unitCode, fiscalYear } = input
  let negativeSpreadHoursRecords: kpiNegativeSpreadCountsRecord[]

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
    negativeSpreadHoursRecords = await negativeSpreadRepository.getNegativeSpreadHours(
      plantCode,
      parseInt(fiscalYear),
      unitCode,
    )
    logger.debug(`Negative spread hours records of unit : ${plantCode} count: ${negativeSpreadHoursRecords.length}`)

    return E.right({
      PlantCode: plantCode,
      UnitCode: unitCode,
      ActualNegativeSpreadHours: mapNegativeSpreadRecordHours(
        negativeSpreadHoursRecords,
        CONST_FORECAST_CATEGORY.ACTUAL,
      ),
      ForecastNegativeSpreadHours: mapNegativeSpreadRecordHours(
        negativeSpreadHoursRecords,
        CONST_FORECAST_CATEGORY.FORCAST,
      ),
    })
  } else {
    /**
     * Get Negative spread data from repository
     */
    negativeSpreadHoursRecords = await negativeSpreadRepository.getNegativeSpreadHours(plantCode, parseInt(fiscalYear))
    logger.debug(`Negative spread hours records of plant : ${plantCode} count: ${negativeSpreadHoursRecords.length}`)

    return E.right({
      PlantCode: plantCode,
      UnitCode: null,
      ActualNegativeSpreadHours: mapNegativeSpreadRecordHours(
        negativeSpreadHoursRecords,
        CONST_FORECAST_CATEGORY.ACTUAL,
      ),
      ForecastNegativeSpreadHours: mapNegativeSpreadRecordHours(
        negativeSpreadHoursRecords,
        CONST_FORECAST_CATEGORY.FORCAST,
      ),
    })
  }
}

function mapNegativeSpreadRecordHours(
  negativeSpreadRecords: kpiNegativeSpreadCountsRecord[],
  forecastCategory: number,
) {
  // filter forecastCategory record
  const filteredRecord = negativeSpreadRecords.filter((i) => i.forecastCategory == forecastCategory)

  return {
    CasesByHours: {
      OneHour: findHoursRecordCount(filteredRecord, 1),
      TwoHours: findHoursRecordCount(filteredRecord, 2),
      ThreeHours: findHoursRecordCount(filteredRecord, 3),
      FourHours: findHoursRecordCount(filteredRecord, 4),
      FiveHours: findHoursRecordCount(filteredRecord, 5),
      SixHours: findHoursRecordCount(filteredRecord, 6),
      SevenHours: findHoursRecordCount(filteredRecord, 7),
      EightHours: findHoursRecordCount(filteredRecord, 8),
      NineHours: findHoursRecordCount(filteredRecord, 9),
      TenHours: findHoursRecordCount(filteredRecord, 10),
      ElevenHours: findHoursRecordCount(filteredRecord, 11),
      TwelveOrMoreHours: sumNegativedSpreadHoursRecord(filteredRecord.filter((i) => i.hours >= 12)),
    },
  }
}

/**
 * Function to find record count by hours
 * @param negativeSpreadHoursRecords records
 * @param hours which hours's recordCount want to get
 * @returns recordCount of hours
 */
function findHoursRecordCount(negativeSpreadHoursRecords: kpiNegativeSpreadCountsRecord[], hours: number) {
  return Number(negativeSpreadHoursRecords.find((i) => i.hours == hours)?.recordCount) || 0
}

/**
 * Sum negative spread Hours
 * @param negativeSpreadHoursRecords
 * @returns sum of hours
 */
function sumNegativedSpreadHoursRecord(negativeSpreadHoursRecords: kpiNegativeSpreadCountsRecord[]) {
  return negativeSpreadHoursRecords.reduce((accumulator, curr) => {
    return accumulator + Number(curr.recordCount)
  }, 0)
}
