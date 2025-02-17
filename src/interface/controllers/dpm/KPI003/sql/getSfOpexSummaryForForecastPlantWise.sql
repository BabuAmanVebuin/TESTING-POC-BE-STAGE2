SELECT
  cr.PLANT_CODE as PLANT_CODE,
  SUM(cr.VALUE) as VALUE
FROM (
  SELECT
    c.FORECAST_CATEGORY as FORECAST_CATEGORY,
    k.FISCAL_YEAR as FISCAL_YEAR,
    k.PLANT_CODE as PLANT_CODE,
    c.MEASURE as MEASURE,
    c.VALUE as VALUE,
    ROW_NUMBER() OVER (PARTITION BY k.FISCAL_YEAR order by c.start_datetime desc) as ROW_NUMBER
  FROM rfz_ope_and_mte.t_kpi003_plant_wise_actual_or_forecast_subcache as c
  INNER JOIN rfz_ope_and_mte.t_kpi_facts k ON c.PLANT_CODE = k.PLANT_CODE AND c.start_datetime=k.MONTH AND k.FISCAL_YEAR <= :1
  WHERE
    c.GRANULARITY='MONTH_CUMULATIVE'
    AND k.PLANT_CODE = :2
    AND c.MEASURE = :3
) cr
WHERE 
  cr.ROW_NUMBER = 1
  AND %startFiscalYearFilter%
  AND %endFiscalYearFilter%
GROUP BY ALL;