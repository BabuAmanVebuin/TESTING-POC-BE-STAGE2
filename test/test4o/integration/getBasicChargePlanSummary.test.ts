```typescript
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

  describe('GET /basic-charge/plan/summary', () => {
    it('should return 200 and the correct data for valid request', async () => {
      await request(app)
        .get('/basic-charge/plan/summary')
        .query({ 'plant-id': 'PLANT1', 'start-fiscal-year': 2020, 'end-fiscal-year': 2022 })
        .expect(200)
        .then((response) => {
          expect(response.body).to.be.an('array');
          expect(response.body[0]).to.have.property('plant-id', 'PLANT1');
        });
    });

    it('should return 400 for missing plant-id', async () => {
      await request(app)
        .get('/basic-charge/plan/summary')
        .query({ 'start-fiscal-year': 2020, 'end-fiscal-year': 2022 })
        .expect(400);
    });

    it('should return 400 for invalid fiscal year range', async () => {
      await request(app)
        .get('/basic-charge/plan/summary')
        .query({ 'plant-id': 'PLANT1', 'start-fiscal-year': 2023, 'end-fiscal-year': 2022 })
        .expect(400);
    });

    it('should return 404 for non-existent plant-id', async () => {
      await request(app)
        .get('/basic-charge/plan/summary')
        .query({ 'plant-id': 'NON_EXISTENT', 'start-fiscal-year': 2020, 'end-fiscal-year': 2022 })
        .expect(404);
    });
  });

  describe('PUT /basic-charge/plan', () => {
    it('should return 200 for successful upsert', async () => {
      await request(app)
        .put('/basic-charge/plan')
        .send({
          plantCode: 'PLANT1',
          unitCode: 'UNIT1',
          fiscalYear: 2022,
          operationInput: 1000,
          maintenanceInput: 500,
          userId: 'user1',
        })
        .expect(200);
    });

    it('should return 400 for missing required fields', async () => {
      await request(app)
        .put('/basic-charge/plan')
        .send({
          plantCode: 'PLANT1',
          fiscalYear: 2022,
          operationInput: 1000,
        })
        .expect(400);
    });

    it('should return 400 for invalid data types', async () => {
      await request(app)
        .put('/basic-charge/plan')
        .send({
          plantCode: 'PLANT1',
          unitCode: 'UNIT1',
          fiscalYear: 'invalid',
          operationInput: 1000,
          maintenanceInput: 500,
          userId: 'user1',
        })
        .expect(400);
    });
  });

  describe('GET /basic-charge/forecast', () => {
    it('should return 200 and the correct data for valid request', async () => {
      await request(app)
        .get('/basic-charge/forecast')
        .query({ 'plant-id': 'PLANT1', 'start-fiscal-year': 2020, 'end-fiscal-year': 2022 })
        .expect(200)
        .then((response) => {
          expect(response.body).to.be.an('array');
          expect(response.body[0]).to.have.property('plant-id', 'PLANT1');
        });
    });

    it('should return 400 for missing plant-id', async () => {
      await request(app)
        .get('/basic-charge/forecast')
        .query({ 'start-fiscal-year': 2020, 'end-fiscal-year': 2022 })
        .expect(400);
    });

    it('should return 400 for invalid fiscal year range', async () => {
      await request(app)
        .get('/basic-charge/forecast')
        .query({ 'plant-id': 'PLANT1', 'start-fiscal-year': 2023, 'end-fiscal-year': 2022 })
        .expect(400);
    });

    it('should return 404 for non-existent plant-id', async () => {
      await request(app)
        .get('/basic-charge/forecast')
        .query({ 'plant-id': 'NON_EXISTENT', 'start-fiscal-year': 2020, 'end-fiscal-year': 2022 })
        .expect(404);
    });
  });

  describe('PUT /basic-charge/forecast', () => {
    it('should return 200 for successful upsert', async () => {
      await request(app)
        .put('/basic-charge/forecast')
        .send({
          plantCode: 'PLANT1',
          unitCode: 'UNIT1',
          fiscalYear: 2022,
          operationInput: 1000,
          maintenanceInput: 500,
          userId: 'user1',
        })
        .expect(200);
    });

    it('should return 400 for missing required fields', async () => {
      await request(app)
        .put('/basic-charge/forecast')
        .send({
          plantCode: 'PLANT1',
          fiscalYear: 2022,
          operationInput: 1000,
        })
        .expect(400);
    });

    it('should return 400 for invalid data types', async () => {
      await request(app)
        .put('/basic-charge/forecast')
        .send({
          plantCode: 'PLANT1',
          unitCode: 'UNIT1',
          fiscalYear: 'invalid',
          operationInput: 1000,
          maintenanceInput: 500,
          userId: 'user1',
        })
        .expect(400);
    });
  });

  describe('GET /basic-charge/forecast/summary', () => {
    it('should return 200 and the correct data for valid request', async () => {
      await request(app)
        .get('/basic-charge/forecast/summary')
        .query({ 'plant-id': 'PLANT1', 'start-fiscal-year': 2020, 'end-fiscal-year': 2022 })
        .expect(200)
        .then((response) => {
          expect(response.body).to.be.an('array');
          expect(response.body[0]).to.have.property('plant-id', 'PLANT1');
        });
    });

    it('should return 400 for missing plant-id', async () => {
      await request(app)
        .get('/basic-charge/forecast/summary')
        .query({ 'start-fiscal-year': 2020, 'end-fiscal-year': 2022 })
        .expect(400);
    });

    it('should return 400 for invalid fiscal year range', async () => {
      await request(app)
        .get('/basic-charge/forecast/summary')
        .query({ 'plant-id': 'PLANT1', 'start-fiscal-year': 2023, 'end-fiscal-year': 2022 })
        .expect(400);
    });

    it('should return 404 for non-existent plant-id', async () => {
      await request(app)
        .get('/basic-charge/forecast/summary')
        .query({ 'plant-id': 'NON_EXISTENT', 'start-fiscal-year': 2020, 'end-fiscal-year': 2022 })
        .expect(404);
    });
  });
});
```