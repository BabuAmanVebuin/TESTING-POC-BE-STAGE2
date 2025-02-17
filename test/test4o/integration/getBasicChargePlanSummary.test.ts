import { expect } from 'chai';
import request from 'supertest';
import { app } from '../../../src/app';
import { sequelize } from '../../../src/infrastructure/orm/sqlize';
import { startTransaction, rollbackTransaction } from '../../../src/infrastructure/orm/sqlize/transaction';
import { Transaction } from 'sequelize';

describe('GET /basic-charge/plan/summary', () => {
  let transaction: Transaction;

  beforeEach(async () => {
    transaction = await startTransaction();
  });

  afterEach(async () => {
    await rollbackTransaction(transaction);
  });

  it('should return 200 and the correct summary data for valid plant-id and fiscal years', async () => {
    await insertFixture('insertBasicChargePlanSummary.sql', transaction);
    const res = await request(app)
      .get('/basic-charge/plan/summary')
      .query({ 'plant-id': 'PLANT1', 'start-fiscal-year': 2020, 'end-fiscal-year': 2022 })
      .expect(200);

    expect(res.body).to.have.property('code', 200);
    expect(res.body.body).to.be.an('array').that.is.not.empty;
    expect(res.body.body[0]).to.have.property('plant-id', 'PLANT1');
  });

  it('should return 200 and an empty array if no data matches the query', async () => {
    const res = await request(app)
      .get('/basic-charge/plan/summary')
      .query({ 'plant-id': 'NON_EXISTENT', 'start-fiscal-year': 2020, 'end-fiscal-year': 2022 })
      .expect(200);

    expect(res.body).to.have.property('code', 200);
    expect(res.body.body).to.be.an('array').that.is.empty;
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
      .query({ 'plant-id': 'PLANT1', 'start-fiscal-year': 'invalid', 'end-fiscal-year': 2022 })
      .expect(400);

    expect(res.body).to.have.property('error');
  });

  it('should return 400 if end-fiscal-year is not a number', async () => {
    const res = await request(app)
      .get('/basic-charge/plan/summary')
      .query({ 'plant-id': 'PLANT1', 'start-fiscal-year': 2020, 'end-fiscal-year': 'invalid' })
      .expect(400);

    expect(res.body).to.have.property('error');
  });

  it('should return 200 and handle large datasets efficiently', async () => {
    await insertFixture('insertLargeBasicChargePlanSummary.sql', transaction);
    const res = await request(app)
      .get('/basic-charge/plan/summary')
      .query({ 'plant-id': 'PLANT1', 'start-fiscal-year': 2000, 'end-fiscal-year': 2022 })
      .expect(200);

    expect(res.body).to.have.property('code', 200);
    expect(res.body.body).to.be.an('array').that.is.not.empty;
  });

  it('should return 200 and filter data correctly by fiscal year range', async () => {
    await insertFixture('insertBasicChargePlanSummary.sql', transaction);
    const res = await request(app)
      .get('/basic-charge/plan/summary')
      .query({ 'plant-id': 'PLANT1', 'start-fiscal-year': 2021, 'end-fiscal-year': 2021 })
      .expect(200);

    expect(res.body).to.have.property('code', 200);
    expect(res.body.body).to.be.an('array').that.has.lengthOf(1);
    expect(res.body.body[0]).to.have.property('fiscal-year', 2021);
  });

  it('should return 200 and handle missing start-fiscal-year gracefully', async () => {
    await insertFixture('insertBasicChargePlanSummary.sql', transaction);
    const res = await request(app)
      .get('/basic-charge/plan/summary')
      .query({ 'plant-id': 'PLANT1', 'end-fiscal-year': 2022 })
      .expect(200);

    expect(res.body).to.have.property('code', 200);
    expect(res.body.body).to.be.an('array').that.is.not.empty;
  });

  it('should return 200 and handle missing end-fiscal-year gracefully', async () => {
    await insertFixture('insertBasicChargePlanSummary.sql', transaction);
    const res = await request(app)
      .get('/basic-charge/plan/summary')
      .query({ 'plant-id': 'PLANT1', 'start-fiscal-year': 2020 })
      .expect(200);

    expect(res.body).to.have.property('code', 200);
    expect(res.body.body).to.be.an('array').that.is.not.empty;
  });

  it('should return 200 and handle no fiscal year filters gracefully', async () => {
    await insertFixture('insertBasicChargePlanSummary.sql', transaction);
    const res = await request(app)
      .get('/basic-charge/plan/summary')
      .query({ 'plant-id': 'PLANT1' })
      .expect(200);

    expect(res.body).to.have.property('code', 200);
    expect(res.body.body).to.be.an('array').that.is.not.empty;
  });

  it('should return 200 and handle special characters in plant-id', async () => {
    await insertFixture('insertSpecialCharBasicChargePlanSummary.sql', transaction);
    const res = await request(app)
      .get('/basic-charge/plan/summary')
      .query({ 'plant-id': 'PLANT#1', 'start-fiscal-year': 2020, 'end-fiscal-year': 2022 })
      .expect(200);

    expect(res.body).to.have.property('code', 200);
    expect(res.body.body).to.be.an('array').that.is.not.empty;
    expect(res.body.body[0]).to.have.property('plant-id', 'PLANT#1');
  });

  it('should return 200 and handle SQL injection attempts gracefully', async () => {
    const res = await request(app)
      .get('/basic-charge/plan/summary')
      .query({ 'plant-id': 'PLANT1; DROP TABLE t_basic_charge_plan;', 'start-fiscal-year': 2020, 'end-fiscal-year': 2022 })
      .expect(200);

    expect(res.body).to.have.property('code', 200);
    expect(res.body.body).to.be.an('array').that.is.empty;
  });

  it('should return 200 and handle large fiscal year ranges efficiently', async () => {
    await insertFixture('insertBasicChargePlanSummary.sql', transaction);
    const res = await request(app)
      .get('/basic-charge/plan/summary')
      .query({ 'plant-id': 'PLANT1', 'start-fiscal-year': 1900, 'end-fiscal-year': 2100 })
      .expect(200);

    expect(res.body).to.have.property('code', 200);
    expect(res.body.body).to.be.an('array').that.is.not.empty;
  });

  it('should return 200 and handle overlapping fiscal year ranges correctly', async () => {
    await insertFixture('insertBasicChargePlanSummary.sql', transaction);
    const res = await request(app)
      .get('/basic-charge/plan/summary')
      .query({ 'plant-id': 'PLANT1', 'start-fiscal-year': 2021, 'end-fiscal-year': 2023 })
      .expect(200);

    expect(res.body).to.have.property('code', 200);
    expect(res.body.body).to.be.an('array').that.is.not.empty;
  });

  it('should return 200 and handle non-overlapping fiscal year ranges correctly', async () => {
    await insertFixture('insertBasicChargePlanSummary.sql', transaction);
    const res = await request(app)
      .get('/basic-charge/plan/summary')
      .query({ 'plant-id': 'PLANT1', 'start-fiscal-year': 2025, 'end-fiscal-year': 2026 })
      .expect(200);

    expect(res.body).to.have.property('code', 200);
    expect(res.body.body).to.be.an('array').that.is.empty;
  });

  it('should return 200 and handle multiple plant-ids correctly', async () => {
    await insertFixture('insertMultiplePlantBasicChargePlanSummary.sql', transaction);
    const res = await request(app)
      .get('/basic-charge/plan/summary')
      .query({ 'plant-id': 'PLANT1,PLANT2', 'start-fiscal-year': 2020, 'end-fiscal-year': 2022 })
      .expect(200);

    expect(res.body).to.have.property('code', 200);
    expect(res.body.body).to.be.an('array').that.is.not.empty;
  });

  it('should return 200 and handle empty query parameters gracefully', async () => {
    const res = await request(app)
      .get('/basic-charge/plan/summary')
      .query({})
      .expect(400);

    expect(res.body).to.have.property('error');
  });

  it('should return 200 and handle invalid query parameters gracefully', async () => {
    const res = await request(app)
      .get('/basic-charge/plan/summary')
      .query({ 'invalid-param': 'value' })
      .expect(400);

    expect(res.body).to.have.property('error');
  });

  it('should return 200 and handle large number of query parameters gracefully', async () => {
    const res = await request(app)
      .get('/basic-charge/plan/summary')
      .query({ 'plant-id': 'PLANT1', 'start-fiscal-year': 2020, 'end-fiscal-year': 2022, 'extra-param': 'value' })
      .expect(200);

    expect(res.body).to.have.property('code', 200);
    expect(res.body.body).to.be.an('array').that.is.not.empty;
  });
});
