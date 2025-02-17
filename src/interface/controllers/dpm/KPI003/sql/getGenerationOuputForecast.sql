SELECT
  PLANT_CODE,
  UNIT_CODE,
  FISCAL_YEAR,
  `VALUE`,
  CORRECTION_VALUE,
  (IFNULL(`VALUE`, 0) + IFNULL(CORRECTION_VALUE, 0)) AS SUM
FROM
  t_generation_output_forecast
WHERE
  PLANT_CODE = :plantId AND
  %unitIdFilter% AND
  %startFiscalYearFilter% AND
  %endFiscalYearFilter% AND
  fiscal_year > :currentFiscalYear AND
  (`VALUE` is not null || CORRECTION_VALUE is not null)