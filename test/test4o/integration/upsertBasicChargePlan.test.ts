import express from 'express';
import { expect } from 'chai';
import request from 'supertest';
import { Transaction } from 'sequelize';
import { sequelize } from '../../../src/infrastructure/orm/sqlize/index.js';
import { BasicChargeRoutes } from '../../../src/infrastructure/webserver/express/basicChargeRoutes.js';

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
        "plant-id": "plant1",
        "unit-id": "unit1",
        "fiscal-year": 2023,
        "operation-input": 100,
        "maintenance-input": 50,
        "user-id": "user1"
      }
    ];

    const response = await request(app)
      .put('/basic-charge/plan')
      .send(payload)
      .set('Accept', 'application/json');

    expect(response.status).to.equal(200);
    expect(response.body).to.equal('OK');
  });

  it('should handle empty input array', async () => {
    const payload: any[] = [];

    const response = await request(app)
      .put('/basic-charge/plan')
      .send(payload)
      .set('Accept', 'application/json');

    expect(response.status).to.equal(200);
    expect(response.body).to.equal('OK');
  });

  it('should fail when plant-id is missing', async () => {
    const payload = [
      {
        "unit-id": "unit1",
        "fiscal-year": 2023,
        "operation-input": 100,
        "maintenance-input": 50,
        "user-id": "user1"
      }
    ];

    const response = await request(app)
      .put('/basic-charge/plan')
      .send(payload)
      .set('Accept', 'application/json');

    expect(response.status).to.equal(400);
  });

  it('should fail when unit-id is missing', async () => {
    const payload = [
      {
        "plant-id": "plant1",
        "fiscal-year": 2023,
        "operation-input": 100,
        "maintenance-input": 50,
        "user-id": "user1"
      }
    ];

    const response = await request(app)
      .put('/basic-charge/plan')
      .send(payload)
      .set('Accept', 'application/json');

    expect(response.status).to.equal(400);
  });

  it('should fail when fiscal-year is missing', async () => {
    const payload = [
      {
        "plant-id": "plant1",
        "unit-id": "unit1",
        "operation-input": 100,
        "maintenance-input": 50,
        "user-id": "user1"
      }
    ];

    const response = await request(app)
      .put('/basic-charge/plan')
      .send(payload)
      .set('Accept', 'application/json');

    expect(response.status).to.equal(400);
  });

  it('should fail when operation-input is missing', async () => {
    const payload = [
      {
        "plant-id": "plant1",
        "unit-id": "unit1",
        "fiscal-year": 2023,
        "maintenance-input": 50,
        "user-id": "user1"
      }
    ];

    const response = await request(app)
      .put('/basic-charge/plan')
      .send(payload)
      .set('Accept', 'application/json');

    expect(response.status).to.equal(400);
  });

  it('should fail when maintenance-input is missing', async () => {
    const payload = [
      {
        "plant-id": "plant1",
        "unit-id": "unit1",
        "fiscal-year": 2023,
        "operation-input": 100,
        "user-id": "user1"
      }
    ];

    const response = await request(app)
      .put('/basic-charge/plan')
      .send(payload)
      .set('Accept', 'application/json');

    expect(response.status).to.equal(400);
  });

  it('should fail when user-id is missing', async () => {
    const payload = [
      {
        "plant-id": "plant1",
        "unit-id": "unit1",
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

  it('should handle null operation-input', async () => {
    const payload = [
      {
        "plant-id": "plant1",
        "unit-id": "unit1",
        "fiscal-year": 2023,
        "operation-input": null,
        "maintenance-input": 50,
        "user-id": "user1"
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
        "plant-id": "plant1",
        "unit-id": "unit1",
        "fiscal-year": 2023,
        "operation-input": 100,
        "maintenance-input": null,
        "user-id": "user1"
      }
    ];

    const response = await request(app)
      .put('/basic-charge/plan')
      .send(payload)
      .set('Accept', 'application/json');

    expect(response.status).to.equal(200);
    expect(response.body).to.equal('OK');
  });

  it('should handle multiple entries', async () => {
    const payload = [
      {
        "plant-id": "plant1",
        "unit-id": "unit1",
        "fiscal-year": 2023,
        "operation-input": 100,
        "maintenance-input": 50,
        "user-id": "user1"
      },
      {
        "plant-id": "plant2",
        "unit-id": "unit2",
        "fiscal-year": 2024,
        "operation-input": 200,
        "maintenance-input": 100,
        "user-id": "user2"
      }
    ];

    const response = await request(app)
      .put('/basic-charge/plan')
      .send(payload)
      .set('Accept', 'application/json');

    expect(response.status).to.equal(200);
    expect(response.body).to.equal('OK');
  });

  it('should fail with invalid fiscal-year type', async () => {
    const payload = [
      {
        "plant-id": "plant1",
        "unit-id": "unit1",
        "fiscal-year": "invalid",
        "operation-input": 100,
        "maintenance-input": 50,
        "user-id": "user1"
      }
    ];

    const response = await request(app)
      .put('/basic-charge/plan')
      .send(payload)
      .set('Accept', 'application/json');

    expect(response.status).to.equal(400);
  });

  it('should fail with invalid operation-input type', async () => {
    const payload = [
      {
        "plant-id": "plant1",
        "unit-id": "unit1",
        "fiscal-year": 2023,
        "operation-input": "invalid",
        "maintenance-input": 50,
        "user-id": "user1"
      }
    ];

    const response = await request(app)
      .put('/basic-charge/plan')
      .send(payload)
      .set('Accept', 'application/json');

    expect(response.status).to.equal(400);
  });

  it('should fail with invalid maintenance-input type', async () => {
    const payload = [
      {
        "plant-id": "plant1",
        "unit-id": "unit1",
        "fiscal-year": 2023,
        "operation-input": 100,
        "maintenance-input": "invalid",
        "user-id": "user1"
      }
    ];

    const response = await request(app)
      .put('/basic-charge/plan')
      .send(payload)
      .set('Accept', 'application/json');

    expect(response.status).to.equal(400);
  });

  it('should fail with invalid user-id type', async () => {
    const payload = [
      {
        "plant-id": "plant1",
        "unit-id": "unit1",
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

  it('should handle large numbers for operation-input and maintenance-input', async () => {
    const payload = [
      {
        "plant-id": "plant1",
        "unit-id": "unit1",
        "fiscal-year": 2023,
        "operation-input": 999999999,
        "maintenance-input": 999999999,
        "user-id": "user1"
      }
    ];

    const response = await request(app)
      .put('/basic-charge/plan')
      .send(payload)
      .set('Accept', 'application/json');

    expect(response.status).to.equal(200);
    expect(response.body).to.equal('OK');
  });

  it('should handle zero values for operation-input and maintenance-input', async () => {
    const payload = [
      {
        "plant-id": "plant1",
        "unit-id": "unit1",
        "fiscal-year": 2023,
        "operation-input": 0,
        "maintenance-input": 0,
        "user-id": "user1"
      }
    ];

    const response = await request(app)
      .put('/basic-charge/plan')
      .send(payload)
      .set('Accept', 'application/json');

    expect(response.status).to.equal(200);
    expect(response.body).to.equal('OK');
  });

  it('should handle negative values for operation-input and maintenance-input', async () => {
    const payload = [
      {
        "plant-id": "plant1",
        "unit-id": "unit1",
        "fiscal-year": 2023,
        "operation-input": -100,
        "maintenance-input": -50,
        "user-id": "user1"
      }
    ];

    const response = await request(app)
      .put('/basic-charge/plan')
      .send(payload)
      .set('Accept', 'application/json');

    expect(response.status).to.equal(200);
    expect(response.body).to.equal('OK');
  });

  it('should handle duplicate entries by updating existing records', async () => {
    const initialPayload = [
      {
        "plant-id": "plant1",
        "unit-id": "unit1",
        "fiscal-year": 2023,
        "operation-input": 100,
        "maintenance-input": 50,
        "user-id": "user1"
      }
    ];

    await request(app)
      .put('/basic-charge/plan')
      .send(initialPayload)
      .set('Accept', 'application/json');

    const updatedPayload = [
      {
        "plant-id": "plant1",
        "unit-id": "unit1",
        "fiscal-year": 2023,
        "operation-input": 200,
        "maintenance-input": 100,
        "user-id": "user1"
      }
    ];

    const response = await request(app)
      .put('/basic-charge/plan')
      .send(updatedPayload)
      .set('Accept', 'application/json');

    expect(response.status).to.equal(200);
    expect(response.body).to.equal('OK');
  });
});