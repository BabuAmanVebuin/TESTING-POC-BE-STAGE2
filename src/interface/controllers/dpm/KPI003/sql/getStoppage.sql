SELECT
  t.ASSET_CODE as `unit-id`,
  m.TYPE_OF_STOPPAGE_TEXT as `type-of-stoppage-text`,
  t.PLAN_END_DATE as date
FROM
  t_regular_stoppage t
INNER JOIN
  m_type_of_stoppage m ON t.type_of_stoppage = m.type_of_stoppage
WHERE
  t.ASSET_CODE IN (:unitList) AND
  t.PLAN_END_DATE >= :startDate AND
  t.PLAN_END_DATE < :endDate