SELECT
  UNIT_CODE,
  ppa_thermal_efficiency as PPA_THERMAL_EFFICIENCY
FROM
  m_unitmaster 
WHERE
  PLANT_CODE = :plantCode