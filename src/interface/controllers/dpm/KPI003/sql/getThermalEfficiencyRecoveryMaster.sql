SELECT
  u.UNIT_CODE as `unit-id`,
  r.Thermal_efficiency_recovery as `thermal-efficiency-recovery`,
  r.TYPE_OF_STOPPAGE_TEXT as `type-of-stoppage-text`
FROM
  m_thermal_efficiency_recovery r
INNER JOIN m_unitmaster u ON r.PMAJPN_FUEL_CATEGORY = u.PMAJPN_FUEL_CATEGORY
WHERE
  u.UNIT_CODE IN (:unitList)