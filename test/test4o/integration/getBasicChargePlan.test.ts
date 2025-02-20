import express from 'express';
import { expect } from 'chai';
import request from 'supertest';
import { Transaction } from 'sequelize';
import { sequelize } from '../../../src/infrastructure/orm/sqlize';
import { BasicChargeRoutes } from '../../../src/infrastructure/routes/dpm/basicChargeRoutes';

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
      .query({ 'plant-id': 'P001' })
      .expect(200);

    expect(res.body).to.deep.equal([]);
  });

  it('should return 200 and the correct data for a specific plant-id', async () => {
    await sequelize.query(
      `INSERT INTO t_basic_charge_plan (PLANT_CODE, UNIT_CODE, FISCAL_YEAR, OPERATION_INPUT, MAINTENANCE_INPUT) VALUES ('P001', 'U001', 2023, 100, 200)`,
      { transaction }
    );

    const res = await request(app)
      .get('/basic-charge/plan')
      .query({ 'plant-id': 'P001' })
      .expect(200);

    expect(res.body).to.deep.equal([
      {
        'plant-id': 'P001',
        'unit-id': 'U001',
        'fiscal-year': 2023,
        'operation-input': 100,
        'maintenance-input': 200,
        sum: 300,
      },
    ]);
  });

  it('should return 200 and filter data by unit-id', async () => {
    await sequelize.query(
      `INSERT INTO t_basic_charge_plan (PLANT_CODE, UNIT_CODE, FISCAL_YEAR, OPERATION_INPUT, MAINTENANCE_INPUT) VALUES ('P001', 'U001', 2023, 100, 200), ('P001', 'U002', 2023, 150, 250)`,
      { transaction }
    );

    const res = await request(app)
      .get('/basic-charge/plan')
      .query({ 'plant-id': 'P001', 'unit-id': 'U001' })
      .expect(200);

    expect(res.body).to.deep.equal([
      {
        'plant-id': 'P001',
        'unit-id': 'U001',
        'fiscal-year': 2023,
        'operation-input': 100,
        'maintenance-input': 200,
        sum: 300,
      },
    ]);
  });

  it('should return 200 and filter data by start-fiscal-year', async () => {
    await sequelize.query(
      `INSERT INTO t_basic_charge_plan (PLANT_CODE, UNIT_CODE, FISCAL_YEAR, OPERATION_INPUT, MAINTENANCE_INPUT) VALUES ('P001', 'U001', 2022, 100, 200), ('P001', 'U001', 2023, 150, 250)`,
      { transaction }
    );

    const res = await request(app)
      .get('/basic-charge/plan')
      .query({ 'plant-id': 'P001', 'start-fiscal-year': 2023 })
      .expect(200);

    expect(res.body).to.deep.equal([
      {
        'plant-id': 'P001',
        'unit-id': 'U001',
        'fiscal-year': 2023,
        'operation-input': 150,
        'maintenance-input': 250,
        sum: 400,
      },
    ]);
  });

  it('should return 200 and filter data by end-fiscal-year', async () => {
    await sequelize.query(
      `INSERT INTO t_basic_charge_plan (PLANT_CODE, UNIT_CODE, FISCAL_YEAR, OPERATION_INPUT, MAINTENANCE_INPUT) VALUES ('P001', 'U001', 2022, 100, 200), ('P001', 'U001', 2023, 150, 250)`,
      { transaction }
    );

    const res = await request(app)
      .get('/basic-charge/plan')
      .query({ 'plant-id': 'P001', 'end-fiscal-year': 2022 })
      .expect(200);

    expect(res.body).to.deep.equal([
      {
        'plant-id': 'P001',
        'unit-id': 'U001',
        'fiscal-year': 2022,
        'operation-input': 100,
        'maintenance-input': 200,
        sum: 300,
      },
    ]);
  });

  it('should return 200 and filter data by both start and end fiscal years', async () => {
    await sequelize.query(
      `INSERT INTO t_basic_charge_plan (PLANT_CODE, UNIT_CODE, FISCAL_YEAR, OPERATION_INPUT, MAINTENANCE_INPUT) VALUES ('P001', 'U001', 2021, 100, 200), ('P001', 'U001', 2022, 150, 250), ('P001', 'U001', 2023, 200, 300)`,
      { transaction }
    );

    const res = await request(app)
      .get('/basic-charge/plan')
      .query({ 'plant-id': 'P001', 'start-fiscal-year': 2022, 'end-fiscal-year': 2023 })
      .expect(200);

    expect(res.body).to.deep.equal([
      {
        'plant-id': 'P001',
        'unit-id': 'U001',
        'fiscal-year': 2022,
        'operation-input': 150,
        'maintenance-input': 250,
        sum: 400,
      },
      {
        'plant-id': 'P001',
        'unit-id': 'U001',
        'fiscal-year': 2023,
        'operation-input': 200,
        'maintenance-input': 300,
        sum: 500,
      },
    ]);
  });

  it('should return 400 if plant-id is missing', async () => {
    const res = await request(app)
      .get('/basic-charge/plan')
      .expect(400);

    expect(res.body).to.have.property('error');
  });

  it('should return 400 if plant-id is invalid', async () => {
    const res = await request(app)
      .get('/basic-charge/plan')
      .query({ 'plant-id': '' })
      .expect(400);

    expect(res.body).to.have.property('error');
  });

  it('should return 400 if start-fiscal-year is not a number', async () => {
    const res = await request(app)
      .get('/basic-charge/plan')
      .query({ 'plant-id': 'P001', 'start-fiscal-year': 'invalid' })
      .expect(400);

    expect(res.body).to.have.property('error');
  });

  it('should return 400 if end-fiscal-year is not a number', async () => {
    const res = await request(app)
      .get('/basic-charge/plan')
      .query({ 'plant-id': 'P001', 'end-fiscal-year': 'invalid' })
      .expect(400);

    expect(res.body).to.have.property('error');
  });

  it('should return 200 and handle null operation-input and maintenance-input', async () => {
    await sequelize.query(
      `INSERT INTO t_basic_charge_plan (PLANT_CODE, UNIT_CODE, FISCAL_YEAR, OPERATION_INPUT, MAINTENANCE_INPUT) VALUES ('P001', 'U001', 2023, NULL, NULL)`,
      { transaction }
    );

    const res = await request(app)
      .get('/basic-charge/plan')
      .query({ 'plant-id': 'P001' })
      .expect(200);

    expect(res.body).to.deep.equal([
      {
        'plant-id': 'P001',
        'unit-id': 'U001',
        'fiscal-year': 2023,
        'operation-input': null,
        'maintenance-input': null,
        sum: 0,
      },
    ]);
  });

  it('should return 200 and handle missing unit-id', async () => {
    await sequelize.query(
      `INSERT INTO t_basic_charge_plan (PLANT_CODE, FISCAL_YEAR, OPERATION_INPUT, MAINTENANCE_INPUT) VALUES ('P001', 2023, 100, 200)`,
      { transaction }
    );

    const res = await request(app)
      .get('/basic-charge/plan')
      .query({ 'plant-id': 'P001' })
      .expect(200);

    expect(res.body).to.deep.equal([
      {
        'plant-id': 'P001',
        'unit-id': null,
        'fiscal-year': 2023,
        'operation-input': 100,
        'maintenance-input': 200,
        sum: 300,
      },
    ]);
  });

  it('should return 200 and handle multiple records for the same plant-id', async () => {
    await sequelize.query(
      `INSERT INTO t_basic_charge_plan (PLANT_CODE, UNIT_CODE, FISCAL_YEAR, OPERATION_INPUT, MAINTENANCE_INPUT) VALUES ('P001', 'U001', 2023, 100, 200), ('P001', 'U002', 2023, 150, 250)`,
      { transaction }
    );

    const res = await request(app)
      .get('/basic-charge/plan')
      .query({ 'plant-id': 'P001' })
      .expect(200);

    expect(res.body).to.deep.equal([
      {
        'plant-id': 'P001',
        'unit-id': 'U001',
        'fiscal-year': 2023,
        'operation-input': 100,
        'maintenance-input': 200,
        sum: 300,
      },
      {
        'plant-id': 'P001',
        'unit-id': 'U002',
        'fiscal-year': 2023,
        'operation-input': 150,
        'maintenance-input': 250,
        sum: 400,
      },
    ]);
  });

  it('should return 200 and handle large numbers for operation-input and maintenance-input', async () => {
    await sequelize.query(
      `INSERT INTO t_basic_charge_plan (PLANT_CODE, UNIT_CODE, FISCAL_YEAR, OPERATION_INPUT, MAINTENANCE_INPUT) VALUES ('P001', 'U001', 2023, 999999999, 999999999)`,
      { transaction }
    );

    const res = await request(app)
      .get('/basic-charge/plan')
      .query({ 'plant-id': 'P001' })
      .expect(200);

    expect(res.body).to.deep.equal([
      {
        'plant-id': 'P001',
        'unit-id': 'U001',
        'fiscal-year': 2023,
        'operation-input': 999999999,
        'maintenance-input': 999999999,
        sum: 1999999998,
      },
    ]);
  });

  it('should return 200 and handle zero values for operation-input and maintenance-input', async () => {
    await sequelize.query(
      `INSERT INTO t_basic_charge_plan (PLANT_CODE, UNIT_CODE, FISCAL_YEAR, OPERATION_INPUT, MAINTENANCE_INPUT) VALUES ('P001', 'U001', 2023, 0, 0)`,
      { transaction }
    );

    const res = await request(app)
      .get('/basic-charge/plan')
      .query({ 'plant-id': 'P001' })
      .expect(200);

    expect(res.body).to.deep.equal([
      {
        'plant-id': 'P001',
        'unit-id': 'U001',
        'fiscal-year': 2023,
        'operation-input': 0,
        'maintenance-input': 0,
        sum: 0,
      },
    ]);
  });

  it('should return 200 and handle negative values for operation-input and maintenance-input', async () => {
    await sequelize.query(
      `INSERT INTO t_basic_charge_plan (PLANT_CODE, UNIT_CODE, FISCAL_YEAR, OPERATION_INPUT, MAINTENANCE_INPUT) VALUES ('P001', 'U001', 2023, -100, -200)`,
      { transaction }
    );

    const res = await request(app)
      .get('/basic-charge/plan')
      .query({ 'plant-id': 'P001' })
      .expect(200);

    expect(res.body).to.deep.equal([
      {
        'plant-id': 'P001',
        'unit-id': 'U001',
        'fiscal-year': 2023,
        'operation-input': -100,
        'maintenance-input': -200,
        sum: -300,
      },
    ]);
  });

  it('should return 200 and handle mixed positive and negative values for operation-input and maintenance-input', async () => {
    await sequelize.query(
      `INSERT INTO t_basic_charge_plan (PLANT_CODE, UNIT_CODE, FISCAL_YEAR, OPERATION_INPUT, MAINTENANCE_INPUT) VALUES ('P001', 'U001', 2023, 100, -200)`,
      { transaction }
    );

    const res = await request(app)
      .get('/basic-charge/plan')
      .query({ 'plant-id': 'P001' })
      .expect(200);

    expect(res.body).to.deep.equal([
      {
        'plant-id': 'P001',
        'unit-id': 'U001',
        'fiscal-year': 2023,
        'operation-input': 100,
        'maintenance-input': -200,
        sum: -100,
      },
    ]);
  });

  it('should return 200 and handle multiple fiscal years for the same plant-id and unit-id', async () => {
    await sequelize.query(
      `INSERT INTO t_basic_charge_plan (PLANT_CODE, UNIT_CODE, FISCAL_YEAR, OPERATION_INPUT, MAINTENANCE_INPUT) VALUES ('P001', 'U001', 2022, 100, 200), ('P001', 'U001', 2023, 150, 250)`,
      { transaction }
    );

    const res = await request(app)
      .get('/basic-charge/plan')
      .query({ 'plant-id': 'P001' })
      .expect(200);

    expect(res.body).to.deep.equal([
      {
        'plant-id': 'P001',
        'unit-id': 'U001',
        'fiscal-year': 2022,
        'operation-input': 100,
        'maintenance-input': 200,
        sum: 300,
      },
      {
        'plant-id': 'P001',
        'unit-id': 'U001',
        'fiscal-year': 2023,
        'operation-input': 150,
        'maintenance-input': 250,
        sum: 400,
      },
    ]);
  });
});