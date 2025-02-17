// Imported from DPM-BE, commit d0e2f45544cc9890762f93cf3e8f224f15efd619
import * as E from "fp-ts/lib/Either.js"
import logger from "../../../../infrastructure/logger.js"
import { invalidPlantCodeError } from "../../../../application/errors/dpm/InvalidPlantCodeError.js"
import { GET_KPI004_QUERY } from "./sql/KPI004Query.js"
import { SnowflakeTransaction, snowflakeSelectWrapper } from "../../../../infrastructure/orm/snowflake/index.js"
import { KPI004DBRecord, KPI004CollectionToProcess, KPI004Response } from "../../../../domain/models/dpm/Kpi004.js"
import {
  checkPlantAndUnitCodeValid,
  checkPlantCodeValid,
} from "../../../services/dpm/plantAndUnitValidation/plantAndUnitValidation.js"
import { invalidPlantAndUnitCodeError } from "../../../../application/errors/dpm/InvalidUnitCodeError.js"
import { ApplicationError } from "../../../../application/errors/dpm/index.js"
import { KPI004CONSTANT, TABLE_NAME_CONSTANTS } from "../../../../config/dpm/constant.js"

import { invalidFiscalYearError } from "../../../../application/errors/dpm/InvalidFiscalYearError.js"
import { validateYear } from "../../../../application/utils.js"

