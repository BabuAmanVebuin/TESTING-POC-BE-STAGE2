import { expect } from 'chai';
import { getBasicChargePlanUsecase } from '../../../src/application/use_cases/dpm/getBasicChargePlanUsecase.js';
import { BasicChargeRepositoryPort } from '../../../src/application/port/BasicChargeRepositoryPort.js';
import sinon, { SinonStub } from 'sinon';

describe('getBasicChargePlanUsecase', () => {
  let basicChargeRepositoryMock: sinon.SinonStubbedInstance<BasicChargeRepositoryPort<any>>;
  let workUnitCtx: any;

  beforeEach(() => {
    basicChargeRepositoryMock = {
      getBasicChargePlan: sinon.stub(),
      wrapInWorkUnitCtx: sinon.stub() as SinonStub<[fn: (workUnitCtx: any) => Promise<any>], Promise<any>>,
      getBasicChargeForecast: sinon.stub(),
      getBasicChargePlanSummary: sinon.stub(),
      upsertBasicChargePlan: sinon.stub(),
      upsertBasicChargeForecast: sinon.stub(),
      getBasicChargeForecastSummary: sinon.stub(),
    };
    workUnitCtx = {};
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should return an empty array when no data is found', async () => {
    basicChargeRepositoryMock.getBasicChargePlan.resolves([]);
    const result = await getBasicChargePlanUsecase(basicChargeRepositoryMock, workUnitCtx, 'plant1');
    expect(result).to.deep.equal([]);
  });

  it('should map data correctly when data is found', async () => {
    basicChargeRepositoryMock.getBasicChargePlan.resolves([
      {
        PLANT_CODE: 'plant1',
        UNIT_CODE: 'unit1',
        FISCAL_YEAR: 2021,
        OPERATION_INPUT: 100,
        MAINTENANCE_INPUT: 200,
        SUM: 300,
      },
    ]);
    const result = await getBasicChargePlanUsecase(basicChargeRepositoryMock, workUnitCtx, 'plant1');
    expect(result).to.deep.equal([
      {
        'plant-id': 'plant1',
        'unit-id': 'unit1',
        'fiscal-year': 2021,
        'operation-input': 100,
        'maintenance-input': 200,
        sum: 300,
      },
    ]);
  });

  it('should handle null operation input', async () => {
    basicChargeRepositoryMock.getBasicChargePlan.resolves([
      {
        PLANT_CODE: 'plant1',
        UNIT_CODE: 'unit1',
        FISCAL_YEAR: 2021,
        OPERATION_INPUT: 0,
        MAINTENANCE_INPUT: 200,
        SUM: 200,
      },
    ]);
    const result = await getBasicChargePlanUsecase(basicChargeRepositoryMock, workUnitCtx, 'plant1');
    expect(result).to.deep.equal([
      {
        'plant-id': 'plant1',
        'unit-id': 'unit1',
        'fiscal-year': 2021,
        'operation-input': null,
        'maintenance-input': 200,
        sum: 200,
      },
    ]);
  });

  it('should handle null maintenance input', async () => {
    basicChargeRepositoryMock.getBasicChargePlan.resolves([
      {
        PLANT_CODE: 'plant1',
        UNIT_CODE: 'unit1',
        FISCAL_YEAR: 2021,
        OPERATION_INPUT: 100,
        MAINTENANCE_INPUT: 0,
        SUM: 100,
      },
    ]);
    const result = await getBasicChargePlanUsecase(basicChargeRepositoryMock, workUnitCtx, 'plant1');
    expect(result).to.deep.equal([
      {
        'plant-id': 'plant1',
        'unit-id': 'unit1',
        'fiscal-year': 2021,
        'operation-input': 100,
        'maintenance-input': null,
        sum: 100,
      },
    ]);
  });

  it('should handle both null operation and maintenance inputs', async () => {
    basicChargeRepositoryMock.getBasicChargePlan.resolves([
      {
        PLANT_CODE: 'plant1',
        UNIT_CODE: 'unit1',
        FISCAL_YEAR: 2021,
        OPERATION_INPUT: 0,
        MAINTENANCE_INPUT: 0,
        SUM: 0,
      },
    ]);
    const result = await getBasicChargePlanUsecase(basicChargeRepositoryMock, workUnitCtx, 'plant1');
    expect(result).to.deep.equal([
      {
        'plant-id': 'plant1',
        'unit-id': 'unit1',
        'fiscal-year': 2021,
        'operation-input': null,
        'maintenance-input': null,
        sum: 0,
      },
    ]);
  });

  it('should filter by unit code when provided', async () => {
    basicChargeRepositoryMock.getBasicChargePlan.resolves([
      {
        PLANT_CODE: 'plant1',
        UNIT_CODE: 'unit1',
        FISCAL_YEAR: 2021,
        OPERATION_INPUT: 100,
        MAINTENANCE_INPUT: 200,
        SUM: 300,
      },
    ]);
    const result = await getBasicChargePlanUsecase(basicChargeRepositoryMock, workUnitCtx, 'plant1', 'unit1');
    expect(result).to.deep.equal([
      {
        'plant-id': 'plant1',
        'unit-id': 'unit1',
        'fiscal-year': 2021,
        'operation-input': 100,
        'maintenance-input': 200,
        sum: 300,
      },
    ]);
  });

  it('should filter by start fiscal year when provided', async () => {
    basicChargeRepositoryMock.getBasicChargePlan.resolves([
      {
        PLANT_CODE: 'plant1',
        UNIT_CODE: 'unit1',
        FISCAL_YEAR: 2021,
        OPERATION_INPUT: 100,
        MAINTENANCE_INPUT: 200,
        SUM: 300,
      },
    ]);
    const result = await getBasicChargePlanUsecase(basicChargeRepositoryMock, workUnitCtx, 'plant1', undefined, 2021);
    expect(result).to.deep.equal([
      {
        'plant-id': 'plant1',
        'unit-id': 'unit1',
        'fiscal-year': 2021,
        'operation-input': 100,
        'maintenance-input': 200,
        sum: 300,
      },
    ]);
  });

  it('should filter by end fiscal year when provided', async () => {
    basicChargeRepositoryMock.getBasicChargePlan.resolves([
      {
        PLANT_CODE: 'plant1',
        UNIT_CODE: 'unit1',
        FISCAL_YEAR: 2021,
        OPERATION_INPUT: 100,
        MAINTENANCE_INPUT: 200,
        SUM: 300,
      },
    ]);
    const result = await getBasicChargePlanUsecase(basicChargeRepositoryMock, workUnitCtx, 'plant1', undefined, undefined, 2021);
    expect(result).to.deep.equal([
      {
        'plant-id': 'plant1',
        'unit-id': 'unit1',
        'fiscal-year': 2021,
        'operation-input': 100,
        'maintenance-input': 200,
        sum: 300,
      },
    ]);
  });

  it('should filter by both start and end fiscal years when provided', async () => {
    basicChargeRepositoryMock.getBasicChargePlan.resolves([
      {
        PLANT_CODE: 'plant1',
        UNIT_CODE: 'unit1',
        FISCAL_YEAR: 2021,
        OPERATION_INPUT: 100,
        MAINTENANCE_INPUT: 200,
        SUM: 300,
      },
    ]);
    const result = await getBasicChargePlanUsecase(basicChargeRepositoryMock, workUnitCtx, 'plant1', undefined, 2020, 2022);
    expect(result).to.deep.equal([
      {
        'plant-id': 'plant1',
        'unit-id': 'unit1',
        'fiscal-year': 2021,
        'operation-input': 100,
        'maintenance-input': 200,
        sum: 300,
      },
    ]);
  });

  it('should throw an error if repository throws', async () => {
    basicChargeRepositoryMock.getBasicChargePlan.rejects(new Error('Repository error'));
    try {
      await getBasicChargePlanUsecase(basicChargeRepositoryMock, workUnitCtx, 'plant1');
    } catch (error) {
      expect(error).to.be.an('error');
      expect(error).to.equal('Repository error');
    }
  });

  it('should handle multiple records correctly', async () => {
    basicChargeRepositoryMock.getBasicChargePlan.resolves([
      {
        PLANT_CODE: 'plant1',
        UNIT_CODE: 'unit1',
        FISCAL_YEAR: 2021,
        OPERATION_INPUT: 100,
        MAINTENANCE_INPUT: 200,
        SUM: 300,
      },
      {
        PLANT_CODE: 'plant1',
        UNIT_CODE: 'unit2',
        FISCAL_YEAR: 2022,
        OPERATION_INPUT: 150,
        MAINTENANCE_INPUT: 250,
        SUM: 400,
      },
    ]);
    const result = await getBasicChargePlanUsecase(basicChargeRepositoryMock, workUnitCtx, 'plant1');
    expect(result).to.deep.equal([
      {
        'plant-id': 'plant1',
        'unit-id': 'unit1',
        'fiscal-year': 2021,
        'operation-input': 100,
        'maintenance-input': 200,
        sum: 300,
      },
      {
        'plant-id': 'plant1',
        'unit-id': 'unit2',
        'fiscal-year': 2022,
        'operation-input': 150,
        'maintenance-input': 250,
        sum: 400,
      },
    ]);
  });

  it('should handle large numbers correctly', async () => {
    basicChargeRepositoryMock.getBasicChargePlan.resolves([
      {
        PLANT_CODE: 'plant1',
        UNIT_CODE: 'unit1',
        FISCAL_YEAR: 2021,
        OPERATION_INPUT: 1e9,
        MAINTENANCE_INPUT: 2e9,
        SUM: 3e9,
      },
    ]);
    const result = await getBasicChargePlanUsecase(basicChargeRepositoryMock, workUnitCtx, 'plant1');
    expect(result).to.deep.equal([
      {
        'plant-id': 'plant1',
        'unit-id': 'unit1',
        'fiscal-year': 2021,
        'operation-input': 1e9,
        'maintenance-input': 2e9,
        sum: 3e9,
      },
    ]);
  });

  it('should handle zero values correctly', async () => {
    basicChargeRepositoryMock.getBasicChargePlan.resolves([
      {
        PLANT_CODE: 'plant1',
        UNIT_CODE: 'unit1',
        FISCAL_YEAR: 2021,
        OPERATION_INPUT: 0,
        MAINTENANCE_INPUT: 0,
        SUM: 0,
      },
    ]);
    const result = await getBasicChargePlanUsecase(basicChargeRepositoryMock, workUnitCtx, 'plant1');
    expect(result).to.deep.equal([
      {
        'plant-id': 'plant1',
        'unit-id': 'unit1',
        'fiscal-year': 2021,
        'operation-input': 0,
        'maintenance-input': 0,
        sum: 0,
      },
    ]);
  });

  it('should handle negative values correctly', async () => {
    basicChargeRepositoryMock.getBasicChargePlan.resolves([
      {
        PLANT_CODE: 'plant1',
        UNIT_CODE: 'unit1',
        FISCAL_YEAR: 2021,
        OPERATION_INPUT: -100,
        MAINTENANCE_INPUT: -200,
        SUM: -300,
      },
    ]);
    const result = await getBasicChargePlanUsecase(basicChargeRepositoryMock, workUnitCtx, 'plant1');
    expect(result).to.deep.equal([
      {
        'plant-id': 'plant1',
        'unit-id': 'unit1',
        'fiscal-year': 2021,
        'operation-input': -100,
        'maintenance-input': -200,
        sum: -300,
      },
    ]);
  });

  it('should handle mixed null and non-null values', async () => {
    basicChargeRepositoryMock.getBasicChargePlan.resolves([
      {
        PLANT_CODE: 'plant1',
        UNIT_CODE: 'unit1',
        FISCAL_YEAR: 2021,
        OPERATION_INPUT: 0,
        MAINTENANCE_INPUT: 200,
        SUM: 200,
      },
      {
        PLANT_CODE: 'plant1',
        UNIT_CODE: 'unit2',
        FISCAL_YEAR: 2022,
        OPERATION_INPUT: 150,
        MAINTENANCE_INPUT: 0,
        SUM: 150,
      },
    ]);
    const result = await getBasicChargePlanUsecase(basicChargeRepositoryMock, workUnitCtx, 'plant1');
    expect(result).to.deep.equal([
      {
        'plant-id': 'plant1',
        'unit-id': 'unit1',
        'fiscal-year': 2021,
        'operation-input': null,
        'maintenance-input': 200,
        sum: 200,
      },
      {
        'plant-id': 'plant1',
        'unit-id': 'unit2',
        'fiscal-year': 2022,
        'operation-input': 150,
        'maintenance-input': null,
        sum: 150,
      },
    ]);
  });

  it('should handle undefined unit code', async () => {
    basicChargeRepositoryMock.getBasicChargePlan.resolves([
      {
        PLANT_CODE: 'plant1',
        UNIT_CODE: 'unit1',
        FISCAL_YEAR: 2021,
        OPERATION_INPUT: 100,
        MAINTENANCE_INPUT: 200,
        SUM: 300,
      },
    ]);
    const result = await getBasicChargePlanUsecase(basicChargeRepositoryMock, workUnitCtx, 'plant1');
    expect(result).to.deep.equal([
      {
        'plant-id': 'plant1',
        'unit-id': undefined,
        'fiscal-year': 2021,
        'operation-input': 100,
        'maintenance-input': 200,
        sum: 300,
      },
    ]);
  });

  it('should handle undefined fiscal year', async () => {
    basicChargeRepositoryMock.getBasicChargePlan.resolves([
      {
        PLANT_CODE: 'plant1',
        UNIT_CODE: 'unit1',
        FISCAL_YEAR: undefined,
        OPERATION_INPUT: 100,
        MAINTENANCE_INPUT: 200,
        SUM: 300,
      },
    ]);
    const result = await getBasicChargePlanUsecase(basicChargeRepositoryMock, workUnitCtx, 'plant1');
    expect(result).to.deep.equal([
      {
        'plant-id': 'plant1',
        'unit-id': 'unit1',
        'fiscal-year': undefined,
        'operation-input': 100,
        'maintenance-input': 200,
        sum: 300,
      },
    ]);
  });

  it('should handle undefined operation input', async () => {
    basicChargeRepositoryMock.getBasicChargePlan.resolves([
      {
        PLANT_CODE: 'plant1',
        UNIT_CODE: 'unit1',
        FISCAL_YEAR: 2021,
        OPERATION_INPUT: undefined,
        MAINTENANCE_INPUT: 200,
        SUM: 200,
      },
    ]);
    const result = await getBasicChargePlanUsecase(basicChargeRepositoryMock, workUnitCtx, 'plant1');
    expect(result).to.deep.equal([
      {
        'plant-id': 'plant1',
        'unit-id': 'unit1',
        'fiscal-year': 2021,
        'operation-input': null,
        'maintenance-input': 200,
        sum: 200,
      },
    ]);
  });

  it('should handle undefined maintenance input', async () => {
    basicChargeRepositoryMock.getBasicChargePlan.resolves([
      {
        PLANT_CODE: 'plant1',
        UNIT_CODE: 'unit1',
        FISCAL_YEAR: 2021,
        OPERATION_INPUT: 100,
        MAINTENANCE_INPUT: undefined,
        SUM: 100,
      },
    ]);
    const result = await getBasicChargePlanUsecase(basicChargeRepositoryMock, workUnitCtx, 'plant1');
    expect(result).to.deep.equal([
      {
        'plant-id': 'plant1',
        'unit-id': 'unit1',
        'fiscal-year': 2021,
        'operation-input': 100,
        'maintenance-input': null,
        sum: 100,
      },
    ]);
  });
});