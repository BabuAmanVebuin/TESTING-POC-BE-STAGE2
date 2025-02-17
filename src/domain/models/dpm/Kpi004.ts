// Imported from DPM-BE, commit d0e2f45544cc9890762f93cf3e8f224f15efd619
export type KPI004DBRecord = {
  PlantCode: string
  UnitCode: string
  FiscalYear: number
  RangeType: number
  StoppagePlannedHours: number
  StoppagePlannedRecords: number
  StoppageActualOrForcastHours: number
  StoppageActualOrForecastRecords: number
  StoppagePlannedDecreseHours: number
  StoppagePlannedDecreseRecords: number
  StoppagePlannedIncresedHours: number
  StoppagePlannedIncresedRecords: number
  StoppageCancledHours: number
  StoppageCancledRecords: number
  StoppageUnPlannedHours: number
  StoppageUnPlannedRecords: number
  GrossMarginPluseImpact: number
  GrossMarginMinusImpact: number
  SellingPricePlannedPlan: number
  SellingPricePlannedActualOrForecast: number
  SellingPriceUnPlannedActualOrForecast: number
  CreateTimestamp: number
  UpdateTimestamp: number
}

export type KPI004CollectionToProcess = {
  PlannedHours: number
  PlannedPlanRecords: number
  ActualOrForcastHours: number
  PlannedActualOrForcastRecords: number
  PlannedDecreseHours: number
  PlannedDecreseRecords: number
  PlannedIncreaseHours: number
  PlannedIncreaseRecords: number
  CancledHours: number
  CancledRecords: number
  UnPlannedHours: number
  UnPlannedRecords: number
  GrossMarginPlusImpact: number
  GrossMarginMinusImpact: number
  PlannedPlanSalePriceSum: number
  PlannedActualOrForcastSalePriceSum: number
  UnplannedSalePriceSum: number
}

// -------------------------------------------------------------------------------------
//  KPI004 sub Cache API response model
// -------------------------------------------------------------------------------------

/**
 * KPI004 Response data
 * @category model
 */
export interface KPI004Response {
  PlantCode: string
  UnitCode: string
  Today: Kpi004ResponseSubCache
  PreviousDay: Kpi004ResponseSubCache
}
/**
 * Annual
 * @category model
 */
export interface Annual {
  ActualOrForcastHours: number
  PlanHours: number
  PositveImpactHours: number
  NagetiveImpactHours: number
}
/**
 * YearStartToPresent
 * @category model
 */
export interface YearStartToPresent {
  ActualOrForcastHours: number
  PlanHours: number
  PlannedDecreseHours: number
  PlannedDecreseRecords: number
  PlannedIncreseHours: number
  PlannedIncreseRecords: number
  CancledHours: number
  CancledRecords: number
  UnplannedHours: number
  UnplannedRecords: number
}
/**
 * PresentToYearEnd
 * @category model
 */
export interface PresentToYearEnd {
  ActualOrForcastHours: number
  PlanHours: number
  PlannedDecreseHours: number
  PlannedDecreseRecords: number
  PlannedIncreseHours: number
  PlannedIncreseRecords: number
  CancledHours: number
  CancledRecords: number
  UnplannedHours: number
  UnplannedRecords: number
}
/**
 * StoppageTime
 * @category model
 */
export interface StoppageTime {
  Annual: Annual
  YearStartToPresent: YearStartToPresent
  PresentToYearEnd: PresentToYearEnd
}
/**
 * GrossMarginImpactAnnual
 * @category model
 */
export interface GrossMarginImpactAnnual {
  PluseImpact: number
  MinuseImpact: number
}
/**
 * Gross Margin Impact Year Start To Present
 * @category model
 */
export interface GrossMarginImpactYearStartToPresent {
  PluseImpact: number
  MinuseImpact: number
}
/**
 * GrossMarginImpactPresentToYearEnd
 * @category model
 */
export interface GrossMarginImpactPresentToYearEnd {
  PluseImpact: number
  MinuseImpact: number
}
/**
 * Gross Margin Impact
 * @category model
 */
export interface GrossMarginImpact {
  Prefix: string
  Suffix: string
  Annual: GrossMarginImpactAnnual
  YearStartToPresent: GrossMarginImpactYearStartToPresent
  PresentToYearEnd: GrossMarginImpactPresentToYearEnd
}
/**
 * Selling Price At Outage Annual
 * @category model
 */
export interface SellingPriceAtOutageAnnual {
  PlannedPlanAvgPrice: number
  PlannedActualOrForcastAvgPrice?: number
  UnplannedAvgPrice: number
}
/**
 * Selling Price AtOutage Year Start To Present
 * @category model
 */
export interface SellingPriceAtOutageYearStartToPresent {
  PlannedPlanAvgPrice?: number
  PlannedPlanRecords: number
  PlannedActualOrForcastAvgPrice?: number
  PlannedActualOrForcastRecords: number
  UnplannedAvgPrice: number
  UnplannedRecords: number
}
/**
 * Selling Price At Outage Present To Year End
 * @category model
 */
export interface SellingPriceAtOutagePresentToYearEnd {
  PlannedPlanAvgPrice: number
  PlannedPlanRecords: number
  PlannedActualOrForcastAvgPrice: number
  PlannedActualOrForcastRecords: number
  UnplannedAvgPrice: number
  UnplannedRecords: number
}
/**
 * Selling Price At Outage
 * @category model
 */
export interface SellingPriceAtOutage {
  Suffix: string
  Annual: SellingPriceAtOutageAnnual
  YearStartToPresent: SellingPriceAtOutageYearStartToPresent
  PresentToYearEnd: SellingPriceAtOutagePresentToYearEnd
}
/**
 * Kpi004 Response SubCasing
 * @category model
 */
export interface Kpi004ResponseSubCache {
  StoppageTime: StoppageTime
  GrossMarginImpact: GrossMarginImpact
  SellingPriceAtOutage: SellingPriceAtOutage
}
