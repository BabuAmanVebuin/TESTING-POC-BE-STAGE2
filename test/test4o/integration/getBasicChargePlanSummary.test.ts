import express from 'express';
import { expect } from 'chai';
import request from 'supertest';
import { Transaction } from 'sequelize';
import { sequelize } from '../../../src/infrastructure/orm/sqlize/index.js';
import { BasicChargeRoutes } from '../../../src/infrastructure/webserver/express/basicChargeRoutes.js';

const app = express();
BasicChargeRoutes(app);

describe('GET /basic-charge/plan/summary', () => {
  let transaction: Transaction;

  beforeEach(async () => {
    transaction = await sequelize.transaction();
  });

  afterEach(async () => {
    await transaction.rollback();
  });

  it('should return 200 and the correct summary for valid plant-id and fiscal years', async () => {
    // Insert test data
    await sequelize.query(
      `INSERT INTO t_basic_charge_plan (PLANT_CODE, FISCAL_YEAR, OPERATION_INPUT, MAINTENANCE_INPUT) VALUES ('PLANT1', 2021, 100, 200)`,
      { transaction }
    );

    const res = await request(app)
      .get('/basic-charge/plan/summary')
      .query({ 'plant-id': 'PLANT1', 'start-fiscal-year': 2020, 'end-fiscal-year': 2022 })
      .expect(200);

    expect(res.body).to.deep.equal({
      code: 200,
      body: [
        {
          'plant-id': 'PLANT1',
          'fiscal-year': 2021,
          value: 300,
        },
      ],
    });
  });

  it('should return 200 and an empty array if no data matches the query', async () => {
    const res = await request(app)
      .get('/basic-charge/plan/summary')
      .query({ 'plant-id': 'PLANT2', 'start-fiscal-year': 2020, 'end-fiscal-year': 2022 })
      .expect(200);

    expect(res.body).to.deep.equal({
      code: 200,
      body: [],
    });
  });

  it('should return 400 if plant-id is missing', async () => {
    const res = await request(app)
      .get('/basic-charge/plan/summary')
      .query({ 'start-fiscal-year': 2020, 'end-fiscal-year': 2022 })
      .expect(400);

    expect(res.body).to.have.property('error');
  });

  it('should return 400 if start-fiscal-year is not a number', async () => {
    const res = await request(app)
      .get('/basic-charge/plan/summary')
      .query({ 'plant-id': 'PLANT1', 'start-fiscal-year': 'abc', 'end-fiscal-year': 2022 })
      .expect(400);

    expect(res.body).to.have.property('error');
  });

  it('should return 400 if end-fiscal-year is not a number', async () => {
    const res = await request(app)
      .get('/basic-charge/plan/summary')
      .query({ 'plant-id': 'PLANT1', 'start-fiscal-year': 2020, 'end-fiscal-year': 'xyz' })
      .expect(400);

    expect(res.body).to.have.property('error');
  });

  it('should return 200 and handle large data sets efficiently', async () => {
    for (let i = 0; i < 1000; i++) {
      await sequelize.query(
        `INSERT INTO t_basic_charge_plan (PLANT_CODE, FISCAL_YEAR, OPERATION_INPUT, MAINTENANCE_INPUT) VALUES ('PLANT1', 2021, 100, 200)`,
        { transaction }
      );
    }

    const res = await request(app)
      .get('/basic-charge/plan/summary')
      .query({ 'plant-id': 'PLANT1', 'start-fiscal-year': 2020, 'end-fiscal-year': 2022 })
      .expect(200);

    expect(res.body.code).to.equal(200);
    expect(res.body.body).to.have.length(1);
    expect(res.body.body[0].value).to.equal(300000);
  });

  it('should return 200 and handle boundary fiscal years correctly', async () => {
    await sequelize.query(
      `INSERT INTO t_basic_charge_plan (PLANT_CODE, FISCAL_YEAR, OPERATION_INPUT, MAINTENANCE_INPUT) VALUES ('PLANT1', 2020, 100, 200)`,
      { transaction }
    );

    const res = await request(app)
      .get('/basic-charge/plan/summary')
      .query({ 'plant-id': 'PLANT1', 'start-fiscal-year': 2020, 'end-fiscal-year': 2020 })
      .expect(200);

    expect(res.body).to.deep.equal({
      code: 200,
      body: [
        {
          'plant-id': 'PLANT1',
          'fiscal-year': 2020,
          value: 300,
        },
      ],
    });
  });

  it('should return 200 and handle no fiscal year filters', async () => {
    await sequelize.query(
      `INSERT INTO t_basic_charge_plan (PLANT_CODE, FISCAL_YEAR, OPERATION_INPUT, MAINTENANCE_INPUT) VALUES ('PLANT1', 2021, 100, 200)`,
      { transaction }
    );

    const res = await request(app)
      .get('/basic-charge/plan/summary')
      .query({ 'plant-id': 'PLANT1' })
      .expect(200);

    expect(res.body.code).to.equal(200);
    expect(res.body.body).to.have.length(1);
  });

  it('should return 200 and handle multiple fiscal years', async () => {
    await sequelize.query(
      `INSERT INTO t_basic_charge_plan (PLANT_CODE, FISCAL_YEAR, OPERATION_INPUT, MAINTENANCE_INPUT) VALUES ('PLANT1', 2021, 100, 200)`,
      { transaction }
    );
    await sequelize.query(
      `INSERT INTO t_basic_charge_plan (PLANT_CODE, FISCAL_YEAR, OPERATION_INPUT, MAINTENANCE_INPUT) VALUES ('PLANT1', 2022, 150, 250)`,
      { transaction }
    );

    const res = await request(app)
      .get('/basic-charge/plan/summary')
      .query({ 'plant-id': 'PLANT1', 'start-fiscal-year': 2020, 'end-fiscal-year': 2023 })
      .expect(200);

    expect(res.body.code).to.equal(200);
    expect(res.body.body).to.have.length(2);
  });

  it('should return 200 and handle missing operation and maintenance inputs', async () => {
    await sequelize.query(
      `INSERT INTO t_basic_charge_plan (PLANT_CODE, FISCAL_YEAR) VALUES ('PLANT1', 2021)`,
      { transaction }
    );

    const res = await request(app)
      .get('/basic-charge/plan/summary')
      .query({ 'plant-id': 'PLANT1', 'start-fiscal-year': 2020, 'end-fiscal-year': 2022 })
      .expect(200);

    expect(res.body.code).to.equal(200);
    expect(res.body.body).to.have.length(0);
  });

  it('should return 200 and handle zero operation and maintenance inputs', async () => {
    await sequelize.query(
      `INSERT INTO t_basic_charge_plan (PLANT_CODE, FISCAL_YEAR, OPERATION_INPUT, MAINTENANCE_INPUT) VALUES ('PLANT1', 2021, 0, 0)`,
      { transaction }
    );

    const res = await request(app)
      .get('/basic-charge/plan/summary')
      .query({ 'plant-id': 'PLANT1', 'start-fiscal-year': 2020, 'end-fiscal-year': 2022 })
      .expect(200);

    expect(res.body).to.deep.equal({
      code: 200,
      body: [
        {
          'plant-id': 'PLANT1',
          'fiscal-year': 2021,
          value: 0,
        },
      ],
    });
  });

  it('should return 200 and handle negative operation and maintenance inputs', async () => {
    await sequelize.query(
      `INSERT INTO t_basic_charge_plan (PLANT_CODE, FISCAL_YEAR, OPERATION_INPUT, MAINTENANCE_INPUT) VALUES ('PLANT1', 2021, -100, -200)`,
      { transaction }
    );

    const res = await request(app)
      .get('/basic-charge/plan/summary')
      .query({ 'plant-id': 'PLANT1', 'start-fiscal-year': 2020, 'end-fiscal-year': 2022 })
      .expect(200);

    expect(res.body).to.deep.equal({
      code: 200,
      body: [
        {
          'plant-id': 'PLANT1',
          'fiscal-year': 2021,
          value: -300,
        },
      ],
    });
  });

  it('should return 200 and handle large operation and maintenance inputs', async () => {
    await sequelize.query(
      `INSERT INTO t_basic_charge_plan (PLANT_CODE, FISCAL_YEAR, OPERATION_INPUT, MAINTENANCE_INPUT) VALUES ('PLANT1', 2021, 1000000, 2000000)`,
      { transaction }
    );

    const res = await request(app)
      .get('/basic-charge/plan/summary')
      .query({ 'plant-id': 'PLANT1', 'start-fiscal-year': 2020, 'end-fiscal-year': 2022 })
      .expect(200);

    expect(res.body).to.deep.equal({
      code: 200,
      body: [
        {
          'plant-id': 'PLANT1',
          'fiscal-year': 2021,
          value: 3000000,
        },
      ],
    });
  });

  it('should return 200 and handle multiple plants', async () => {
    await sequelize.query(
      `INSERT INTO t_basic_charge_plan (PLANT_CODE, FISCAL_YEAR, OPERATION_INPUT, MAINTENANCE_INPUT) VALUES ('PLANT1', 2021, 100, 200)`,
      { transaction }
    );
    await sequelize.query(
      `INSERT INTO t_basic_charge_plan (PLANT_CODE, FISCAL_YEAR, OPERATION_INPUT, MAINTENANCE_INPUT) VALUES ('PLANT2', 2021, 150, 250)`,
      { transaction }
    );

    const res = await request(app)
      .get('/basic-charge/plan/summary')
      .query({ 'plant-id': 'PLANT1', 'start-fiscal-year': 2020, 'end-fiscal-year': 2022 })
      .expect(200);

    expect(res.body).to.deep.equal({
      code: 200,
      body: [
        {
          'plant-id': 'PLANT1',
          'fiscal-year': 2021,
          value: 300,
        },
      ],
    });
  });

  it('should return 200 and handle overlapping fiscal years', async () => {
    await sequelize.query(
      `INSERT INTO t_basic_charge_plan (PLANT_CODE, FISCAL_YEAR, OPERATION_INPUT, MAINTENANCE_INPUT) VALUES ('PLANT1', 2021, 100, 200)`,
      { transaction }
    );
    await sequelize.query(
      `INSERT INTO t_basic_charge_plan (PLANT_CODE, FISCAL_YEAR, OPERATION_INPUT, MAINTENANCE_INPUT) VALUES ('PLANT1', 2022, 150, 250)`,
      { transaction }
    );

    const res = await request(app)
      .get('/basic-charge/plan/summary')
      .query({ 'plant-id': 'PLANT1', 'start-fiscal-year': 2021, 'end-fiscal-year': 2021 })
      .expect(200);

    expect(res.body).to.deep.equal({
      code: 200,
      body: [
        {
          'plant-id': 'PLANT1',
          'fiscal-year': 2021,
          value: 300,
        },
      ],
    });
  });

  it('should return 200 and handle fiscal year as a string', async () => {
    await sequelize.query(
      `INSERT INTO t_basic_charge_plan (PLANT_CODE, FISCAL_YEAR, OPERATION_INPUT, MAINTENANCE_INPUT) VALUES ('PLANT1', 2021, 100, 200)`,
      { transaction }
    );

    const res = await request(app)
      .get('/basic-charge/plan/summary')
      .query({ 'plant-id': 'PLANT1', 'start-fiscal-year': '2020', 'end-fiscal-year': '2022' })
      .expect(200);

    expect(res.body).to.deep.equal({
      code: 200,
      body: [
        {
          'plant-id': 'PLANT1',
          'fiscal-year': 2021,
          value: 300,
        },
      ],
    });
  });

  it('should return 200 and handle fiscal year as a float', async () => {
    await sequelize.query(
      `INSERT INTO t_basic_charge_plan (PLANT_CODE, FISCAL_YEAR, OPERATION_INPUT, MAINTENANCE_INPUT) VALUES ('PLANT1', 2021, 100, 200)`,
      { transaction }
    );

    const res = await request(app)
      .get('/basic-charge/plan/summary')
      .query({ 'plant-id': 'PLANT1', 'start-fiscal-year': 2020.5, 'end-fiscal-year': 2022.5 })
      .expect(200);

    expect(res.body).to.deep.equal({
      code: 200,
      body: [
        {
          'plant-id': 'PLANT1',
          'fiscal-year': 2021,
          value: 300,
        },
      ],
    });
  });

  it('should return 200 and handle fiscal year as a negative number', async () => {
    await sequelize.query(
      `INSERT INTO t_basic_charge_plan (PLANT_CODE, FISCAL_YEAR, OPERATION_INPUT, MAINTENANCE_INPUT) VALUES ('PLANT1', -2021, 100, 200)`,
      { transaction }
    );

    const res = await request(app)
      .get('/basic-charge/plan/summary')
      .query({ 'plant-id': 'PLANT1', 'start-fiscal-year': -2022, 'end-fiscal-year': -2020 })
      .expect(200);

    expect(res.body).to.deep.equal({
      code: 200,
      body: [
        {
          'plant-id': 'PLANT1',
          'fiscal-year': -2021,
          value: 300,
        },
      ],
    });
  });

  it('should return 200 and handle fiscal year as zero', async () => {
    await sequelize.query(
      `INSERT INTO t_basic_charge_plan (PLANT_CODE, FISCAL_YEAR, OPERATION_INPUT, MAINTENANCE_INPUT) VALUES ('PLANT1', 0, 100, 200)`,
      { transaction }
    );

    const res = await request(app)
      .get('/basic-charge/plan/summary')
      .query({ 'plant-id': 'PLANT1', 'start-fiscal-year': -1, 'end-fiscal-year': 1 })
      .expect(200);

    expect(res.body).to.deep.equal({
      code: 200,
      body: [
        {
          'plant-id': 'PLANT1',
          'fiscal-year': 0,
          value: 300,
        },
      ],
    });
  });
});