export const getKPI004Controller = async (
  input: {
    plantCode: string
    unitCode: string
    fiscalYear: string
  },
  snowflakeTransaction: SnowflakeTransaction,
  t: typeof i18n.__,
): Promise<E.Either<ApplicationError, KPI004Response>> => {
  const { plantCode, unitCode, fiscalYear } = input

  /**
   * Validation
   */
  if (!validateYear(parseInt(fiscalYear))) {
    logger.warn(`Request validation error - Invalid fiscal year error :${fiscalYear}}`)
    return E.left(invalidFiscalYearError(t, fiscalYear))
  }

  let QUERY = GET_KPI004_QUERY
  const isPlantCodeValid = await checkPlantCodeValid(plantCode)
  if (!plantCode || !isPlantCodeValid) {
    logger.warn(`Request validation error - Invalid plantCode:${plantCode}`)

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

  const QUERY_FOR_TODAY = QUERY.replace("%tableName%", TABLE_NAME_CONSTANTS.T_KPI004_SUBCACHE_TODAY)
  const dbRecordsForToday: KPI004DBRecord[] = await snowflakeSelectWrapper<KPI004DBRecord>(snowflakeTransaction, {
    sqlText: QUERY_FOR_TODAY,
    binds: [plantCode, unitCode, fiscalYear],
  })

  logger.debug(`QUERY_FOR_TODAY fetched record count:${dbRecordsForToday.length} `)
  const objKpi004Today = getResponseObjectSingle(dbRecordsForToday, t)

  const QUERY_FOR_PREVIOUS_DAY = QUERY.replace("%tableName%", TABLE_NAME_CONSTANTS.T_KPI004_SUBCACHE_PREVIOUSDAY)

  const dbRecordsForPreviousday: KPI004DBRecord[] = await snowflakeSelectWrapper<KPI004DBRecord>(snowflakeTransaction, {
    sqlText: QUERY_FOR_PREVIOUS_DAY,
    binds: [plantCode, unitCode, fiscalYear],
  })
  logger.debug(`QUERY_FOR_PREVIOUS_DAY fetched record count:${dbRecordsForPreviousday.length} `)
  const objKpi004PreviousDay = getResponseObjectSingle(dbRecordsForPreviousday, t)

  return E.right({
    PlantCode: plantCode,
    UnitCode: unitCode,
    Today: objKpi004Today,
    PreviousDay: objKpi004PreviousDay,
  })
}

const getResponseObjectSingle = (collection: KPI004DBRecord[], t: typeof i18n.__) => {
  /**
   * To get values for annual data
   */
  const extractedAnnualData = exractAllValuesFromArray(collection)
  const annualResponse = getAnnualResponseObject(extractedAnnualData)

  /**
   * To get records for RangeType = 1 (YearStart To Present).
   */
  const arrKPIRecords004YearStartToPresent = extractRangeTypeArray(
    collection,
    KPI004CONSTANT.FILEDS.RANGE_TYPE_YEAR_START_TO_PRESENT,
  )
  const extractedYearStartToPresent = exractAllValuesFromArray(arrKPIRecords004YearStartToPresent)
  const objYearStartToPresent = getResponseObject(extractedYearStartToPresent)

  /**
   * To get records for RangeType = 2 (Present To YearEnd)
   */
  const arrKPIRecords004PresentToYearEnd = extractRangeTypeArray(
    collection,
    KPI004CONSTANT.FILEDS.RANGE_TYPE_PRESENT_TO_YEAR_END,
  )
  const extractedPresentToYearEnd = exractAllValuesFromArray(arrKPIRecords004PresentToYearEnd)
  const objPresentToYearEnd = getResponseObject(extractedPresentToYearEnd)

  return {
    StoppageTime: {
      Annual: annualResponse.stoppage,
      YearStartToPresent: objYearStartToPresent.objStoppageInfo,
      PresentToYearEnd: objPresentToYearEnd.objStoppageInfo,
    },
    GrossMarginImpact: {
      Prefix: t("VALUE.PREFIX_YEN"),
      Suffix: t("VALUE.SUFFIX_OKU"),
      Annual: annualResponse.grossMargin,
      YearStartToPresent: objYearStartToPresent.objGrossMarginImpact,
      PresentToYearEnd: objPresentToYearEnd.objGrossMarginImpact,
    },
    SellingPriceAtOutage: {
      Suffix: t("VALUE.SUFFIX_YEN_KWH"),
      Annual: annualResponse.SellingPrice,
      YearStartToPresent: objYearStartToPresent.objSellingPrice,
      PresentToYearEnd: objPresentToYearEnd.objSellingPrice,
    },
  }
}

const getAnnualResponseObject = (collection: KPI004CollectionToProcess) => {
  const objAnnualResponse = {
    stoppage: {
      ActualOrForcastHours: collection.ActualOrForcastHours,
      PlanHours: collection.PlannedHours,
      PositveImpactHours: collection.PlannedDecreseHours + collection.CancledHours,
      NagetiveImpactHours: collection.PlannedIncreaseHours + collection.UnPlannedHours,
    },
    grossMargin: {
      PluseImpact: collection.GrossMarginPlusImpact,
      MinuseImpact: collection.GrossMarginMinusImpact,
    },
    SellingPrice: {
      PlannedPlanAvgPrice: collection.PlannedPlanSalePriceSum / collection.PlannedHours,
      PlannedActualOrForcastAvgPrice:
        collection.PlannedActualOrForcastSalePriceSum / (collection.ActualOrForcastHours - collection.UnPlannedHours),
      UnplannedAvgPrice: collection.UnplannedSalePriceSum / collection.UnPlannedHours,
    },
  }
  return objAnnualResponse
}

const getResponseObject = (collection: KPI004CollectionToProcess) => {
  const objStoppageInfo = {
    ActualOrForcastHours: collection.ActualOrForcastHours,
    PlanHours: collection.PlannedHours,
    PlannedDecreseHours: collection.PlannedDecreseHours,
    PlannedDecreseRecords: collection.PlannedDecreseRecords,
    PlannedIncreseHours: collection.PlannedIncreaseHours,
    PlannedIncreseRecords: collection.PlannedIncreaseRecords,
    CancledHours: collection.CancledHours,
    CancledRecords: collection.CancledRecords,
    UnplannedHours: collection.UnPlannedHours,
    UnplannedRecords: collection.UnPlannedRecords,
  }

  const objGrossMarginImpact = {
    PluseImpact: collection.GrossMarginPlusImpact,
    MinuseImpact: collection.GrossMarginMinusImpact,
  }

  const objSellingPrice = {
    PlannedPlanAvgPrice: collection.PlannedPlanSalePriceSum / collection.PlannedHours,
    PlannedPlanRecords: collection.PlannedPlanRecords,
    PlannedActualOrForcastAvgPrice:
      collection.PlannedActualOrForcastSalePriceSum / (collection.ActualOrForcastHours - collection.UnPlannedHours),
    PlannedActualOrForcastRecords: collection.PlannedActualOrForcastRecords,
    UnplannedAvgPrice: collection.UnplannedSalePriceSum / collection.UnPlannedHours,
    UnplannedRecords: collection.UnPlannedRecords,
  }

  return {
    objStoppageInfo,
    objGrossMarginImpact,
    objSellingPrice,
  }
}

const exractAllValuesFromArray = (arrCollection: KPI004DBRecord[]) => {
  /*↓↓ Stoppage Hours Calculation ↓↓*/
  const PlannedHours = getAllArrayValuesSum(arrCollection, KPI004CONSTANT.FILEDS.STOPPAGE_PLANNED_HOURS)

  const PlannedPlanRecords = getAllArrayValuesSum(arrCollection, KPI004CONSTANT.FILEDS.STOPPAGE_PLANNED_RECORDS)

  const ActualOrForcastHours = getAllArrayValuesSum(
    arrCollection,
    KPI004CONSTANT.FILEDS.STOPPAGE_ACTUAL_OR_FORECAST_HOURS,
  )

  const PlannedActualOrForcastRecords = getAllArrayValuesSum(
    arrCollection,
    KPI004CONSTANT.FILEDS.STOPPAGE_ACTUAL_OR_FORECAST_RECORDS,
  )

  const PlannedDecreseHours = getAllArrayValuesSum(arrCollection, KPI004CONSTANT.FILEDS.STOPPAGE_PLANNED_DECRESE_HOURS)

  const PlannedDecreseRecords = getAllArrayValuesSum(
    arrCollection,
    KPI004CONSTANT.FILEDS.STOPPAGE_PLANNED_DECRESE_RECORDS,
  )

  const PlannedIncreaseHours = getAllArrayValuesSum(
    arrCollection,
    KPI004CONSTANT.FILEDS.STOPPAGE_PLANNED_INCRESED_HOURS,
  )

  const PlannedIncreaseRecords = getAllArrayValuesSum(
    arrCollection,
    KPI004CONSTANT.FILEDS.STOPPAGE_PLANNED_INCRESED_RECORDS,
  )

  const CancledHours = getAllArrayValuesSum(arrCollection, KPI004CONSTANT.FILEDS.STOPPAGE_CANCELED_HOURS)

  const CancledRecords = getAllArrayValuesSum(arrCollection, KPI004CONSTANT.FILEDS.STOPPAGE_CANCELED_RECORDS)

  const UnPlannedHours = getAllArrayValuesSum(arrCollection, KPI004CONSTANT.FILEDS.STOPPAGE_UN_PLANNED_HOURS)

  const UnPlannedRecords = getAllArrayValuesSum(arrCollection, KPI004CONSTANT.FILEDS.STOPPAGE_UN_PLANNED_RECORDS)
  /*↑↑ Stoppage Hours Calculation ↑↑*/

  /*↓↓ Gross Margin Impact Calculation ↓↓*/
  const GrossMarginPlusImpact = getAllArrayValuesSum(arrCollection, KPI004CONSTANT.FILEDS.GROSS_MARGIN_PLUS_IMPACT)

  const GrossMarginMinusImpact = getAllArrayValuesSum(arrCollection, KPI004CONSTANT.FILEDS.GROSS_MARGIN_MINUS_IMPACT)
  /*↑↑ Gross Margin Impact Calculation ↑↑*/

  /*↓↓ Salling Price at Outage Calculation ↓↓*/
  const PlannedPlanSalePriceSum = getAllArrayValuesSum(arrCollection, KPI004CONSTANT.FILEDS.SELLING_PRICE_PLANNED_PLAN)

  const PlannedActualOrForcastSalePriceSum = getAllArrayValuesSum(
    arrCollection,
    KPI004CONSTANT.FILEDS.SELLING_PRICE_PLANNED_ACTUAL_OR_FORECAST,
  )

  const UnplannedSalePriceSum = getAllArrayValuesSum(
    arrCollection,
    KPI004CONSTANT.FILEDS.SELLING_PRICE_UN_PLANNED_ACTUAL_OR_FORECAST,
  )
  /*↑↑ Salling Price at Outage Calculation ↑↑*/

  const objReturn: KPI004CollectionToProcess = {
    PlannedHours,
    PlannedPlanRecords,
    ActualOrForcastHours,
    PlannedActualOrForcastRecords,
    PlannedDecreseHours,
    PlannedDecreseRecords,
    PlannedIncreaseHours,
    PlannedIncreaseRecords,
    CancledHours,
    CancledRecords,
    UnPlannedHours,
    UnPlannedRecords,
    GrossMarginPlusImpact,
    GrossMarginMinusImpact,
    PlannedPlanSalePriceSum,
    PlannedActualOrForcastSalePriceSum,
    UnplannedSalePriceSum,
  }

  return objReturn
}

const extractRangeTypeArray = (arrCollection: KPI004DBRecord[], rangeType: number) => {
  const arrExtractedCollection = arrCollection.filter((objEachCollectionValue: KPI004DBRecord) => {
    if (objEachCollectionValue.RangeType == rangeType) {
      return true
    } else {
      return false
    }
  })
  return arrExtractedCollection
}

const getAllArrayValuesSum = (collection: KPI004DBRecord[], valueToExtract: string) => {
  const arrayValue: number[] = getAllArrayValues(collection, valueToExtract)

  const sumOfArray = getSumOfAllValues(arrayValue)

  return sumOfArray
}

const getAllArrayValues = (collection: KPI004DBRecord[], valueToExtract: string) => {
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
