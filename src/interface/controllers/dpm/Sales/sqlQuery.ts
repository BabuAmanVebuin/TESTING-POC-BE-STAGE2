// Imported from DPM-BE, commit d0e2f45544cc9890762f93cf3e8f224f15efd619
export const SALES_UNIT_PRICE_QUERY = `select 																				
tkf.DAY, 										
tkf.FORECAST_CATEGORY,										
Avg(tkf.SALE_UNIT_PRICE) / 1000 as AVG_SALES_UNITPRICE									
from RFZ_OPE_AND_MTE.t_kpi_facts tkf 										
where 										
    tkf.PLANT_CODE = :1								
    and tkf.UNIT_CODE = :2									
    and tkf.FORECAST_CATEGORY = :3								
    and tkf.FISCAL_CATEGORY = :4									
    and %timeFrame%
group by tkf.PLANT_CODE, tkf.UNIT_CODE, tkf.DAY, tkf.FORECAST_CATEGORY ORDER BY tkf.DAY`

export const IS_PLANT_UNIT_EXIST_QUERY = `select
distinct PLANT_CODE, UNIT_CODE from RFZ_OPE_AND_MTE.m_unitmaster
where PLANT_CODE = :1 and UNIT_CODE = :2`
