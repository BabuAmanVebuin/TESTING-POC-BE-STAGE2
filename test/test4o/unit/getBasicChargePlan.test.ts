import { expect } from 'chai';
import sinon from 'sinon';
import { getBasicChargePlanUsecase } from '../../../src/application/use_cases/dpm/getBasicChargePlanUsecase';
import { BasicChargeRepositoryPort } from '../../../src/application/port/BasicChargeRepositoryPort';
import { BasicChargePlanDataFromDB } from '../../../src/domain/entities/dpm/basicChargePlan';

describe('getBasicChargePlanUsecase', () => {
  let basicChargeRepository: sinon.SinonStubbedInstance<BasicChargeRepositoryPort<any>>;
  let workUnitCtx: any;

  beforeEach(() => {
    basicChargeRepository = {
      getBasicChargePlan: sinon.stub(),
      wrapInWorkUnitCtx: sinon.stub(),
      getBasicChargeForecast: sinon.stub(),
      getBasicChargePlanSummary: sinon.stub(),
      upsertBasicChargePlan: sinon.stub(),
      upsertBasicChargeForecast: sinon.stub(),
      getBasicChargeForecastSummary: sinon.stub(),
    };
    workUnitCtx = {};
  });

  it('should return mapped data when repository returns valid data', async () => {
    const mockData: BasicChargePlanDataFromDB[] = [
      {
        PLANT_CODE: 'P1',
        UNIT_CODE: 'U1',
        FISCAL_YEAR: 2021,
        OPERATION_INPUT: 100,
        MAINTENANCE_INPUT: 50,
        SUM: 150,
      },
    ];
    basicChargeRepository.getBasicChargePlan.resolves(mockData);

    const result = await getBasicChargePlanUsecase(basicChargeRepository, workUnitCtx, 'P1');

    expect(result).to.deep.equal([
      {
        'plant-id': 'P1',
        'unit-id': 'U1',
        'fiscal-year': 2021,
        'operation-input': 100,
        'maintenance-input': 50,
        sum: 150,
      },
    ]);
  });

  it('should handle null operation input', async () => {
    const mockData: BasicChargePlanDataFromDB[] = [
      {
        PLANT_CODE: 'P1',
        UNIT_CODE: 'U1',
        FISCAL_YEAR: 2021,
        OPERATION_INPUT: null,
        MAINTENANCE_INPUT: 50,
        SUM: 50,
      },
    ];
    basicChargeRepository.getBasicChargePlan.resolves(mockData);

    const result = await getBasicChargePlanUsecase(basicChargeRepository, workUnitCtx, 'P1');

    expect(result).to.deep.equal([
      {
        'plant-id': 'P1',
        'unit-id': 'U1',
        'fiscal-year': 2021,
        'operation-input': null,
        'maintenance-input': 50,
        sum: 50,
      },
    ]);
  });

  it('should handle null maintenance input', async () => {
    const mockData: BasicChargePlanDataFromDB[] = [
      {
        PLANT_CODE: 'P1',
        UNIT_CODE: 'U1',
        FISCAL_YEAR: 2021,
        OPERATION_INPUT: 100,
        MAINTENANCE_INPUT: null,
        SUM: 100,
      },
    ];
    basicChargeRepository.getBasicChargePlan.resolves(mockData);

    const result = await getBasicChargePlanUsecase(basicChargeRepository, workUnitCtx, 'P1');

    expect(result).to.deep.equal([
      {
        'plant-id': 'P1',
        'unit-id': 'U1',
        'fiscal-year': 2021,
        'operation-input': 100,
        'maintenance-input': null,
        sum: 100,
      },
    ]);
  });

  it('should handle both null operation and maintenance inputs', async () => {
    const mockData: BasicChargePlanDataFromDB[] = [
      {
        PLANT_CODE: 'P1',
        UNIT_CODE: 'U1',
        FISCAL_YEAR: 2021,
        OPERATION_INPUT: null,
        MAINTENANCE_INPUT: null,
        SUM: 0,
      },
    ];
    basicChargeRepository.getBasicChargePlan.resolves(mockData);

    const result = await getBasicChargePlanUsecase(basicChargeRepository, workUnitCtx, 'P1');

    expect(result).to.deep.equal([
      {
        'plant-id': 'P1',
        'unit-id': 'U1',
        'fiscal-year': 2021,
        'operation-input': null,
        'maintenance-input': null,
        sum: 0,
      },
    ]);
  });

  it('should return empty array when repository returns empty data', async () => {
    basicChargeRepository.getBasicChargePlan.resolves([]);

    const result = await getBasicChargePlanUsecase(basicChargeRepository, workUnitCtx, 'P1');

    expect(result).to.deep.equal([]);
  });

  it('should throw an error when repository throws an error', async () => {
    basicChargeRepository.getBasicChargePlan.rejects(new Error('Database error'));

    try {
      await getBasicChargePlanUsecase(basicChargeRepository, workUnitCtx, 'P1');
      expect.fail('Expected error to be thrown');
    } catch (error) {
      expect(error.message).to.equal('Database error');
    }
  });

  it('should call repository with correct parameters', async () => {
    const mockData: BasicChargePlanDataFromDB[] = [];
    basicChargeRepository.getBasicChargePlan.resolves(mockData);

    await getBasicChargePlanUsecase(basicChargeRepository, workUnitCtx, 'P1', 'U1', 2020, 2021);

    expect(basicChargeRepository.getBasicChargePlan.calledOnceWith(workUnitCtx, 'P1', 'U1', 2020, 2021)).to.be.true;
  });

  it('should handle undefined unitCode', async () => {
    const mockData: BasicChargePlanDataFromDB[] = [];
    basicChargeRepository.getBasicChargePlan.resolves(mockData);

    await getBasicChargePlanUsecase(basicChargeRepository, workUnitCtx, 'P1', undefined, 2020, 2021);

    expect(basicChargeRepository.getBasicChargePlan.calledOnceWith(workUnitCtx, 'P1', undefined, 2020, 2021)).to.be.true;
  });

  it('should handle undefined startFiscalYear', async () => {
    const mockData: BasicChargePlanDataFromDB[] = [];
    basicChargeRepository.getBasicChargePlan.resolves(mockData);

    await getBasicChargePlanUsecase(basicChargeRepository, workUnitCtx, 'P1', 'U1', undefined, 2021);

    expect(basicChargeRepository.getBasicChargePlan.calledOnceWith(workUnitCtx, 'P1', 'U1', undefined, 2021)).to.be.true;
  });

  it('should handle undefined endFiscalYear', async () => {
    const mockData: BasicChargePlanDataFromDB[] = [];
    basicChargeRepository.getBasicChargePlan.resolves(mockData);

    await getBasicChargePlanUsecase(basicChargeRepository, workUnitCtx, 'P1', 'U1', 2020, undefined);

    expect(basicChargeRepository.getBasicChargePlan.calledOnceWith(workUnitCtx, 'P1', 'U1', 2020, undefined)).to.be.true;
  });

  it('should handle all optional parameters as undefined', async () => {
    const mockData: BasicChargePlanDataFromDB[] = [];
    basicChargeRepository.getBasicChargePlan.resolves(mockData);

    await getBasicChargePlanUsecase(basicChargeRepository, workUnitCtx, 'P1');

    expect(basicChargeRepository.getBasicChargePlan.calledOnceWith(workUnitCtx, 'P1', undefined, undefined, undefined)).to.be.true;
  });

  it('should map multiple rows correctly', async () => {
    const mockData: BasicChargePlanDataFromDB[] = [
      {
        PLANT_CODE: 'P1',
        UNIT_CODE: 'U1',
        FISCAL_YEAR: 2021,
        OPERATION_INPUT: 100,
        MAINTENANCE_INPUT: 50,
        SUM: 150,
      },
      {
        PLANT_CODE: 'P1',
        UNIT_CODE: 'U2',
        FISCAL_YEAR: 2022,
        OPERATION_INPUT: 200,
        MAINTENANCE_INPUT: 100,
        SUM: 300,
      },
    ];
    basicChargeRepository.getBasicChargePlan.resolves(mockData);

    const result = await getBasicChargePlanUsecase(basicChargeRepository, workUnitCtx, 'P1');

    expect(result).to.deep.equal([
      {
        'plant-id': 'P1',
        'unit-id': 'U1',
        'fiscal-year': 2021,
        'operation-input': 100,
        'maintenance-input': 50,
        sum: 150,
      },
      {
        'plant-id': 'P1',
        'unit-id': 'U2',
        'fiscal-year': 2022,
        'operation-input': 200,
        'maintenance-input': 100,
        sum: 300,
      },
    ]);
  });

  it('should handle large numbers correctly', async () => {
    const mockData: BasicChargePlanDataFromDB[] = [
      {
        PLANT_CODE: 'P1',
        UNIT_CODE: 'U1',
        FISCAL_YEAR: 2021,
        OPERATION_INPUT: 1e9,
        MAINTENANCE_INPUT: 5e8,
        SUM: 1.5e9,
      },
    ];
    basicChargeRepository.getBasicChargePlan.resolves(mockData);

    const result = await getBasicChargePlanUsecase(basicChargeRepository, workUnitCtx, 'P1');

    expect(result).to.deep.equal([
      {
        'plant-id': 'P1',
        'unit-id': 'U1',
        'fiscal-year': 2021,
        'operation-input': 1e9,
        'maintenance-input': 5e8,
        sum: 1.5e9,
      },
    ]);
  });

  it('should handle negative numbers correctly', async () => {
    const mockData: BasicChargePlanDataFromDB[] = [
      {
        PLANT_CODE: 'P1',
        UNIT_CODE: 'U1',
        FISCAL_YEAR: 2021,
        OPERATION_INPUT: -100,
        MAINTENANCE_INPUT: -50,
        SUM: -150,
      },
    ];
    basicChargeRepository.getBasicChargePlan.resolves(mockData);

    const result = await getBasicChargePlanUsecase(basicChargeRepository, workUnitCtx, 'P1');

    expect(result).to.deep.equal([
      {
        'plant-id': 'P1',
        'unit-id': 'U1',
        'fiscal-year': 2021,
        'operation-input': -100,
        'maintenance-input': -50,
        sum: -150,
      },
    ]);
  });

  it('should handle zero values correctly', async () => {
    const mockData: BasicChargePlanDataFromDB[] = [
      {
        PLANT_CODE: 'P1',
        UNIT_CODE: 'U1',
        FISCAL_YEAR: 2021,
        OPERATION_INPUT: 0,
        MAINTENANCE_INPUT: 0,
        SUM: 0,
      },
    ];
    basicChargeRepository.getBasicChargePlan.resolves(mockData);

    const result = await getBasicChargePlanUsecase(basicChargeRepository, workUnitCtx, 'P1');

    expect(result).to.deep.equal([
      {
        'plant-id': 'P1',
        'unit-id': 'U1',
        'fiscal-year': 2021,
        'operation-input': 0,
        'maintenance-input': 0,
        sum: 0,
      },
    ]);
  });

  it('should handle mixed null and non-null inputs', async () => {
    const mockData: BasicChargePlanDataFromDB[] = [
      {
        PLANT_CODE: 'P1',
        UNIT_CODE: 'U1',
        FISCAL_YEAR: 2021,
        OPERATION_INPUT: null,
        MAINTENANCE_INPUT: 50,
        SUM: 50,
      },
      {
        PLANT_CODE: 'P1',
        UNIT_CODE: 'U2',
        FISCAL_YEAR: 2022,
        OPERATION_INPUT: 100,
        MAINTENANCE_INPUT: null,
        SUM: 100,
      },
    ];
    basicChargeRepository.getBasicChargePlan.resolves(mockData);

    const result = await getBasicChargePlanUsecase(basicChargeRepository, workUnitCtx, 'P1');

    expect(result).to.deep.equal([
      {
        'plant-id': 'P1',
        'unit-id': 'U1',
        'fiscal-year': 2021,
        'operation-input': null,
        'maintenance-input': 50,
        sum: 50,
      },
      {
        'plant-id': 'P1',
        'unit-id': 'U2',
        'fiscal-year': 2022,
        'operation-input': 100,
        'maintenance-input': null,
        sum: 100,
      },
    ]);
  });

  it('should handle fiscal year boundaries', async () => {
    const mockData: BasicChargePlanDataFromDB[] = [
      {
        PLANT_CODE: 'P1',
        UNIT_CODE: 'U1',
        FISCAL_YEAR: 2020,
        OPERATION_INPUT: 100,
        MAINTENANCE_INPUT: 50,
        SUM: 150,
      },
      {
        PLANT_CODE: 'P1',
        UNIT_CODE: 'U2',
        FISCAL_YEAR: 2021,
        OPERATION_INPUT: 200,
        MAINTENANCE_INPUT: 100,
        SUM: 300,
      },
    ];
    basicChargeRepository.getBasicChargePlan.resolves(mockData);

    const result = await getBasicChargePlanUsecase(basicChargeRepository, workUnitCtx, 'P1', undefined, 2020, 2021);

    expect(result).to.deep.equal([
      {
        'plant-id': 'P1',
        'unit-id': 'U1',
        'fiscal-year': 2020,
        'operation-input': 100,
        'maintenance-input': 50,
        sum: 150,
      },
      {
        'plant-id': 'P1',
        'unit-id': 'U2',
        'fiscal-year': 2021,
        'operation-input': 200,
        'maintenance-input': 100,
        sum: 300,
      },
    ]);
  });

  it('should handle empty plant code', async () => {
    const mockData: BasicChargePlanDataFromDB[] = [];
    basicChargeRepository.getBasicChargePlan.resolves(mockData);

    await getBasicChargePlanUsecase(basicChargeRepository, workUnitCtx, '');

    expect(basicChargeRepository.getBasicChargePlan.calledOnceWith(workUnitCtx, '', undefined, undefined, undefined)).to.be.true;
  });

  afterEach(() => {
    sinon.restore();
  });
});
