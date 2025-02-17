// Imported from DPM-BE, commit d0e2f45544cc9890762f93cf3e8f224f15efd619
import { expect } from "chai"
import { env } from "../../../src/infrastructure/env/dpm/index.js"
import { DateTime, Duration } from "luxon"
import { hashRows } from "../../../src/application/use_cases/dpm/generateKpi003MeasureSectionUseCase.js"
import { generateKpi003MeasureSubSectionUseCase } from "../../../src/application/use_cases/dpm/generateKpi003MeasureSubSectionUseCase.js"

describe("generateKpi003MeasureSubSectionUseCase", () => {
  const prefix = "Prefix"
  const suffix = "Suffix"
  const fakePeriodLength = 12
  const start = DateTime.local()
  const hashedPlannedRows = hashRows(
    Array.from({ length: fakePeriodLength }, (_, i) => ({
      START: start
        .plus({
          month: i,
        })
        .toJSDate(),
      VALUE: Math.random() * 100,
      FORECAST_CATEGORY: "Planned",
    })),
  )
  const hashedActualOrForecastRows = hashRows(
    Array.from({ length: fakePeriodLength }, (_, i) => ({
      START: start
        .plus({
          month: i,
        })
        .toJSDate(),
      VALUE: Math.random() * 100,
      FORECAST_CATEGORY: "Forecast",
    })),
  )
  const outerLength = 5
  const getOuterDuration = (idx: number) => Duration.fromObject({ months: idx })
  const fakeInnerLength = 31
  const getRealInnerLength = (dt: DateTime) => dt.daysInMonth as number
  const getInnerDuration = (idx: number) => Duration.fromObject({ days: idx })
  const convertor = (original: number) => original
  const estimatesArray = Array(env.KPI003_YEAR_HALF_RANGE * 2).fill({
    actual: Math.random() * 100,
    forecast: Math.random() * 100,
    planned: Math.random() * 100,
  })

  it("should generate the KPI003 measure subsection", () => {
    const result = generateKpi003MeasureSubSectionUseCase({
      prefix,
      suffix,
      hashedPlannedRows,
      hashedActualOrForecastRows,
      start,
      outerLength,
      getOuterDuration,
      fakeInnerLength,
      getRealInnerLength,
      getInnerDuration,
      convertor,
      estimatesArray,
    })
    expect(result).to.exist
    expect(result.Prefix).to.equal(prefix)
    expect(result.Suffix).to.equal(suffix)
    expect(Object.keys(result).length).to.equal(outerLength + 2)
    for (let index = 1; index < outerLength; index++) {
      expect(result).to.haveOwnProperty(`${index}`)
    }
  })
})
