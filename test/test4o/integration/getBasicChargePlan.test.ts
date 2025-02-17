import { expect } from 'chai';
import request from 'supertest';
import { sequelize } from '../../../src/orm/sqlize/index';
import { BasicChargeRoutes } from '../../../src/infrastructure/webserver/express/routes';
import Express from 'express';

const app = Express();
BasicChargeRoutes(app);

describe('Basic Charge API Integration Tests', () => {
  let transaction;

  before(async () => {
    transaction = await sequelize.transaction();
  });

  after(async () => {
    await transaction.rollback();
  });

  describe('GET /basic-charge/plan', () => {
    it('should return 200 and the basic charge plan data', async () => {
      const res = await request(app)
        .get('/basic-charge/plan')
        .query({ 'plant-id': 'P001', 'unit-id': 'U001', 'start-fiscal-year': 2020, 'end-fiscal-year': 2021 })
        .expect(200);

      expect(res.body).to.have.property('code', 200);
      expect(res.body.body).to.be.an('array');
    });

    it('should return 400 for missing plant-id', async () => {
      await request(app)
        .get('/basic-charge/plan')
        .query({ 'unit-id': 'U001', 'start-fiscal-year': 2020, 'end-fiscal-year': 2021 })
        .expect(400);
    });

    it('should return 400 for invalid fiscal year', async () => {
      await request(app)
        .get('/basic-charge/plan')
        .query({ 'plant-id': 'P001', 'unit-id': 'U001', 'start-fiscal-year': 'invalid', 'end-fiscal-year': 2021 })
        .expect(400);
    });
  });

  describe('PUT /basic-charge/plan', () => {
    it('should return 200 and upsert the basic charge plan', async () => {
      const res = await request(app)
        .put('/basic-charge/plan')
        .send({
          'plant-id': 'P001',
          'unit-id': 'U001',
          'fiscal-year': 2022,
          'operation-input': 1000,
          'maintenance-input': 500,
        })
        .expect(200);

      expect(res.body).to.have.property('code', 200);
      expect(res.body.body).to.equal('Upsert successful');
    });

    it('should return 400 for missing fields', async () => {
      await request(app)
        .put('/basic-charge/plan')
        .send({
          'plant-id': 'P001',
          'fiscal-year': 2022,
          'operation-input': 1000,
        })
        .expect(400);
    });

    it('should return 400 for invalid input types', async () => {
      await request(app)
        .put('/basic-charge/plan')
        .send({
          'plant-id': 'P001',
          'unit-id': 'U001',
          'fiscal-year': 'invalid',
          'operation-input': 1000,
          'maintenance-input': 500,
        })
        .expect(400);
    });
  });

  describe('GET /basic-charge/forecast', () => {
    it('should return 200 and the basic charge forecast data', async () => {
      const res = await request(app)
        .get('/basic-charge/forecast')
        .query({ 'plant-id': 'P001', 'unit-id': 'U001', 'start-fiscal-year': 2020, 'end-fiscal-year': 2021 })
        .expect(200);

      expect(res.body).to.have.property('code', 200);
      expect(res.body.body).to.be.an('array');
    });

    it('should return 400 for missing plant-id', async () => {
      await request(app)
        .get('/basic-charge/forecast')
        .query({ 'unit-id': 'U001', 'start-fiscal-year': 2020, 'end-fiscal-year': 2021 })
        .expect(400);
    });

    it('should return 400 for invalid fiscal year', async () => {
      await request(app)
        .get('/basic-charge/forecast')
        .query({ 'plant-id': 'P001', 'unit-id': 'U001', 'start-fiscal-year': 'invalid', 'end-fiscal-year': 2021 })
        .expect(400);
    });
  });

  describe('GET /basic-charge/plan/summary', () => {
    it('should return 200 and the basic charge plan summary', async () => {
      const res = await request(app)
        .get('/basic-charge/plan/summary')
        .query({ 'plant-id': 'P001', 'start-fiscal-year': 2020, 'end-fiscal-year': 2021 })
        .expect(200);

      expect(res.body).to.have.property('code', 200);
      expect(res.body.body).to.be.an('array');
    });

    it('should return 400 for missing plant-id', async () => {
      await request(app)
        .get('/basic-charge/plan/summary')
        .query({ 'start-fiscal-year': 2020, 'end-fiscal-year': 2021 })
        .expect(400);
    });

    it('should return 400 for invalid fiscal year', async () => {
      await request(app)
        .get('/basic-charge/plan/summary')
        .query({ 'plant-id': 'P001', 'start-fiscal-year': 'invalid', 'end-fiscal-year': 2021 })
        .expect(400);
    });
  });

  describe('PUT /basic-charge/forecast', () => {
    it('should return 200 and upsert the basic charge forecast', async () => {
      const res = await request(app)
        .put('/basic-charge/forecast')
        .send({
          'plant-id': 'P001',
          'unit-id': 'U001',
          'fiscal-year': 2022,
          'operation-input': 1000,
          'maintenance-input': 500,
        })
        .expect(200);

      expect(res.body).to.have.property('code', 200);
      expect(res.body.body).to.equal('Upsert successful');
    });

    it('should return 400 for missing fields', async () => {
      await request(app)
        .put('/basic-charge/forecast')
        .send({
          'plant-id': 'P001',
          'fiscal-year': 2022,
          'operation-input': 1000,
        })
        .expect(400);
    });

    it('should return 400 for invalid input types', async () => {
      await request(app)
        .put('/basic-charge/forecast')
        .send({
          'plant-id': 'P001',
          'unit-id': 'U001',
          'fiscal-year': 'invalid',
          'operation-input': 1000,
          'maintenance-input': 500,
        })
        .expect(400);
    });
  });

  describe('GET /basic-charge/forecast/summary', () => {
    it('should return 200 and the basic charge forecast summary', async () => {
      const res = await request(app)
        .get('/basic-charge/forecast/summary')
        .query({ 'plant-id': 'P001', 'start-fiscal-year': 2020, 'end-fiscal-year': 2021 })
        .expect(200);

      expect(res.body).to.have.property('code', 200);
      expect(res.body.body).to.be.an('array');
    });

    it('should return 400 for missing plant-id', async () => {
      await request(app)
        .get('/basic-charge/forecast/summary')
        .query({ 'start-fiscal-year': 2020, 'end-fiscal-year': 2021 })
        .expect(400);
    });

    it('should return 400 for invalid fiscal year', async () => {
      await request(app)
        .get('/basic-charge/forecast/summary')
        .query({ 'plant-id': 'P001', 'start-fiscal-year': 'invalid', 'end-fiscal-year': 2021 })
        .expect(400);
    });
  });
});