INSERT INTO t_thermal_efficiency_forecast
  (PLANT_CODE, UNIT_CODE, FISCAL_YEAR, CORRECTION_VALUE, CREATED_DATETIME, UPDATED_DATETIME, CREATE_BY, UPDATE_BY)
VALUES
  ('HE_', 'HE_A100', :fiscalYear1, 20, '2022-11-15 09:00:00', '2022-11-15 09:00:00', 'person@email.com', 'person@email.com'),
  ('HE_', 'HE_A100', :fiscalYear2, 5, '2022-11-15 09:00:00', '2022-11-15 09:00:00', 'person@email.com', 'person@email.com'),
  ('HE_', 'HE_520', :fiscalYear3, 10, '2022-11-15 09:00:00', '2022-11-15 09:00:00', 'person@email.com', 'person@email.com'),
  ('HE_', 'HE_A200', :fiscalYear1, 55.5, '2022-11-15 09:00:00', '2022-11-15 09:00:00', 'person@email.com', 'person@email.com')

