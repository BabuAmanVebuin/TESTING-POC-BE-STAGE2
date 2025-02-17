INSERT INTO
    m_team (TEAM_ID, TEAM_NAME)
VALUES
    (1, 'Team 1'),
    (21, 'Team 2'),
    (56, 'Team 3');

-- $break$
INSERT INTO
    m_asset_task_group (ASSET_TASK_GROUP_ID, ASSET_GROUP_ID, PLANT_ID, TEAM_ID, ASSET_TASK_GROUP_NAME)
VALUES
    (1, 'HE_A100', 'HE_', 1, 'Asset task group 1'),
    (6, 'XX_AXXX', 'XX_', 21, 'Asset task group 2'),
    (38, 'XX_AXXX', 'XX_', 56, 'Asset task group 3');

-- $break$
INSERT INTO
    m_user_tot (USER_ID, USER_NAME, PLANT_ID, ASSET_TASK_GROUP_ID, TEAM_ID, LAST_ACTIVE_TIMESTAMP)
VALUES
    ('test1@user.com', 'Test User 1', 'HE_', 1, 1, '2023-06-01 00:00:00'),
    ('test2@user.com', 'Test User 2', 'XX_', 38, 56, '2023-06-01 00:00:00'),
    ('test3@user.com', 'Test User 3', 'XX_', 6, 21, '2023-06-01 00:00:00'),
    ('test4@user.com', 'Test User 4', 'HE_', 1, 1, '9999-01-01 00:00:00');