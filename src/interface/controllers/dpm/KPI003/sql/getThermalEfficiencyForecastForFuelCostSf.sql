SELECT 
  m.PLANT_CODE, 
  t.UNIT_CODE, 
  FISCAL_YEAR, 
  FORECAST as VALUE 
FROM rfz_ope_and_mte.t_kpi003_unit_wise_thermalefficiency_annual_estimates t INNER JOIN rfz_ope_and_mte.m_unitmaster m ON m.UNIT_CODE = t.UNIT_CODE 
AND m.PLANT_CODE = :1 
WHERE 
  t.FISCAL_YEAR <= :2
;


