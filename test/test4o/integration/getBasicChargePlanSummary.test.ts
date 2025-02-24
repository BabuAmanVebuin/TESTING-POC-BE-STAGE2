import express from 'express';
import { expect } from 'chai';
import request from 'supertest';
import { sequelize } from '../../../src/orm/sqlize/index.js';
import { BasicChargeRoutes } from '../../../src/interface/routes/dpm/util.js';

const app = express();
BasicChargeRoutes(app);

describe('GET /basic-charge/plan/summary', () => {
  let transaction: any;

  beforeEach(async () => {
    transaction = await sequelize.transaction();
  });

  afterEach(async () => {
    await transaction.rollback();
  });

  it('should return 200 and an empty array when no data is available', async () => {
    const res = await request(app)
      .get('/basic-charge/plan/summary')
      .query({ 'plant-id': 'P001' })
      .expect(200);

    expect(res.body).to.deep.equal([]);
  });

  it('should return 200 and data for a valid plant-id', async () => {
    await sequelize.query(
      `INSERT INTO t_basic_charge_plan (PLANT_CODE, FISCAL_YEAR, OPERATION_INPUT, MAINTENANCE_INPUT) VALUES ('P001', 2023, 100, 200)`,
      { transaction }
    );

    const res = await request(app)
      .get('/basic-charge/plan/summary')
      .query({ 'plant-id': 'P001' })
      .expect(200);

    expect(res.body).to.deep.equal([
      { 'plant-id': 'P001', 'fiscal-year': 2023, value: 300 }
    ]);
  });

  it('should return 400 for missing plant-id', async () => {
    const res = await request(app)
      .get('/basic-charge/plan/summary')
      .expect(400);

    expect(res.body).to.have.property('error');
  });

  it('should return 400 for invalid start-fiscal-year', async () => {
    const res = await request(app)
      .get('/basic-charge/plan/summary')
      .query({ 'plant-id': 'P001', 'start-fiscal-year': 'invalid' })
      .expect(400);

    expect(res.body).to.have.property('error');
  });

  it('should return 400 for invalid end-fiscal-year', async () => {
    const res = await request(app)
      .get('/basic-charge/plan/summary')
      .query({ 'plant-id': 'P001', 'end-fiscal-year': 'invalid' })
      .expect(400);

    expect(res.body).to.have.property('error');
  });

  it('should return 200 and filter data by start-fiscal-year', async () => {
    await sequelize.query(
      `INSERT INTO t_basic_charge_plan (PLANT_CODE, FISCAL_YEAR, OPERATION_INPUT, MAINTENANCE_INPUT) VALUES ('P001', 2022, 100, 200), ('P001', 2023, 150, 250)`,
      { transaction }
    );

    const res = await request(app)
      .get('/basic-charge/plan/summary')
      .query({ 'plant-id': 'P001', 'start-fiscal-year': 2023 })
      .expect(200);

    expect(res.body).to.deep.equal([
      { 'plant-id': 'P001', 'fiscal-year': 2023, value: 400 }
    ]);
  });

  it('should return 200 and filter data by end-fiscal-year', async () => {
    await sequelize.query(
      `INSERT INTO t_basic_charge_plan (PLANT_CODE, FISCAL_YEAR, OPERATION_INPUT, MAINTENANCE_INPUT) VALUES ('P001', 2022, 100, 200), ('P001', 2023, 150, 250)`,
      { transaction }
    );

    const res = await request(app)
      .get('/basic-charge/plan/summary')
      .query({ 'plant-id': 'P001', 'end-fiscal-year': 2022 })
      .expect(200);

    expect(res.body).to.deep.equal([
      { 'plant-id': 'P001', 'fiscal-year': 2022, value: 300 }
    ]);
  });

  it('should return 200 and filter data by start and end fiscal years', async () => {
    await sequelize.query(
      `INSERT INTO t_basic_charge_plan (PLANT_CODE, FISCAL_YEAR, OPERATION_INPUT, MAINTENANCE_INPUT) VALUES ('P001', 2021, 100, 200), ('P001', 2022, 150, 250), ('P001', 2023, 200, 300)`,
      { transaction }
    );

    const res = await request(app)
      .get('/basic-charge/plan/summary')
      .query({ 'plant-id': 'P001', 'start-fiscal-year': 2022, 'end-fiscal-year': 2023 })
      .expect(200);

    expect(res.body).to.deep.equal([
      { 'plant-id': 'P001', 'fiscal-year': 2022, value: 400 },
      { 'plant-id': 'P001', 'fiscal-year': 2023, value: 500 }
    ]);
  });

  it('should return 200 and handle large data sets', async () => {
    for (let i = 0; i < 1000; i++) {
      await sequelize.query(
        `INSERT INTO t_basic_charge_plan (PLANT_CODE, FISCAL_YEAR, OPERATION_INPUT, MAINTENANCE_INPUT) VALUES ('P001', ${2020 + i}, 100, 200)`,
        { transaction }
      );
    }

    const res = await request(app)
      .get('/basic-charge/plan/summary')
      .query({ 'plant-id': 'P001' })
      .expect(200);

    expect(res.body).to.have.length(1000);
  });

  it('should return 200 and handle concurrent requests', async () => {
    await sequelize.query(
      `INSERT INTO t_basic_charge_plan (PLANT_CODE, FISCAL_YEAR, OPERATION_INPUT, MAINTENANCE_INPUT) VALUES ('P001', 2023, 100, 200)`,
      { transaction }
    );

    const requests = Array.from({ length: 10 }, () =>
      request(app)
        .get('/basic-charge/plan/summary')
        .query({ 'plant-id': 'P001' })
        .expect(200)
    );

    const responses = await Promise.all(requests);

    responses.forEach(res => {
      expect(res.body).to.deep.equal([
        { 'plant-id': 'P001', 'fiscal-year': 2023, value: 300 }
      ]);
    });
  });

  it('should return 200 and handle special characters in plant-id', async () => {
    await sequelize.query(
      `INSERT INTO t_basic_charge_plan (PLANT_CODE, FISCAL_YEAR, OPERATION_INPUT, MAINTENANCE_INPUT) VALUES ('P@001', 2023, 100, 200)`,
      { transaction }
    );

    const res = await request(app)
      .get('/basic-charge/plan/summary')
      .query({ 'plant-id': 'P@001' })
      .expect(200);

    expect(res.body).to.deep.equal([
      { 'plant-id': 'P@001', 'fiscal-year': 2023, value: 300 }
    ]);
  });

  it('should return 200 and handle SQL injection attempts', async () => {
    const res = await request(app)
      .get('/basic-charge/plan/summary')
      .query({ 'plant-id': 'P001; DROP TABLE t_basic_charge_plan;' })
      .expect(200);

    expect(res.body).to.deep.equal([]);
  });

  it('should return 200 and handle non-existent plant-id', async () => {
    const res = await request(app)
      .get('/basic-charge/plan/summary')
      .query({ 'plant-id': 'NON_EXISTENT' })
      .expect(200);

    expect(res.body).to.deep.equal([]);
  });

  it('should return 200 and handle large fiscal year range', async () => {
    await sequelize.query(
      `INSERT INTO t_basic_charge_plan (PLANT_CODE, FISCAL_YEAR, OPERATION_INPUT, MAINTENANCE_INPUT) VALUES ('P001', 2020, 100, 200), ('P001', 2030, 150, 250)`,
      { transaction }
    );

    const res = await request(app)
      .get('/basic-charge/plan/summary')
      .query({ 'plant-id': 'P001', 'start-fiscal-year': 2020, 'end-fiscal-year': 2030 })
      .expect(200);

    expect(res.body).to.deep.equal([
      { 'plant-id': 'P001', 'fiscal-year': 2020, value: 300 },
      { 'plant-id': 'P001', 'fiscal-year': 2030, value: 400 }
    ]);
  });

  it('should return 200 and handle overlapping fiscal year ranges', async () => {
    await sequelize.query(
      `INSERT INTO t_basic_charge_plan (PLANT_CODE, FISCAL_YEAR, OPERATION_INPUT, MAINTENANCE_INPUT) VALUES ('P001', 2020, 100, 200), ('P001', 2021, 150, 250)`,
      { transaction }
    );

    const res = await request(app)
      .get('/basic-charge/plan/summary')
      .query({ 'plant-id': 'P001', 'start-fiscal-year': 2020, 'end-fiscal-year': 2021 })
      .expect(200);

    expect(res.body).to.deep.equal([
      { 'plant-id': 'P001', 'fiscal-year': 2020, value: 300 },
      { 'plant-id': 'P001', 'fiscal-year': 2021, value: 400 }
    ]);
  });

  it('should return 200 and handle fiscal year range with no data', async () => {
    const res = await request(app)
      .get('/basic-charge/plan/summary')
      .query({ 'plant-id': 'P001', 'start-fiscal-year': 2025, 'end-fiscal-year': 2030 })
      .expect(200);

    expect(res.body).to.deep.equal([]);
  });

  it('should return 200 and handle multiple plant-ids', async () => {
    await sequelize.query(
      `INSERT INTO t_basic_charge_plan (PLANT_CODE, FISCAL_YEAR, OPERATION_INPUT, MAINTENANCE_INPUT) VALUES ('P001', 2023, 100, 200), ('P002', 2023, 150, 250)`,
      { transaction }
    );

    const res1 = await request(app)
      .get('/basic-charge/plan/summary')
      .query({ 'plant-id': 'P001' })
      .expect(200);

    const res2 = await request(app)
      .get('/basic-charge/plan/summary')
      .query({ 'plant-id': 'P002' })
      .expect(200);

    expect(res1.body).to.deep.equal([
      { 'plant-id': 'P001', 'fiscal-year': 2023, value: 300 }
    ]);

    expect(res2.body).to.deep.equal([
      { 'plant-id': 'P002', 'fiscal-year': 2023, value: 400 }
    ]);
  });

  it('should return 200 and handle missing fiscal year data', async () => {
    await sequelize.query(
      `INSERT INTO t_basic_charge_plan (PLANT_CODE, FISCAL_YEAR, OPERATION_INPUT, MAINTENANCE_INPUT) VALUES ('P001', 2023, NULL, NULL)`,
      { transaction }
    );

    const res = await request(app)
      .get('/basic-charge/plan/summary')
      .query({ 'plant-id': 'P001' })
      .expect(200);

    expect(res.body).to.deep.equal([]);
  });
});