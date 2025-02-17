// Imported from DPM-BE, commit d0e2f45544cc9890762f93cf3e8f224f15efd619
import { expect } from "chai"
import { DateTime, Duration } from "luxon"
import { Kpi003SubcacheMinimalRow, UnscaledEstimates } from "../../../src/domain/models/dpm/Kpi003Cache.js"
import { generateKpi003MeasureEntryUseCase } from "../../../src/application/use_cases/dpm/generateKpi003MeasureEntryUseCase.js"
import { env } from "../../../src/infrastructure/env/dpm/index.js"
import { formatDateWithTimeZone } from "../../../src/application/utils.js"
import { DATE_CONST } from "../../../src/config/dpm/constant.js"
import { hashRows } from "../../../src/application/use_cases/dpm/generateKpi003MeasureSectionUseCase.js"
describe("generateKpi003MeasureEntryUseCase", () => {
  it("should generate mapped estimates measure entry with convert value", () => {
    // Mocked data
    const unscaledEstimates: UnscaledEstimates = {
      planned: 10,
      actual: 20,
      forecast: 30,
    }
    const start = DateTime.fromObject({ year: 2022, month: 4, day: 1 }, { zone: env.TIMEZONE })
    const getRealInnerLength = () => 12
    const convert = (original: number) => original * 2
    const result = generateKpi003MeasureEntryUseCase(
      new Map<string, Kpi003SubcacheMinimalRow>([]),
      new Map<string, Kpi003SubcacheMinimalRow>([]),
      start,
      getRealInnerLength(),
      getRealInnerLength(),
      (idx: number) => Duration.fromObject({ month: idx }),
      convert,
      unscaledEstimates,
    )
    expect(result.Estimates).to.deep.equal({
      Planned: unscaledEstimates?.planned && convert(unscaledEstimates?.planned),
      Actual: unscaledEstimates?.actual && convert(unscaledEstimates?.actual),
      Forecast: unscaledEstimates?.forecast && convert(unscaledEstimates?.forecast),
    })
  })

  it("should generate planned entry with converted value", () => {
    // Mocked data
    const fakePeriodLength = 12
    const realPeriodLength = 10
    const frameDuration = (idx: number) => Duration.fromObject({ month: idx })
    const convert = (original: number) => original * 2
    const unscaledEstimates: UnscaledEstimates = {
      planned: 10,
      actual: 20,
      forecast: 30,
    }
    const start = DateTime.fromObject({ year: 2022, month: 4, day: 1 }, { zone: env.TIMEZONE })
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
    // Call the use case function
    const result = generateKpi003MeasureEntryUseCase(
      hashedPlannedRows,
      new Map<string, Kpi003SubcacheMinimalRow>([]),
      start,
      fakePeriodLength,
      realPeriodLength,
      frameDuration,
      convert,
      unscaledEstimates,
    )
    // planned
    for (let element = 0; element < realPeriodLength; element++) {
      expect(result.Planned[element]).equal(
        convert(
          hashedPlannedRows.get(
            formatDateWithTimeZone(start.plus(frameDuration(element)).toJSDate(), DATE_CONST.ISO_8601_KPI003),
          )?.VALUE || 0,
        ),
      )
    }
    for (let element = realPeriodLength + 1; element < fakePeriodLength; element++) {
      expect(result.Planned[element]).to.be.null
    }
  })

  it("should generate Actual entry with converted value", () => {
    // Mocked data
    const fakePeriodLength = 12
    const realPeriodLength = 10
    const frameDuration = (idx: number) => Duration.fromObject({ month: idx })
    const convert = (original: number) => original * 2
    const unscaledEstimates: UnscaledEstimates = {
      planned: 10,
      actual: 20,
      forecast: 30,
    }
    const start = DateTime.fromObject({ year: 2022, month: 4, day: 1 }, { zone: env.TIMEZONE })
    const hashedActualOrForecastRows = hashRows(
      Array.from({ length: fakePeriodLength }, (_, i) => ({
        START: start
          .plus({
            month: i,
          })
          .toJSDate(),
        VALUE: Math.random() * 100,
        FORECAST_CATEGORY: "Actual",
      })),
    )
    // Call the use case function
    const result = generateKpi003MeasureEntryUseCase(
      new Map<string, Kpi003SubcacheMinimalRow>([]),
      hashedActualOrForecastRows,
      start,
      fakePeriodLength,
      realPeriodLength,
      frameDuration,
      convert,
      unscaledEstimates,
    )
    // Actual
    for (let element = 0; element < realPeriodLength; element++) {
      expect(result.Actual[element]).equal(
        convert(
          hashedActualOrForecastRows.get(
            formatDateWithTimeZone(start.plus(frameDuration(element)).toJSDate(), DATE_CONST.ISO_8601_KPI003),
          )?.VALUE || 0,
        ),
      )
    }
    for (let element = realPeriodLength + 1; element < fakePeriodLength; element++) {
      expect(result.Actual[element]).to.be.null
    }
  })
  it("should generate forecast entry with converted value", () => {
    // Mocked data
    const fakePeriodLength = 12
    const realPeriodLength = 10
    const frameDuration = (idx: number) => Duration.fromObject({ month: idx })
    const convert = (original: number) => original * 2
    const unscaledEstimates: UnscaledEstimates = {
      planned: 10,
      actual: 20,
      forecast: 30,
    }
    const start = DateTime.fromObject({ year: 2022, month: 4, day: 1 }, { zone: env.TIMEZONE })
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
    // Call the use case function
    const result = generateKpi003MeasureEntryUseCase(
      new Map<string, Kpi003SubcacheMinimalRow>([]),
      hashedActualOrForecastRows,
      start,
      fakePeriodLength,
      realPeriodLength,
      frameDuration,
      convert,
      unscaledEstimates,
    )
    // Actual
    for (let element = 0; element < realPeriodLength; element++) {
      expect(result.Forecast[element]).to.equal(
        convert(
          hashedActualOrForecastRows.get(
            formatDateWithTimeZone(start.plus(frameDuration(element)).toJSDate(), DATE_CONST.ISO_8601_KPI003),
          )?.VALUE || 0,
        ),
      )
    }
    for (let element = realPeriodLength + 1; element < fakePeriodLength; element++) {
      expect(result.Forecast[element]).to.be.null
    }
  })
})
