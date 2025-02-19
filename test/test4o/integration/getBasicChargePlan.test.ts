import express from 'express';
import { expect } from 'chai';
import request from 'supertest';
import { Transaction } from 'sequelize';
import { BasicChargeRoutes } from '../../../src/infrastructure/webserver/express/basicChargeRoutes.js';
import { sequelize } from '../../../src/infrastructure/orm/sqlize/index.js';

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

    expect(res.body).to.have.property('code', 200);
    expect(res.body).to.have.property('body').that.is.an('array').that.is.empty;
  });

  it('should return 200 and data for a specific plant-id', async () => {
    await sequelize.query(
      `INSERT INTO t_basic_charge_plan (PLANT_CODE, UNIT_CODE, FISCAL_YEAR, OPERATION_INPUT, MAINTENANCE_INPUT) VALUES ('P001', 'U001', 2023, 100, 200)`,
      { transaction }
    );

    const res = await request(app)
      .get('/basic-charge/plan')
      .query({ 'plant-id': 'P001' })
      .expect(200);

    expect(res.body).to.have.property('code', 200);
    expect(res.body.body).to.be.an('array').that.has.lengthOf(1);
    expect(res.body.body[0]).to.include({
      'plant-id': 'P001',
      'unit-id': 'U001',
      'fiscal-year': 2023,
      'operation-input': 100,
      'maintenance-input': 200,
      sum: 300,
    });
  });

  it('should return 200 and data for a specific unit-id', async () => {
    await sequelize.query(
      `INSERT INTO t_basic_charge_plan (PLANT_CODE, UNIT_CODE, FISCAL_YEAR, OPERATION_INPUT, MAINTENANCE_INPUT) VALUES ('P001', 'U002', 2023, 150, 250)`,
      { transaction }
    );

    const res = await request(app)
      .get('/basic-charge/plan')
      .query({ 'plant-id': 'P001', 'unit-id': 'U002' })
      .expect(200);

    expect(res.body).to.have.property('code', 200);
    expect(res.body.body).to.be.an('array').that.has.lengthOf(1);
    expect(res.body.body[0]).to.include({
      'plant-id': 'P001',
      'unit-id': 'U002',
      'fiscal-year': 2023,
      'operation-input': 150,
      'maintenance-input': 250,
      sum: 400,
    });
  });

  it('should return 200 and data for a specific fiscal year range', async () => {
    await sequelize.query(
      `INSERT INTO t_basic_charge_plan (PLANT_CODE, UNIT_CODE, FISCAL_YEAR, OPERATION_INPUT, MAINTENANCE_INPUT) VALUES ('P001', 'U003', 2022, 200, 300)`,
      { transaction }
    );

    const res = await request(app)
      .get('/basic-charge/plan')
      .query({ 'plant-id': 'P001', 'start-fiscal-year': 2022, 'end-fiscal-year': 2023 })
      .expect(200);

    expect(res.body).to.have.property('code', 200);
    expect(res.body.body).to.be.an('array').that.has.lengthOf(1);
    expect(res.body.body[0]).to.include({
      'plant-id': 'P001',
      'unit-id': 'U003',
      'fiscal-year': 2022,
      'operation-input': 200,
      'maintenance-input': 300,
      sum: 500,
    });
  });

  it('should return 200 and no data for a non-existent plant-id', async () => {
    const res = await request(app)
      .get('/basic-charge/plan')
      .query({ 'plant-id': 'P999' })
      .expect(200);

    expect(res.body).to.have.property('code', 200);
    expect(res.body.body).to.be.an('array').that.is.empty;
  });

  it('should return 400 for missing plant-id', async () => {
    const res = await request(app)
      .get('/basic-charge/plan')
      .expect(400);

    expect(res.body).to.have.property('code', 400);
  });

  it('should return 400 for invalid fiscal year range', async () => {
    const res = await request(app)
      .get('/basic-charge/plan')
      .query({ 'plant-id': 'P001', 'start-fiscal-year': 2024, 'end-fiscal-year': 2023 })
      .expect(400);

    expect(res.body).to.have.property('code', 400);
  });

  it('should return 200 and data for multiple units', async () => {
    await sequelize.query(
      `INSERT INTO t_basic_charge_plan (PLANT_CODE, UNIT_CODE, FISCAL_YEAR, OPERATION_INPUT, MAINTENANCE_INPUT) VALUES ('P001', 'U004', 2023, 300, 400), ('P001', 'U005', 2023, 350, 450)`,
      { transaction }
    );

    const res = await request(app)
      .get('/basic-charge/plan')
      .query({ 'plant-id': 'P001' })
      .expect(200);

    expect(res.body).to.have.property('code', 200);
    expect(res.body.body).to.be.an('array').that.has.lengthOf(2);
  });

  it('should return 200 and data for a specific unit and fiscal year', async () => {
    await sequelize.query(
      `INSERT INTO t_basic_charge_plan (PLANT_CODE, UNIT_CODE, FISCAL_YEAR, OPERATION_INPUT, MAINTENANCE_INPUT) VALUES ('P001', 'U006', 2023, 400, 500)`,
      { transaction }
    );

    const res = await request(app)
      .get('/basic-charge/plan')
      .query({ 'plant-id': 'P001', 'unit-id': 'U006', 'start-fiscal-year': 2023, 'end-fiscal-year': 2023 })
      .expect(200);

    expect(res.body).to.have.property('code', 200);
    expect(res.body.body).to.be.an('array').that.has.lengthOf(1);
    expect(res.body.body[0]).to.include({
      'plant-id': 'P001',
      'unit-id': 'U006',
      'fiscal-year': 2023,
      'operation-input': 400,
      'maintenance-input': 500,
      sum: 900,
    });
  });

  it('should return 200 and data for overlapping fiscal year ranges', async () => {
    await sequelize.query(
      `INSERT INTO t_basic_charge_plan (PLANT_CODE, UNIT_CODE, FISCAL_YEAR, OPERATION_INPUT, MAINTENANCE_INPUT) VALUES ('P001', 'U007', 2022, 500, 600), ('P001', 'U007', 2023, 550, 650)`,
      { transaction }
    );

    const res = await request(app)
      .get('/basic-charge/plan')
      .query({ 'plant-id': 'P001', 'start-fiscal-year': 2022, 'end-fiscal-year': 2023 })
      .expect(200);

    expect(res.body).to.have.property('code', 200);
    expect(res.body.body).to.be.an('array').that.has.lengthOf(2);
  });

  it('should return 200 and data for a specific plant-id with null operation input', async () => {
    await sequelize.query(
      `INSERT INTO t_basic_charge_plan (PLANT_CODE, UNIT_CODE, FISCAL_YEAR, OPERATION_INPUT, MAINTENANCE_INPUT) VALUES ('P001', 'U008', 2023, NULL, 700)`,
      { transaction }
    );

    const res = await request(app)
      .get('/basic-charge/plan')
      .query({ 'plant-id': 'P001' })
      .expect(200);

    expect(res.body).to.have.property('code', 200);
    expect(res.body.body).to.be.an('array').that.has.lengthOf(1);
    expect(res.body.body[0]).to.include({
      'plant-id': 'P001',
      'unit-id': 'U008',
      'fiscal-year': 2023,
      'operation-input': null,
      'maintenance-input': 700,
      sum: 700,
    });
  });

  it('should return 200 and data for a specific plant-id with null maintenance input', async () => {
    await sequelize.query(
      `INSERT INTO t_basic_charge_plan (PLANT_CODE, UNIT_CODE, FISCAL_YEAR, OPERATION_INPUT, MAINTENANCE_INPUT) VALUES ('P001', 'U009', 2023, 800, NULL)`,
      { transaction }
    );

    const res = await request(app)
      .get('/basic-charge/plan')
      .query({ 'plant-id': 'P001' })
      .expect(200);

    expect(res.body).to.have.property('code', 200);
    expect(res.body.body).to.be.an('array').that.has.lengthOf(1);
    expect(res.body.body[0]).to.include({
      'plant-id': 'P001',
      'unit-id': 'U009',
      'fiscal-year': 2023,
      'operation-input': 800,
      'maintenance-input': null,
      sum: 800,
    });
  });

  it('should return 200 and data for a specific plant-id with both inputs null', async () => {
    await sequelize.query(
      `INSERT INTO t_basic_charge_plan (PLANT_CODE, UNIT_CODE, FISCAL_YEAR, OPERATION_INPUT, MAINTENANCE_INPUT) VALUES ('P001', 'U010', 2023, NULL, NULL)`,
      { transaction }
    );

    const res = await request(app)
      .get('/basic-charge/plan')
      .query({ 'plant-id': 'P001' })
      .expect(200);

    expect(res.body).to.have.property('code', 200);
    expect(res.body.body).to.be.an('array').that.is.empty;
  });

  it('should return 200 and data for a specific plant-id with zero inputs', async () => {
    await sequelize.query(
      `INSERT INTO t_basic_charge_plan (PLANT_CODE, UNIT_CODE, FISCAL_YEAR, OPERATION_INPUT, MAINTENANCE_INPUT) VALUES ('P001', 'U011', 2023, 0, 0)`,
      { transaction }
    );

    const res = await request(app)
      .get('/basic-charge/plan')
      .query({ 'plant-id': 'P001' })
      .expect(200);

    expect(res.body).to.have.property('code', 200);
    expect(res.body.body).to.be.an('array').that.has.lengthOf(1);
    expect(res.body.body[0]).to.include({
      'plant-id': 'P001',
      'unit-id': 'U011',
      'fiscal-year': 2023,
      'operation-input': 0,
      'maintenance-input': 0,
      sum: 0,
    });
  });

  it('should return 200 and data for a specific plant-id with negative inputs', async () => {
    await sequelize.query(
      `INSERT INTO t_basic_charge_plan (PLANT_CODE, UNIT_CODE, FISCAL_YEAR, OPERATION_INPUT, MAINTENANCE_INPUT) VALUES ('P001', 'U012', 2023, -100, -200)`,
      { transaction }
    );

    const res = await request(app)
      .get('/basic-charge/plan')
      .query({ 'plant-id': 'P001' })
      .expect(200);

    expect(res.body).to.have.property('code', 200);
    expect(res.body.body).to.be.an('array').that.has.lengthOf(1);
    expect(res.body.body[0]).to.include({
      'plant-id': 'P001',
      'unit-id': 'U012',
      'fiscal-year': 2023,
      'operation-input': -100,
      'maintenance-input': -200,
      sum: -300,
    });
  });

  it('should return 200 and data for a specific plant-id with large inputs', async () => {
    await sequelize.query(
      `INSERT INTO t_basic_charge_plan (PLANT_CODE, UNIT_CODE, FISCAL_YEAR, OPERATION_INPUT, MAINTENANCE_INPUT) VALUES ('P001', 'U013', 2023, 1000000, 2000000)`,
      { transaction }
    );

    const res = await request(app)
      .get('/basic-charge/plan')
      .query({ 'plant-id': 'P001' })
      .expect(200);

    expect(res.body).to.have.property('code', 200);
    expect(res.body.body).to.be.an('array').that.has.lengthOf(1);
    expect(res.body.body[0]).to.include({
      'plant-id': 'P001',
      'unit-id': 'U013',
      'fiscal-year': 2023,
      'operation-input': 1000000,
      'maintenance-input': 2000000,
      sum: 3000000,
    });
  });

  it('should return 200 and data for a specific plant-id with decimal inputs', async () => {
    await sequelize.query(
      `INSERT INTO t_basic_charge_plan (PLANT_CODE, UNIT_CODE, FISCAL_YEAR, OPERATION_INPUT, MAINTENANCE_INPUT) VALUES ('P001', 'U014', 2023, 123.45, 678.90)`,
      { transaction }
    );

    const res = await request(app)
      .get('/basic-charge/plan')
      .query({ 'plant-id': 'P001' })
      .expect(200);

    expect(res.body).to.have.property('code', 200);
    expect(res.body.body).to.be.an('array').that.has.lengthOf(1);
    expect(res.body.body[0]).to.include({
      'plant-id': 'P001',
      'unit-id': 'U014',
      'fiscal-year': 2023,
      'operation-input': 123.45,
      'maintenance-input': 678.90,
      sum: 802.35,
    });
  });

  it('should return 200 and data for a specific plant-id with mixed null and non-null inputs', async () => {
    await sequelize.query(
      `INSERT INTO t_basic_charge_plan (PLANT_CODE, UNIT_CODE, FISCAL_YEAR, OPERATION_INPUT, MAINTENANCE_INPUT) VALUES ('P001', 'U015', 2023, NULL, 1000)`,
      { transaction }
    );

    const res = await request(app)
      .get('/basic-charge/plan')
      .query({ 'plant-id': 'P001' })
      .expect(200);

    expect(res.body).to.have.property('code', 200);
    expect(res.body.body).to.be.an('array').that.has.lengthOf(1);
    expect(res.body.body[0]).to.include({
      'plant-id': 'P001',
      'unit-id': 'U015',
      'fiscal-year': 2023,
      'operation-input': null,
      'maintenance-input': 1000,
      sum: 1000,
    });
  });

  it('should return 200 and data for a specific plant-id with mixed zero and non-zero inputs', async () => {
    await sequelize.query(
      `INSERT INTO t_basic_charge_plan (PLANT_CODE, UNIT_CODE, FISCAL_YEAR, OPERATION_INPUT, MAINTENANCE_INPUT) VALUES ('P001', 'U016', 2023, 0, 1000)`,
      { transaction }
    );

    const res = await request(app)
      .get('/basic-charge/plan')
      .query({ 'plant-id': 'P001' })
      .expect(200);

    expect(res.body).to.have.property('code', 200);
    expect(res.body.body).to.be.an('array').that.has.lengthOf(1);
    expect(res.body.body[0]).to.include({
      'plant-id': 'P001',
      'unit-id': 'U016',
      'fiscal-year': 2023,
      'operation-input': 0,
      'maintenance-input': 1000,
      sum: 1000,
    });
  });

  it('should return 200 and data for a specific plant-id with mixed negative and positive inputs', async () => {
    await sequelize.query(
      `INSERT INTO t_basic_charge_plan (PLANT_CODE, UNIT_CODE, FISCAL_YEAR, OPERATION_INPUT, MAINTENANCE_INPUT) VALUES ('P001', 'U017', 2023, -500, 1500)`,
      { transaction }
    );

    const res = await request(app)
      .get('/basic-charge/plan')
      .query({ 'plant-id': 'P001' })
      .expect(200);

    expect(res.body).to.have.property('code', 200);
    expect(res.body.body).to.be.an('array').that.has.lengthOf(1);
    expect(res.body.body[0]).to.include({
      'plant-id': 'P001',
      'unit-id': 'U017',
      'fiscal-year': 2023,
      'operation-input': -500,
      'maintenance-input': 1500,
      sum: 1000,
    });
  });
});