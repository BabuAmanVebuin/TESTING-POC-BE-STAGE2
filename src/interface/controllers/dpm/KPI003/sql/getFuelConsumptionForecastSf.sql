SELECT 
  PLANT_CODE, 
  UNIT_CODE, 
  FISCAL_YEAR, 
  sum(FUEL_CONSUMPTION) as VALUE
FROM rfz_ope_and_mte.t_kpi_facts 
WHERE 
  PLANT_CODE = :1 
  AND FORECAST_CATEGORY = 3 
  AND FISCAL_CATEGORY = 1 
  AND FISCAL_YEAR <= :2 
GROUP BY all
;