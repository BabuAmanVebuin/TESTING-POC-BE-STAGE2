SELECT
  PLANT_CODE,
  FISCAL_YEAR,
  SUM((IFNULL(`VALUE`, 0) + IFNULL(CORRECTION_VALUE, 0))) as VALUE
FROM
  t_generation_output_forecast
WHERE
  PLANT_CODE = :plantId AND
  %startFiscalYearFilter% AND
  %endFiscalYearFilter% AND
  fiscal_year > :currentFiscalYear AND
  (`VALUE` is not null || CORRECTION_VALUE is not null)
GROUP BY PLANT_CODE, FISCAL_YEAR