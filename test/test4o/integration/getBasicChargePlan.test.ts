import express from 'express';
import { expect } from 'chai';
import request from 'supertest';
import { sequelize } from '../../../src/orm/sqlize/index.js';
import { BasicChargeRoutes } from '../../../src/interface/routes/dpm/BasicChargeRoutes.js';
import { Transaction } from 'sequelize';

const app = express();
BasicChargeRoutes(app);

describe('GET /basic-charge/plan', () => {
  let transaction: Transaction;

  beforeEach(async () => {
    transaction = await sequelize.transaction();
  });

  afterEach(async () => {
    await transaction.rollback();
  });

  it('should return 200 and an empty array when no data is available', async () => {
    const res = await request(app)
      .get('/basic-charge/plan')
      .query({ 'plant-id': 'P1' })
      .expect(200);

    expect(res.body).to.deep.equal([]);
  });

  it('should return 200 and the correct data for a valid plant-id', async () => {
    await sequelize.query(
      `INSERT INTO t_basic_charge_plan (PLANT_CODE, UNIT_CODE, FISCAL_YEAR, OPERATION_INPUT, MAINTENANCE_INPUT) VALUES ('P1', 'U1', 2023, 100, 200)`,
      { transaction }
    );

    const res = await request(app)
      .get('/basic-charge/plan')
      .query({ 'plant-id': 'P1' })
      .expect(200);

    expect(res.body).to.deep.equal([
      {
        'plant-id': 'P1',
        'unit-id': 'U1',
        'fiscal-year': 2023,
        'operation-input': 100,
        'maintenance-input': 200,
        sum: 300,
      },
    ]);
  });

  it('should return 200 and filter by unit-id', async () => {
    await sequelize.query(
      `INSERT INTO t_basic_charge_plan (PLANT_CODE, UNIT_CODE, FISCAL_YEAR, OPERATION_INPUT, MAINTENANCE_INPUT) VALUES ('P1', 'U1', 2023, 100, 200), ('P1', 'U2', 2023, 150, 250)`,
      { transaction }
    );

    const res = await request(app)
      .get('/basic-charge/plan')
      .query({ 'plant-id': 'P1', 'unit-id': 'U1' })
      .expect(200);

    expect(res.body).to.deep.equal([
      {
        'plant-id': 'P1',
        'unit-id': 'U1',
        'fiscal-year': 2023,
        'operation-input': 100,
        'maintenance-input': 200,
        sum: 300,
      },
    ]);
  });

  it('should return 200 and filter by fiscal year range', async () => {
    await sequelize.query(
      `INSERT INTO t_basic_charge_plan (PLANT_CODE, UNIT_CODE, FISCAL_YEAR, OPERATION_INPUT, MAINTENANCE_INPUT) VALUES ('P1', 'U1', 2022, 100, 200), ('P1', 'U1', 2023, 150, 250)`,
      { transaction }
    );

    const res = await request(app)
      .get('/basic-charge/plan')
      .query({ 'plant-id': 'P1', 'start-fiscal-year': 2023, 'end-fiscal-year': 2023 })
      .expect(200);

    expect(res.body).to.deep.equal([
      {
        'plant-id': 'P1',
        'unit-id': 'U1',
        'fiscal-year': 2023,
        'operation-input': 150,
        'maintenance-input': 250,
        sum: 400,
      },
    ]);
  });

  it('should return 400 for missing plant-id', async () => {
    const res = await request(app)
      .get('/basic-charge/plan')
      .expect(400);

    expect(res.body).to.have.property('error');
  });

  it('should return 400 for invalid fiscal year range', async () => {
    const res = await request(app)
      .get('/basic-charge/plan')
      .query({ 'plant-id': 'P1', 'start-fiscal-year': 2024, 'end-fiscal-year': 2023 })
      .expect(400);

    expect(res.body).to.have.property('error');
  });

  it('should return 200 and handle null operation-input and maintenance-input', async () => {
    await sequelize.query(
      `INSERT INTO t_basic_charge_plan (PLANT_CODE, UNIT_CODE, FISCAL_YEAR, OPERATION_INPUT, MAINTENANCE_INPUT) VALUES ('P1', 'U1', 2023, NULL, NULL)`,
      { transaction }
    );

    const res = await request(app)
      .get('/basic-charge/plan')
      .query({ 'plant-id': 'P1' })
      .expect(200);

    expect(res.body).to.deep.equal([]);
  });

  it('should return 200 and handle zero operation-input and maintenance-input', async () => {
    await sequelize.query(
      `INSERT INTO t_basic_charge_plan (PLANT_CODE, UNIT_CODE, FISCAL_YEAR, OPERATION_INPUT, MAINTENANCE_INPUT) VALUES ('P1', 'U1', 2023, 0, 0)`,
      { transaction }
    );

    const res = await request(app)
      .get('/basic-charge/plan')
      .query({ 'plant-id': 'P1' })
      .expect(200);

    expect(res.body).to.deep.equal([
      {
        'plant-id': 'P1',
        'unit-id': 'U1',
        'fiscal-year': 2023,
        'operation-input': 0,
        'maintenance-input': 0,
        sum: 0,
      },
    ]);
  });

  it('should return 200 and handle large numbers for inputs', async () => {
    await sequelize.query(
      `INSERT INTO t_basic_charge_plan (PLANT_CODE, UNIT_CODE, FISCAL_YEAR, OPERATION_INPUT, MAINTENANCE_INPUT) VALUES ('P1', 'U1', 2023, 999999999, 999999999)`,
      { transaction }
    );

    const res = await request(app)
      .get('/basic-charge/plan')
      .query({ 'plant-id': 'P1' })
      .expect(200);

    expect(res.body).to.deep.equal([
      {
        'plant-id': 'P1',
        'unit-id': 'U1',
        'fiscal-year': 2023,
        'operation-input': 999999999,
        'maintenance-input': 999999999,
        sum: 1999999998,
      },
    ]);
  });

  it('should return 200 and handle multiple records', async () => {
    await sequelize.query(
      `INSERT INTO t_basic_charge_plan (PLANT_CODE, UNIT_CODE, FISCAL_YEAR, OPERATION_INPUT, MAINTENANCE_INPUT) VALUES ('P1', 'U1', 2023, 100, 200), ('P1', 'U2', 2023, 150, 250)`,
      { transaction }
    );

    const res = await request(app)
      .get('/basic-charge/plan')
      .query({ 'plant-id': 'P1' })
      .expect(200);

    expect(res.body).to.deep.equal([
      {
        'plant-id': 'P1',
        'unit-id': 'U1',
        'fiscal-year': 2023,
        'operation-input': 100,
        'maintenance-input': 200,
        sum: 300,
      },
      {
        'plant-id': 'P1',
        'unit-id': 'U2',
        'fiscal-year': 2023,
        'operation-input': 150,
        'maintenance-input': 250,
        sum: 400,
      },
    ]);
  });

  it('should return 200 and handle no matching records', async () => {
    await sequelize.query(
      `INSERT INTO t_basic_charge_plan (PLANT_CODE, UNIT_CODE, FISCAL_YEAR, OPERATION_INPUT, MAINTENANCE_INPUT) VALUES ('P1', 'U1', 2023, 100, 200)`,
      { transaction }
    );

    const res = await request(app)
      .get('/basic-charge/plan')
      .query({ 'plant-id': 'P2' })
      .expect(200);

    expect(res.body).to.deep.equal([]);
  });

  it('should return 200 and handle special characters in plant-id', async () => {
    await sequelize.query(
      `INSERT INTO t_basic_charge_plan (PLANT_CODE, UNIT_CODE, FISCAL_YEAR, OPERATION_INPUT, MAINTENANCE_INPUT) VALUES ('P@1', 'U1', 2023, 100, 200)`,
      { transaction }
    );

    const res = await request(app)
      .get('/basic-charge/plan')
      .query({ 'plant-id': 'P@1' })
      .expect(200);

    expect(res.body).to.deep.equal([
      {
        'plant-id': 'P@1',
        'unit-id': 'U1',
        'fiscal-year': 2023,
        'operation-input': 100,
        'maintenance-input': 200,
        sum: 300,
      },
    ]);
  });

  it('should return 200 and handle special characters in unit-id', async () => {
    await sequelize.query(
      `INSERT INTO t_basic_charge_plan (PLANT_CODE, UNIT_CODE, FISCAL_YEAR, OPERATION_INPUT, MAINTENANCE_INPUT) VALUES ('P1', 'U@1', 2023, 100, 200)`,
      { transaction }
    );

    const res = await request(app)
      .get('/basic-charge/plan')
      .query({ 'plant-id': 'P1', 'unit-id': 'U@1' })
      .expect(200);

    expect(res.body).to.deep.equal([
      {
        'plant-id': 'P1',
        'unit-id': 'U@1',
        'fiscal-year': 2023,
        'operation-input': 100,
        'maintenance-input': 200,
        sum: 300,
      },
    ]);
  });

  it('should return 200 and handle fiscal year as string', async () => {
    await sequelize.query(
      `INSERT INTO t_basic_charge_plan (PLANT_CODE, UNIT_CODE, FISCAL_YEAR, OPERATION_INPUT, MAINTENANCE_INPUT) VALUES ('P1', 'U1', 2023, 100, 200)`,
      { transaction }
    );

    const res = await request(app)
      .get('/basic-charge/plan')
      .query({ 'plant-id': 'P1', 'start-fiscal-year': '2023', 'end-fiscal-year': '2023' })
      .expect(200);

    expect(res.body).to.deep.equal([
      {
        'plant-id': 'P1',
        'unit-id': 'U1',
        'fiscal-year': 2023,
        'operation-input': 100,
        'maintenance-input': 200,
        sum: 300,
      },
    ]);
  });

  it('should return 200 and handle missing optional parameters', async () => {
    await sequelize.query(
      `INSERT INTO t_basic_charge_plan (PLANT_CODE, UNIT_CODE, FISCAL_YEAR, OPERATION_INPUT, MAINTENANCE_INPUT) VALUES ('P1', 'U1', 2023, 100, 200)`,
      { transaction }
    );

    const res = await request(app)
      .get('/basic-charge/plan')
      .query({ 'plant-id': 'P1' })
      .expect(200);

    expect(res.body).to.deep.equal([
      {
        'plant-id': 'P1',
        'unit-id': 'U1',
        'fiscal-year': 2023,
        'operation-input': 100,
        'maintenance-input': 200,
        sum: 300,
      },
    ]);
  });

  it('should return 200 and handle large fiscal year range', async () => {
    await sequelize.query(
      `INSERT INTO t_basic_charge_plan (PLANT_CODE, UNIT_CODE, FISCAL_YEAR, OPERATION_INPUT, MAINTENANCE_INPUT) VALUES ('P1', 'U1', 2020, 100, 200), ('P1', 'U1', 2025, 150, 250)`,
      { transaction }
    );

    const res = await request(app)
      .get('/basic-charge/plan')
      .query({ 'plant-id': 'P1', 'start-fiscal-year': 2020, 'end-fiscal-year': 2025 })
      .expect(200);

    expect(res.body).to.deep.equal([
      {
        'plant-id': 'P1',
        'unit-id': 'U1',
        'fiscal-year': 2020,
        'operation-input': 100,
        'maintenance-input': 200,
        sum: 300,
      },
      {
        'plant-id': 'P1',
        'unit-id': 'U1',
        'fiscal-year': 2025,
        'operation-input': 150,
        'maintenance-input': 250,
        sum: 400,
      },
    ]);
  });

  it('should return 200 and handle no fiscal year range', async () => {
    await sequelize.query(
      `INSERT INTO t_basic_charge_plan (PLANT_CODE, UNIT_CODE, FISCAL_YEAR, OPERATION_INPUT, MAINTENANCE_INPUT) VALUES ('P1', 'U1', 2023, 100, 200)`,
      { transaction }
    );

    const res = await request(app)
      .get('/basic-charge/plan')
      .query({ 'plant-id': 'P1' })
      .expect(200);

    expect(res.body).to.deep.equal([
      {
        'plant-id': 'P1',
        'unit-id': 'U1',
        'fiscal-year': 2023,
        'operation-input': 100,
        'maintenance-input': 200,
        sum: 300,
      },
    ]);
  });

  it('should return 200 and handle non-existent plant-id', async () => {
    const res = await request(app)
      .get('/basic-charge/plan')
      .query({ 'plant-id': 'P999' })
      .expect(200);

    expect(res.body).to.deep.equal([]);
  });

  it('should return 200 and handle non-existent unit-id', async () => {
    await sequelize.query(
      `INSERT INTO t_basic_charge_plan (PLANT_CODE, UNIT_CODE, FISCAL_YEAR, OPERATION_INPUT, MAINTENANCE_INPUT) VALUES ('P1', 'U1', 2023, 100, 200)`,
      { transaction }
    );

    const res = await request(app)
      .get('/basic-charge/plan')
      .query({ 'plant-id': 'P1', 'unit-id': 'U999' })
      .expect(200);

    expect(res.body).to.deep.equal([]);
  });
});