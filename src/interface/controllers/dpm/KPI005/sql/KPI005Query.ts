export const GET_KPI005_QUERY = `
SELECT  
        plant_code as "PlantCode",
        unit_code as "UnitCode",
        fiscal_year as "FiscalYear",
        range_type as "RangeType",
        planned_gross_margin_at_nagative_operation as "PlannedGrossMarginAtNegativeOperation",
        actual_or_forcast_gross_margin_at_nagative_operation as "ActualOrForecastGrossMarginAtNegativeOperation",
        planned_nagivative_operating_hours as "PlannedNegativeOperatingHours",
        actual_or_forcast_nagivative_operating_hours as "ActualOrForecastNegativeOperatingHours",
        planned_spread_at_nagative_operation as "PlannedSpreadAtNegativeOperation",
        actual_or_forcast_spread_at_nagative_operation as "ActualOrForecastSpreadAtNegativeOperation"
FROM %tableName% ktst
 WHERE ktst.plant_code = :1
AND ktst.fiscal_year = :3
`
