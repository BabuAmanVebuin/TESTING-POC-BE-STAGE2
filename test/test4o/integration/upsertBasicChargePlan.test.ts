import express from 'express';
import { expect } from 'chai';
import request from 'supertest';
import { Transaction } from 'sequelize';
import { sequelize } from '../../../src/infrastructure/orm/sqlize';
import { BasicChargeRoutes } from '../../../src/infrastructure/webserver/express/routes';

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

  it('should successfully upsert a basic charge plan with valid data', async () => {
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

  it('should handle empty payload gracefully', async () => {
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

  it('should fail when operation-input is not a number', async () => {
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

  it('should fail when maintenance-input is not a number', async () => {
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

  it('should handle null operation-input and maintenance-input', async () => {
    const payload = [
      {
        "plant-id": "plant1",
        "unit-id": "unit1",
        "fiscal-year": 2023,
        "operation-input": null,
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

  it('should handle multiple entries in the payload', async () => {
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

  it('should fail when fiscal-year is not a number', async () => {
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

  it('should fail when payload is not an array', async () => {
    const payload = {
      "plant-id": "plant1",
      "unit-id": "unit1",
      "fiscal-year": 2023,
      "operation-input": 100,
      "maintenance-input": 50,
      "user-id": "user1"
    };

    const response = await request(app)
      .put('/basic-charge/plan')
      .send(payload)
      .set('Accept', 'application/json');

    expect(response.status).to.equal(400);
  });

  it('should fail when payload is null', async () => {
    const payload = null;

    const response = await request(app)
      .put('/basic-charge/plan')
      .send(payload)
      .set('Accept', 'application/json');

    expect(response.status).to.equal(400);
  });

  it('should fail when payload is an empty object', async () => {
    const payload = {};

    const response = await request(app)
      .put('/basic-charge/plan')
      .send(payload)
      .set('Accept', 'application/json');

    expect(response.status).to.equal(400);
  });

  it('should fail when payload is a string', async () => {
    const payload = "invalid";

    const response = await request(app)
      .put('/basic-charge/plan')
      .send(payload)
      .set('Accept', 'application/json');

    expect(response.status).to.equal(400);
  });

  it('should fail when payload is a number', async () => {
    const payload = 123;

    const response = await request(app)
      .put('/basic-charge/plan')
      .send(payload)
      .set('Accept', 'application/json');

    expect(response.status).to.equal(400);
  });

  it('should fail when payload is a boolean', async () => {
    const payload = true;

    const response = await request(app)
      .put('/basic-charge/plan')
      .send(payload)
      .set('Accept', 'application/json');

    expect(response.status).to.equal(400);
  });

  it('should fail when payload is an array of non-objects', async () => {
    const payload = [1, 2, 3];

    const response = await request(app)
      .put('/basic-charge/plan')
      .send(payload)
      .set('Accept', 'application/json');

    expect(response.status).to.equal(400);
  });

  it('should fail when payload contains an object with invalid keys', async () => {
    const payload = [
      {
        "invalid-key": "value"
      }
    ];

    const response = await request(app)
      .put('/basic-charge/plan')
      .send(payload)
      .set('Accept', 'application/json');

    expect(response.status).to.equal(400);
  });
});
