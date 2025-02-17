// Imported from DPM-BE, commit d0e2f45544cc9890762f93cf3e8f224f15efd619
import { expect } from "chai"
import { DateTime, Duration } from "luxon"
import { env } from "../../../src/infrastructure/env/dpm/index.js"
import { getKpi003ResponseTimeRangeUseCase } from "../../../src/application/use_cases/dpm/getKpi003ResponseTimeRangeUseCase.js"
import { timestampToString } from "../../../src/application/utils.js"
describe("getKpi003ResponseTimeRangeUseCase", () => {
  const mockTimestamp = 1625097600 // July 1, 2021 00:00:00 UTC
  const dt = DateTime.fromSeconds(mockTimestamp).setZone(env.TIMEZONE)
  const now = DateTime.utc().setZone(env.TIMEZONE)
  const currentFiscalYearStart = now
    .set({ month: 4, day: 1, hour: 0, minute: 0, second: 0, millisecond: 0 })
    .minus(Duration.fromObject({ years: now.month > 3 ? 0 : 1 }))
  // Determine the correct start and end datetimes
  const flooredToMidnight = dt.set({
    hour: 0,
    minute: 0,
    second: 0,
    millisecond: 0,
  })
  const flooredToMondayMidnight = flooredToMidnight.set({ weekday: 1 })
  const flooredTo1stOfMonthMidnight = flooredToMidnight.set({ day: 1 })
  const flooredToFiscalYearStart = flooredTo1stOfMonthMidnight
    .set({ month: 4 })
    .minus(Duration.fromObject({ year: dt.month > 3 ? 0 : 1 }))

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

  const outputYearStart = flooredToFiscalYearStart.minus(yearHalfRange)
  const outputMonthStart = flooredTo1stOfMonthMidnight.minus(monthHalfRange)
  const outputWeekStart = flooredToMondayMidnight.minus(weekHalfRange)
  const outputDayStart = flooredToMidnight.minus(dayHalfRange)

  const monthlyStart = outputYearStart
  const monthlyEnd = flooredToFiscalYearStart.plus(yearHalfRange)
  const dailyStart = DateTime.min(outputMonthStart, outputWeekStart)
  const dailyEnd = DateTime.max(
    flooredTo1stOfMonthMidnight.plus(monthHalfRange),
    flooredToMondayMidnight.plus(weekHalfRange),
  )
  const hourlyStart = outputDayStart
  const hourlyEnd = flooredToMidnight.plus(dayHalfRange)

  it("returns the correct KPI003 date time range", () => {
    const result = getKpi003ResponseTimeRangeUseCase(mockTimestamp)

    expect(timestampToString(result.annualEstimatesStart)).equal(timestampToString(outputYearStart))
    expect(timestampToString(result.monthlyEstimatesStart)).equal(timestampToString(outputMonthStart))
    expect(timestampToString(result.weeklyEstimatesStart)).equal(timestampToString(outputWeekStart))
    expect(timestampToString(result.dailyEstimatesStart)).equal(timestampToString(outputDayStart))
    expect(timestampToString(result.hourlySubcacheStart)).equal(timestampToString(hourlyStart))
    expect(timestampToString(result.hourlySubcacheEnd)).equal(timestampToString(hourlyEnd))
    expect(timestampToString(result.dailySubcacheStart)).equal(timestampToString(dailyStart))
    expect(timestampToString(result.dailySubcacheEnd)).equal(timestampToString(dailyEnd))
    expect(timestampToString(result.monthlySubcacheStart)).equal(timestampToString(monthlyStart))
    expect(timestampToString(result.monthlySubcacheEnd)).equal(timestampToString(monthlyEnd))
    expect(timestampToString(result.currentFiscalYearStart)).equal(timestampToString(currentFiscalYearStart))
  })
})
