INSERT INTO `m_unitmaster` 
(`UNIT_CODE`, `UNIT_NAME`, `PLANT_CODE`, `PLANT_NAME`, `RATED_OUTPUT`, `PMAJPN_UNIT_ID`, `IOT_UNIT`, `PMAJPN_AREA_ID`, `PMAJPN_PRICE_INDEX_FIXED`, `PMAJPN_PRICE_INDEX_PRELIMINARY`, `PMAJPN_PRICE_INDEX_FORWARD`, `PMAJPN_PRICE_INDEX_FORWARD_SUB`, `PMAJPN_FUEL_CATEGORY`, `SAP_FI_PARTICULARS_PROFIT_CENTRE_PARTIAL_NAME`, `SAP_FI_SLIP_PROFIT_CENTRE_PARTIAL_NAME`, `SAP_PM_WBS_ITEM`, `SAP_PM_WBS_ITEM_DETAILS`, `UNIT_START_DATE`, `CREATE_TIMESTAMP`, `UPDATE_TIMESTAMP`,`PROFIT_START_DATE`,`DISPLAY_ON_DASHBOARD`, `thermal_efficiency_decrease`, `ppa_thermal_efficiency`, `fuel_unit_calorific_value`, `discount_rate`) 
VALUES
('HE_A100', '1号機', 'HE_', '碧南火力発電所', 700, 84116, '33_10', 4, 'JCOAL Fixed', 'JCOAL Preliminary', 'JCOAL Forward', '-', '石炭', '西日本支社 碧南火力発電所', '西支 碧南火力発', '2091', 'A100', '1991-10-18', NULL, '2023-01-12 20:54:01','1991-10-19', 1, 0.17, 54.14, 54670, 2.8), 
('HE_A200', '2号機', 'HE_', '碧南火力発電所', 700, 84117, '33_20', 4, 'JCOAL Fixed', 'JCOAL Preliminary', 'JCOAL Forward', '-', '石炭', '西日本支社 碧南火力発電所', '西支 碧南火力発', '2091', 'A200', '1992-06-12', NULL, '2023-01-12 20:54:01','1992-06-13', 1, 0.17, 54.14, 54670, 2.8), 
('HE_A300', '3号機', 'HE_', '碧南火力発電所', 700, 84118, '33_30', 4, 'JCOAL Fixed', 'JCOAL Preliminary', 'JCOAL Forward', '-', 'LNG', '西日本支社 碧南火力発電所', '西支 碧南火力発', '2091', 'A300', '1993-04-22', NULL, '2023-01-12 20:54:01','1993-04-23', 1, 0.17, 54.14, 54670, 2.8);

-- $break$
INSERT INTO m_type_of_stoppage
(`TYPE_OF_STOPPAGE`, `TYPE_OF_STOPPAGE_TEXT`, `MAJOR_MAINTENANCE_FLAG`)
VALUES
('1A', 'FFF', 1),
('1B', 'FFC', 1);

-- $break$
INSERT INTO t_regular_stoppage
(`STOPPAGE_CODE`, `STATUS`, `ASSET_CODE`, `TYPE_OF_STOPPAGE`, `PLAN_START_DATE`, `PLAN_END_DATE`, `ACTUAL_START_DATE`, `ACTUAL_END_DATE`)
VALUES
('MIG_001', 'CRTD', 'HE_A100', '1A', '2023-08-27', '2023-09-27', '9999-12-31', '9999-12-31'),
('MIG_002', 'CRTD', 'HE_A200', '1A', '2024-08-27', '2024-09-27', '9999-12-31', '9999-12-31'),
('MIG_003', 'CRTD', 'HE_A300', '1A', '2024-08-27', '2024-09-27', '9999-12-31', '9999-12-31'),
('MIG_004', 'CRTD', 'HE_A100', '1A', '2024-10-27', '2024-12-27', '9999-12-31', '9999-12-31');

-- $break$
INSERT INTO m_thermal_efficiency_recovery
(`PMAJPN_FUEL_CATEGORY`, `TYPE_OF_STOPPAGE_TEXT`, `THERMAL_EFFICIENCY_RECOVERY`, `CREATE_BY`, `UPDATE_BY`)
VALUES
('石炭', 'FFF', 0.35, 'test user', 'test user'),
('石炭', 'MMH', 0, 'test user', 'test user'),
('LNG', 'FFF', 0.35, 'test user', 'test user'),
('LNG', 'MMC', 0.3, 'test user', 'test user');