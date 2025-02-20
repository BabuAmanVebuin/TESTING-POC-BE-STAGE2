import express from 'express';
import { expect } from 'chai';
import request from 'supertest';
import { Transaction } from 'sequelize';
import { sequelize } from '../../../src/infrastructure/orm/sqlize/index';
import { BasicChargeRoutes } from '../../../src/infrastructure/routes/dpm/basicChargeRoutes';

const app = express();
app.use(express.json());
BasicChargeRoutes(app);

describe('PUT /basic-charge/plan', () => {
  let transaction: Transaction;

  beforeEach(async () => {
    transaction = await sequelize.transaction();
  });

  afterEach(async () => {
    await transaction.rollback();
  });

  it('should successfully upsert a basic charge plan', async () => {
    const payload = [
      {
        "plant-id": "PLANT1",
        "unit-id": "UNIT1",
        "fiscal-year": 2023,
        "operation-input": 100,
        "maintenance-input": 50,
        "user-id": "USER1"
      }
    ];

    const response = await request(app)
      .put('/basic-charge/plan')
      .send(payload)
      .set('Accept', 'application/json');

    expect(response.status).to.equal(200);
    expect(response.body).to.equal('OK');
  });

  it('should handle empty payload gracefully', async () => {
    const payload: any[] = [];

    const response = await request(app)
      .put('/basic-charge/plan')
      .send(payload)
      .set('Accept', 'application/json');

    expect(response.status).to.equal(200);
    expect(response.body).to.equal('OK');
  });

  it('should return error for missing plant-id', async () => {
    const payload = [
      {
        "unit-id": "UNIT1",
        "fiscal-year": 2023,
        "operation-input": 100,
        "maintenance-input": 50,
        "user-id": "USER1"
      }
    ];

    const response = await request(app)
      .put('/basic-charge/plan')
      .send(payload)
      .set('Accept', 'application/json');

    expect(response.status).to.equal(400);
  });

  it('should return error for missing unit-id', async () => {
    const payload = [
      {
        "plant-id": "PLANT1",
        "fiscal-year": 2023,
        "operation-input": 100,
        "maintenance-input": 50,
        "user-id": "USER1"
      }
    ];

    const response = await request(app)
      .put('/basic-charge/plan')
      .send(payload)
      .set('Accept', 'application/json');

    expect(response.status).to.equal(400);
  });

  it('should return error for missing fiscal-year', async () => {
    const payload = [
      {
        "plant-id": "PLANT1",
        "unit-id": "UNIT1",
        "operation-input": 100,
        "maintenance-input": 50,
        "user-id": "USER1"
      }
    ];

    const response = await request(app)
      .put('/basic-charge/plan')
      .send(payload)
      .set('Accept', 'application/json');

    expect(response.status).to.equal(400);
  });

  it('should return error for missing operation-input', async () => {
    const payload = [
      {
        "plant-id": "PLANT1",
        "unit-id": "UNIT1",
        "fiscal-year": 2023,
        "maintenance-input": 50,
        "user-id": "USER1"
      }
    ];

    const response = await request(app)
      .put('/basic-charge/plan')
      .send(payload)
      .set('Accept', 'application/json');

    expect(response.status).to.equal(400);
  });

  it('should return error for missing maintenance-input', async () => {
    const payload = [
      {
        "plant-id": "PLANT1",
        "unit-id": "UNIT1",
        "fiscal-year": 2023,
        "operation-input": 100,
        "user-id": "USER1"
      }
    ];

    const response = await request(app)
      .put('/basic-charge/plan')
      .send(payload)
      .set('Accept', 'application/json');

    expect(response.status).to.equal(400);
  });

  it('should return error for missing user-id', async () => {
    const payload = [
      {
        "plant-id": "PLANT1",
        "unit-id": "UNIT1",
        "fiscal-year": 2023,
        "operation-input": 100,
        "maintenance-input": 50
      }
    ];

    const response = await request(app)
      .put('/basic-charge/plan')
      .send(payload)
      .set('Accept', 'application/json');

    expect(response.status).to.equal(400);
  });

  it('should return error for invalid fiscal-year type', async () => {
    const payload = [
      {
        "plant-id": "PLANT1",
        "unit-id": "UNIT1",
        "fiscal-year": "2023",
        "operation-input": 100,
        "maintenance-input": 50,
        "user-id": "USER1"
      }
    ];

    const response = await request(app)
      .put('/basic-charge/plan')
      .send(payload)
      .set('Accept', 'application/json');

    expect(response.status).to.equal(400);
  });

  it('should return error for invalid operation-input type', async () => {
    const payload = [
      {
        "plant-id": "PLANT1",
        "unit-id": "UNIT1",
        "fiscal-year": 2023,
        "operation-input": "100",
        "maintenance-input": 50,
        "user-id": "USER1"
      }
    ];

    const response = await request(app)
      .put('/basic-charge/plan')
      .send(payload)
      .set('Accept', 'application/json');

    expect(response.status).to.equal(400);
  });

  it('should return error for invalid maintenance-input type', async () => {
    const payload = [
      {
        "plant-id": "PLANT1",
        "unit-id": "UNIT1",
        "fiscal-year": 2023,
        "operation-input": 100,
        "maintenance-input": "50",
        "user-id": "USER1"
      }
    ];

    const response = await request(app)
      .put('/basic-charge/plan')
      .send(payload)
      .set('Accept', 'application/json');

    expect(response.status).to.equal(400);
  });

  it('should return error for invalid user-id type', async () => {
    const payload = [
      {
        "plant-id": "PLANT1",
        "unit-id": "UNIT1",
        "fiscal-year": 2023,
        "operation-input": 100,
        "maintenance-input": 50,
        "user-id": 123
      }
    ];

    const response = await request(app)
      .put('/basic-charge/plan')
      .send(payload)
      .set('Accept', 'application/json');

    expect(response.status).to.equal(400);
  });

  it('should handle null operation-input', async () => {
    const payload = [
      {
        "plant-id": "PLANT1",
        "unit-id": "UNIT1",
        "fiscal-year": 2023,
        "operation-input": null,
        "maintenance-input": 50,
        "user-id": "USER1"
      }
    ];

    const response = await request(app)
      .put('/basic-charge/plan')
      .send(payload)
      .set('Accept', 'application/json');

    expect(response.status).to.equal(200);
    expect(response.body).to.equal('OK');
  });

  it('should handle null maintenance-input', async () => {
    const payload = [
      {
        "plant-id": "PLANT1",
        "unit-id": "UNIT1",
        "fiscal-year": 2023,
        "operation-input": 100,
        "maintenance-input": null,
        "user-id": "USER1"
      }
    ];

    const response = await request(app)
      .put('/basic-charge/plan')
      .send(payload)
      .set('Accept', 'application/json');

    expect(response.status).to.equal(200);
    expect(response.body).to.equal('OK');
  });

  it('should handle multiple entries in payload', async () => {
    const payload = [
      {
        "plant-id": "PLANT1",
        "unit-id": "UNIT1",
        "fiscal-year": 2023,
        "operation-input": 100,
        "maintenance-input": 50,
        "user-id": "USER1"
      },
      {
        "plant-id": "PLANT2",
        "unit-id": "UNIT2",
        "fiscal-year": 2024,
        "operation-input": 200,
        "maintenance-input": 100,
        "user-id": "USER2"
      }
    ];

    const response = await request(app)
      .put('/basic-charge/plan')
      .send(payload)
      .set('Accept', 'application/json');

    expect(response.status).to.equal(200);
    expect(response.body).to.equal('OK');
  });

  it('should return error for duplicate entries in payload', async () => {
    const payload = [
      {
        "plant-id": "PLANT1",
        "unit-id": "UNIT1",
        "fiscal-year": 2023,
        "operation-input": 100,
        "maintenance-input": 50,
        "user-id": "USER1"
      },
      {
        "plant-id": "PLANT1",
        "unit-id": "UNIT1",
        "fiscal-year": 2023,
        "operation-input": 200,
        "maintenance-input": 100,
        "user-id": "USER1"
      }
    ];

    const response = await request(app)
      .put('/basic-charge/plan')
      .send(payload)
      .set('Accept', 'application/json');

    expect(response.status).to.equal(400);
  });

  it('should return error for invalid JSON payload', async () => {
    const payload = '{ "plant-id": "PLANT1", "unit-id": "UNIT1", "fiscal-year": 2023, "operation-input": 100, "maintenance-input": 50, "user-id": "USER1" ';

    const response = await request(app)
      .put('/basic-charge/plan')
      .send(payload)
      .set('Accept', 'application/json');

    expect(response.status).to.equal(400);
  });

  it('should return error for unsupported HTTP method', async () => {
    const payload = [
      {
        "plant-id": "PLANT1",
        "unit-id": "UNIT1",
        "fiscal-year": 2023,
        "operation-input": 100,
        "maintenance-input": 50,
        "user-id": "USER1"
      }
    ];

    const response = await request(app)
      .post('/basic-charge/plan')
      .send(payload)
      .set('Accept', 'application/json');

    expect(response.status).to.equal(404);
  });

  it('should return error for missing Content-Type header', async () => {
    const payload = [
      {
        "plant-id": "PLANT1",
        "unit-id": "UNIT1",
        "fiscal-year": 2023,
        "operation-input": 100,
        "maintenance-input": 50,
        "user-id": "USER1"
      }
    ];

    const response = await request(app)
      .put('/basic-charge/plan')
      .send(payload);

    expect(response.status).to.equal(400);
  });
});