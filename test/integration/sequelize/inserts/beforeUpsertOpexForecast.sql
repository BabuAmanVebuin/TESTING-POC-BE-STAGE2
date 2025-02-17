INSERT INTO
    t_opex_forecast (PLANT_CODE, UNIT_CODE, FISCAL_YEAR, OPERATION_COST, MAINTENANCE_COST, CREATED_DATETIME, UPDATED_DATETIME, CREATE_BY, UPDATE_BY)
VALUES
    ('AA_','AA_100', :fiscalYear1, 0.00, 10.00,'2022-11-15 09:00:00', '2022-11-15 09:00:00', 'person@email.com', 'person@email.com'),
    ('BB_','BB_100', :fiscalYear2, 0.00, 10, '2022-11-15 09:00:00', '2022-11-15 09:00:00', 'person@email.com', 'person@email.com'),
    ('BB_','BB_100', :fiscalYear3, 0.00, 10.00, '2022-11-15 09:00:00', '2022-11-15 09:00:00', 'person@email.com', 'person@email.com'),
    ('BB_','BB_100', :fiscalYear4, 0.00, 10.00,'2022-11-15 09:00:00','2022-11-15 09:00:00', 'person@email.com', 'person@email.com'),
    ('CC_','CC_100', :fiscalYear1, null, 10.00,'2022-11-15 09:00:00', '2022-11-15 09:00:00', 'person@email.com', 'person@email.com'),
    ('DD_','DD_100', :fiscalYear1, 0.00, null, '2022-11-15 09:00:00', '2022-11-15 09:00:00', 'person@email.com', 'person@email.com');
