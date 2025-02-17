import { expect } from 'chai';
import request from 'supertest';
import { sequelize } from '../../../src/infrastructure/orm/sqlize';
import { BasicChargeRoutes } from '../../../src/infrastructure/webserver/express/routes';
import Express from 'express';
import { Transaction } from 'sequelize';

const app = Express();
app.use(Express.json());
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
      .expect(200);

    expect(response.body).to.deep.equal({ code: 200, body: "OK" });
  });

  it('should handle empty payload gracefully', async () => {
    const payload = [];

    const response = await request(app)
      .put('/basic-charge/plan')
      .send(payload)
      .expect(200);

    expect(response.body).to.deep.equal({ code: 200, body: "OK" });
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
      .expect(400);

    expect(response.body).to.have.property('error');
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
      .expect(400);

    expect(response.body).to.have.property('error');
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
      .expect(400);

    expect(response.body).to.have.property('error');
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
      .expect(400);

    expect(response.body).to.have.property('error');
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
      .expect(400);

    expect(response.body).to.have.property('error');
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
      .expect(400);

    expect(response.body).to.have.property('error');
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
      .expect(200);

    expect(response.body).to.deep.equal({ code: 200, body: "OK" });
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
      .expect(200);

    expect(response.body).to.deep.equal({ code: 200, body: "OK" });
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
      .expect(200);

    expect(response.body).to.deep.equal({ code: 200, body: "OK" });
  });

  it('should return error for invalid fiscal-year type', async () => {
    const payload = [
      {
        "plant-id": "PLANT1",
        "unit-id": "UNIT1",
        "fiscal-year": "invalid",
        "operation-input": 100,
        "maintenance-input": 50,
        "user-id": "USER1"
      }
    ];

    const response = await request(app)
      .put('/basic-charge/plan')
      .send(payload)
      .expect(400);

    expect(response.body).to.have.property('error');
  });

  it('should return error for invalid operation-input type', async () => {
    const payload = [
      {
        "plant-id": "PLANT1",
        "unit-id": "UNIT1",
        "fiscal-year": 2023,
        "operation-input": "invalid",
        "maintenance-input": 50,
        "user-id": "USER1"
      }
    ];

    const response = await request(app)
      .put('/basic-charge/plan')
      .send(payload)
      .expect(400);

    expect(response.body).to.have.property('error');
  });

  it('should return error for invalid maintenance-input type', async () => {
    const payload = [
      {
        "plant-id": "PLANT1",
        "unit-id": "UNIT1",
        "fiscal-year": 2023,
        "operation-input": 100,
        "maintenance-input": "invalid",
        "user-id": "USER1"
      }
    ];

    const response = await request(app)
      .put('/basic-charge/plan')
      .send(payload)
      .expect(400);

    expect(response.body).to.have.property('error');
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
      .expect(400);

    expect(response.body).to.have.property('error');
  });

  it('should handle large payloads efficiently', async () => {
    const payload = Array.from({ length: 1000 }, (_, i) => ({
      "plant-id": `PLANT${i}`,
      "unit-id": `UNIT${i}`,
      "fiscal-year": 2023,
      "operation-input": 100,
      "maintenance-input": 50,
      "user-id": `USER${i}`
    }));

    const response = await request(app)
      .put('/basic-charge/plan')
      .send(payload)
      .expect(200);

    expect(response.body).to.deep.equal({ code: 200, body: "OK" });
  });

  it('should return error for payload exceeding size limit', async () => {
    const payload = Array.from({ length: 10001 }, (_, i) => ({
      "plant-id": `PLANT${i}`,
      "unit-id": `UNIT${i}`,
      "fiscal-year": 2023,
      "operation-input": 100,
      "maintenance-input": 50,
      "user-id": `USER${i}`
    }));

    const response = await request(app)
      .put('/basic-charge/plan')
      .send(payload)
      .expect(413);

    expect(response.body).to.have.property('error');
  });

  it('should return error for invalid JSON format', async () => {
    const payload = '{"plant-id": "PLANT1", "unit-id": "UNIT1", "fiscal-year": 2023, "operation-input": 100, "maintenance-input": 50, "user-id": "USER1"';

    const response = await request(app)
      .put('/basic-charge/plan')
      .set('Content-Type', 'application/json')
      .send(payload)
      .expect(400);

    expect(response.body).to.have.property('error');
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
      .expect(405);

    expect(response.body).to.have.property('error');
  });
});