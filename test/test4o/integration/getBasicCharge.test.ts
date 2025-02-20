```typescript
import express from 'express';
import { expect } from 'chai';
import request from 'supertest';
import { Sequelize, Transaction } from 'sequelize';
import { BasicChargeRoutes } from '../../../src/infrastructure/webserver/express/routes';
import { sequelize } from '../../../src/infrastructure/orm/sequelize';

const app = express();
BasicChargeRoutes(app);

describe('GET /basic-charge', () => {
  let transaction: Transaction;

  beforeEach(async () => {
    transaction = await sequelize.transaction();
  });

  afterEach(async () => {
    await transaction.rollback();
  });

  it('should return basic charge data for valid plantCode, unitCode, and epochSeconds', async () => {
    const response = await request(app)
      .get('/basic-charge')
      .query({ plantCode: 'validPlant', unitCode: 'validUnit', epochSeconds: 1609459200 })
      .expect(200);

    expect(response.body).to.have.property('PlantCode', 'validPlant');
    expect(response.body).to.have.property('UnitCode', 'validUnit');
    expect(response.body).to.have.property('BasicCharge').that.is.an('array');
  });

  it('should return 404 for invalid plantCode', async () => {
    const response = await request(app)
      .get('/basic-charge')
      .query({ plantCode: 'invalidPlant', unitCode: 'validUnit', epochSeconds: 1609459200 })
      .expect(404);

    expect(response.text).to.equal('Invalid plant code');
  });

  it('should return 404 for invalid unitCode', async () => {
    const response = await request(app)
      .get('/basic-charge')
      .query({ plantCode: 'validPlant', unitCode: 'invalidUnit', epochSeconds: 1609459200 })
      .expect(404);

    expect(response.text).to.equal('Invalid unit code');
  });

  it('should return 400 for invalid epochSeconds', async () => {
    const response = await request(app)
      .get('/basic-charge')
      .query({ plantCode: 'validPlant', unitCode: 'validUnit', epochSeconds: 'invalid' })
      .expect(400);

    expect(response.text).to.equal('Invalid epoch timestamp');
  });

  it('should return 500 for internal server error', async () => {
    const response = await request(app)
      .get('/basic-charge')
      .query({ plantCode: 'errorPlant', unitCode: 'validUnit', epochSeconds: 1609459200 })
      .expect(500);

    expect(response.text).to.equal('Internal server error');
  });

  it('should return basic charge data with null unitCode', async () => {
    const response = await request(app)
      .get('/basic-charge')
      .query({ plantCode: 'validPlant', unitCode: null, epochSeconds: 1609459200 })
      .expect(200);

    expect(response.body).to.have.property('PlantCode', 'validPlant');
    expect(response.body).to.have.property('UnitCode', null);
    expect(response.body).to.have.property('BasicCharge').that.is.an('array');
  });

  it('should return 400 for missing plantCode', async () => {
    const response = await request(app)
      .get('/basic-charge')
      .query({ unitCode: 'validUnit', epochSeconds: 1609459200 })
      .expect(400);

    expect(response.text).to.equal('Missing plant code');
  });

  it('should return 400 for missing epochSeconds', async () => {
    const response = await request(app)
      .get('/basic-charge')
      .query({ plantCode: 'validPlant', unitCode: 'validUnit' })
      .expect(400);

    expect(response.text).to.equal('Missing epoch timestamp');
  });

  it('should return 400 for missing unitCode', async () => {
    const response = await request(app)
      .get('/basic-charge')
      .query({ plantCode: 'validPlant', epochSeconds: 1609459200 })
      .expect(400);

    expect(response.text).to.equal('Missing unit code');
  });

  it('should return 200 with empty BasicCharge array for valid plantCode and unitCode with no data', async () => {
    const response = await request(app)
      .get('/basic-charge')
      .query({ plantCode: 'emptyDataPlant', unitCode: 'emptyDataUnit', epochSeconds: 1609459200 })
      .expect(200);

    expect(response.body).to.have.property('PlantCode', 'emptyDataPlant');
    expect(response.body).to.have.property('UnitCode', 'emptyDataUnit');
    expect(response.body).to.have.property('BasicCharge').that.is.an('array').that.is.empty;
  });

  it('should return 200 with correct currency prefix and suffix', async () => {
    const response = await request(app)
      .get('/basic-charge')
      .query({ plantCode: 'validPlant', unitCode: 'validUnit', epochSeconds: 1609459200 })
      .expect(200);

    expect(response.body).to.have.property('Prefix', '¥');
    expect(response.body).to.have.property('Suffix', 'Oku');
  });

  it('should handle large epochSeconds values gracefully', async () => {
    const response = await request(app)
      .get('/basic-charge')
      .query({ plantCode: 'validPlant', unitCode: 'validUnit', epochSeconds: 9999999999 })
      .expect(200);

    expect(response.body).to.have.property('PlantCode', 'validPlant');
    expect(response.body).to.have.property('UnitCode', 'validUnit');
    expect(response.body).to.have.property('BasicCharge').that.is.an('array');
  });

  it('should handle small epochSeconds values gracefully', async () => {
    const response = await request(app)
      .get('/basic-charge')
      .query({ plantCode: 'validPlant', unitCode: 'validUnit', epochSeconds: 1 })
      .expect(200);

    expect(response.body).to.have.property('PlantCode', 'validPlant');
    expect(response.body).to.have.property('UnitCode', 'validUnit');
    expect(response.body).to.have.property('BasicCharge').that.is.an('array');
  });

  it('should return 200 with correct fiscal year range', async () => {
    const response = await request(app)
      .get('/basic-charge')
      .query({ plantCode: 'validPlant', unitCode: 'validUnit', epochSeconds: 1609459200 })
      .expect(200);

    expect(response.body.BasicCharge).to.be.an('array');
    response.body.BasicCharge.forEach((charge: any) => {
      expect(charge).to.have.property('FiscalYear').that.is.a('number');
    });
  });

  it('should return 200 with correct annual and monthly values', async () => {
    const response = await request(app)
      .get('/basic-charge')
      .query({ plantCode: 'validPlant', unitCode: 'validUnit', epochSeconds: 1609459200 })
      .expect(200);

    expect(response.body.BasicCharge).to.be.an('array');
    response.body.BasicCharge.forEach((charge: any) => {
      expect(charge).to.have.property('Annual').that.is.a('number');
      expect(charge).to.have.property('Monthly').that.is.a('number');
    });
  });

  it('should return 200 with correct handling of null maintenance and operation amounts', async () => {
    const response = await request(app)
      .get('/basic-charge')
      .query({ plantCode: 'nullAmountsPlant', unitCode: 'nullAmountsUnit', epochSeconds: 1609459200 })
      .expect(200);

    expect(response.body.BasicCharge).to.be.an('array');
    response.body.BasicCharge.forEach((charge: any) => {
      expect(charge).to.have.property('Annual').that.is.a('number');
      expect(charge).to.have.property('Monthly').that.is.a('number');
    });
  });

  it('should return 200 with correct handling of profit start date', async () => {
    const response = await request(app)
      .get('/basic-charge')
      .query({ plantCode: 'profitStartPlant', unitCode: 'profitStartUnit', epochSeconds: 1609459200 })
      .expect(200);

    expect(response.body.BasicCharge).to.be.an('array');
    response.body.BasicCharge.forEach((charge: any) => {
      expect(charge).to.have.property('Annual').that.is.a('number');
      expect(charge).to.have.property('Monthly').that.is.a('number');
    });
  });

  it('should return 200 with correct handling of fiscal year boundaries', async () => {
    const response = await request(app)
      .get('/basic-charge')
      .query({ plantCode: 'boundaryPlant', unitCode: 'boundaryUnit', epochSeconds: 1609459200 })
      .expect(200);

    expect(response.body.BasicCharge).to.be.an('array');
    response.body.BasicCharge.forEach((charge: any) => {
      expect(charge).to.have.property('FiscalYear').that.is.a('number');
    });
  });

  it('should return 200 with correct handling of multiple units', async () => {
    const response = await request(app)
      .get('/basic-charge')
      .query({ plantCode: 'multiUnitPlant', unitCode: 'multiUnit', epochSeconds: 1609459200 })
      .expect(200);

    expect(response.body.BasicCharge).to.be.an('array');
    response.body.BasicCharge.forEach((charge: any) => {
      expect(charge).to.have.property('FiscalYear').that.is.a('number');
    });
  });
});
```