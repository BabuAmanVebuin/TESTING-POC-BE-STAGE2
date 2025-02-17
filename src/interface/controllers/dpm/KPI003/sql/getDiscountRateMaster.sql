SELECT
  UNIT_CODE,
  DISCOUNT_RATE
FROM
  m_unitmaster 
WHERE
  PLANT_CODE = :plantId AND
  %unitIdFilter%