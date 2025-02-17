INSERT INTO
    m_team (TEAM_ID, TEAM_NAME)
VALUES
    (1, 'Team 1');

-- $break$
INSERT INTO
    m_asset_task_group (ASSET_TASK_GROUP_ID, ASSET_GROUP_ID, PLANT_ID, TEAM_ID, ASSET_TASK_GROUP_NAME)
VALUES
    (1, 'HE_A100', 'HE_', 1, 'Asset task group 1');

-- $break$
INSERT INTO
    m_user_tot (USER_ID, USER_NAME, PLANT_ID, ASSET_TASK_GROUP_ID, TEAM_ID)
VALUES
    ('test@user.com', 'Test User', 'HE_', 1, 1);