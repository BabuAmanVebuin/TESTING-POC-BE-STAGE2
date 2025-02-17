SELECT
  UNIT_CODE as `unit-id`,
  thermal_efficiency_decrease as `thermal-efficiency-decrease`
FROM
  m_unitmaster 
WHERE
  UNIT_CODE IN (:unitList)