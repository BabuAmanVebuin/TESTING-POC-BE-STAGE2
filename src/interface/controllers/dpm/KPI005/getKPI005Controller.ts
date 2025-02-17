// Imported from DPM-BE, commit d0e2f45544cc9890762f93cf3e8f224f15efd619
import * as E from "fp-ts/lib/Either.js"
import { GET_KPI005_QUERY } from "./sql/KPI005Query.js"
import { SnowflakeTransaction, snowflakeSelectWrapper } from "../../../../infrastructure/orm/snowflake/index.js"
import logger from "../../../../infrastructure/logger.js"
import { ApplicationError } from "../../../../application/errors/dpm/index.js"
import {
  KPI005CollectionToProcess,
  KPI005DBRecord,
  KPI005ResponseData,
  KPI005SubCache,
} from "../../../../domain/models/dpm/Kpi005.js"
import {
  checkPlantAndUnitCodeValid,
  checkPlantCodeValid,
} from "../../../services/dpm/plantAndUnitValidation/plantAndUnitValidation.js"
import { validateYear } from "../../../../application/utils.js"
import { invalidFiscalYearError } from "../../../../application/errors/dpm/InvalidFiscalYearError.js"
import { invalidPlantCodeError } from "../../../../application/errors/dpm/InvalidPlantCodeError.js"
import { invalidPlantAndUnitCodeError } from "../../../../application/errors/dpm/InvalidUnitCodeError.js"
import { KPI005CONSTANT, TABLE_NAME_CONSTANTS } from "../../../../config/dpm/constant.js"
import { RangeType as RangeTypeEnum } from "../../../../config/dpm/enums.js"

export const getKPI005Controller = async (
  input: {
    plantCode: string
    unitCode: string
    fiscalYear: string
  },
  snowflakeTransaction: SnowflakeTransaction,
  t: typeof i18n.__,
): Promise<E.Either<ApplicationError, KPI005ResponseData>> => {
  const { plantCode, unitCode, fiscalYear } = input
  let QUERY = GET_KPI005_QUERY
  const isPlantCodeValid = await checkPlantCodeValid(plantCode)

  if (!validateYear(parseInt(fiscalYear))) {
    logger.warn(`Request validation error - Invalid fiscal year error :${fiscalYear}}`)

    return E.left(invalidFiscalYearError(t, fiscalYear))
  }
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
    QUERY = `${QUERY} AND UNIT_CODE = :2`
  }

  const QUERY_FOR_TODAY = QUERY.replace("%tableName%", TABLE_NAME_CONSTANTS.T_KPI005_SUBCACHE_TODAY)
  const dbRecordsForToday: KPI005DBRecord[] = await snowflakeSelectWrapper<KPI005DBRecord>(snowflakeTransaction, {
    sqlText: QUERY_FOR_TODAY,
    binds: [plantCode, unitCode, fiscalYear],
  })
  logger.debug(`QUERY_FOR_TODAY fetched record count:${dbRecordsForToday.length}`)
  const objKpi005Today: KPI005SubCache = getResponseObjectSingle(dbRecordsForToday, t)

  const QUERY_FOR_PREVIOUS_DAY = QUERY.replace("%tableName%", TABLE_NAME_CONSTANTS.T_KPI005_SUBCACHE_PREVIOUSDAY)

  const dbRecordsForPreviousday: KPI005DBRecord[] = await snowflakeSelectWrapper<KPI005DBRecord>(snowflakeTransaction, {
    sqlText: QUERY_FOR_PREVIOUS_DAY,
    binds: [plantCode, unitCode, fiscalYear],
  })
  logger.debug(`QUERY_FOR_PREVIOUS_DAY fetched record count:${dbRecordsForPreviousday.length}`)
  const objKpi005PreviousDay = getResponseObjectSingle(dbRecordsForPreviousday, t)

  return E.right({
    PlantCode: plantCode,
    UnitCode: unitCode,
    Today: objKpi005Today,
    PreviousDay: objKpi005PreviousDay,
  })
}

const getResponseObjectSingle = (collection: KPI005DBRecord[], t: typeof i18n.__): KPI005SubCache => {
  /**
   * To get values for annual data
   */
  const extractedAnnualData = exractAllValuesFromArray(collection)

  const annualResponse = getAnnualResponseObject(extractedAnnualData)

  /**
   * To get records for RangeType = 1 (YearStart To Present).
   */
  const arrKPIRecords005YearStartToPresent = extractRangeTypeArray(collection, RangeTypeEnum.YEAR_START_TO_PRESENT)
  const extractedYearStartToPresent = exractAllValuesFromArray(arrKPIRecords005YearStartToPresent)

  const objYearStartToPresent = getResponseObject(extractedYearStartToPresent)

  /**
   * To get records for RangeType = 2 (Present To YearEnd)
   */
  const arrKPIRecords005PresentToYearEnd = extractRangeTypeArray(collection, RangeTypeEnum.PRESENT_TO_YEAR_END)
  const extractedPresentToYearEnd = exractAllValuesFromArray(arrKPIRecords005PresentToYearEnd)
  const objPresentToYearEnd = getResponseObject(extractedPresentToYearEnd)

  return {
    NegativeOperationGrossMargin: {
      Prefix: t("VALUE.PREFIX_YEN"),
      Suffix: t("VALUE.SUFFIX_OKU"),
      Annual: annualResponse.NegativeOperationGrossMargin,
      YearStartToPresent: objYearStartToPresent.objNegativeOperationGrossMargin,
      PresentToYearEnd: objPresentToYearEnd.objNegativeOperationGrossMargin,
    },
    NegativeOperationTime: {
      Suffix: t("VALUE.SUFFIX_HRS"),
      Annual: annualResponse.NegativeOperationTime,
      YearStartToPresent: objYearStartToPresent.objNegativeOperationTime,
      PresentToYearEnd: objPresentToYearEnd.objNegativeOperationTime,
    },
    NegativeOperationAvgSpread: {
      Suffix: t("VALUE.SUFFIX_YEN_KWH"),
      Annual: annualResponse.NegativeOperationAvgSpread,
      YearStartToPresent: objYearStartToPresent.objNegativeOperationAvgSpread,
      PresentToYearEnd: objPresentToYearEnd.objNegativeOperationAvgSpread,
    },
  }
}

