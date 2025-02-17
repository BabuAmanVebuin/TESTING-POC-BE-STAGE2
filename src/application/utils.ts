// Imported from DPM-BE, commit d0e2f45544cc9890762f93cf3e8f224f15efd619
import { DateTime, Duration } from "luxon"
import { CONST_FORECAST_CATEGORY, CONST_VARIABLE, DATE_CONST, FISCAL_YEAR_DATE } from "../config/dpm/constant.js"
import { env } from "../infrastructure/env/dpm/index.js"

export const timestampToString = (timestamp: DateTime): string => timestamp.toFormat(DATE_CONST.YYYY_MM_DD_HH_MM_SS_SSS)

/**
 * Function to format a date with a time zone.
 * @param  date - The date to be formatted.
 * @param {string} [toFormat=DATE_CONST.ISO_8601_UTC] - The format to be used for formatting.
 * @param {string} [setZone=env.TIMEZONE] - The time zone to be used for formatting.
 * @returns {string} A string representing the formatted date.
 */
export const formatDateWithTimeZone = (
  date: Date,
  toFormat: string = DATE_CONST.ISO_8601_UTC,
  setZone: string = env.TIMEZONE,
): string => {
  return DateTime.fromJSDate(date).setZone(setZone).toFormat(toFormat)
}

/**
 * Get getFiscalYearStartDate
 * @param fiscalYear
 * @returns FiscalYearStartDate
 */
export const getFiscalYearStartDate = (fiscalYear: number): string =>
  `${fiscalYear}${FISCAL_YEAR_DATE.FISCAL_YEAR_START_DATE_PART}`
/**
 * Get getFiscal Year Star Date
 * @param fiscalYear
 * @returns Fiscal Year End Date
 */
export const getFiscalYearEndDate = (fiscalYear: number): string =>
  `${Number(fiscalYear) + 1}${FISCAL_YEAR_DATE.FISCAL_YEAR_END_DATE_PART}`

export const getFiscalYearStartDateTime = (date: DateTime): DateTime => {
  return date
    .set({
      month: 4,
      day: 1,
      hour: 0,
      minute: 0,
      second: 0,
      millisecond: 0,
    })
    .minus(Duration.fromObject({ years: date.month > 3 ? 0 : 1 }))
}
/**
 * Function to get Current Fiscal Year
 * @returns Fiscal Year
 */
export const getFiscalYear = (jstDate: DateTime): number => {
  if (jstDate.month <= 3) {
    return jstDate.year - 1
  }

  return jstDate.year
}

export const getFormattedUnitCode = (unitCode: string): string => {
  const formattedUnitCode: string = unitCode.substring(3, 6)
  return formattedUnitCode
}
/**
 * Function to get Current JST Date Time
 * @returns JST current date time
 */
export const getCurrentDateTimeJST = (): DateTime => {
  return DateTime.utc().setZone(env.TIMEZONE)
}

/**
 * Function to validate year
 * @param year
 * @returns is valid year
 */
export const validateYear = (year: number): boolean => {
  return !isNaN(year) && year <= CONST_VARIABLE.MAX_YEAR && year >= CONST_VARIABLE.MIN_YEAR
}
/**
 * Function to validate formate of date
 * @param date string date
 * @param fromFormat formate
 * @returns is valid date Format
 */
export const validateStringOfDateFormat = (date: string, fromFormat: string) => {
  return DateTime.fromFormat(date, fromFormat).isValid
}

/**
 * Function to validate Forecast Category
 * @param forecastCategory
 * @returns is Valid Forecast Category
 */
export const isValidForecastCategory = (forecastCategory: string): boolean => {
  return (
    Number(forecastCategory) === CONST_FORECAST_CATEGORY.ACTUAL ||
    Number(forecastCategory) === CONST_FORECAST_CATEGORY.FORCAST ||
    Number(forecastCategory) === CONST_FORECAST_CATEGORY.PLANED
  )
}
