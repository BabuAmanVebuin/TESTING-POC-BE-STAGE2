SELECT
  PLANT_CODE,
  UNIT_CODE,
  FISCAL_YEAR,
  OPERATION_COST,
  MAINTENANCE_COST,
  (IFNULL(OPERATION_COST, 0) + IFNULL(MAINTENANCE_COST, 0)) AS SUM
FROM
  t_opex_forecast
WHERE
  PLANT_CODE = :plantId AND
  %unitIdFilter% AND
  %startFiscalYearFilter% AND
  %endFiscalYearFilter% AND
  fiscal_year > :currentFiscalYear AND
  (OPERATION_COST is not null || MAINTENANCE_COST is not null)