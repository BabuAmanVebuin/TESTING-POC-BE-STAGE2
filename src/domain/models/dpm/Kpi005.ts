// Imported from DPM-BE, commit d0e2f45544cc9890762f93cf3e8f224f15efd619
export type KPI005DBRecord = {
  PlantCode: string
  UnitCode: string
  FiscalYear: number
  RangeType: number
  PlannedGrossMarginAtNegativeOperation: number
  ActualOrForecastGrossMarginAtNegativeOperation: number
  PlannedNegativeOperatingHours: number
  ActualOrForecastNegativeOperatingHours: number
  PlannedSpreadAtNegativeOperation: number
  ActualOrForecastSpreadAtNegativeOperation: number
}

export type KPI005CollectionToProcess = {
  PlannedGrossMarginAtNegativeOperation: number
  ActualOrForecastGrossMarginAtNegativeOperation: number
  PlannedNegativeOperatingHours: number
  ActualOrForecastNegativeOperatingHours: number
  PlannedSpreadAtNegativeOperation: number
  ActualOrForecastSpreadAtNegativeOperation: number
}

// -------------------------------------------------------------------------------------
//  KPI005 sub Cache API response model
// -------------------------------------------------------------------------------------

/**
 * KPI005 Negative Operation GrossMargin
 * @category model
 */
export interface NegativeOperationGrossMargin {
  Prefix: string
  Suffix: string
  Annual: Annual
  YearStartToPresent: YearStartToPresent
  PresentToYearEnd: PresentToYearEnd
}
/**
 * KPI005Negative Operation Time
 * @category model
 */
export interface NegativeOperationTime {
  Suffix: string
  Annual: Pick<Annual, "Plan" | "ActualOrForcast">
  YearStartToPresent: Pick<YearStartToPresent, "Plan" | "ActualOrForcast">
  PresentToYearEnd: Pick<PresentToYearEnd, "Plan" | "ActualOrForcast">
}
/**
 * Negative Operation Avg Spread
 * @category model
 */
export interface NegativeOperationAvgSpread {
  Suffix: string
  Annual: Pick<Annual, "Plan" | "ActualOrForcast">
  YearStartToPresent: Pick<YearStartToPresent, "Plan" | "ActualOrForcast">
  PresentToYearEnd: Pick<PresentToYearEnd, "ActualOrForcast" | "Plan">
}
/**
 * Annual type
 * @category model
 */
export interface Annual {
  Plan: number
  ActualOrForcast: number
}

/**
 * Annual type
 * @category model
 */
export interface PresentToYearEnd {
  Plan: number
  ActualOrForcast: number
}

/**
 * Year Start To Present type
 * @category model
 */
export interface YearStartToPresent {
  Plan: number
  ActualOrForcast: number
}

/**
 * KPI005 Sub Cache
 * @category model
 */
export interface KPI005SubCache {
  NegativeOperationGrossMargin: NegativeOperationGrossMargin
  NegativeOperationTime: NegativeOperationTime
  NegativeOperationAvgSpread: NegativeOperationAvgSpread
}

/**
 * kpi005 api response data model
 * @category model
 */
export interface KPI005ResponseData {
  PlantCode: string
  UnitCode: string
  Today: KPI005SubCache
  PreviousDay: KPI005SubCache
}
