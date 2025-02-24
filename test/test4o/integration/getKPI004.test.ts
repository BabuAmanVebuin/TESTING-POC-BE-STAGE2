import express from 'express';
import { expect } from 'chai';
import request from 'supertest';
import { Sequelize } from 'sequelize';
import { Transaction } from 'sequelize/types';
import { getKPI004Data } from '../../../src/routes/dpm/KPI004';
import { KPI004Response } from '../../../src/domain/models/dpm/Kpi004';

const app = express();
getKPI004Data(app);

describe('GET /kpi004', () => {
  let sequelize: Sequelize;
  let transaction: Transaction;

  before(async () => {
    sequelize = new Sequelize('sqlite::memory:');
    await sequelize.authenticate();
  });

  beforeEach(async () => {
    transaction = await sequelize.transaction();
  });

  afterEach(async () => {
    await transaction.rollback();
  });

  after(async () => {
    await sequelize.close();
  });

  it('should return 200 and valid data for valid plantCode, unitCode, and fiscalYear', async () => {
    const res = await request(app)
      .get('/kpi004')
      .query({ plantCode: 'validPlant', unitCode: 'validUnit', fiscalYear: '2023' })
      .expect(200);

    const responseBody: KPI004Response = res.body;
    expect(responseBody.Success).to.be.true;
    expect(responseBody.Data).to.have.property('PlantCode', 'validPlant');
  });

  it('should return 400 for invalid plantCode', async () => {
    const res = await request(app)
      .get('/kpi004')
      .query({ plantCode: 'invalidPlant', unitCode: 'validUnit', fiscalYear: '2023' })
      .expect(400);

    expect(res.body.Success).to.be.false;
    expect(res.body.Message).to.equal('Invalid plant code');
  });

  it('should return 400 for invalid unitCode', async () => {
    const res = await request(app)
      .get('/kpi004')
      .query({ plantCode: 'validPlant', unitCode: 'invalidUnit', fiscalYear: '2023' })
      .expect(400);

    expect(res.body.Success).to.be.false;
    expect(res.body.Message).to.equal('Invalid plant and unit code');
  });

  it('should return 400 for invalid fiscalYear', async () => {
    const res = await request(app)
      .get('/kpi004')
      .query({ plantCode: 'validPlant', unitCode: 'validUnit', fiscalYear: 'invalidYear' })
      .expect(400);

    expect(res.body.Success).to.be.false;
    expect(res.body.Message).to.equal('Invalid fiscal year');
  });

  it('should return 200 with no data found message for valid inputs but no data', async () => {
    const res = await request(app)
      .get('/kpi004')
      .query({ plantCode: 'noDataPlant', unitCode: 'noDataUnit', fiscalYear: '2023' })
      .expect(200);

    expect(res.body.Success).to.be.false;
    expect(res.body.Message).to.equal('No data found');
  });

  it('should return 500 for internal server error', async () => {
    const res = await request(app)
      .get('/kpi004')
      .query({ plantCode: 'errorPlant', unitCode: 'errorUnit', fiscalYear: '2023' })
      .expect(500);

    expect(res.body.Success).to.be.false;
    expect(res.body.Message).to.equal('Internal server error');
  });

  it('should return 200 and valid data for valid plantCode and fiscalYear without unitCode', async () => {
    const res = await request(app)
      .get('/kpi004')
      .query({ plantCode: 'validPlant', fiscalYear: '2023' })
      .expect(200);

    const responseBody: KPI004Response = res.body;
    expect(responseBody.Success).to.be.true;
    expect(responseBody.Data).to.have.property('PlantCode', 'validPlant');
  });

  it('should return 400 for missing plantCode', async () => {
    const res = await request(app)
      .get('/kpi004')
      .query({ unitCode: 'validUnit', fiscalYear: '2023' })
      .expect(400);

    expect(res.body.Success).to.be.false;
    expect(res.body.Message).to.equal('Invalid plant code');
  });

  it('should return 400 for missing fiscalYear', async () => {
    const res = await request(app)
      .get('/kpi004')
      .query({ plantCode: 'validPlant', unitCode: 'validUnit' })
      .expect(400);

    expect(res.body.Success).to.be.false;
    expect(res.body.Message).to.equal('Invalid fiscal year');
  });

  it('should return 200 and valid data for valid plantCode and fiscalYear with undefined unitCode', async () => {
    const res = await request(app)
      .get('/kpi004')
      .query({ plantCode: 'validPlant', unitCode: 'undefined', fiscalYear: '2023' })
      .expect(200);

    const responseBody: KPI004Response = res.body;
    expect(responseBody.Success).to.be.true;
    expect(responseBody.Data).to.have.property('PlantCode', 'validPlant');
  });

  it('should return 200 and valid data for valid plantCode, unitCode, and fiscalYear with extra query params', async () => {
    const res = await request(app)
      .get('/kpi004')
      .query({ plantCode: 'validPlant', unitCode: 'validUnit', fiscalYear: '2023', extraParam: 'extraValue' })
      .expect(200);

    const responseBody: KPI004Response = res.body;
    expect(responseBody.Success).to.be.true;
    expect(responseBody.Data).to.have.property('PlantCode', 'validPlant');
  });

  it('should return 400 for invalid query parameter types', async () => {
    const res = await request(app)
      .get('/kpi004')
      .query({ plantCode: 123, unitCode: true, fiscalYear: {} })
      .expect(400);

    expect(res.body.Success).to.be.false;
    expect(res.body.Message).to.equal('Invalid query parameters');
  });

  it('should return 200 and valid data for valid plantCode, unitCode, and fiscalYear with leading/trailing spaces', async () => {
    const res = await request(app)
      .get('/kpi004')
      .query({ plantCode: ' validPlant ', unitCode: ' validUnit ', fiscalYear: ' 2023 ' })
      .expect(200);

    const responseBody: KPI004Response = res.body;
    expect(responseBody.Success).to.be.true;
    expect(responseBody.Data).to.have.property('PlantCode', 'validPlant');
  });

  it('should return 200 and valid data for valid plantCode, unitCode, and fiscalYear with special characters', async () => {
    const res = await request(app)
      .get('/kpi004')
      .query({ plantCode: 'valid@Plant', unitCode: 'valid#Unit', fiscalYear: '2023' })
      .expect(200);

    const responseBody: KPI004Response = res.body;
    expect(responseBody.Success).to.be.true;
    expect(responseBody.Data).to.have.property('PlantCode', 'valid@Plant');
  });

  it('should return 200 and valid data for valid plantCode, unitCode, and fiscalYear with numeric values', async () => {
    const res = await request(app)
      .get('/kpi004')
      .query({ plantCode: '123', unitCode: '456', fiscalYear: '2023' })
      .expect(200);

    const responseBody: KPI004Response = res.body;
    expect(responseBody.Success).to.be.true;
    expect(responseBody.Data).to.have.property('PlantCode', '123');
  });

  it('should return 200 and valid data for valid plantCode, unitCode, and fiscalYear with mixed case', async () => {
    const res = await request(app)
      .get('/kpi004')
      .query({ plantCode: 'ValidPlant', unitCode: 'ValidUnit', fiscalYear: '2023' })
      .expect(200);

    const responseBody: KPI004Response = res.body;
    expect(responseBody.Success).to.be.true;
    expect(responseBody.Data).to.have.property('PlantCode', 'ValidPlant');
  });

  it('should return 200 and valid data for valid plantCode, unitCode, and fiscalYear with long string values', async () => {
    const res = await request(app)
      .get('/kpi004')
      .query({ plantCode: 'a'.repeat(255), unitCode: 'b'.repeat(255), fiscalYear: '2023' })
      .expect(200);

    const responseBody: KPI004Response = res.body;
    expect(responseBody.Success).to.be.true;
    expect(responseBody.Data).to.have.property('PlantCode', 'a'.repeat(255));
  });

  it('should return 200 and valid data for valid plantCode, unitCode, and fiscalYear with short string values', async () => {
    const res = await request(app)
      .get('/kpi004')
      .query({ plantCode: 'a', unitCode: 'b', fiscalYear: '2023' })
      .expect(200);

    const responseBody: KPI004Response = res.body;
    expect(responseBody.Success).to.be.true;
    expect(responseBody.Data).to.have.property('PlantCode', 'a');
  });

  it('should return 200 and valid data for valid plantCode, unitCode, and fiscalYear with zero values', async () => {
    const res = await request(app)
      .get('/kpi004')
      .query({ plantCode: '0', unitCode: '0', fiscalYear: '2023' })
      .expect(200);

    const responseBody: KPI004Response = res.body;
    expect(responseBody.Success).to.be.true;
    expect(responseBody.Data).to.have.property('PlantCode', '0');
  });
});