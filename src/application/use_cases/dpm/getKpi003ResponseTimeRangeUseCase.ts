// Imported from DPM-BE, commit d0e2f45544cc9890762f93cf3e8f224f15efd619
import { DateTime, Duration } from "luxon"
import { env } from "../../../infrastructure/env/dpm/index.js"
import { getFiscalYearStartDateTime } from "../../utils.js"

const yearHalfRange = Duration.fromObject({
  years: env.KPI003_YEAR_HALF_RANGE,
})
const monthHalfRange = Duration.fromObject({
  months: env.KPI003_MONTH_HALF_RANGE,
})
const weekHalfRange = Duration.fromObject({
  weeks: env.KPI003_WEEK_HALF_RANGE,
})
const dayHalfRange = Duration.fromObject({ days: env.KPI003_DAY_HALF_RANGE })

/**
 * Calculates the KPI003 date time range based on the provided timestamp.
 *
 * @param {number} timestamp - The timestamp in seconds.
 * @returns {Object} The KPI003 date time range.
 */
export const getKpi003ResponseTimeRangeUseCase = (
  timestamp: number,
): {
  annualEstimatesStart: DateTime
  monthlyEstimatesStart: DateTime
  weeklyEstimatesStart: DateTime
  dailyEstimatesStart: DateTime
  hourlySubcacheEnd: DateTime
  hourlySubcacheStart: DateTime
  dailySubcacheEnd: DateTime
  dailySubcacheStart: DateTime
  monthlySubcacheEnd: DateTime
  monthlySubcacheStart: DateTime
  currentFiscalYearStart: DateTime
} => {
  // Convert timestamp to DateTime of correct timezone
  const inputDateTime = DateTime.fromSeconds(timestamp).setZone(env.TIMEZONE)
  const now = DateTime.utc().setZone(env.TIMEZONE)
  const currentFiscalYearStart = getFiscalYearStartDateTime(now)

  // Determine the correct start and end datetimes
  const flooredToMidnight = inputDateTime.set({
    hour: 0,
    minute: 0,
    second: 0,
    millisecond: 0,
  })
  const flooredToMondayMidnight = flooredToMidnight.set({ weekday: 1 })
  const flooredToFirstOfMonthMidnight = flooredToMidnight.set({ day: 1 })
  const flooredToFiscalYearStart = getFiscalYearStartDateTime(flooredToFirstOfMonthMidnight)
  // Estimates Start
  const annualEstimatesStart = flooredToFiscalYearStart.minus(yearHalfRange)
  const monthlyEstimatesStart = flooredToFirstOfMonthMidnight.minus(monthHalfRange)
  const weeklyEstimatesStart = flooredToMondayMidnight.minus(weekHalfRange)
  const dailyEstimatesStart = flooredToMidnight.minus(dayHalfRange)
  // Subcache Start
  const monthlySubcacheStart = annualEstimatesStart
  const monthlySubcacheEnd = flooredToFiscalYearStart.plus(yearHalfRange)
  const dailySubcacheStart = DateTime.min(monthlyEstimatesStart, weeklyEstimatesStart)
  const dailySubcacheEnd = DateTime.max(
    flooredToFirstOfMonthMidnight.plus(monthHalfRange),
    flooredToMondayMidnight.plus(weekHalfRange),
  )
  const hourlySubcacheStart = dailyEstimatesStart
  const hourlySubcacheEnd = flooredToMidnight.plus(dayHalfRange)

  return {
    annualEstimatesStart,
    monthlyEstimatesStart,
    weeklyEstimatesStart,
    dailyEstimatesStart,
    hourlySubcacheStart,
    hourlySubcacheEnd,
    dailySubcacheStart,
    dailySubcacheEnd,
    monthlySubcacheStart,
    monthlySubcacheEnd,
    currentFiscalYearStart,
  }
}
