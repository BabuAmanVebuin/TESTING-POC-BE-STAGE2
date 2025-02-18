import express from 'express';
import { expect } from 'chai';
import request from 'supertest';
import { Transaction } from 'sequelize';
import { sequelize } from '../../../src/infrastructure/orm/sqlize';
import { BasicChargeRoutes } from '../../../src/infrastructure/webserver/express/routes';

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

  it('should return 200 and an empty array when no data is available', async () => {
    const res = await request(app)
      .get('/basic-charge/plan/summary')
      .query({ 'plant-id': 'PLANT1' })
      .expect(200);

    expect(res.body).to.have.property('code', 200);
    expect(res.body).to.have.property('body').that.is.an('array').that.is.empty;
  });

  it('should return 200 and data for a specific plant-id', async () => {
    await sequelize.query(
      `INSERT INTO t_basic_charge_plan (PLANT_CODE, FISCAL_YEAR, OPERATION_INPUT, MAINTENANCE_INPUT) VALUES ('PLANT1', 2023, 100, 200)`,
      { transaction }
    );

    const res = await request(app)
      .get('/basic-charge/plan/summary')
      .query({ 'plant-id': 'PLANT1' })
      .expect(200);

    expect(res.body).to.have.property('code', 200);
    expect(res.body.body).to.be.an('array').that.has.lengthOf(1);
    expect(res.body.body[0]).to.include({ 'plant-id': 'PLANT1', 'fiscal-year': 2023, value: 300 });
  });

  it('should return 200 and filter data by start-fiscal-year', async () => {
    await sequelize.query(
      `INSERT INTO t_basic_charge_plan (PLANT_CODE, FISCAL_YEAR, OPERATION_INPUT, MAINTENANCE_INPUT) VALUES ('PLANT1', 2022, 100, 200), ('PLANT1', 2023, 150, 250)`,
      { transaction }
    );

    const res = await request(app)
      .get('/basic-charge/plan/summary')
      .query({ 'plant-id': 'PLANT1', 'start-fiscal-year': 2023 })
      .expect(200);

    expect(res.body).to.have.property('code', 200);
    expect(res.body.body).to.be.an('array').that.has.lengthOf(1);
    expect(res.body.body[0]).to.include({ 'plant-id': 'PLANT1', 'fiscal-year': 2023, value: 400 });
  });

  it('should return 200 and filter data by end-fiscal-year', async () => {
    await sequelize.query(
      `INSERT INTO t_basic_charge_plan (PLANT_CODE, FISCAL_YEAR, OPERATION_INPUT, MAINTENANCE_INPUT) VALUES ('PLANT1', 2022, 100, 200), ('PLANT1', 2023, 150, 250)`,
      { transaction }
    );

    const res = await request(app)
      .get('/basic-charge/plan/summary')
      .query({ 'plant-id': 'PLANT1', 'end-fiscal-year': 2022 })
      .expect(200);

    expect(res.body).to.have.property('code', 200);
    expect(res.body.body).to.be.an('array').that.has.lengthOf(1);
    expect(res.body.body[0]).to.include({ 'plant-id': 'PLANT1', 'fiscal-year': 2022, value: 300 });
  });

  it('should return 200 and filter data by start and end fiscal years', async () => {
    await sequelize.query(
      `INSERT INTO t_basic_charge_plan (PLANT_CODE, FISCAL_YEAR, OPERATION_INPUT, MAINTENANCE_INPUT) VALUES ('PLANT1', 2021, 100, 200), ('PLANT1', 2022, 150, 250), ('PLANT1', 2023, 200, 300)`,
      { transaction }
    );

    const res = await request(app)
      .get('/basic-charge/plan/summary')
      .query({ 'plant-id': 'PLANT1', 'start-fiscal-year': 2022, 'end-fiscal-year': 2023 })
      .expect(200);

    expect(res.body).to.have.property('code', 200);
    expect(res.body.body).to.be.an('array').that.has.lengthOf(2);
    expect(res.body.body).to.deep.include.members([
      { 'plant-id': 'PLANT1', 'fiscal-year': 2022, value: 400 },
      { 'plant-id': 'PLANT1', 'fiscal-year': 2023, value: 500 },
    ]);
  });

  it('should return 400 if plant-id is missing', async () => {
    const res = await request(app)
      .get('/basic-charge/plan/summary')
      .expect(400);

    expect(res.body).to.have.property('code', 400);
    expect(res.body).to.have.property('message').that.includes('plant-id is required');
  });

  it('should return 400 if start-fiscal-year is not a number', async () => {
    const res = await request(app)
      .get('/basic-charge/plan/summary')
      .query({ 'plant-id': 'PLANT1', 'start-fiscal-year': 'invalid' })
      .expect(400);

    expect(res.body).to.have.property('code', 400);
    expect(res.body).to.have.property('message').that.includes('start-fiscal-year must be a number');
  });

  it('should return 400 if end-fiscal-year is not a number', async () => {
    const res = await request(app)
      .get('/basic-charge/plan/summary')
      .query({ 'plant-id': 'PLANT1', 'end-fiscal-year': 'invalid' })
      .expect(400);

    expect(res.body).to.have.property('code', 400);
    expect(res.body).to.have.property('message').that.includes('end-fiscal-year must be a number');
  });

  it('should return 200 and handle large datasets efficiently', async () => {
    const values = Array.from({ length: 1000 }, (_, i) => `('PLANT1', ${2020 + i}, 100, 200)`).join(',');
    await sequelize.query(
      `INSERT INTO t_basic_charge_plan (PLANT_CODE, FISCAL_YEAR, OPERATION_INPUT, MAINTENANCE_INPUT) VALUES ${values}`,
      { transaction }
    );

    const res = await request(app)
      .get('/basic-charge/plan/summary')
      .query({ 'plant-id': 'PLANT1' })
      .expect(200);

    expect(res.body).to.have.property('code', 200);
    expect(res.body.body).to.be.an('array').that.has.lengthOf(1000);
  });

  it('should return 200 and handle concurrent requests', async () => {
    await sequelize.query(
      `INSERT INTO t_basic_charge_plan (PLANT_CODE, FISCAL_YEAR, OPERATION_INPUT, MAINTENANCE_INPUT) VALUES ('PLANT1', 2023, 100, 200)`,
      { transaction }
    );

    const requests = Array.from({ length: 10 }, () =>
      request(app)
        .get('/basic-charge/plan/summary')
        .query({ 'plant-id': 'PLANT1' })
        .expect(200)
    );

    const responses = await Promise.all(requests);

    responses.forEach((res) => {
      expect(res.body).to.have.property('code', 200);
      expect(res.body.body).to.be.an('array').that.has.lengthOf(1);
      expect(res.body.body[0]).to.include({ 'plant-id': 'PLANT1', 'fiscal-year': 2023, value: 300 });
    });
  });

  it('should return 200 and handle missing fiscal year data gracefully', async () => {
    await sequelize.query(
      `INSERT INTO t_basic_charge_plan (PLANT_CODE, FISCAL_YEAR, OPERATION_INPUT) VALUES ('PLANT1', 2023, 100)`,
      { transaction }
    );

    const res = await request(app)
      .get('/basic-charge/plan/summary')
      .query({ 'plant-id': 'PLANT1' })
      .expect(200);

    expect(res.body).to.have.property('code', 200);
    expect(res.body.body).to.be.an('array').that.has.lengthOf(1);
    expect(res.body.body[0]).to.include({ 'plant-id': 'PLANT1', 'fiscal-year': 2023, value: 100 });
  });

  it('should return 200 and handle zero values correctly', async () => {
    await sequelize.query(
      `INSERT INTO t_basic_charge_plan (PLANT_CODE, FISCAL_YEAR, OPERATION_INPUT, MAINTENANCE_INPUT) VALUES ('PLANT1', 2023, 0, 0)`,
      { transaction }
    );

    const res = await request(app)
      .get('/basic-charge/plan/summary')
      .query({ 'plant-id': 'PLANT1' })
      .expect(200);

    expect(res.body).to.have.property('code', 200);
    expect(res.body.body).to.be.an('array').that.has.lengthOf(1);
    expect(res.body.body[0]).to.include({ 'plant-id': 'PLANT1', 'fiscal-year': 2023, value: 0 });
  });

  it('should return 200 and handle negative values correctly', async () => {
    await sequelize.query(
      `INSERT INTO t_basic_charge_plan (PLANT_CODE, FISCAL_YEAR, OPERATION_INPUT, MAINTENANCE_INPUT) VALUES ('PLANT1', 2023, -100, -200)`,
      { transaction }
    );

    const res = await request(app)
      .get('/basic-charge/plan/summary')
      .query({ 'plant-id': 'PLANT1' })
      .expect(200);

    expect(res.body).to.have.property('code', 200);
    expect(res.body.body).to.be.an('array').that.has.lengthOf(1);
    expect(res.body.body[0]).to.include({ 'plant-id': 'PLANT1', 'fiscal-year': 2023, value: -300 });
  });

  it('should return 200 and handle multiple plants correctly', async () => {
    await sequelize.query(
      `INSERT INTO t_basic_charge_plan (PLANT_CODE, FISCAL_YEAR, OPERATION_INPUT, MAINTENANCE_INPUT) VALUES ('PLANT1', 2023, 100, 200), ('PLANT2', 2023, 150, 250)`,
      { transaction }
    );

    const res1 = await request(app)
      .get('/basic-charge/plan/summary')
      .query({ 'plant-id': 'PLANT1' })
      .expect(200);

    expect(res1.body).to.have.property('code', 200);
    expect(res1.body.body).to.be.an('array').that.has.lengthOf(1);
    expect(res1.body.body[0]).to.include({ 'plant-id': 'PLANT1', 'fiscal-year': 2023, value: 300 });

    const res2 = await request(app)
      .get('/basic-charge/plan/summary')
      .query({ 'plant-id': 'PLANT2' })
      .expect(200);

    expect(res2.body).to.have.property('code', 200);
    expect(res2.body.body).to.be.an('array').that.has.lengthOf(1);
    expect(res2.body.body[0]).to.include({ 'plant-id': 'PLANT2', 'fiscal-year': 2023, value: 400 });
  });

  it('should return 200 and handle large fiscal year ranges', async () => {
    const values = Array.from({ length: 100 }, (_, i) => `('PLANT1', ${2000 + i}, 100, 200)`).join(',');
    await sequelize.query(
      `INSERT INTO t_basic_charge_plan (PLANT_CODE, FISCAL_YEAR, OPERATION_INPUT, MAINTENANCE_INPUT) VALUES ${values}`,
      { transaction }
    );

    const res = await request(app)
      .get('/basic-charge/plan/summary')
      .query({ 'plant-id': 'PLANT1', 'start-fiscal-year': 2000, 'end-fiscal-year': 2099 })
      .expect(200);

    expect(res.body).to.have.property('code', 200);
    expect(res.body.body).to.be.an('array').that.has.lengthOf(100);
  });

  it('should return 200 and handle overlapping fiscal year ranges', async () => {
    await sequelize.query(
      `INSERT INTO t_basic_charge_plan (PLANT_CODE, FISCAL_YEAR, OPERATION_INPUT, MAINTENANCE_INPUT) VALUES ('PLANT1', 2022, 100, 200), ('PLANT1', 2023, 150, 250)`,
      { transaction }
    );

    const res = await request(app)
      .get('/basic-charge/plan/summary')
      .query({ 'plant-id': 'PLANT1', 'start-fiscal-year': 2022, 'end-fiscal-year': 2023 })
      .expect(200);

    expect(res.body).to.have.property('code', 200);
    expect(res.body.body).to.be.an('array').that.has.lengthOf(2);
    expect(res.body.body).to.deep.include.members([
      { 'plant-id': 'PLANT1', 'fiscal-year': 2022, value: 300 },
      { 'plant-id': 'PLANT1', 'fiscal-year': 2023, value: 400 },
    ]);
  });

  it('should return 200 and handle non-overlapping fiscal year ranges', async () => {
    await sequelize.query(
      `INSERT INTO t_basic_charge_plan (PLANT_CODE, FISCAL_YEAR, OPERATION_INPUT, MAINTENANCE_INPUT) VALUES ('PLANT1', 2022, 100, 200), ('PLANT1', 2023, 150, 250)`,
      { transaction }
    );

    const res = await request(app)
      .get('/basic-charge/plan/summary')
      .query({ 'plant-id': 'PLANT1', 'start-fiscal-year': 2024, 'end-fiscal-year': 2025 })
      .expect(200);

    expect(res.body).to.have.property('code', 200);
    expect(res.body.body).to.be.an('array').that.is.empty;
  });

  it('should return 200 and handle fiscal year range with no data', async () => {
    const res = await request(app)
      .get('/basic-charge/plan/summary')
      .query({ 'plant-id': 'PLANT1', 'start-fiscal-year': 2020, 'end-fiscal-year': 2021 })
      .expect(200);

    expect(res.body).to.have.property('code', 200);
    expect(res.body.body).to.be.an('array').that.is.empty;
  });

  it('should return 200 and handle fiscal year range with partial data', async () => {
    await sequelize.query(
      `INSERT INTO t_basic_charge_plan (PLANT_CODE, FISCAL_YEAR, OPERATION_INPUT, MAINTENANCE_INPUT) VALUES ('PLANT1', 2022, 100, 200)`,
      { transaction }
    );

    const res = await request(app)
      .get('/basic-charge/plan/summary')
      .query({ 'plant-id': 'PLANT1', 'start-fiscal-year': 2021, 'end-fiscal-year': 2023 })
      .expect(200);

    expect(res.body).to.have.property('code', 200);
    expect(res.body.body).to.be.an('array').that.has.lengthOf(1);
    expect(res.body.body[0]).to.include({ 'plant-id': 'PLANT1', 'fiscal-year': 2022, value: 300 });
  });
});