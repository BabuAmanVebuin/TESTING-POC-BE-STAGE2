INSERT INTO
    t_opex_forecast (PLANT_CODE,  UNIT_CODE,  FISCAL_YEAR,  OPERATION_COST,  MAINTENANCE_COST,  CREATED_DATETIME,  UPDATED_DATETIME,  CREATE_BY,  UPDATE_BY)
VALUES
    ('BB_', 'BB_100', :fiscalYear1, 0.00, 0.00, '2022-11-15 09:00:00', '2022-11-15 09:00:00', 'person@email.com', 'person@email.com'), 
    ('BB_', 'BB_110', :fiscalYear1, 30.00, 10.00, '2022-11-15 09:00:00', '2022-11-15 09:00:00', 'person@email.com', 'person@email.com'), 
    ('BB_', 'BB_120', :fiscalYear1, 40.00, 10.00, '2022-11-15 09:00:00', '2022-11-15 09:00:00', 'person@email.com', 'person@email.com'), 
    ('BB_', 'BB_130', :fiscalYear1, 0.00, 10.00, '2022-11-15 09:00:00', '2022-11-15 09:00:00', 'person@email.com', 'person@email.com'), 
    ('BB_', 'BB_140', :fiscalYear2, 10.00, 25.00, '2022-11-15 09:00:00', '2022-11-15 09:00:00', 'person@email.com', 'person@email.com'), 
    ('BB_', 'BB_150', :fiscalYear2, 0.00, 15.00, '2022-11-15 09:00:00', '2022-11-15 09:00:00', 'person@email.com', 'person@email.com'), 
    ('BE_', 'BE_150', :fiscalYear3, null, 12.00, '2022-11-15 09:00:00', '2022-11-15 09:00:00', 'person@email.com', 'person@email.com'), 
    ('BB_', 'BE_180', :fiscalYear3, 10.00, 12.00, '2022-11-15 09:00:00', '2022-11-15 09:00:00', 'person@email.com', 'person@email.com'), 
    ('BE_', 'BE_170', :fiscalYear3, 20.00, null, '2022-11-15 09:00:00', '2022-11-15 09:00:00', 'person@email.com', 'person@email.com'), 
    ('DE_', 'DE_150', :fiscalYear3, null, null, '2022-11-15 09:00:00', '2022-11-15 09:00:00', 'person@email.com', 'person@email.com'), 
    ('DE_', 'DE_160', :fiscalYear3, null, null, '2022-11-15 09:00:00', '2022-11-15 09:00:00', 'person@email.com', 'person@email.com'), 
    ('CC_', 'CC_100', :fiscalYear1, null, 10.00, '2022-11-15 09:00:00', '2022-11-15 09:00:00', 'person@email.com', 'person@email.com'), 
    ('DD_', 'DD_100', :fiscalYear1, 0.00, null, '2022-11-15 09:00:00', '2022-11-15 09:00:00', 'person@email.com', 'person@email.com');
