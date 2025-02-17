SELECT
  UNIT_CODE as `unit-id`,
  fuel_unit_calorific_value as `fuel-unit-calorific-value`
FROM
  m_unitmaster 
WHERE
  PLANT_CODE = :plantId