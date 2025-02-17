// Imported from DPM-BE, commit d0e2f45544cc9890762f93cf3e8f224f15efd619
import * as E from "fp-ts/lib/Either.js"
import { SnowflakeTransaction, snowflakeSelectWrapper } from "../../../../infrastructure/orm/snowflake/index.js"
import { ApplicationError } from "../../../../application/errors/dpm/index.js"
import { Stoppage, StoppageResponceRecord } from "../../../../domain/models/dpm/Stoppage.js"
import { getDPMPlantId } from "../../../services/dpm/helper.js"
import { GET_STOPPAGE_DATA_QUERY } from "./sql/StoppageQuery.js"
import { formatDateWithTimeZone, getFormattedUnitCode, validateYear } from "../../../../application/utils.js"
import logger from "../../../../infrastructure/logger.js"
import {
  checkPlantAndUnitCodeValid,
  checkPlantCodeValid,
} from "../../../services/dpm/plantAndUnitValidation/plantAndUnitValidation.js"
import { invalidFiscalYearError } from "../../../../application/errors/dpm/InvalidFiscalYearError.js"
import { invalidPlantCodeError } from "../../../../application/errors/dpm/InvalidPlantCodeError.js"
import { invalidPlantAndUnitCodeError } from "../../../../application/errors/dpm/InvalidUnitCodeError.js"

export const getStoppageController = async (
  input: {
    plantCode: string
    unitCode: string
    fiscalYear: string
  },
  snowflakeTransaction: SnowflakeTransaction,
  t: typeof i18n.__,
): Promise<E.Either<ApplicationError, StoppageResponceRecord[]>> => {
  const { plantCode, unitCode, fiscalYear } = input
  const plantId = getDPMPlantId(plantCode)
  let unitCodeInDb = unitCode
  let QUERY = GET_STOPPAGE_DATA_QUERY

  /**
   * Validation
   */
  if (!validateYear(parseInt(fiscalYear))) {
    logger.warn(`Request validation error - Invalid fiscal year error :${fiscalYear}}`)
    return E.left(invalidFiscalYearError(t, fiscalYear))
  }
  const isPlantCodeValid = await checkPlantCodeValid(plantCode)
  if (!plantCode || !isPlantCodeValid) {
    logger.warn(`Request validation error - `)
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
    QUERY = `${QUERY} AND unit_id = :3`
    unitCodeInDb = getFormattedUnitCode(unitCode)
  }

  const dbRecords: Stoppage[] = await snowflakeSelectWrapper(snowflakeTransaction, {
    sqlText: QUERY,
    binds: [plantId, fiscalYear, unitCodeInDb],
  })
  logger.debug(`QUERY StoppageDBRecord fetched record count:${dbRecords.length}`)
  return E.right(
    dbRecords.map(
      (i): StoppageResponceRecord => ({
        PlantCode: i.PlantCode,
        UnitCode: i.UnitCode,
        Name: i.Name,
        PlanStart: i.PlanStart && formatDateWithTimeZone(i.PlanStart),
        PlanEnd: i.PlanEnd && formatDateWithTimeZone(i.PlanEnd),
        ForecastStart: i.ForecastStart && formatDateWithTimeZone(i.ForecastStart),
        ForecastEnd: i.ForecastEnd && formatDateWithTimeZone(i.ForecastEnd),
        ActualStart: i.ActualStart && formatDateWithTimeZone(i.ActualStart),
        ActualEnd: i.ActualEnd && formatDateWithTimeZone(i.ActualEnd),
        CoarseStoppageType: i.CoarseStoppageType,
        Cancelled: i.Cancelled,
      }),
    ),
  )
}
