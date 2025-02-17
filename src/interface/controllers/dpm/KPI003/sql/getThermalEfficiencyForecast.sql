SELECT *
FROM
  t_thermal_efficiency_forecast
WHERE
  PLANT_CODE = :plantId AND
  %unitIdFilter% AND
  %startFiscalYearFilter% AND
  %endFiscalYearFilter% AND
  fiscal_year > :currentFiscalYear