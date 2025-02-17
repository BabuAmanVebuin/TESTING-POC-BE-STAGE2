// Imported from DPM-BE, commit d0e2f45544cc9890762f93cf3e8f224f15efd619
import * as E from "fp-ts/lib/Either.js"
import { ApplicationError } from "../../../../application/errors/dpm/index.js"
import {
  formatDateWithTimeZone,
  getFiscalYearEndDate,
  getFiscalYearStartDate,
  validateYear,
} from "../../../../application/utils.js"
import logger from "../../../../infrastructure/logger.js"
import {
  checkPlantAndUnitCodeValid,
  checkPlantCodeValid,
} from "../../../services/dpm/plantAndUnitValidation/plantAndUnitValidation.js"
import { invalidFiscalYearError } from "../../../../application/errors/dpm/InvalidFiscalYearError.js"
import { invalidPlantCodeError } from "../../../../application/errors/dpm/InvalidPlantCodeError.js"
import { invalidPlantAndUnitCodeError } from "../../../../application/errors/dpm/InvalidUnitCodeError.js"
import { StartStopCostsRepositoryPort } from "../../../../application/port/repositories/dpm/StartStopCostsRepositoryPort.js"
import {
  CostWithPeriod,
  GetStartStopCostResponse,
  StartUpCostRecord,
} from "../../../../domain/models/dpm/getStartStopCost.js"
import { invalidStartupModeError } from "../../../../application/errors/dpm/InvalidStartupModeError.js"
import { DateTime } from "luxon"
import { DATE_CONST } from "../../../../config/dpm/constant.js"
import { DurationUnit } from "../../../../config/dpm/enums.js"
import { env } from "../../../../infrastructure/env/dpm/index.js"

export const getStartStopCostsController = async (
  input: {
    plantCode: string
    unitCode: string
    fiscalYear: string
    startupMode: string
  },
  services: Pick<StartStopCostsRepositoryPort, "getStartStopCost">,
  t: typeof i18n.__,
): Promise<E.Either<ApplicationError, GetStartStopCostResponse>> => {
  const { plantCode, unitCode, fiscalYear, startupMode } = input
  /**
   * request input validation
   */

  // startupMode validation
  if (startupMode == "undefined" || startupMode.length > 10) {
    logger.warn(`Request validation error - Invalid startup Mode error :${fiscalYear}}`)

    return E.left(invalidStartupModeError(t, startupMode))
  }

  // fiscalYear validation
  const isPlantCodeValid = await checkPlantCodeValid(plantCode)

  if (!validateYear(parseInt(fiscalYear))) {
    logger.warn(`Request validation error - Invalid fiscal year error :${fiscalYear}}`)

    return E.left(invalidFiscalYearError(t, fiscalYear))
  }

  // plantCode unitCode validation
  if (!plantCode || !isPlantCodeValid) {
    logger.warn(`Request validation error - Invalid plant code error plantCode :${plantCode}, unitCode: ${unitCode}`)
    return E.left(invalidPlantCodeError(t, plantCode))
  }
  // unitCode unitCode validation
  // validate the combination of plant and unit code
  const isPlantAndUnitCodeValid = await checkPlantAndUnitCodeValid(plantCode, unitCode)
  if (!isPlantAndUnitCodeValid) {
    logger.warn(
      `Request validation error - Invalid plant and unit code error plantCode :${plantCode}, unitCode: ${unitCode}`,
    )
    return E.left(invalidPlantAndUnitCodeError(t, plantCode, unitCode))
  }
  // fiscalYear start end dates
  const fiscalYearStartDate = getFiscalYearStartDate(parseInt(fiscalYear))
  const fiscalYearEndDate = getFiscalYearEndDate(parseInt(fiscalYear))

  // get startStopCostRecord from repository
  const startStopCostRecord = await services.getStartStopCost(
    plantCode,
    unitCode,
    startupMode,
    fiscalYearStartDate,
    fiscalYearEndDate,
  )

  // map start Stop Record to Monthly Cost and Annual Cost
  const mapResult = mapResultFromStartStopRecord(
    startStopCostRecord,
    DateTime.fromFormat(fiscalYearStartDate, DATE_CONST.YYYY_MM_DD_HH_MM_SS, {
      zone: env.TIMEZONE,
    }),
    DateTime.fromFormat(fiscalYearEndDate, DATE_CONST.YYYY_MM_DD_HH_MM_SS, {
      zone: env.TIMEZONE,
    }),
  )

  return E.right({
    PlantCode: plantCode,
    UnitCode: unitCode,
    FiscalYear: parseInt(fiscalYear),
    StartupMode: startupMode,
    AnnualCost: mapResult.AnnualCost,
    MonthlyCost: mapResult.MonthlyCost,
  })
}

/**
 * Function for Start Stop api response object map
 * @param startStopCostRecord
 * @returns
 */
function mapResultFromStartStopRecord(
  startStopCostRecord: StartUpCostRecord[],
  fiscalYearStartDate: DateTime,
  fiscalYearEndDate: DateTime,
) {
  const response: {
    AnnualCost: CostWithPeriod
    MonthlyCost: CostWithPeriod
  } = {
    AnnualCost: {
      Period: [],
      Cost: [],
    },
    MonthlyCost: {
      Period: [],
      Cost: [],
    },
  }

  /**
   * monthWiseCostData contained key as month start date
   * object as dayCount and sum of day cost value
   */
  const monthWiseCostData: Map<string, { dayCount: number; sum: number }> = new Map()

  /**
   * MAP DAY AND MONTH WISE RECORD
   */
  startStopCostRecord.forEach((record) => {
    // Variables of dates
    const scheduledStartDate = DateTime.fromJSDate(record.SCHEDULED_START_DATE)
    const scheduledEndDate = DateTime.fromJSDate(record.SCHEDULED_END_DATE)

    /**
     * day date for calculation
     */
    let day = scheduledStartDate < fiscalYearStartDate ? fiscalYearStartDate : scheduledStartDate

    while (day <= scheduledEndDate && day <= fiscalYearEndDate) {
      const dayDateString = formatDateWithTimeZone(day.toJSDate(), DATE_CONST.YYYY_MM_DD)

      // Avoid duplicate record
      if (!response.MonthlyCost.Period.includes(dayDateString)) {
        response.MonthlyCost.Period.push(dayDateString)
        // push cost of day in cost array
        response.MonthlyCost.Cost.push(record.VALUE)

        // Month Group For annul calculation
        const month = formatDateWithTimeZone(day.startOf(DurationUnit.MONTH).toJSDate(), DATE_CONST.YYYY_MM_DD)

        const monthRecord = monthWiseCostData.get(month)

        if (!monthRecord) {
          monthWiseCostData.set(month, { dayCount: 1, sum: record.VALUE })
        } else {
          monthWiseCostData.set(month, {
            dayCount: monthRecord.dayCount + 1,
            sum: monthRecord.sum + record.VALUE,
          })
        }
      } else {
        logger.warn(`Duplicate record of startStopCostRecord : ${JSON.stringify(record)}`)
      }
      // increment day for next day calculation
      day = day.plus({ days: 1 })
    }
  })

  // Map average of all monthWiseCostData
  monthWiseCostData.forEach((values, month) => {
    response.AnnualCost.Period.push(month)
    response.AnnualCost.Cost.push(values.sum / values.dayCount)
  })
  return response
}
