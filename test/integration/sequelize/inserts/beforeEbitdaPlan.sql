INSERT INTO t_opex_plan
  (PLANT_CODE, UNIT_CODE, FISCAL_YEAR, OPERATION_COST, MAINTENANCE_COST, CREATED_DATETIME, UPDATED_DATETIME, CREATE_BY, UPDATE_BY)
VALUES
  ('HE_', 'HE_A100', 2024, 10.10, 40.10, '2022-11-15 09:00:00', '2022-11-15 09:00:00', 'person@email.com', 'person@email.com'),
  ('HE_', 'HE_A100', 2025, 20.20, 40.20, '2022-11-15 09:00:00', '2022-11-15 09:00:00', 'person@email.com', 'person@email.com'),
  ('HE_', 'HE_A100', 2026, 10.20, 40.30, '2022-11-15 09:00:00', '2022-11-15 09:00:00', 'person@email.com', 'person@email.com'),
  ('HE_', 'HE_A200', 2024, 10.30, 40.40, '2022-11-15 09:00:00', '2022-11-15 09:00:00', 'person@email.com', 'person@email.com'),
  ('HE_', 'HE_A200', 2025, null, null, '2022-11-15 09:00:00', '2022-11-15 09:00:00', 'person@email.com', 'person@email.com'),
  ('HE_', 'HE_A200', 2026, 10.50, 40.60, '2022-11-15 09:00:00', '2022-11-15 09:00:00', 'person@email.com', 'person@email.com'),
  ('HE_', 'HE_A300', 2024, 10.60, 40.70, '2022-11-15 09:00:00', '2022-11-15 09:00:00', 'person@email.com', 'person@email.com'),
  ('HE_', 'HE_A300', 2025, 10.80, null, '2022-11-15 09:00:00', '2022-11-15 09:00:00', 'person@email.com', 'person@email.com'),
  ('HE_', 'HE_A300', 2026, 10.90, 40.90, '2022-11-15 09:00:00', '2022-11-15 09:00:00', 'person@email.com', 'person@email.com');

-- $break$
INSERT INTO t_basic_charge_plan
  (PLANT_CODE, UNIT_CODE, FISCAL_YEAR, OPERATION_INPUT, MAINTENANCE_INPUT, CREATED_DATETIME, UPDATED_DATETIME, CREATE_BY, UPDATE_BY)
VALUES
  ('HE_', 'HE_A100', 2024, 30.30, 30.30, '2022-11-15 09:00:00', '2022-11-15 09:00:00', 'person@email.com', 'person@email.com'),
  ('HE_', 'HE_A100', 2025, 20.20, 30.20, '2022-11-15 09:00:00', '2022-11-15 09:00:00', 'person@email.com', 'person@email.com'),
  ('HE_', 'HE_A100', 2026, null, 30.30, '2022-11-15 09:00:00', '2022-11-15 09:00:00', 'person@email.com', 'person@email.com'),
  ('HE_', 'HE_A200', 2024, 30.30, 30.40, '2022-11-15 09:00:00', '2022-11-15 09:00:00', 'person@email.com', 'person@email.com'),
  ('HE_', 'HE_A200', 2025, 30.40, 30.50, '2022-11-15 09:00:00', '2022-11-15 09:00:00', 'person@email.com', 'person@email.com'),
  ('HE_', 'HE_A200', 2026, 30.50, 30.60, '2022-11-15 09:00:00', '2022-11-15 09:00:00', 'person@email.com', 'person@email.com'),
  ('HE_', 'HE_A300', 2024, 30.60, 30.70, '2022-11-15 09:00:00', '2022-11-15 09:00:00', 'person@email.com', 'person@email.com'),
  ('HE_', 'HE_A300', 2025, 30.80, 30.80, '2022-11-15 09:00:00', '2022-11-15 09:00:00', 'person@email.com', 'person@email.com'),
  ('HE_', 'HE_A300', 2026, null, null, '2022-11-15 09:00:00', '2022-11-15 09:00:00', 'person@email.com', 'person@email.com');
