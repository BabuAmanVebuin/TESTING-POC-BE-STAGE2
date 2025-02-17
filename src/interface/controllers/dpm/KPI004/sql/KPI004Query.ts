export const GET_KPI004_QUERY = `
SELECT  plant_code as "PlantCode",
unit_code as "UnitCode",
fiscal_year as "FiscalYear",
range_type as "RangeType",
stoppage_planned_hours as "StoppagePlannedHours",
stoppage_planned_records as "StoppagePlannedRecords",
stoppage_actual_or_forcast_hours as "StoppageActualOrForcastHours",
stoppage_actual_or_focast_records as "StoppageActualOrForecastRecords",
stoppage_planned_decrese_hours  as "StoppagePlannedDecreseHours",
stoppage_planned_decrese_records as "StoppagePlannedDecreseRecords",
stoppage_planned_incresed_hours as "StoppagePlannedIncresedHours",
stoppage_planned_incresed_records as "StoppagePlannedIncresedRecords",
stoppage_cancled_hours as "StoppageCancledHours",
stoppage_cancled_records as "StoppageCancledRecords",
stoppage_unplanned_hours as "StoppageUnPlannedHours",
stoppage_unplanned_records as "StoppageUnPlannedRecords",
grossmargin_pluse_impact as "GrossMarginPluseImpact",
grossmargin_minus_impact as "GrossMarginMinusImpact",
selling_price_planned_plan as "SellingPricePlannedPlan",
selling_price_planned_actual_or_focast as "SellingPricePlannedActualOrForecast",
selling_price_unplanned_actual_or_focast as "SellingPriceUnPlannedActualOrForecast",
        create_timestmp as "CreateTimestamp",
        create_timestmp as "UpdateTimestamp"
FROM %tableName% ktst
WHERE ktst.PLANT_CODE = :1
AND ktst.FISCAL_YEAR = :3
`
