// Imported from DPM-BE, commit d0e2f45544cc9890762f93cf3e8f224f15efd619
import { either as E } from "fp-ts"
import { ApplicationError } from "../../../../application/errors/dpm/index.js"
import {
  getSalesPriceRequest,
  salesPriceResponse,
  salesUnitPrice,
} from "../../../../domain/entities/dpm/getSalesPrice.js"
import logger from "../../../../infrastructure/logger.js"
import { SnowflakeTransaction, snowflakeSelectWrapper } from "../../../../infrastructure/orm/snowflake/index.js"
import { SALES_UNIT_PRICE_QUERY } from "./sqlQuery.js"
import {
  formatDateWithTimeZone,
  getCurrentDateTimeJST,
  getFiscalYear,
  getFiscalYearEndDate,
  getFiscalYearStartDate,
  timestampToString,
  validateYear,
} from "../../../../application/utils.js"
import { invalidFiscalYearError } from "../../../../application/errors/dpm/InvalidFiscalYearError.js"
import { validateInput } from "./validation.js"
import { invalidPlantAndUnitCodeError } from "../../../../application/errors/dpm/InvalidUnitCodeError.js"
import { CONST_FISCAL_CATEGORY, CONST_FORECAST_CATEGORY } from "../../../../config/dpm/constant.js"
import { DateTime } from "luxon"

const getSalesPriceData = async (
  snowflakeTransaction: SnowflakeTransaction,
  input: getSalesPriceRequest,
  forecastCategory: number,
  fiscalCategory: number,
  startDate: string,
  endDateTime: string,
): Promise<salesUnitPrice[]> => {
  const dateRangeCondition = `tkf.HOUR >= '${startDate}' and tkf.HOUR < '${endDateTime}'`

  const query = SALES_UNIT_PRICE_QUERY.replace("%timeFrame%", dateRangeCondition)

  return await snowflakeSelectWrapper<salesUnitPrice>(snowflakeTransaction, {
    sqlText: query,
    binds: [input.plantId, input.unitId, forecastCategory, fiscalCategory],
  })
}

/**
 * Function GET Sales Price Controller
 * @param input
 * @param connection - db connection
 * @returns salesUnitPrice[] or ApplicationError
 */
export const getSalesPriceController = async (
  input: getSalesPriceRequest,
  snowflakeTransaction: SnowflakeTransaction,
  t: typeof i18n.__,
): Promise<E.Either<ApplicationError, salesPriceResponse>> => {
  logger.info("GET sales API started")

  const fiscalYear = parseInt(input.fiscalYear)
  const plantId = input.plantId
  const unitId = input.unitId
  // -------------------------------------------------------------------------------------
  // Input Validation
  // -------------------------------------------------------------------------------------

  if (!validateYear(fiscalYear)) {
    logger.warn(`Request validation error - Invalid fiscal year error :${fiscalYear}}`)
    return E.left(invalidFiscalYearError(t, input.fiscalYear))
  }

  const validationResponse = await validateInput(snowflakeTransaction, input)
  if (!validationResponse.isValid) {
    logger.warn(
      `Request validation error - Invalid plant and unit code error plantCode :${plantId}, unitCode: ${unitId}`,
    )
    return E.left(invalidPlantAndUnitCodeError(t, input.plantId, unitId))
  }
  // -------------------------------------------------------------------------------------
  // Get Sales Data
  // -------------------------------------------------------------------------------------

  /**
   * Current date time
   */
  const currentDateTime = getCurrentDateTimeJST()
  const currentDateTimeJSTString = timestampToString(currentDateTime)
  const currentFiscalYear = getFiscalYear(currentDateTime)
  /**
   * Input fiscal year Start end date
   */
  const fiscalYearStartDate = getFiscalYearStartDate(fiscalYear)
  const fiscalYearEndDate = getFiscalYearEndDate(fiscalYear)

  let actualSalesRecordEndTime = fiscalYearEndDate
  let forcastSalesRecordStartDate = fiscalYearStartDate
  let actualSalesRecord: salesUnitPrice[] = []
  /**
   * If fiscalYear is less than or equal to currentFiscalYear
   * then actual record can be available
   */
  if (fiscalYear <= currentFiscalYear) {
    /**
     * If fiscalYear equal to currentFiscalYear
     * then get from year start to currentDateTime
     */
    if (fiscalYear == currentFiscalYear) {
      actualSalesRecordEndTime = currentDateTimeJSTString
    }

    actualSalesRecord = await getSalesPriceData(
      snowflakeTransaction,
      input,
      CONST_FORECAST_CATEGORY.ACTUAL,
      CONST_FISCAL_CATEGORY.GROSS_MARGIN,
      fiscalYearStartDate,
      actualSalesRecordEndTime,
    )

    logger.debug(`ActualSalesRecord fetched record count:${actualSalesRecord.length}`)
  }

  /**
   * Get Forcast Sales record
   * Forcast Record last actual record to fiscal year end
   */
  // forcastSalesRecordStartDate is last day's next day of actualSalesRecord if actualSalesRecord exist
  if (actualSalesRecord.length !== 0) {
    forcastSalesRecordStartDate = timestampToString(
      DateTime.fromJSDate(new Date(actualSalesRecord[actualSalesRecord.length - 1].DAY)).plus({ days: 1 }),
    )
  }

  const forcastSalesRecord: salesUnitPrice[] = await getSalesPriceData(
    snowflakeTransaction,
    input,
    CONST_FORECAST_CATEGORY.FORCAST,
    CONST_FISCAL_CATEGORY.GROSS_MARGIN,
    forcastSalesRecordStartDate,
    fiscalYearEndDate,
  )
  logger.debug(`ForcastSalesRecord fetched record count:${forcastSalesRecord.length}`)
  const salesPrice: salesPriceResponse = {
    PLANT_CODE: plantId,
    UNIT_CODE: unitId,
    SUFFIX: t("VALUE.SUFFIX_YEN_KWH"),
    SALES: [...actualSalesRecord, ...forcastSalesRecord].map((sales) => ({
      ...sales,
      DAY: formatDateWithTimeZone(new Date(sales.DAY)),
    })),
  }
  return E.right(salesPrice)
}
