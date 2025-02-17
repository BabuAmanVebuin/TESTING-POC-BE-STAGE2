INSERT INTO t_generation_output_forecast 
  (PLANT_CODE, UNIT_CODE, FISCAL_YEAR, VALUE, CORRECTION_VALUE, CREATED_DATETIME, UPDATED_DATETIME, CREATE_BY, UPDATE_BY)
VALUES
  ('HE_', 'HE_A100', :fiscalYear1, 60, 10, '2022-11-15 09:00:00', '2022-11-15 09:00:00', 'person@email.com', 'person@email.com'),
  ('HE_', 'HE_A100', :fiscalYear2, 25, 30, '2022-11-15 09:00:00', '2022-11-15 09:00:00', 'person@email.com', 'person@email.com'),
  ('HE_', 'HE_A100', :fiscalYear3, 40, 10, '2022-11-15 09:00:00', '2022-11-15 09:00:00', 'person@email.com', 'person@email.com'),
  ('HE_', 'HE_A200', :fiscalYear1, 70, 15, '2022-11-15 09:00:00', '2022-11-15 09:00:00', 'person@email.com', 'person@email.com'),
  ('HE_', 'HE_A200', :fiscalYear2, 20, 10, '2022-11-15 09:00:00', '2022-11-15 09:00:00', 'person@email.com', 'person@email.com'),
  ('HE_', 'HE_A200', :fiscalYear3, 35, 10, '2022-11-15 09:00:00', '2022-11-15 09:00:00', 'person@email.com', 'person@email.com'),
  ('HE_', 'HE_A300', :fiscalYear1, 45, 20, '2022-11-15 09:00:00', '2022-11-15 09:00:00', 'person@email.com', 'person@email.com'),
  ('HE_', 'HE_A300', :fiscalYear2, 70, 10, '2022-11-15 09:00:00', '2022-11-15 09:00:00', 'person@email.com', 'person@email.com'),
  ('HE_', 'HE_A300', :fiscalYear3, 20, 40, '2022-11-15 09:00:00', '2022-11-15 09:00:00', 'person@email.com', 'person@email.com');
