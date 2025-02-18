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
      .query({ 'plant-id': 'PLANT1' })
      .expect(200);

    expect(res.body).to.have.property('code', 200);
    expect(res.body).to.have.property('body').that.is.an('array').that.is.empty;
  });

  it('should return 200 and data for a specific plant-id', async () => {
    await sequelize.query(
      `INSERT INTO t_basic_charge_plan (PLANT_CODE, UNIT_CODE, FISCAL_YEAR, OPERATION_INPUT, MAINTENANCE_INPUT) VALUES ('PLANT1', 'UNIT1', 2023, 100, 200)`,
      { transaction }
    );

    const res = await request(app)
      .get('/basic-charge/plan')
      .query({ 'plant-id': 'PLANT1' })
      .expect(200);

    expect(res.body).to.have.property('code', 200);
    expect(res.body.body).to.be.an('array').that.has.lengthOf(1);
    expect(res.body.body[0]).to.include({
      'plant-id': 'PLANT1',
      'unit-id': 'UNIT1',
      'fiscal-year': 2023,
      'operation-input': 100,
      'maintenance-input': 200,
      sum: 300,
    });
  });

  it('should return 200 and data for a specific unit-id', async () => {
    await sequelize.query(
      `INSERT INTO t_basic_charge_plan (PLANT_CODE, UNIT_CODE, FISCAL_YEAR, OPERATION_INPUT, MAINTENANCE_INPUT) VALUES ('PLANT1', 'UNIT1', 2023, 100, 200)`,
      { transaction }
    );

    const res = await request(app)
      .get('/basic-charge/plan')
      .query({ 'plant-id': 'PLANT1', 'unit-id': 'UNIT1' })
      .expect(200);

    expect(res.body).to.have.property('code', 200);
    expect(res.body.body).to.be.an('array').that.has.lengthOf(1);
    expect(res.body.body[0]).to.include({
      'plant-id': 'PLANT1',
      'unit-id': 'UNIT1',
      'fiscal-year': 2023,
      'operation-input': 100,
      'maintenance-input': 200,
      sum: 300,
    });
  });

  it('should return 200 and data for a specific fiscal year range', async () => {
    await sequelize.query(
      `INSERT INTO t_basic_charge_plan (PLANT_CODE, UNIT_CODE, FISCAL_YEAR, OPERATION_INPUT, MAINTENANCE_INPUT) VALUES ('PLANT1', 'UNIT1', 2023, 100, 200)`,
      { transaction }
    );

    const res = await request(app)
      .get('/basic-charge/plan')
      .query({ 'plant-id': 'PLANT1', 'start-fiscal-year': 2022, 'end-fiscal-year': 2023 })
      .expect(200);

    expect(res.body).to.have.property('code', 200);
    expect(res.body.body).to.be.an('array').that.has.lengthOf(1);
    expect(res.body.body[0]).to.include({
      'plant-id': 'PLANT1',
      'unit-id': 'UNIT1',
      'fiscal-year': 2023,
      'operation-input': 100,
      'maintenance-input': 200,
      sum: 300,
    });
  });

  it('should return 200 and an empty array for a non-existent plant-id', async () => {
    const res = await request(app)
      .get('/basic-charge/plan')
      .query({ 'plant-id': 'NON_EXISTENT' })
      .expect(200);

    expect(res.body).to.have.property('code', 200);
    expect(res.body).to.have.property('body').that.is.an('array').that.is.empty;
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
      .query({ 'plant-id': 'PLANT1', 'start-fiscal-year': 2024, 'end-fiscal-year': 2023 })
      .expect(400);

    expect(res.body).to.have.property('code', 400);
  });

  it('should return 200 and data for multiple units', async () => {
    await sequelize.query(
      `INSERT INTO t_basic_charge_plan (PLANT_CODE, UNIT_CODE, FISCAL_YEAR, OPERATION_INPUT, MAINTENANCE_INPUT) VALUES ('PLANT1', 'UNIT1', 2023, 100, 200), ('PLANT1', 'UNIT2', 2023, 150, 250)`,
      { transaction }
    );

    const res = await request(app)
      .get('/basic-charge/plan')
      .query({ 'plant-id': 'PLANT1' })
      .expect(200);

    expect(res.body).to.have.property('code', 200);
    expect(res.body.body).to.be.an('array').that.has.lengthOf(2);
  });

  it('should return 200 and data with null operation-input', async () => {
    await sequelize.query(
      `INSERT INTO t_basic_charge_plan (PLANT_CODE, UNIT_CODE, FISCAL_YEAR, OPERATION_INPUT, MAINTENANCE_INPUT) VALUES ('PLANT1', 'UNIT1', 2023, NULL, 200)`,
      { transaction }
    );

    const res = await request(app)
      .get('/basic-charge/plan')
      .query({ 'plant-id': 'PLANT1' })
      .expect(200);

    expect(res.body).to.have.property('code', 200);
    expect(res.body.body).to.be.an('array').that.has.lengthOf(1);
    expect(res.body.body[0]).to.include({
      'plant-id': 'PLANT1',
      'unit-id': 'UNIT1',
      'fiscal-year': 2023,
      'operation-input': null,
      'maintenance-input': 200,
      sum: 200,
    });
  });

  it('should return 200 and data with null maintenance-input', async () => {
    await sequelize.query(
      `INSERT INTO t_basic_charge_plan (PLANT_CODE, UNIT_CODE, FISCAL_YEAR, OPERATION_INPUT, MAINTENANCE_INPUT) VALUES ('PLANT1', 'UNIT1', 2023, 100, NULL)`,
      { transaction }
    );

    const res = await request(app)
      .get('/basic-charge/plan')
      .query({ 'plant-id': 'PLANT1' })
      .expect(200);

    expect(res.body).to.have.property('code', 200);
    expect(res.body.body).to.be.an('array').that.has.lengthOf(1);
    expect(res.body.body[0]).to.include({
      'plant-id': 'PLANT1',
      'unit-id': 'UNIT1',
      'fiscal-year': 2023,
      'operation-input': 100,
      'maintenance-input': null,
      sum: 100,
    });
  });

  it('should return 200 and data for a specific fiscal year', async () => {
    await sequelize.query(
      `INSERT INTO t_basic_charge_plan (PLANT_CODE, UNIT_CODE, FISCAL_YEAR, OPERATION_INPUT, MAINTENANCE_INPUT) VALUES ('PLANT1', 'UNIT1', 2023, 100, 200)`,
      { transaction }
    );

    const res = await request(app)
      .get('/basic-charge/plan')
      .query({ 'plant-id': 'PLANT1', 'start-fiscal-year': 2023, 'end-fiscal-year': 2023 })
      .expect(200);

    expect(res.body).to.have.property('code', 200);
    expect(res.body.body).to.be.an('array').that.has.lengthOf(1);
    expect(res.body.body[0]).to.include({
      'plant-id': 'PLANT1',
      'unit-id': 'UNIT1',
      'fiscal-year': 2023,
      'operation-input': 100,
      'maintenance-input': 200,
      sum: 300,
    });
  });

  it('should return 200 and data for a specific plant-id and unit-id', async () => {
    await sequelize.query(
      `INSERT INTO t_basic_charge_plan (PLANT_CODE, UNIT_CODE, FISCAL_YEAR, OPERATION_INPUT, MAINTENANCE_INPUT) VALUES ('PLANT1', 'UNIT1', 2023, 100, 200)`,
      { transaction }
    );

    const res = await request(app)
      .get('/basic-charge/plan')
      .query({ 'plant-id': 'PLANT1', 'unit-id': 'UNIT1' })
      .expect(200);

    expect(res.body).to.have.property('code', 200);
    expect(res.body.body).to.be.an('array').that.has.lengthOf(1);
    expect(res.body.body[0]).to.include({
      'plant-id': 'PLANT1',
      'unit-id': 'UNIT1',
      'fiscal-year': 2023,
      'operation-input': 100,
      'maintenance-input': 200,
      sum: 300,
    });
  });

  it('should return 200 and data for a specific plant-id with no unit-id', async () => {
    await sequelize.query(
      `INSERT INTO t_basic_charge_plan (PLANT_CODE, UNIT_CODE, FISCAL_YEAR, OPERATION_INPUT, MAINTENANCE_INPUT) VALUES ('PLANT1', NULL, 2023, 100, 200)`,
      { transaction }
    );

    const res = await request(app)
      .get('/basic-charge/plan')
      .query({ 'plant-id': 'PLANT1' })
      .expect(200);

    expect(res.body).to.have.property('code', 200);
    expect(res.body.body).to.be.an('array').that.has.lengthOf(1);
    expect(res.body.body[0]).to.include({
      'plant-id': 'PLANT1',
      'unit-id': null,
      'fiscal-year': 2023,
      'operation-input': 100,
      'maintenance-input': 200,
      sum: 300,
    });
  });

  it('should return 200 and data for a specific plant-id with no operation-input', async () => {
    await sequelize.query(
      `INSERT INTO t_basic_charge_plan (PLANT_CODE, UNIT_CODE, FISCAL_YEAR, OPERATION_INPUT, MAINTENANCE_INPUT) VALUES ('PLANT1', 'UNIT1', 2023, NULL, 200)`,
      { transaction }
    );

    const res = await request(app)
      .get('/basic-charge/plan')
      .query({ 'plant-id': 'PLANT1' })
      .expect(200);

    expect(res.body).to.have.property('code', 200);
    expect(res.body.body).to.be.an('array').that.has.lengthOf(1);
    expect(res.body.body[0]).to.include({
      'plant-id': 'PLANT1',
      'unit-id': 'UNIT1',
      'fiscal-year': 2023,
      'operation-input': null,
      'maintenance-input': 200,
      sum: 200,
    });
  });

  it('should return 200 and data for a specific plant-id with no maintenance-input', async () => {
    await sequelize.query(
      `INSERT INTO t_basic_charge_plan (PLANT_CODE, UNIT_CODE, FISCAL_YEAR, OPERATION_INPUT, MAINTENANCE_INPUT) VALUES ('PLANT1', 'UNIT1', 2023, 100, NULL)`,
      { transaction }
    );

    const res = await request(app)
      .get('/basic-charge/plan')
      .query({ 'plant-id': 'PLANT1' })
      .expect(200);

    expect(res.body).to.have.property('code', 200);
    expect(res.body.body).to.be.an('array').that.has.lengthOf(1);
    expect(res.body.body[0]).to.include({
      'plant-id': 'PLANT1',
      'unit-id': 'UNIT1',
      'fiscal-year': 2023,
      'operation-input': 100,
      'maintenance-input': null,
      sum: 100,
    });
  });

  it('should return 200 and data for a specific plant-id with no inputs', async () => {
    await sequelize.query(
      `INSERT INTO t_basic_charge_plan (PLANT_CODE, UNIT_CODE, FISCAL_YEAR, OPERATION_INPUT, MAINTENANCE_INPUT) VALUES ('PLANT1', 'UNIT1', 2023, NULL, NULL)`,
      { transaction }
    );

    const res = await request(app)
      .get('/basic-charge/plan')
      .query({ 'plant-id': 'PLANT1' })
      .expect(200);

    expect(res.body).to.have.property('code', 200);
    expect(res.body.body).to.be.an('array').that.is.empty;
  });

  it('should return 200 and data for a specific plant-id with multiple fiscal years', async () => {
    await sequelize.query(
      `INSERT INTO t_basic_charge_plan (PLANT_CODE, UNIT_CODE, FISCAL_YEAR, OPERATION_INPUT, MAINTENANCE_INPUT) VALUES ('PLANT1', 'UNIT1', 2023, 100, 200), ('PLANT1', 'UNIT1', 2024, 150, 250)`,
      { transaction }
    );

    const res = await request(app)
      .get('/basic-charge/plan')
      .query({ 'plant-id': 'PLANT1', 'start-fiscal-year': 2023, 'end-fiscal-year': 2024 })
      .expect(200);

    expect(res.body).to.have.property('code', 200);
    expect(res.body.body).to.be.an('array').that.has.lengthOf(2);
  });

  it('should return 200 and data for a specific plant-id with overlapping fiscal years', async () => {
    await sequelize.query(
      `INSERT INTO t_basic_charge_plan (PLANT_CODE, UNIT_CODE, FISCAL_YEAR, OPERATION_INPUT, MAINTENANCE_INPUT) VALUES ('PLANT1', 'UNIT1', 2023, 100, 200), ('PLANT1', 'UNIT1', 2024, 150, 250)`,
      { transaction }
    );

    const res = await request(app)
      .get('/basic-charge/plan')
      .query({ 'plant-id': 'PLANT1', 'start-fiscal-year': 2022, 'end-fiscal-year': 2023 })
      .expect(200);

    expect(res.body).to.have.property('code', 200);
    expect(res.body.body).to.be.an('array').that.has.lengthOf(1);
  });

  it('should return 200 and data for a specific plant-id with no fiscal year filter', async () => {
    await sequelize.query(
      `INSERT INTO t_basic_charge_plan (PLANT_CODE, UNIT_CODE, FISCAL_YEAR, OPERATION_INPUT, MAINTENANCE_INPUT) VALUES ('PLANT1', 'UNIT1', 2023, 100, 200), ('PLANT1', 'UNIT1', 2024, 150, 250)`,
      { transaction }
    );

    const res = await request(app)
      .get('/basic-charge/plan')
      .query({ 'plant-id': 'PLANT1' })
      .expect(200);

    expect(res.body).to.have.property('code', 200);
    expect(res.body.body).to.be.an('array').that.has.lengthOf(2);
  });
});