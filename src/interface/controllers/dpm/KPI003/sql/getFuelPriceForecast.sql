SELECT
  PLANT_CODE,
  FISCAL_YEAR,
  `VALUE`
FROM
  t_fuel_price_forecast
WHERE
  PLANT_CODE = :plantId AND
  %startFiscalYearFilter% AND
  VALUE IS NOT NULL AND
  %endFiscalYearFilter% AND
  fiscal_year > :currentFiscalYear