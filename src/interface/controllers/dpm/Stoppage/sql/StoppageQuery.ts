// Imported from DPM-BE, commit d0e2f45544cc9890762f93cf3e8f224f15efd619
export const GET_STOPPAGE_DATA_QUERY = `
    SELECT 
    plant_id as "PlantCode",
    unit_id as "UnitCode",
    name as "Name",
    fiscally_planned_start_datetime as "PlanStart",
    fiscally_planned_end_datetime as "PlanEnd",
    scheduled_start_datetime as "ForecastStart",
    scheduled_end_datetime as "ForecastEnd",
    actual_start_datetime as "ActualStart",
    actual_end_datetime as "ActualEnd",
    coarse_stoppage_type as "CoarseStoppageType",
    cancelled as "Cancelled"
    from rfz_ope_and_mte.t_stoppage_yearwise_organized WHERE plant_id= :1 and fiscalyear= :2
`
