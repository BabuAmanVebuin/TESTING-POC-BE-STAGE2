SELECT
  PLANT_CODE,
  UNIT_CODE,
  FISCAL_YEAR,
  OPERATION_INPUT,
  MAINTENANCE_INPUT,
  (IFNULL(OPERATION_INPUT, 0) + IFNULL(MAINTENANCE_INPUT, 0)) AS SUM
FROM
  t_basic_charge_forecast
WHERE
  PLANT_CODE = :plantId AND
  %unitIdFilter% AND
  %startFiscalYearFilter% AND
  %endFiscalYearFilter% AND
  fiscal_year > :currentFiscalYear AND
  (OPERATION_INPUT is not null || MAINTENANCE_INPUT is not null)