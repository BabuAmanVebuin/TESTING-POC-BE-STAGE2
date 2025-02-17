```typescript
import { expect } from 'chai';
import request from 'supertest';
import { sequelize } from '../../../src/infrastructure/orm/sqlize/index';
import { BasicChargeRoutes } from '../../../src/infrastructure/webserver/express/routes';
import Express from 'express';

const app = Express();
BasicChargeRoutes(app);

describe('Basic Charge API Integration Tests', () => {
  let transaction;

  beforeEach(async () => {
    transaction = await sequelize.transaction();
  });

  afterEach(async () => {
    await transaction.rollback();
  });

  describe('GET /basic-charge/plan', () => {
    it('should return 200 and an empty array when no data is present', async () => {
      const res = await request(app)
        .get('/basic-charge/plan')
        .set('Accept', 'application/json')
        .expect(200);

      expect(res.body).to.be.an('array').that.is.empty;
    });

    it('should return 200 and the correct data when data is present', async () => {
      await sequelize.query(
        `INSERT INTO t_basic_charge_plan (PLANT_CODE, UNIT_CODE, FISCAL_YEAR, OPERATION_INPUT, MAINTENANCE_INPUT, CREATED_DATETIME, UPDATED_DATETIME, CREATE_BY, UPDATE_BY)
         VALUES ('plant1', 'unit1', 2023, 100, 200, NOW(), NOW(), 'user1', 'user1')`,
        { transaction }
      );

      const res = await request(app)
        .get('/basic-charge/plan')
        .set('Accept', 'application/json')
        .expect(200);

      expect(res.body).to.be.an('array').that.has.lengthOf(1);
      expect(res.body[0]).to.include({
        PLANT_CODE: 'plant1',
        UNIT_CODE: 'unit1',
        FISCAL_YEAR: 2023,
        OPERATION_INPUT: 100,
        MAINTENANCE_INPUT: 200,
      });
    });
  });

  describe('PUT /basic-charge/plan', () => {
    it('should return 200 and upsert data successfully', async () => {
      const payload = [
        {
          "plant-id": "plant1",
          "unit-id": "unit1",
          "fiscal-year": 2023,
          "operation-input": 150,
          "maintenance-input": 250,
          "user-id": "user1"
        }
      ];

      const res = await request(app)
        .put('/basic-charge/plan')
        .send(payload)
        .set('Accept', 'application/json')
        .expect(200);

      expect(res.body).to.equal('OK');

      const [result] = await sequelize.query(
        `SELECT * FROM t_basic_charge_plan WHERE PLANT_CODE = 'plant1' AND UNIT_CODE = 'unit1' AND FISCAL_YEAR = 2023`,
        { transaction }
      );

      expect(result).to.have.lengthOf(1);
      expect(result[0]).to.include({
        PLANT_CODE: 'plant1',
        UNIT_CODE: 'unit1',
        FISCAL_YEAR: 2023,
        OPERATION_INPUT: 150,
        MAINTENANCE_INPUT: 250,
      });
    });

    it('should return 400 for invalid payload', async () => {
      const payload = [
        {
          "plant-id": "plant1",
          "unit-id": "unit1",
          "fiscal-year": "invalid-year",
          "operation-input": 150,
          "maintenance-input": 250,
          "user-id": "user1"
        }
      ];

      await request(app)
        .put('/basic-charge/plan')
        .send(payload)
        .set('Accept', 'application/json')
        .expect(400);
    });
  });

  describe('GET /basic-charge/forecast', () => {
    it('should return 200 and an empty array when no forecast data is present', async () => {
      const res = await request(app)
        .get('/basic-charge/forecast')
        .set('Accept', 'application/json')
        .expect(200);

      expect(res.body).to.be.an('array').that.is.empty;
    });

    it('should return 200 and the correct forecast data when data is present', async () => {
      await sequelize.query(
        `INSERT INTO t_basic_charge_forecast (PLANT_CODE, UNIT_CODE, FISCAL_YEAR, OPERATION_INPUT, MAINTENANCE_INPUT, CREATED_DATETIME, UPDATED_DATETIME, CREATE_BY, UPDATE_BY)
         VALUES ('plant1', 'unit1', 2023, 100, 200, NOW(), NOW(), 'user1', 'user1')`,
        { transaction }
      );

      const res = await request(app)
        .get('/basic-charge/forecast')
        .set('Accept', 'application/json')
        .expect(200);

      expect(res.body).to.be.an('array').that.has.lengthOf(1);
      expect(res.body[0]).to.include({
        PLANT_CODE: 'plant1',
        UNIT_CODE: 'unit1',
        FISCAL_YEAR: 2023,
        OPERATION_INPUT: 100,
        MAINTENANCE_INPUT: 200,
      });
    });
  });

  describe('PUT /basic-charge/forecast', () => {
    it('should return 200 and upsert forecast data successfully', async () => {
      const payload = [
        {
          "plant-id": "plant1",
          "unit-id": "unit1",
          "fiscal-year": 2023,
          "operation-input": 150,
          "maintenance-input": 250,
          "user-id": "user1"
        }
      ];

      const res = await request(app)
        .put('/basic-charge/forecast')
        .send(payload)
        .set('Accept', 'application/json')
        .expect(200);

      expect(res.body).to.equal('OK');

      const [result] = await sequelize.query(
        `SELECT * FROM t_basic_charge_forecast WHERE PLANT_CODE = 'plant1' AND UNIT_CODE = 'unit1' AND FISCAL_YEAR = 2023`,
        { transaction }
      );

      expect(result).to.have.lengthOf(1);
      expect(result[0]).to.include({
        PLANT_CODE: 'plant1',
        UNIT_CODE: 'unit1',
        FISCAL_YEAR: 2023,
        OPERATION_INPUT: 150,
        MAINTENANCE_INPUT: 250,
      });
    });

    it('should return 400 for invalid forecast payload', async () => {
      const payload = [
        {
          "plant-id": "plant1",
          "unit-id": "unit1",
          "fiscal-year": "invalid-year",
          "operation-input": 150,
          "maintenance-input": 250,
          "user-id": "user1"
        }
      ];

      await request(app)
        .put('/basic-charge/forecast')
        .send(payload)
        .set('Accept', 'application/json')
        .expect(400);
    });
  });

  describe('GET /basic-charge/plan/summary', () => {
    it('should return 200 and an empty array when no plan summary data is present', async () => {
      const res = await request(app)
        .get('/basic-charge/plan/summary')
        .set('Accept', 'application/json')
        .expect(200);

      expect(res.body).to.be.an('array').that.is.empty;
    });

    it('should return 200 and the correct plan summary data when data is present', async () => {
      await sequelize.query(
        `INSERT INTO t_basic_charge_plan (PLANT_CODE, FISCAL_YEAR, OPERATION_INPUT, MAINTENANCE_INPUT, CREATED_DATETIME, UPDATED_DATETIME, CREATE_BY, UPDATE_BY)
         VALUES ('plant1', 2023, 100, 200, NOW(), NOW(), 'user1', 'user1')`,
        { transaction }
      );

      const res = await request(app)
        .get('/basic-charge/plan/summary')
        .set('Accept', 'application/json')
        .expect(200);

      expect(res.body).to.be.an('array').that.has.lengthOf(1);
      expect(res.body[0]).to.include({
        PLANT_CODE: 'plant1',
        FISCAL_YEAR: 2023,
        VALUE: 300,
      });
    });
  });

  describe('GET /basic-charge/forecast/summary', () => {
    it('should return 200 and an empty array when no forecast summary data is present', async () => {
      const res = await request(app)
        .get('/basic-charge/forecast/summary')
        .set('Accept', 'application/json')
        .expect(200);

      expect(res.body).to.be.an('array').that.is.empty;
    });

    it('should return 200 and the correct forecast summary data when data is present', async () => {
      await sequelize.query(
        `INSERT INTO t_basic_charge_forecast (PLANT_CODE, FISCAL_YEAR, OPERATION_INPUT, MAINTENANCE_INPUT, CREATED_DATETIME, UPDATED_DATETIME, CREATE_BY, UPDATE_BY)
         VALUES ('plant1', 2023, 100, 200, NOW(), NOW(), 'user1', 'user1')`,
        { transaction }
      );

      const res = await request(app)
        .get('/basic-charge/forecast/summary')
        .set('Accept', 'application/json')
        .expect(200);

      expect(res.body).to.be.an('array').that.has.lengthOf(1);
      expect(res.body[0]).to.include({
        PLANT_CODE: 'plant1',
        FISCAL_YEAR: 2023,
        VALUE: 300,
      });
    });
  });
});
```