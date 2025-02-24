import { expect } from 'chai';
import { getBasicChargePlanUsecase } from '../../../src/application/use_cases/getBasicChargePlanUsecase';
import { BasicChargeRepositoryPort } from '../../../src/application/port/BasicChargeRepositoryPort';
import { BasicChargePlanDataFromDB } from '../../../src/domain/entities/dpm/basicChargePlan';
import sinon from 'sinon';

describe('getBasicChargePlanUsecase', () => {
  let basicChargeRepositoryMock: sinon.SinonStubbedInstance<BasicChargeRepositoryPort<any>>;
  let workUnitCtxMock: any;

  beforeEach(() => {
    basicChargeRepositoryMock = {
      getBasicChargePlan: sinon.stub(),
      wrapInWorkUnitCtx: sinon.stub(),
      getBasicChargeForecast: sinon.stub(),
      getBasicChargePlanSummary: sinon.stub(),
      upsertBasicChargePlan: sinon.stub(),
      upsertBasicChargeForecast: sinon.stub(),
      getBasicChargeForecastSummary: sinon.stub(),
    };
    workUnitCtxMock = {};
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should return mapped data when repository returns valid data', async () => {
    const mockData: BasicChargePlanDataFromDB[] = [
      {
        PLANT_CODE: 'P1',
        UNIT_CODE: 'U1',
        FISCAL_YEAR: 2021,
        OPERATION_INPUT: 100,
        MAINTENANCE_INPUT: 200,
        SUM: 300,
      },
    ];
    basicChargeRepositoryMock.getBasicChargePlan.resolves(mockData);

    const result = await getBasicChargePlanUsecase(
      basicChargeRepositoryMock,
      workUnitCtxMock,
      'P1',
      'U1',
      2020,
      2022
    );

    expect(result).to.deep.equal([
      {
        'plant-id': 'P1',
        'unit-id': 'U1',
        'fiscal-year': 2021,
        'operation-input': 100,
        'maintenance-input': 200,
        sum: 300,
      },
    ]);
  });

  it('should handle null operation and maintenance inputs', async () => {
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
    basicChargeRepositoryMock.getBasicChargePlan.resolves(mockData);

    const result = await getBasicChargePlanUsecase(
      basicChargeRepositoryMock,
      workUnitCtxMock,
      'P1'
    );

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
    basicChargeRepositoryMock.getBasicChargePlan.resolves([]);

    const result = await getBasicChargePlanUsecase(
      basicChargeRepositoryMock,
      workUnitCtxMock,
      'P1'
    );

    expect(result).to.deep.equal([]);
  });

  it('should throw an error when repository throws an error', async () => {
    basicChargeRepositoryMock.getBasicChargePlan.rejects(new Error('Database error'));

    try {
      await getBasicChargePlanUsecase(
        basicChargeRepositoryMock,
        workUnitCtxMock,
        'P1'
      );
    } catch (error) {
      expect(error).to.be.an('error');
      expect(error.message).to.equal('Database error');
    }
  });

  it('should call repository with correct parameters', async () => {
    const mockData: BasicChargePlanDataFromDB[] = [];
    basicChargeRepositoryMock.getBasicChargePlan.resolves(mockData);

    await getBasicChargePlanUsecase(
      basicChargeRepositoryMock,
      workUnitCtxMock,
      'P1',
      'U1',
      2020,
      2022
    );

    expect(basicChargeRepositoryMock.getBasicChargePlan.calledOnce).to.be.true;
    expect(basicChargeRepositoryMock.getBasicChargePlan.firstCall.args).to.deep.equal([
      workUnitCtxMock,
      'P1',
      'U1',
      2020,
      2022,
    ]);
  });

  it('should handle undefined unitCode, startFiscalYear, and endFiscalYear', async () => {
    const mockData: BasicChargePlanDataFromDB[] = [];
    basicChargeRepositoryMock.getBasicChargePlan.resolves(mockData);

    await getBasicChargePlanUsecase(
      basicChargeRepositoryMock,
      workUnitCtxMock,
      'P1'
    );

    expect(basicChargeRepositoryMock.getBasicChargePlan.calledOnce).to.be.true;
    expect(basicChargeRepositoryMock.getBasicChargePlan.firstCall.args).to.deep.equal([
      workUnitCtxMock,
      'P1',
      undefined,
      undefined,
      undefined,
    ]);
  });

  it('should handle only startFiscalYear provided', async () => {
    const mockData: BasicChargePlanDataFromDB[] = [];
    basicChargeRepositoryMock.getBasicChargePlan.resolves(mockData);

    await getBasicChargePlanUsecase(
      basicChargeRepositoryMock,
      workUnitCtxMock,
      'P1',
      undefined,
      2020
    );

    expect(basicChargeRepositoryMock.getBasicChargePlan.calledOnce).to.be.true;
    expect(basicChargeRepositoryMock.getBasicChargePlan.firstCall.args).to.deep.equal([
      workUnitCtxMock,
      'P1',
      undefined,
      2020,
      undefined,
    ]);
  });

  it('should handle only endFiscalYear provided', async () => {
    const mockData: BasicChargePlanDataFromDB[] = [];
    basicChargeRepositoryMock.getBasicChargePlan.resolves(mockData);

    await getBasicChargePlanUsecase(
      basicChargeRepositoryMock,
      workUnitCtxMock,
      'P1',
      undefined,
      undefined,
      2022
    );

    expect(basicChargeRepositoryMock.getBasicChargePlan.calledOnce).to.be.true;
    expect(basicChargeRepositoryMock.getBasicChargePlan.firstCall.args).to.deep.equal([
      workUnitCtxMock,
      'P1',
      undefined,
      undefined,
      2022,
    ]);
  });

  it('should handle only unitCode provided', async () => {
    const mockData: BasicChargePlanDataFromDB[] = [];
    basicChargeRepositoryMock.getBasicChargePlan.resolves(mockData);

    await getBasicChargePlanUsecase(
      basicChargeRepositoryMock,
      workUnitCtxMock,
      'P1',
      'U1'
    );

    expect(basicChargeRepositoryMock.getBasicChargePlan.calledOnce).to.be.true;
    expect(basicChargeRepositoryMock.getBasicChargePlan.firstCall.args).to.deep.equal([
      workUnitCtxMock,
      'P1',
      'U1',
      undefined,
      undefined,
    ]);
  });

  it('should handle all parameters as undefined', async () => {
    const mockData: BasicChargePlanDataFromDB[] = [];
    basicChargeRepositoryMock.getBasicChargePlan.resolves(mockData);

    await getBasicChargePlanUsecase(
      basicChargeRepositoryMock,
      workUnitCtxMock,
      'P1',
      undefined,
      undefined,
      undefined
    );

    expect(basicChargeRepositoryMock.getBasicChargePlan.calledOnce).to.be.true;
    expect(basicChargeRepositoryMock.getBasicChargePlan.firstCall.args).to.deep.equal([
      workUnitCtxMock,
      'P1',
      undefined,
      undefined,
      undefined,
    ]);
  });

  it('should handle repository returning multiple records', async () => {
    const mockData: BasicChargePlanDataFromDB[] = [
      {
        PLANT_CODE: 'P1',
        UNIT_CODE: 'U1',
        FISCAL_YEAR: 2021,
        OPERATION_INPUT: 100,
        MAINTENANCE_INPUT: 200,
        SUM: 300,
      },
      {
        PLANT_CODE: 'P1',
        UNIT_CODE: 'U2',
        FISCAL_YEAR: 2022,
        OPERATION_INPUT: 150,
        MAINTENANCE_INPUT: 250,
        SUM: 400,
      },
    ];
    basicChargeRepositoryMock.getBasicChargePlan.resolves(mockData);

    const result = await getBasicChargePlanUsecase(
      basicChargeRepositoryMock,
      workUnitCtxMock,
      'P1'
    );

    expect(result).to.deep.equal([
      {
        'plant-id': 'P1',
        'unit-id': 'U1',
        'fiscal-year': 2021,
        'operation-input': 100,
        'maintenance-input': 200,
        sum: 300,
      },
      {
        'plant-id': 'P1',
        'unit-id': 'U2',
        'fiscal-year': 2022,
        'operation-input': 150,
        'maintenance-input': 250,
        sum: 400,
      },
    ]);
  });

  it('should handle repository returning records with zero inputs', async () => {
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
    basicChargeRepositoryMock.getBasicChargePlan.resolves(mockData);

    const result = await getBasicChargePlanUsecase(
      basicChargeRepositoryMock,
      workUnitCtxMock,
      'P1'
    );

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

  it('should handle repository returning records with negative inputs', async () => {
    const mockData: BasicChargePlanDataFromDB[] = [
      {
        PLANT_CODE: 'P1',
        UNIT_CODE: 'U1',
        FISCAL_YEAR: 2021,
        OPERATION_INPUT: -100,
        MAINTENANCE_INPUT: -200,
        SUM: -300,
      },
    ];
    basicChargeRepositoryMock.getBasicChargePlan.resolves(mockData);

    const result = await getBasicChargePlanUsecase(
      basicChargeRepositoryMock,
      workUnitCtxMock,
      'P1'
    );

    expect(result).to.deep.equal([
      {
        'plant-id': 'P1',
        'unit-id': 'U1',
        'fiscal-year': 2021,
        'operation-input': -100,
        'maintenance-input': -200,
        sum: -300,
      },
    ]);
  });

  it('should handle repository returning records with large inputs', async () => {
    const mockData: BasicChargePlanDataFromDB[] = [
      {
        PLANT_CODE: 'P1',
        UNIT_CODE: 'U1',
        FISCAL_YEAR: 2021,
        OPERATION_INPUT: 1e9,
        MAINTENANCE_INPUT: 1e9,
        SUM: 2e9,
      },
    ];
    basicChargeRepositoryMock.getBasicChargePlan.resolves(mockData);

    const result = await getBasicChargePlanUsecase(
      basicChargeRepositoryMock,
      workUnitCtxMock,
      'P1'
    );

    expect(result).to.deep.equal([
      {
        'plant-id': 'P1',
        'unit-id': 'U1',
        'fiscal-year': 2021,
        'operation-input': 1e9,
        'maintenance-input': 1e9,
        sum: 2e9,
      },
    ]);
  });

  it('should handle repository returning records with mixed null and non-null inputs', async () => {
    const mockData: BasicChargePlanDataFromDB[] = [
      {
        PLANT_CODE: 'P1',
        UNIT_CODE: 'U1',
        FISCAL_YEAR: 2021,
        OPERATION_INPUT: null,
        MAINTENANCE_INPUT: 200,
        SUM: 200,
      },
    ];
    basicChargeRepositoryMock.getBasicChargePlan.resolves(mockData);

    const result = await getBasicChargePlanUsecase(
      basicChargeRepositoryMock,
      workUnitCtxMock,
      'P1'
    );

    expect(result).to.deep.equal([
      {
        'plant-id': 'P1',
        'unit-id': 'U1',
        'fiscal-year': 2021,
        'operation-input': null,
        'maintenance-input': 200,
        sum: 200,
      },
    ]);
  });

  it('should handle repository returning records with all null inputs', async () => {
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
    basicChargeRepositoryMock.getBasicChargePlan.resolves(mockData);

    const result = await getBasicChargePlanUsecase(
      basicChargeRepositoryMock,
      workUnitCtxMock,
      'P1'
    );

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

  it('should handle repository returning records with all zero inputs', async () => {
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
    basicChargeRepositoryMock.getBasicChargePlan.resolves(mockData);

    const result = await getBasicChargePlanUsecase(
      basicChargeRepositoryMock,
      workUnitCtxMock,
      'P1'
    );

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

  it('should handle repository returning records with all negative inputs', async () => {
    const mockData: BasicChargePlanDataFromDB[] = [
      {
        PLANT_CODE: 'P1',
        UNIT_CODE: 'U1',
        FISCAL_YEAR: 2021,
        OPERATION_INPUT: -100,
        MAINTENANCE_INPUT: -200,
        SUM: -300,
      },
    ];
    basicChargeRepositoryMock.getBasicChargePlan.resolves(mockData);

    const result = await getBasicChargePlanUsecase(
      basicChargeRepositoryMock,
      workUnitCtxMock,
      'P1'
    );

    expect(result).to.deep.equal([
      {
        'plant-id': 'P1',
        'unit-id': 'U1',
        'fiscal-year': 2021,
        'operation-input': -100,
        'maintenance-input': -200,
        sum: -300,
      },
    ]);
  });
});