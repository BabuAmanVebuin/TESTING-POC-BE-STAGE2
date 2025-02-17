import { expect } from 'chai';
import request from 'supertest';
import { sequelize } from '../../../src/infrastructure/orm/sqlize';
import { BasicChargeRoutes } from '../../../src/infrastructure/webserver/express/routes';
import Express from 'express';
import { Transaction } from 'sequelize';

const app = Express();
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

  it('should return 200 and the correct data for a valid plant-id', async () => {
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

  it('should return 200 and filter by unit-id', async () => {
    await sequelize.query(
      `INSERT INTO t_basic_charge_plan (PLANT_CODE, UNIT_CODE, FISCAL_YEAR, OPERATION_INPUT, MAINTENANCE_INPUT) VALUES ('P001', 'U001', 2023, 100, 200), ('P001', 'U002', 2023, 150, 250)`,
      { transaction }
    );

    const res = await request(app)
      .get('/basic-charge/plan')
      .query({ 'plant-id': 'P001', 'unit-id': 'U001' })
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

  it('should return 200 and filter by fiscal year range', async () => {
    await sequelize.query(
      `INSERT INTO t_basic_charge_plan (PLANT_CODE, UNIT_CODE, FISCAL_YEAR, OPERATION_INPUT, MAINTENANCE_INPUT) VALUES ('P001', 'U001', 2022, 100, 200), ('P001', 'U001', 2023, 150, 250)`,
      { transaction }
    );

    const res = await request(app)
      .get('/basic-charge/plan')
      .query({ 'plant-id': 'P001', 'start-fiscal-year': 2023, 'end-fiscal-year': 2023 })
      .expect(200);

    expect(res.body).to.have.property('code', 200);
    expect(res.body.body).to.be.an('array').that.has.lengthOf(1);
    expect(res.body.body[0]).to.include({
      'plant-id': 'P001',
      'unit-id': 'U001',
      'fiscal-year': 2023,
      'operation-input': 150,
      'maintenance-input': 250,
      sum: 400,
    });
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

  it('should return 200 and handle null operation-input and maintenance-input', async () => {
    await sequelize.query(
      `INSERT INTO t_basic_charge_plan (PLANT_CODE, UNIT_CODE, FISCAL_YEAR, OPERATION_INPUT, MAINTENANCE_INPUT) VALUES ('P001', 'U001', 2023, NULL, NULL)`,
      { transaction }
    );

    const res = await request(app)
      .get('/basic-charge/plan')
      .query({ 'plant-id': 'P001' })
      .expect(200);

    expect(res.body).to.have.property('code', 200);
    expect(res.body.body).to.be.an('array').that.is.empty;
  });

  it('should return 200 and handle multiple records', async () => {
    await sequelize.query(
      `INSERT INTO t_basic_charge_plan (PLANT_CODE, UNIT_CODE, FISCAL_YEAR, OPERATION_INPUT, MAINTENANCE_INPUT) VALUES ('P001', 'U001', 2023, 100, 200), ('P001', 'U002', 2023, 150, 250)`,
      { transaction }
    );

    const res = await request(app)
      .get('/basic-charge/plan')
      .query({ 'plant-id': 'P001' })
      .expect(200);

    expect(res.body).to.have.property('code', 200);
    expect(res.body.body).to.be.an('array').that.has.lengthOf(2);
  });

  it('should return 200 and handle no matching records', async () => {
    await sequelize.query(
      `INSERT INTO t_basic_charge_plan (PLANT_CODE, UNIT_CODE, FISCAL_YEAR, OPERATION_INPUT, MAINTENANCE_INPUT) VALUES ('P001', 'U001', 2023, 100, 200)`,
      { transaction }
    );

    const res = await request(app)
      .get('/basic-charge/plan')
      .query({ 'plant-id': 'P002' })
      .expect(200);

    expect(res.body).to.have.property('code', 200);
    expect(res.body.body).to.be.an('array').that.is.empty;
  });

  it('should return 200 and handle large datasets', async () => {
    for (let i = 0; i < 1000; i++) {
      await sequelize.query(
        `INSERT INTO t_basic_charge_plan (PLANT_CODE, UNIT_CODE, FISCAL_YEAR, OPERATION_INPUT, MAINTENANCE_INPUT) VALUES ('P001', 'U${i}', 2023, 100, 200)`,
        { transaction }
      );
    }

    const res = await request(app)
      .get('/basic-charge/plan')
      .query({ 'plant-id': 'P001' })
      .expect(200);

    expect(res.body).to.have.property('code', 200);
    expect(res.body.body).to.be.an('array').that.has.lengthOf(1000);
  });

  it('should return 200 and handle special characters in plant-id', async () => {
    await sequelize.query(
      `INSERT INTO t_basic_charge_plan (PLANT_CODE, UNIT_CODE, FISCAL_YEAR, OPERATION_INPUT, MAINTENANCE_INPUT) VALUES ('P@001', 'U001', 2023, 100, 200)`,
      { transaction }
    );

    const res = await request(app)
      .get('/basic-charge/plan')
      .query({ 'plant-id': 'P@001' })
      .expect(200);

    expect(res.body).to.have.property('code', 200);
    expect(res.body.body).to.be.an('array').that.has.lengthOf(1);
  });

  it('should return 200 and handle special characters in unit-id', async () => {
    await sequelize.query(
      `INSERT INTO t_basic_charge_plan (PLANT_CODE, UNIT_CODE, FISCAL_YEAR, OPERATION_INPUT, MAINTENANCE_INPUT) VALUES ('P001', 'U@001', 2023, 100, 200)`,
      { transaction }
    );

    const res = await request(app)
      .get('/basic-charge/plan')
      .query({ 'plant-id': 'P001', 'unit-id': 'U@001' })
      .expect(200);

    expect(res.body).to.have.property('code', 200);
    expect(res.body.body).to.be.an('array').that.has.lengthOf(1);
  });

  it('should return 200 and handle zero operation-input and maintenance-input', async () => {
    await sequelize.query(
      `INSERT INTO t_basic_charge_plan (PLANT_CODE, UNIT_CODE, FISCAL_YEAR, OPERATION_INPUT, MAINTENANCE_INPUT) VALUES ('P001', 'U001', 2023, 0, 0)`,
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
      'operation-input': 0,
      'maintenance-input': 0,
      sum: 0,
    });
  });

  it('should return 200 and handle negative operation-input and maintenance-input', async () => {
    await sequelize.query(
      `INSERT INTO t_basic_charge_plan (PLANT_CODE, UNIT_CODE, FISCAL_YEAR, OPERATION_INPUT, MAINTENANCE_INPUT) VALUES ('P001', 'U001', 2023, -100, -200)`,
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
      'operation-input': -100,
      'maintenance-input': -200,
      sum: -300,
    });
  });

  it('should return 200 and handle large numbers for operation-input and maintenance-input', async () => {
    await sequelize.query(
      `INSERT INTO t_basic_charge_plan (PLANT_CODE, UNIT_CODE, FISCAL_YEAR, OPERATION_INPUT, MAINTENANCE_INPUT) VALUES ('P001', 'U001', 2023, 1000000, 2000000)`,
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
      'operation-input': 1000000,
      'maintenance-input': 2000000,
      sum: 3000000,
    });
  });

  it('should return 200 and handle fiscal year as a string', async () => {
    await sequelize.query(
      `INSERT INTO t_basic_charge_plan (PLANT_CODE, UNIT_CODE, FISCAL_YEAR, OPERATION_INPUT, MAINTENANCE_INPUT) VALUES ('P001', 'U001', 2023, 100, 200)`,
      { transaction }
    );

    const res = await request(app)
      .get('/basic-charge/plan')
      .query({ 'plant-id': 'P001', 'start-fiscal-year': '2023', 'end-fiscal-year': '2023' })
      .expect(200);

    expect(res.body).to.have.property('code', 200);
    expect(res.body.body).to.be.an('array').that.has.lengthOf(1);
  });

  it('should return 200 and handle missing optional parameters', async () => {
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
  });

  it('should return 200 and handle all parameters', async () => {
    await sequelize.query(
      `INSERT INTO t_basic_charge_plan (PLANT_CODE, UNIT_CODE, FISCAL_YEAR, OPERATION_INPUT, MAINTENANCE_INPUT) VALUES ('P001', 'U001', 2023, 100, 200)`,
      { transaction }
    );

    const res = await request(app)
      .get('/basic-charge/plan')
      .query({ 'plant-id': 'P001', 'unit-id': 'U001', 'start-fiscal-year': 2023, 'end-fiscal-year': 2023 })
      .expect(200);

    expect(res.body).to.have.property('code', 200);
    expect(res.body.body).to.be.an('array').that.has.lengthOf(1);
  });
});