const getAnnualResponseObject = (collection: KPI005CollectionToProcess) => {
  const objAnnualResponse = {
    NegativeOperationGrossMargin: {
      Plan: +collection.PlannedGrossMarginAtNegativeOperation,
      ActualOrForcast: +collection.ActualOrForecastGrossMarginAtNegativeOperation,
    },
    NegativeOperationTime: {
      Plan: +collection.PlannedNegativeOperatingHours,
      ActualOrForcast: +collection.ActualOrForecastNegativeOperatingHours,
    },
    NegativeOperationAvgSpread: {
      Plan: +collection.PlannedSpreadAtNegativeOperation / +collection.PlannedNegativeOperatingHours,
      ActualOrForcast:
        +collection.ActualOrForecastSpreadAtNegativeOperation / +collection.ActualOrForecastNegativeOperatingHours,
    },
  }
  return objAnnualResponse
}

const getResponseObject = (collection: KPI005CollectionToProcess) => {
  const objNegativeOperationGrossMargin = {
    Plan: +collection.PlannedGrossMarginAtNegativeOperation,
    ActualOrForcast: +collection.ActualOrForecastGrossMarginAtNegativeOperation,
  }

  const objNegativeOperationTime = {
    Plan: +collection.PlannedNegativeOperatingHours,
    ActualOrForcast: +collection.ActualOrForecastNegativeOperatingHours,
  }

  const objNegativeOperationAvgSpread = {
    Plan: +collection.PlannedSpreadAtNegativeOperation / +collection.PlannedNegativeOperatingHours,
    ActualOrForcast:
      +collection.ActualOrForecastSpreadAtNegativeOperation / +collection.ActualOrForecastNegativeOperatingHours,
  }

  return {
    objNegativeOperationGrossMargin,
    objNegativeOperationTime,
    objNegativeOperationAvgSpread,
  }
}

const exractAllValuesFromArray = (arrCollection: KPI005DBRecord[]) => {
  /*↓↓ Stoppage Hours Calculation ↓↓*/
  const ActualOrForecastGrossMarginAtNegativeOperation = getAllArrayValuesSum(
    arrCollection,
    KPI005CONSTANT.FIELDS.ACTUAL_OR_FORCAST_GROSS_MARGIN_AT_NAGATIVE_OPERATION,
  )

  const ActualOrForecastNegativeOperatingHours = getAllArrayValuesSum(
    arrCollection,
    KPI005CONSTANT.FIELDS.ACTUAL_OR_FORCAST_NAGIVATIVE_OPERATING_HOURS,
  )

  const ActualOrForecastSpreadAtNegativeOperation = getAllArrayValuesSum(
    arrCollection,
    KPI005CONSTANT.FIELDS.ACTUAL_OR_FORCAST_SPREAD_AT_NAGATIVE_OPERATION,
  )

  const PlannedGrossMarginAtNegativeOperation = getAllArrayValuesSum(
    arrCollection,
    KPI005CONSTANT.FIELDS.PLANNED_GROSS_MARGIN_AT_NAGATIVE_OPERATION,
  )

  const PlannedNegativeOperatingHours = getAllArrayValuesSum(
    arrCollection,
    KPI005CONSTANT.FIELDS.PLANNED_NAGIVATIVE_OPERATING_HOURS,
  )

  const PlannedSpreadAtNegativeOperation = getAllArrayValuesSum(
    arrCollection,
    KPI005CONSTANT.FIELDS.PLANNED_SPREAD_AT_NAGATIVE_OPERATION,
  )

  const objReturn: KPI005CollectionToProcess = {
    PlannedGrossMarginAtNegativeOperation,
    ActualOrForecastGrossMarginAtNegativeOperation,
    PlannedNegativeOperatingHours,
    ActualOrForecastNegativeOperatingHours,
    PlannedSpreadAtNegativeOperation,
    ActualOrForecastSpreadAtNegativeOperation,
  }

  return objReturn
}

const extractRangeTypeArray = (arrCollection: KPI005DBRecord[], rangeType: number) => {
  const arrExtractedCollection = arrCollection.filter((objEachCollectionValue: KPI005DBRecord) => {
    if (objEachCollectionValue.RangeType == rangeType) {
      return true
    } else {
      return false
    }
  })
  return arrExtractedCollection
}

const getAllArrayValuesSum = (collection: KPI005DBRecord[], valueToExtract: string) => {
  const arrayValue: number[] = getAllArrayValues(collection, valueToExtract)

  const sumOfArray = getSumOfAllValues(arrayValue)

  return sumOfArray
}

const getAllArrayValues = (collection: KPI005DBRecord[], valueToExtract: string) => {
  const extractedArray = collection.map((objEachCollectionValue: { [x: string]: any }) => {
    return objEachCollectionValue[valueToExtract]
  })
  return extractedArray
}

const getSumOfAllValues = (arrCollection: number[]) => {
  if (arrCollection.length > 0) {
    return arrCollection.reduce((accumulator, curr) => accumulator + curr)
  } else {
    return 0
  }
}
