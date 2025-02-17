SELECT 
  m.PLANT_CODE, 
  g.UNIT_CODE, 
  FISCAL_YEAR, 
  FORECAST as VALUE 
FROM 
  rfz_ope_and_mte.t_kpi003_unit_wise_generationoutput_annual_estimates g 
INNER JOIN rfz_ope_and_mte.m_unitmaster m ON m.UNIT_CODE = g.UNIT_CODE 
AND m.PLANT_CODE = :1 
WHERE 
g.FISCAL_YEAR <= :2
;



