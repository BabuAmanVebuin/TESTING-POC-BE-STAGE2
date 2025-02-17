SELECT
  UNIT_CODE as `unit-id`,
  ppa_thermal_efficiency as `ppa-thermal-efficiency`
FROM
  m_unitmaster 
WHERE
  PLANT_CODE = :plantId AND
  %unitIdFilter%