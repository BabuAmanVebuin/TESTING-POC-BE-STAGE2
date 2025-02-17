SELECT
  cr.FISCAL_YEAR as FISCAL_YEAR,
  cr.PLANT_CODE as PLANT_CODE,
  cr.UNIT_CODE as UNIT_CODE,
  cr.VALUE as VALUE
FROM (
  SELECT
    c.FORECAST_CATEGORY as FORECAST_CATEGORY,
    k.FISCAL_YEAR as FISCAL_YEAR,
    k.PLANT_CODE as PLANT_CODE,
    c.UNIT_CODE as UNIT_CODE,
    c.MEASURE as MEASURE,
    c.VALUE as VALUE,
    ROW_NUMBER() OVER (PARTITION BY c.UNIT_CODE, k.FISCAL_YEAR order by c.start_datetime desc) as ROW_NUMBER
  FROM rfz_ope_and_mte.t_kpi003_unit_wise_actual_or_forecast_subcache c
  INNER JOIN rfz_ope_and_mte.t_kpi_facts k ON c.start_datetime=k.MONTH AND c.UNIT_CODE = k.UNIT_CODE AND k.FISCAL_YEAR <= :1
  WHERE
    c.GRANULARITY='MONTH_CUMULATIVE'
    AND k.PLANT_CODE = :2
    AND c.MEASURE = 'GrossMargin'
) cr
WHERE 
  cr.ROW_NUMBER = 1
  AND %unitIdFilter%
  AND %startFiscalYearFilter%
  AND %endFiscalYearFilter%
;