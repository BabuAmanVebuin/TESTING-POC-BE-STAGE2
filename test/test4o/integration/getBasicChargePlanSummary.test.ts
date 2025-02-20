import express from 'express';
import { expect } from 'chai';
import request from 'supertest';
import { Transaction } from 'sequelize';
import { sequelize } from '../../../src/infrastructure/orm/sqlize';
import { BasicChargeRoutes } from '../../../src/infrastructure/webserver/express/routes';
import { BasicChargePlanSummaryDataFromDB } from '../../../src/domain/entities/dpm/basicChargePlanSummary';

const app = express();
BasicChargeRoutes(app);

describe('GET /basic-charge/plan/summary', () => {
  let transaction: Transaction;

  beforeEach(async () => {
    transaction = await sequelize.transaction();
  });

  afterEach(async () => {
    await transaction.rollback();
  });

  it('should return 200 and the correct summary data when valid plant-id is provided', async () => {
    const plantId = 'PLANT1';
    const fiscalYear = 2023;
    const value = 1000;

    await sequelize.query(
      `INSERT INTO t_basic_charge_plan (PLANT_CODE, FISCAL_YEAR, OPERATION_INPUT, MAINTENANCE_INPUT) VALUES (?, ?, ?, ?)`,
      {
        replacements: [plantId, fiscalYear, value / 2, value / 2],
        transaction,
      }
    );

    const res = await request(app)
      .get('/basic-charge/plan/summary')
      .query({ 'plant-id': plantId });

    expect(res.status).to.equal(200);
    expect(res.body).to.deep.equal([
      {
        'plant-id': plantId,
        'fiscal-year': fiscalYear,
        value,
      },
    ]);
  });

  it('should return 200 and an empty array when no data is found for the given plant-id', async () => {
    const res = await request(app)
      .get('/basic-charge/plan/summary')
      .query({ 'plant-id': 'NON_EXISTENT_PLANT' });

    expect(res.status).to.equal(200);
    expect(res.body).to.deep.equal([]);
  });

  it('should return 400 when plant-id is missing', async () => {
    const res = await request(app).get('/basic-charge/plan/summary');

    expect(res.status).to.equal(400);
  });

  it('should return 200 and filter data by start-fiscal-year', async () => {
    const plantId = 'PLANT1';
    const fiscalYear1 = 2022;
    const fiscalYear2 = 2023;
    const value = 1000;

    await sequelize.query(
      `INSERT INTO t_basic_charge_plan (PLANT_CODE, FISCAL_YEAR, OPERATION_INPUT, MAINTENANCE_INPUT) VALUES (?, ?, ?, ?)`,
      {
        replacements: [plantId, fiscalYear1, value / 2, value / 2],
        transaction,
      }
    );

    await sequelize.query(
      `INSERT INTO t_basic_charge_plan (PLANT_CODE, FISCAL_YEAR, OPERATION_INPUT, MAINTENANCE_INPUT) VALUES (?, ?, ?, ?)`,
      {
        replacements: [plantId, fiscalYear2, value / 2, value / 2],
        transaction,
      }
    );

    const res = await request(app)
      .get('/basic-charge/plan/summary')
      .query({ 'plant-id': plantId, 'start-fiscal-year': fiscalYear2 });

    expect(res.status).to.equal(200);
    expect(res.body).to.deep.equal([
      {
        'plant-id': plantId,
        'fiscal-year': fiscalYear2,
        value,
      },
    ]);
  });

  it('should return 200 and filter data by end-fiscal-year', async () => {
    const plantId = 'PLANT1';
    const fiscalYear1 = 2022;
    const fiscalYear2 = 2023;
    const value = 1000;

    await sequelize.query(
      `INSERT INTO t_basic_charge_plan (PLANT_CODE, FISCAL_YEAR, OPERATION_INPUT, MAINTENANCE_INPUT) VALUES (?, ?, ?, ?)`,
      {
        replacements: [plantId, fiscalYear1, value / 2, value / 2],
        transaction,
      }
    );

    await sequelize.query(
      `INSERT INTO t_basic_charge_plan (PLANT_CODE, FISCAL_YEAR, OPERATION_INPUT, MAINTENANCE_INPUT) VALUES (?, ?, ?, ?)`,
      {
        replacements: [plantId, fiscalYear2, value / 2, value / 2],
        transaction,
      }
    );

    const res = await request(app)
      .get('/basic-charge/plan/summary')
      .query({ 'plant-id': plantId, 'end-fiscal-year': fiscalYear1 });

    expect(res.status).to.equal(200);
    expect(res.body).to.deep.equal([
      {
        'plant-id': plantId,
        'fiscal-year': fiscalYear1,
        value,
      },
    ]);
  });

  it('should return 200 and filter data by start-fiscal-year and end-fiscal-year', async () => {
    const plantId = 'PLANT1';
    const fiscalYear1 = 2021;
    const fiscalYear2 = 2022;
    const fiscalYear3 = 2023;
    const value = 1000;

    await sequelize.query(
      `INSERT INTO t_basic_charge_plan (PLANT_CODE, FISCAL_YEAR, OPERATION_INPUT, MAINTENANCE_INPUT) VALUES (?, ?, ?, ?)`,
      {
        replacements: [plantId, fiscalYear1, value / 2, value / 2],
        transaction,
      }
    );

    await sequelize.query(
      `INSERT INTO t_basic_charge_plan (PLANT_CODE, FISCAL_YEAR, OPERATION_INPUT, MAINTENANCE_INPUT) VALUES (?, ?, ?, ?)`,
      {
        replacements: [plantId, fiscalYear2, value / 2, value / 2],
        transaction,
      }
    );

    await sequelize.query(
      `INSERT INTO t_basic_charge_plan (PLANT_CODE, FISCAL_YEAR, OPERATION_INPUT, MAINTENANCE_INPUT) VALUES (?, ?, ?, ?)`,
      {
        replacements: [plantId, fiscalYear3, value / 2, value / 2],
        transaction,
      }
    );

    const res = await request(app)
      .get('/basic-charge/plan/summary')
      .query({ 'plant-id': plantId, 'start-fiscal-year': fiscalYear1, 'end-fiscal-year': fiscalYear2 });

    expect(res.status).to.equal(200);
    expect(res.body).to.deep.equal([
      {
        'plant-id': plantId,
        'fiscal-year': fiscalYear1,
        value,
      },
      {
        'plant-id': plantId,
        'fiscal-year': fiscalYear2,
        value,
      },
    ]);
  });

  it('should return 200 and handle large data sets efficiently', async () => {
    const plantId = 'PLANT1';
    const fiscalYear = 2023;
    const value = 1000;

    for (let i = 0; i < 1000; i++) {
      await sequelize.query(
        `INSERT INTO t_basic_charge_plan (PLANT_CODE, FISCAL_YEAR, OPERATION_INPUT, MAINTENANCE_INPUT) VALUES (?, ?, ?, ?)`,
        {
          replacements: [plantId, fiscalYear + i, value / 2, value / 2],
          transaction,
        }
      );
    }

    const res = await request(app)
      .get('/basic-charge/plan/summary')
      .query({ 'plant-id': plantId });

    expect(res.status).to.equal(200);
    expect(res.body).to.have.lengthOf(1000);
  });

  it('should return 200 and handle concurrent requests', async () => {
    const plantId = 'PLANT1';
    const fiscalYear = 2023;
    const value = 1000;

    await sequelize.query(
      `INSERT INTO t_basic_charge_plan (PLANT_CODE, FISCAL_YEAR, OPERATION_INPUT, MAINTENANCE_INPUT) VALUES (?, ?, ?, ?)`,
      {
        replacements: [plantId, fiscalYear, value / 2, value / 2],
        transaction,
      }
    );

    const requests = Array.from({ length: 10 }, () =>
      request(app)
        .get('/basic-charge/plan/summary')
        .query({ 'plant-id': plantId })
    );

    const responses = await Promise.all(requests);

    responses.forEach((res) => {
      expect(res.status).to.equal(200);
      expect(res.body).to.deep.equal([
        {
          'plant-id': plantId,
          'fiscal-year': fiscalYear,
          value,
        },
      ]);
    });
  });

  it('should return 200 and handle special characters in plant-id', async () => {
    const plantId = 'PLANT!@#';
    const fiscalYear = 2023;
    const value = 1000;

    await sequelize.query(
      `INSERT INTO t_basic_charge_plan (PLANT_CODE, FISCAL_YEAR, OPERATION_INPUT, MAINTENANCE_INPUT) VALUES (?, ?, ?, ?)`,
      {
        replacements: [plantId, fiscalYear, value / 2, value / 2],
        transaction,
      }
    );

    const res = await request(app)
      .get('/basic-charge/plan/summary')
      .query({ 'plant-id': plantId });

    expect(res.status).to.equal(200);
    expect(res.body).to.deep.equal([
      {
        'plant-id': plantId,
        'fiscal-year': fiscalYear,
        value,
      },
    ]);
  });

  it('should return 200 and handle numeric plant-id', async () => {
    const plantId = '12345';
    const fiscalYear = 2023;
    const value = 1000;

    await sequelize.query(
      `INSERT INTO t_basic_charge_plan (PLANT_CODE, FISCAL_YEAR, OPERATION_INPUT, MAINTENANCE_INPUT) VALUES (?, ?, ?, ?)`,
      {
        replacements: [plantId, fiscalYear, value / 2, value / 2],
        transaction,
      }
    );

    const res = await request(app)
      .get('/basic-charge/plan/summary')
      .query({ 'plant-id': plantId });

    expect(res.status).to.equal(200);
    expect(res.body).to.deep.equal([
      {
        'plant-id': plantId,
        'fiscal-year': fiscalYear,
        value,
      },
    ]);
  });

  it('should return 200 and handle non-existent fiscal years', async () => {
    const plantId = 'PLANT1';
    const fiscalYear = 2023;
    const value = 1000;

    await sequelize.query(
      `INSERT INTO t_basic_charge_plan (PLANT_CODE, FISCAL_YEAR, OPERATION_INPUT, MAINTENANCE_INPUT) VALUES (?, ?, ?, ?)`,
      {
        replacements: [plantId, fiscalYear, value / 2, value / 2],
        transaction,
      }
    );

    const res = await request(app)
      .get('/basic-charge/plan/summary')
      .query({ 'plant-id': plantId, 'start-fiscal-year': 2025 });

    expect(res.status).to.equal(200);
    expect(res.body).to.deep.equal([]);
  });

  it('should return 200 and handle overlapping fiscal year ranges', async () => {
    const plantId = 'PLANT1';
    const fiscalYear1 = 2022;
    const fiscalYear2 = 2023;
    const value = 1000;

    await sequelize.query(
      `INSERT INTO t_basic_charge_plan (PLANT_CODE, FISCAL_YEAR, OPERATION_INPUT, MAINTENANCE_INPUT) VALUES (?, ?, ?, ?)`,
      {
        replacements: [plantId, fiscalYear1, value / 2, value / 2],
        transaction,
      }
    );

    await sequelize.query(
      `INSERT INTO t_basic_charge_plan (PLANT_CODE, FISCAL_YEAR, OPERATION_INPUT, MAINTENANCE_INPUT) VALUES (?, ?, ?, ?)`,
      {
        replacements: [plantId, fiscalYear2, value / 2, value / 2],
        transaction,
      }
    );

    const res = await request(app)
      .get('/basic-charge/plan/summary')
      .query({ 'plant-id': plantId, 'start-fiscal-year': 2022, 'end-fiscal-year': 2023 });

    expect(res.status).to.equal(200);
    expect(res.body).to.deep.equal([
      {
        'plant-id': plantId,
        'fiscal-year': fiscalYear1,
        value,
      },
      {
        'plant-id': plantId,
        'fiscal-year': fiscalYear2,
        value,
      },
    ]);
  });

  it('should return 200 and handle fiscal year as a string', async () => {
    const plantId = 'PLANT1';
    const fiscalYear = 2023;
    const value = 1000;

    await sequelize.query(
      `INSERT INTO t_basic_charge_plan (PLANT_CODE, FISCAL_YEAR, OPERATION_INPUT, MAINTENANCE_INPUT) VALUES (?, ?, ?, ?)`,
      {
        replacements: [plantId, fiscalYear, value / 2, value / 2],
        transaction,
      }
    );

    const res = await request(app)
      .get('/basic-charge/plan/summary')
      .query({ 'plant-id': plantId, 'start-fiscal-year': '2023' });

    expect(res.status).to.equal(200);
    expect(res.body).to.deep.equal([
      {
        'plant-id': plantId,
        'fiscal-year': fiscalYear,
        value,
      },
    ]);
  });

  it('should return 200 and handle large fiscal year values', async () => {
    const plantId = 'PLANT1';
    const fiscalYear = 9999;
    const value = 1000;

    await sequelize.query(
      `INSERT INTO t_basic_charge_plan (PLANT_CODE, FISCAL_YEAR, OPERATION_INPUT, MAINTENANCE_INPUT) VALUES (?, ?, ?, ?)`,
      {
        replacements: [plantId, fiscalYear, value / 2, value / 2],
        transaction,
      }
    );

    const res = await request(app)
      .get('/basic-charge/plan/summary')
      .query({ 'plant-id': plantId });

    expect(res.status).to.equal(200);
    expect(res.body).to.deep.equal([
      {
        'plant-id': plantId,
        'fiscal-year': fiscalYear,
        value,
      },
    ]);
  });

  it('should return 200 and handle zero fiscal year values', async () => {
    const plantId = 'PLANT1';
    const fiscalYear = 0;
    const value = 1000;

    await sequelize.query(
      `INSERT INTO t_basic_charge_plan (PLANT_CODE, FISCAL_YEAR, OPERATION_INPUT, MAINTENANCE_INPUT) VALUES (?, ?, ?, ?)`,
      {
        replacements: [plantId, fiscalYear, value / 2, value / 2],
        transaction,
      }
    );

    const res = await request(app)
      .get('/basic-charge/plan/summary')
      .query({ 'plant-id': plantId });

    expect(res.status).to.equal(200);
    expect(res.body).to.deep.equal([
      {
        'plant-id': plantId,
        'fiscal-year': fiscalYear,
        value,
      },
    ]);
  });

  it('should return 200 and handle negative fiscal year values', async () => {
    const plantId = 'PLANT1';
    const fiscalYear = -1;
    const value = 1000;

    await sequelize.query(
      `INSERT INTO t_basic_charge_plan (PLANT_CODE, FISCAL_YEAR, OPERATION_INPUT, MAINTENANCE_INPUT) VALUES (?, ?, ?, ?)`,
      {
        replacements: [plantId, fiscalYear, value / 2, value / 2],
        transaction,
      }
    );

    const res = await request(app)
      .get('/basic-charge/plan/summary')
      .query({ 'plant-id': plantId });

    expect(res.status).to.equal(200);
    expect(res.body).to.deep.equal([
      {
        'plant-id': plantId,
        'fiscal-year': fiscalYear,
        value,
      },
    ]);
  });

  it('should return 200 and handle non-numeric fiscal year values gracefully', async () => {
    const plantId = 'PLANT1';
    const fiscalYear = 2023;
    const value = 1000;

    await sequelize.query(
      `INSERT INTO t_basic_charge_plan (PLANT_CODE, FISCAL_YEAR, OPERATION_INPUT, MAINTENANCE_INPUT) VALUES (?, ?, ?, ?)`,
      {
        replacements: [plantId, fiscalYear, value / 2, value / 2],
        transaction,
      }
    );

    const res = await request(app)
      .get('/basic-charge/plan/summary')
      .query({ 'plant-id': plantId, 'start-fiscal-year': 'abc' });

    expect(res.status).to.equal(200);
    expect(res.body).to.deep.equal([]);
  });

  it('should return 200 and handle missing fiscal year values', async () => {
    const plantId = 'PLANT1';
    const fiscalYear = 2023;
    const value = 1000;

    await sequelize.query(
      `INSERT INTO t_basic_charge_plan (PLANT_CODE, FISCAL_YEAR, OPERATION_INPUT, MAINTENANCE_INPUT) VALUES (?, ?, ?, ?)`,
      {
        replacements: [plantId, fiscalYear, value / 2, value / 2],
        transaction,
      }
    );

    const res = await request(app)
      .get('/basic-charge/plan/summary')
      .query({ 'plant-id': plantId });

    expect(res.status).to.equal(200);
    expect(res.body).to.deep.equal([
      {
        'plant-id': plantId,
        'fiscal-year': fiscalYear,
        value,
      },
    ]);
  });
});