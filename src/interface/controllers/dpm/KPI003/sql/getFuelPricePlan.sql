SELECT
  PLANT_CODE,
  FISCAL_YEAR,
  `VALUE`
FROM
  t_fuel_price_plan
WHERE
  PLANT_CODE = :plantId AND
  %startFiscalYearFilter% AND
  VALUE IS NOT NULL AND
  %endFiscalYearFilter%