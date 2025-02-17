SELECT 
    SUM((IFNULL(`VALUE`, 0) + IFNULL(CORRECTION_VALUE, 0))) AS sum
FROM 
t_generation_output_plan
WHERE 
(`VALUE` IS NOT NULL OR 
CORRECTION_VALUE IS NOT NULL ) AND
PLANT_CODE =:plantCode AND
%unitIdFilter% AND
%startFiscalYearFilter% AND
%endFiscalYearFilter% AND
(`VALUE` is not null || CORRECTION_VALUE is not null)