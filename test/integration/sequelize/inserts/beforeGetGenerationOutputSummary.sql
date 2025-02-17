INSERT INTO
    t_generation_output_plan (
        PLANT_CODE,
        UNIT_CODE,
        FISCAL_YEAR,
        VALUE,
        CORRECTION_VALUE,
        CREATED_DATETIME,
        UPDATED_DATETIME,
        CREATE_BY,
        UPDATE_BY
    )
VALUES
    (
        'AA_',
        'AA_200',
        2030,
        50,
        30,
        '2022-11-15 09:00:00',
        '2022-11-15 09:00:00',
        'person@email.com',
        'person@email.com'
    );
-- $break$
INSERT INTO
    t_generation_output_plan (
        PLANT_CODE,
        UNIT_CODE,
        FISCAL_YEAR,
        VALUE,
        CORRECTION_VALUE,
        CREATED_DATETIME,
        UPDATED_DATETIME,
        CREATE_BY,
        UPDATE_BY
    )
VALUES
    (
        'AA_',
        'AA_100',
        2020,
        0,
        20,
        '2022-11-15 09:00:00',
        '2022-11-15 09:00:00',
        'person@email.com',
        'person@email.com'
    );
-- $break$
INSERT INTO
    t_generation_output_plan (
        PLANT_CODE,
        UNIT_CODE,
        FISCAL_YEAR,
        VALUE,
        CORRECTION_VALUE,
        CREATED_DATETIME,
        UPDATED_DATETIME,
        CREATE_BY,
        UPDATE_BY
    )
VALUES
    (
        'AA_',
        'AA_100',
        2025,
        5,
        10,
        '2022-11-15 09:00:00',
        '2022-11-15 09:00:00',
        'person@email.com',
        'person@email.com'
    );
-- $break$
INSERT INTO
    t_generation_output_plan (
        PLANT_CODE,
        UNIT_CODE,
        FISCAL_YEAR,
        VALUE,
        CORRECTION_VALUE,
        CREATED_DATETIME,
        UPDATED_DATETIME,
        CREATE_BY,
        UPDATE_BY
    )
VALUES
    (
        'BB_',
        'BB_100',
        2035,
        0,
        10,
        '2022-11-15 09:00:00',
        '2022-11-15 09:00:00',
        'person@email.com',
        'person@email.com'
    );
-- $break$
INSERT INTO
    t_generation_output_plan (
        PLANT_CODE,
        UNIT_CODE,
        FISCAL_YEAR,
        VALUE,
        CORRECTION_VALUE,
        CREATED_DATETIME,
        UPDATED_DATETIME,
        CREATE_BY,
        UPDATE_BY
    )
VALUES
    (
        'BB_',
        'BB_100',
        2026,
        0,
        10,
        '2022-11-15 09:00:00',
        '2022-11-15 09:00:00',
        'person@email.com',
        'person@email.com'
    );
-- $break$
INSERT INTO
    t_generation_output_plan (
        PLANT_CODE,
        UNIT_CODE,
        FISCAL_YEAR,
        VALUE,
        CORRECTION_VALUE,
        CREATED_DATETIME,
        UPDATED_DATETIME,
        CREATE_BY,
        UPDATE_BY
    )
VALUES
    (
        'BB_',
        'BB_100',
        2040,
        0,
        10,
        '2022-11-15 09:00:00',
        '2022-11-15 09:00:00',
        'person@email.com',
        'person@email.com'
    );
-- $break$
INSERT INTO
    t_generation_output_plan (
        PLANT_CODE,
        UNIT_CODE,
        FISCAL_YEAR,
        VALUE,
        CORRECTION_VALUE,
        CREATED_DATETIME,
        UPDATED_DATETIME,
        CREATE_BY,
        UPDATE_BY
    )
VALUES
    (
        'BB_',
        'BB_300',
        2030,
        0,
        10,
        '2022-11-15 09:00:00',
        '2022-11-15 09:00:00',
        'person@email.com',
        'person@email.com'
    );
-- $break$
INSERT INTO
    t_generation_output_forecast (
        PLANT_CODE,
        UNIT_CODE,
        FISCAL_YEAR,
        VALUE,
        CORRECTION_VALUE,
        CREATED_DATETIME,
        UPDATED_DATETIME,
        CREATE_BY,
        UPDATE_BY
    )
VALUES
    (
        'AA_',
        'AA_300',
        :fiscalYear1,
        0,
        10,
        '2022-11-15 09:00:00',
        '2022-11-15 09:00:00',
        'person@email.com',
        'person@email.com'
    );
-- $break$
INSERT INTO
    t_generation_output_forecast (
        PLANT_CODE,
        UNIT_CODE,
        FISCAL_YEAR,
        VALUE,
        CORRECTION_VALUE,
        CREATED_DATETIME,
        UPDATED_DATETIME,
        CREATE_BY,
        UPDATE_BY
    )
VALUES
    (
        'AA_',
        'AA_300',
        :fiscalYear2,
        10,
        20,
        '2022-11-15 09:00:00',
        '2022-11-15 09:00:00',
        'person@email.com',
        'person@email.com'
    );    
-- $break$
INSERT INTO
    t_generation_output_forecast (
        PLANT_CODE,
        UNIT_CODE,
        FISCAL_YEAR,
        VALUE,
        CORRECTION_VALUE,
        CREATED_DATETIME,
        UPDATED_DATETIME,
        CREATE_BY,
        UPDATE_BY
    )
VALUES
    (
        'FF_',
        'FF_300',
        :fiscalYear3,
        null,
        null,
        '2022-11-15 09:00:00',
        '2022-11-15 09:00:00',
        'person@email.com',
        'person@email.com'
    );        
-- $break$
INSERT INTO
    t_generation_output_plan (
        PLANT_CODE,
        UNIT_CODE,
        FISCAL_YEAR,
        VALUE,
        CORRECTION_VALUE,
        CREATED_DATETIME,
        UPDATED_DATETIME,
        CREATE_BY,
        UPDATE_BY
    )
VALUES
    (
        'FF_',
        'FF_300',
        2030,
        null,
        null,
        '2022-11-15 09:00:00',
        '2022-11-15 09:00:00',
        'person@email.com',
        'person@email.com'
    );      