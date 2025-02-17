INSERT INTO m_team
(TEAM_ID, TEAM_NAME)
VALUES
(1, 'Team 1');

-- $break$
INSERT INTO m_task_priority
(TASK_PRIORITY_ID, LANG, TASK_PRIORITY_NAME, TASK_PRIORITY_SORT_NUMBER)
VALUES
(1, 'JA', 'Test', 1);

-- $break$
INSERT INTO m_task_status
(TASK_STATUS_ID, LANG, TASK_STATUS_NAME, TASK_STATUS_SORT_NUMBER)
VALUES
(1, 'JA', 'Test Status 1', 1),
(2, 'JA', 'Test Status 2', 2);

-- $break$
INSERT INTO m_event_type
(EVENT_TYPE_ID, EVENT_TYPE_NAME, EVENT_TYPE_SORT_NUMBER)
VALUES
(1, 'Test Eventtype 1', 1),
(2, 'Test Eventtype 2', 2);

-- $break$
INSERT INTO m_task_type
(TASK_TYPE_ID, LANG, TASK_CATEGORY_ID, TASK_TYPE_NAME, TASK_CATEGORY_NAME, TASK_EXECUTION_TIME)
VALUES
(1, 'JA', 1, 'Test Tasktype 1', 'Test Category', '01:00:00');

-- $break$
INSERT INTO m_event_template
(EVENT_TYPE_ID, EVENT_TEMPLATE_ID, TASK_TYPE_ID, TASK_PRIORITY_ID, EVENT_TEMPLATE_SORT_NUMBER)
VALUES
(1, 1, 1, 1, 1);

-- $break$
INSERT INTO m_operation
(OPERATION_ID, OPERATION_NAME, CREATE_TIMESTAMP, UPDATE_TIMESTAMP)
VALUES
(1, 'Operation name', '2022-08-05 11:00:33', '2022-08-05 11:00:33');

-- $break$
INSERT INTO t_operation_event_type
(OPERATION_ID, EVENT_TYPE_ID)
VALUES
(1, 1),
(1, 2);

-- $break$
INSERT INTO m_asset_task_group
(ASSET_TASK_GROUP_ID, ASSET_GROUP_ID, PLANT_ID, TEAM_ID, ASSET_TASK_GROUP_NAME)
VALUES
(1, 'HE_A100', 'HE_', 1, 'Test asset task group name 1');

-- $break$
INSERT INTO m_user_tot
(USER_ID, USER_NAME, PLANT_ID, ASSET_TASK_GROUP_ID, TEAM_ID)
VALUES
('test1@user.com', 'Test User 1', 'HE_', 1, 1);