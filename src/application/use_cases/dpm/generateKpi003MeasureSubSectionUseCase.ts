// Imported from DPM-BE, commit d0e2f45544cc9890762f93cf3e8f224f15efd619
import { DateTime, Duration } from "luxon"
import { Kpi003SubcacheMinimalRow, UnscaledEstimates } from "../../../domain/models/dpm/Kpi003Cache.js"
import { generateKpi003MeasureEntryUseCase } from "./generateKpi003MeasureEntryUseCase.js"

/**
 * Generate a subsection of the KPI003 measure section based on the provided parameters.
 * @returns Generated subsection as a record.
 */
export const generateKpi003MeasureSubSectionUseCase = ({
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
}: {
  prefix: string | null
  suffix: string | null
  hashedPlannedRows: Map<string, Kpi003SubcacheMinimalRow>
  hashedActualOrForecastRows: Map<string, Kpi003SubcacheMinimalRow>
  start: DateTime
  outerLength: number
  getOuterDuration: (idx: number) => Duration
  fakeInnerLength: number
  getRealInnerLength: (dt: DateTime) => number
  getInnerDuration: (idx: number) => Duration
  convertor: (original: number) => number
  estimatesArray: UnscaledEstimates[]
}): Record<string, unknown> => {
  const result: Record<string, unknown> = {
    Prefix: prefix,
    Suffix: suffix,
  }

  for (const outerIdx of [...Array(outerLength).keys()]) {
    const currentStart = start.plus(getOuterDuration(outerIdx))
    result[(outerIdx + 1).toString()] = generateKpi003MeasureEntryUseCase(
      hashedPlannedRows,
      hashedActualOrForecastRows,
      currentStart,
      fakeInnerLength,
      getRealInnerLength(currentStart),
      getInnerDuration,
      convertor,
      estimatesArray[outerIdx] || {
        planned: null,
        actual: null,
        forecast: null,
      },
    )
  }

  return result
}
