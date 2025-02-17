// Imported from DPM-BE, commit d0e2f45544cc9890762f93cf3e8f224f15efd619
import { expect } from "chai"
import { Kpi003SubcacheMinimalRow } from "../../../src/domain/models/dpm/Kpi003Cache.js"
import { env } from "../../../src/infrastructure/env/dpm/index.js"
import {
  generateKpi003MeasureSectionUseCase,
  hashRows,
} from "../../../src/application/use_cases/dpm/generateKpi003MeasureSectionUseCase.js"
import { getKpi003ResponseTimeRangeUseCase } from "../../../src/application/use_cases/dpm/getKpi003ResponseTimeRangeUseCase.js"
import { DATE_CONST } from "../../../src/config/dpm/constant.js"
import { formatDateWithTimeZone } from "../../../src/application/utils.js"

describe("generateKpi003MeasureSectionUseCase", () => {
  const timeRangeDates = getKpi003ResponseTimeRangeUseCase(Math.floor(Date.now() / 1000))

  const subcache = {
    plannedRows: {
      hourly: [] as Kpi003SubcacheMinimalRow[],
      daily: [] as Kpi003SubcacheMinimalRow[],
      monthly: [] as Kpi003SubcacheMinimalRow[],
      cumulativeMonthly: [] as Kpi003SubcacheMinimalRow[],
    },
    actualOrForecastRows: {
      hourly: [] as Kpi003SubcacheMinimalRow[],
      daily: [] as Kpi003SubcacheMinimalRow[],
      monthly: [] as Kpi003SubcacheMinimalRow[],
      cumulativeMonthly: [] as Kpi003SubcacheMinimalRow[],
    },
  }

  const estimates = {
    annualEstimatesArray: Array(env.KPI003_YEAR_HALF_RANGE * 2).fill({
      actual: 0,
      forecast: 0,
      planned: 0,
    }),
    monthlyEstimatesArray: Array(env.KPI003_MONTH_HALF_RANGE * 2).fill({
      actual: 0,
      forecast: 0,
      planned: 0,
    }),
    weeklyEstimatesArray: Array(env.KPI003_WEEK_HALF_RANGE * 2).fill({
      actual: 0,
      forecast: 0,
      planned: 0,
    }),
    dailyEstimatesArray: Array(env.KPI003_DAY_HALF_RANGE * 2).fill({
      actual: 0,
      forecast: 0,
      planned: 0,
    }),
  }

  const unscaledCurrentYear = {
    forecast: 2,
    planned: 1,
  }

  const otherPrefix = "✔"
  const otherSuffix = "𐄂"
  const otherConversion = (original: number) => original * 2
  const dailyPrefix = "dailyPrefix"
  const dailySuffix = "dailySuffix"
  const dailyConversion = (original: number) => original * 3

  it("should generate the KPI003 measure section", () => {
    const result = generateKpi003MeasureSectionUseCase({
      timeRangeDates,
      subcache,
      estimates,
      unscaledCurrentYear,
      otherPrefix,
      otherSuffix,
      otherConversion,
      dailyPrefix,
      dailySuffix,
      dailyConversion,
    })

    expect(result.Annual).to.exist
    expect(result.Annual.Prefix).to.equal(otherPrefix)
    expect(result.Annual.Suffix).to.equal(otherSuffix)

    expect(result.Monthly).to.exist
    expect(result.Monthly.Prefix).to.equal(otherPrefix)
    expect(result.Monthly.Suffix).to.equal(otherSuffix)

    expect(result.Weekly).to.exist
    expect(result.Weekly.Prefix).to.equal(otherPrefix)
    expect(result.Weekly.Suffix).to.equal(otherSuffix)

    expect(result.Daily).to.exist
    expect(result.Daily.Prefix).to.equal(dailyPrefix)
    expect(result.Daily.Suffix).to.equal(dailySuffix)

    expect(result.Cumulative).to.exist
    expect(result.Cumulative.Prefix).to.equal(otherPrefix)
    expect(result.Cumulative.Suffix).to.equal(otherSuffix)

    expect(result.ForecastCurrentYear).to.exist
    expect(result.ForecastCurrentYear).to.equal(otherConversion(unscaledCurrentYear.forecast))

    expect(result.PlannedCurrentYear).to.exist
    expect(result.PlannedCurrentYear).to.equal(otherConversion(unscaledCurrentYear.planned))
  })

  it("should hash rows correctly", () => {
    const rows: Kpi003SubcacheMinimalRow[] = [
      {
        START: new Date("2022-02-01T00:00:00.000+09:00"),
        FORECAST_CATEGORY: "Planned",
        VALUE: Math.random() * 1000,
      },
      {
        START: new Date("2022-03-01T00:00:00.000+09:00"),
        FORECAST_CATEGORY: "Forecast",
        VALUE: Math.random() * 1000,
      },
      {
        START: new Date("2022-04-01T00:00:00.000+09:00"),
        FORECAST_CATEGORY: "Actual",
        VALUE: Math.random() * 1000,
      },
    ]

    const hashedRows = hashRows(rows)

    // Assertions
    expect(hashedRows.size).to.equal(rows.length)
    rows.forEach((row) =>
      expect(hashedRows.get(formatDateWithTimeZone(row.START, DATE_CONST.ISO_8601_KPI003))).to.equal(row),
    )
  })
})
