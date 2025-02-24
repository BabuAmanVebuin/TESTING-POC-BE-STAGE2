import express from 'express';
import { expect } from 'chai';
import request from 'supertest';
import { sequelize } from '../../../src/orm/sqlize/index.js';
import { BasicChargeRoutes } from '../../../src/interface/routes/dpm/util.js';

const app = express();
BasicChargeRoutes(app);

describe('PUT /basic-charge/plan', () => {
  let transaction;

  beforeEach(async () => {
    transaction = await sequelize.transaction();
  });

  afterEach(async () => {
    await transaction.rollback();
  });

  it('should successfully upsert a basic charge plan', async () => {
    const payload = [
      {
        "plant-id": "P001",
        "unit-id": "U001",
        "fiscal-year": 2023,
        "operation-input": 100,
        "maintenance-input": 50,
        "user-id": "user123"
      }
    ];

    const res = await request(app)
      .put('/basic-charge/plan')
      .send(payload)
      .set('Accept', 'application/json');

    expect(res.status).to.equal(200);
    expect(res.body).to.equal('OK');
  });

  it('should fail when payload is empty', async () => {
    const payload = [];

    const res = await request(app)
      .put('/basic-charge/plan')
      .send(payload)
      .set('Accept', 'application/json');

    expect(res.status).to.equal(400);
  });

  it('should fail when plant-id is missing', async () => {
    const payload = [
      {
        "unit-id": "U001",
        "fiscal-year": 2023,
        "operation-input": 100,
        "maintenance-input": 50,
        "user-id": "user123"
      }
    ];

    const res = await request(app)
      .put('/basic-charge/plan')
      .send(payload)
      .set('Accept', 'application/json');

    expect(res.status).to.equal(400);
  });

  it('should fail when unit-id is missing', async () => {
    const payload = [
      {
        "plant-id": "P001",
        "fiscal-year": 2023,
        "operation-input": 100,
        "maintenance-input": 50,
        "user-id": "user123"
      }
    ];

    const res = await request(app)
      .put('/basic-charge/plan')
      .send(payload)
      .set('Accept', 'application/json');

    expect(res.status).to.equal(400);
  });

  it('should fail when fiscal-year is missing', async () => {
    const payload = [
      {
        "plant-id": "P001",
        "unit-id": "U001",
        "operation-input": 100,
        "maintenance-input": 50,
        "user-id": "user123"
      }
    ];

    const res = await request(app)
      .put('/basic-charge/plan')
      .send(payload)
      .set('Accept', 'application/json');

    expect(res.status).to.equal(400);
  });

  it('should fail when operation-input is missing', async () => {
    const payload = [
      {
        "plant-id": "P001",
        "unit-id": "U001",
        "fiscal-year": 2023,
        "maintenance-input": 50,
        "user-id": "user123"
      }
    ];

    const res = await request(app)
      .put('/basic-charge/plan')
      .send(payload)
      .set('Accept', 'application/json');

    expect(res.status).to.equal(400);
  });

  it('should fail when maintenance-input is missing', async () => {
    const payload = [
      {
        "plant-id": "P001",
        "unit-id": "U001",
        "fiscal-year": 2023,
        "operation-input": 100,
        "user-id": "user123"
      }
    ];

    const res = await request(app)
      .put('/basic-charge/plan')
      .send(payload)
      .set('Accept', 'application/json');

    expect(res.status).to.equal(400);
  });

  it('should fail when user-id is missing', async () => {
    const payload = [
      {
        "plant-id": "P001",
        "unit-id": "U001",
        "fiscal-year": 2023,
        "operation-input": 100,
        "maintenance-input": 50
      }
    ];

    const res = await request(app)
      .put('/basic-charge/plan')
      .send(payload)
      .set('Accept', 'application/json');

    expect(res.status).to.equal(400);
  });

  it('should fail when fiscal-year is not a number', async () => {
    const payload = [
      {
        "plant-id": "P001",
        "unit-id": "U001",
        "fiscal-year": "2023",
        "operation-input": 100,
        "maintenance-input": 50,
        "user-id": "user123"
      }
    ];

    const res = await request(app)
      .put('/basic-charge/plan')
      .send(payload)
      .set('Accept', 'application/json');

    expect(res.status).to.equal(400);
  });

  it('should fail when operation-input is not a number', async () => {
    const payload = [
      {
        "plant-id": "P001",
        "unit-id": "U001",
        "fiscal-year": 2023,
        "operation-input": "100",
        "maintenance-input": 50,
        "user-id": "user123"
      }
    ];

    const res = await request(app)
      .put('/basic-charge/plan')
      .send(payload)
      .set('Accept', 'application/json');

    expect(res.status).to.equal(400);
  });

  it('should fail when maintenance-input is not a number', async () => {
    const payload = [
      {
        "plant-id": "P001",
        "unit-id": "U001",
        "fiscal-year": 2023,
        "operation-input": 100,
        "maintenance-input": "50",
        "user-id": "user123"
      }
    ];

    const res = await request(app)
      .put('/basic-charge/plan')
      .send(payload)
      .set('Accept', 'application/json');

    expect(res.status).to.equal(400);
  });

  it('should fail when user-id is not a string', async () => {
    const payload = [
      {
        "plant-id": "P001",
        "unit-id": "U001",
        "fiscal-year": 2023,
        "operation-input": 100,
        "maintenance-input": 50,
        "user-id": 123
      }
    ];

    const res = await request(app)
      .put('/basic-charge/plan')
      .send(payload)
      .set('Accept', 'application/json');

    expect(res.status).to.equal(400);
  });

  it('should fail when plant-id is not a string', async () => {
    const payload = [
      {
        "plant-id": 123,
        "unit-id": "U001",
        "fiscal-year": 2023,
        "operation-input": 100,
        "maintenance-input": 50,
        "user-id": "user123"
      }
    ];

    const res = await request(app)
      .put('/basic-charge/plan')
      .send(payload)
      .set('Accept', 'application/json');

    expect(res.status).to.equal(400);
  });

  it('should fail when unit-id is not a string', async () => {
    const payload = [
      {
        "plant-id": "P001",
        "unit-id": 123,
        "fiscal-year": 2023,
        "operation-input": 100,
        "maintenance-input": 50,
        "user-id": "user123"
      }
    ];

    const res = await request(app)
      .put('/basic-charge/plan')
      .send(payload)
      .set('Accept', 'application/json');

    expect(res.status).to.equal(400);
  });

  it('should fail when operation-input is null', async () => {
    const payload = [
      {
        "plant-id": "P001",
        "unit-id": "U001",
        "fiscal-year": 2023,
        "operation-input": null,
        "maintenance-input": 50,
        "user-id": "user123"
      }
    ];

    const res = await request(app)
      .put('/basic-charge/plan')
      .send(payload)
      .set('Accept', 'application/json');

    expect(res.status).to.equal(400);
  });

  it('should fail when maintenance-input is null', async () => {
    const payload = [
      {
        "plant-id": "P001",
        "unit-id": "U001",
        "fiscal-year": 2023,
        "operation-input": 100,
        "maintenance-input": null,
        "user-id": "user123"
      }
    ];

    const res = await request(app)
      .put('/basic-charge/plan')
      .send(payload)
      .set('Accept', 'application/json');

    expect(res.status).to.equal(400);
  });

  it('should fail when payload is not an array', async () => {
    const payload = {
      "plant-id": "P001",
      "unit-id": "U001",
      "fiscal-year": 2023,
      "operation-input": 100,
      "maintenance-input": 50,
      "user-id": "user123"
    };

    const res = await request(app)
      .put('/basic-charge/plan')
      .send(payload)
      .set('Accept', 'application/json');

    expect(res.status).to.equal(400);
  });

  it('should fail when payload is null', async () => {
    const res = await request(app)
      .put('/basic-charge/plan')
      .send(null)
      .set('Accept', 'application/json');

    expect(res.status).to.equal(400);
  });

  it('should fail when payload is undefined', async () => {
    const res = await request(app)
      .put('/basic-charge/plan')
      .send(undefined)
      .set('Accept', 'application/json');

    expect(res.status).to.equal(400);
  });

  it('should fail when payload is a string', async () => {
    const payload = "invalid payload";

    const res = await request(app)
      .put('/basic-charge/plan')
      .send(payload)
      .set('Accept', 'application/json');

    expect(res.status).to.equal(400);
  });

  it('should fail when payload is a number', async () => {
    const payload = 123;

    const res = await request(app)
      .put('/basic-charge/plan')
      .send(payload)
      .set('Accept', 'application/json');

    expect(res.status).to.equal(400);
  });
});