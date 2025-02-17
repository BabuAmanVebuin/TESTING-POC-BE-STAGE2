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
        'HE_',
        'HE_100',
        YEAR(CURRENT_DATE) + 1,
        0,
        null,
        '2022-11-15 09:00:00',
        '2022-11-15 09:00:00',
        'person@email.com',
        'person@email.com'
    );
