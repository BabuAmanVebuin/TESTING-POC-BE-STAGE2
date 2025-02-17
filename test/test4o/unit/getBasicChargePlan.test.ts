import { expect } from 'chai';
import { getBasicChargePlanUsecase } from '../../../src/application/use_cases/dpm/getBasicChargePlanUsecase';
import { BasicChargeRepositoryPort } from '../../../src/application/port/BasicChargeRepositoryPort';
import sinon from 'sinon';

describe('getBasicChargePlanUsecase', () => {
  let basicChargeRepository: BasicChargeRepositoryPort<any>;
  let workUnitCtx: any;

  beforeEach(() => {
    workUnitCtx = {};
    basicChargeRepository = {
      wrapInWorkUnitCtx: sinon.stub(),
      getBasicChargePlan: sinon.stub(),
      getBasicChargeForecast: sinon.stub(),
      getBasicChargePlanSummary: sinon.stub(),
      upsertBasicChargePlan: sinon.stub(),
      upsertBasicChargeForecast: sinon.stub(),
      getBasicChargeForecastSummary: sinon.stub(),
    };
  });

  it('should return basic charge plan data successfully', async () => {
    const mockData = [
      {
        PLANT_CODE: 'plant1',
        UNIT_CODE: 'unit1',
        FISCAL_YEAR: 2021,
        OPERATION_INPUT: 100,
        MAINTENANCE_INPUT: 50,
        SUM: 150,
      },
    ];

    (basicChargeRepository.getBasicChargePlan as sinon.SinonStub).resolves(mockData);

    const result = await getBasicChargePlanUsecase(
      basicChargeRepository,
      workUnitCtx,
      'plant1',
      'unit1',
      2021,
      2022
    );

    expect(result).to.deep.equal([
      {
        'plant-id': 'plant1',
        'unit-id': 'unit1',
        'fiscal-year': 2021,
        'operation-input': 100,
        'maintenance-input': 50,
        sum: 150,
      },
    ]);
  });

  it('should handle empty data response', async () => {
    (basicChargeRepository.getBasicChargePlan as sinon.SinonStub).resolves([]);

    const result = await getBasicChargePlanUsecase(
      basicChargeRepository,
      workUnitCtx,
      'plant1',
      'unit1',
      2021,
      2022
    );

    expect(result).to.deep.equal([]);
  });

  it('should handle null operation input', async () => {
    const mockData = [
      {
        PLANT_CODE: 'plant1',
        UNIT_CODE: 'unit1',
        FISCAL_YEAR: 2021,
        OPERATION_INPUT: null,
        MAINTENANCE_INPUT: 50,
        SUM: 50,
      },
    ];

    (basicChargeRepository.getBasicChargePlan as sinon.SinonStub).resolves(mockData);

    const result = await getBasicChargePlanUsecase(
      basicChargeRepository,
      workUnitCtx,
      'plant1',
      'unit1',
      2021,
      2022
    );

    expect(result).to.deep.equal([
      {
        'plant-id': 'plant1',
        'unit-id': 'unit1',
        'fiscal-year': 2021,
        'operation-input': null,
        'maintenance-input': 50,
        sum: 50,
      },
    ]);
  });

  it('should handle null maintenance input', async () => {
    const mockData = [
      {
        PLANT_CODE: 'plant1',
        UNIT_CODE: 'unit1',
        FISCAL_YEAR: 2021,
        OPERATION_INPUT: 100,
        MAINTENANCE_INPUT: null,
        SUM: 100,
      },
    ];

    (basicChargeRepository.getBasicChargePlan as sinon.SinonStub).resolves(mockData);

    const result = await getBasicChargePlanUsecase(
      basicChargeRepository,
      workUnitCtx,
      'plant1',
      'unit1',
      2021,
      2022
    );

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
    const mockData = [
      {
        PLANT_CODE: 'plant1',
        UNIT_CODE: 'unit1',
        FISCAL_YEAR: 2021,
        OPERATION_INPUT: null,
        MAINTENANCE_INPUT: null,
        SUM: 0,
      },
    ];

    (basicChargeRepository.getBasicChargePlan as sinon.SinonStub).resolves(mockData);

    const result = await getBasicChargePlanUsecase(
      basicChargeRepository,
      workUnitCtx,
      'plant1',
      'unit1',
      2021,
      2022
    );

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

  it('should handle missing unit code', async () => {
    const mockData = [
      {
        PLANT_CODE: 'plant1',
        UNIT_CODE: 'unit1',
        FISCAL_YEAR: 2021,
        OPERATION_INPUT: 100,
        MAINTENANCE_INPUT: 50,
        SUM: 150,
      },
    ];

    (basicChargeRepository.getBasicChargePlan as sinon.SinonStub).resolves(mockData);

    const result = await getBasicChargePlanUsecase(
      basicChargeRepository,
      workUnitCtx,
      'plant1',
      undefined,
      2021,
      2022
    );

    expect(result).to.deep.equal([
      {
        'plant-id': 'plant1',
        'unit-id': 'unit1',
        'fiscal-year': 2021,
        'operation-input': 100,
        'maintenance-input': 50,
        sum: 150,
      },
    ]);
  });

  it('should handle missing start fiscal year', async () => {
    const mockData = [
      {
        PLANT_CODE: 'plant1',
        UNIT_CODE: 'unit1',
        FISCAL_YEAR: 2021,
        OPERATION_INPUT: 100,
        MAINTENANCE_INPUT: 50,
        SUM: 150,
      },
    ];

    (basicChargeRepository.getBasicChargePlan as sinon.SinonStub).resolves(mockData);

    const result = await getBasicChargePlanUsecase(
      basicChargeRepository,
      workUnitCtx,
      'plant1',
      'unit1',
      undefined,
      2022
    );

    expect(result).to.deep.equal([
      {
        'plant-id': 'plant1',
        'unit-id': 'unit1',
        'fiscal-year': 2021,
        'operation-input': 100,
        'maintenance-input': 50,
        sum: 150,
      },
    ]);
  });

  it('should handle missing end fiscal year', async () => {
    const mockData = [
      {
        PLANT_CODE: 'plant1',
        UNIT_CODE: 'unit1',
        FISCAL_YEAR: 2021,
        OPERATION_INPUT: 100,
        MAINTENANCE_INPUT: 50,
        SUM: 150,
      },
    ];

    (basicChargeRepository.getBasicChargePlan as sinon.SinonStub).resolves(mockData);

    const result = await getBasicChargePlanUsecase(
      basicChargeRepository,
      workUnitCtx,
      'plant1',
      'unit1',
      2021,
      undefined
    );

    expect(result).to.deep.equal([
      {
        'plant-id': 'plant1',
        'unit-id': 'unit1',
        'fiscal-year': 2021,
        'operation-input': 100,
        'maintenance-input': 50,
        sum: 150,
      },
    ]);
  });

  it('should handle repository error', async () => {
    (basicChargeRepository.getBasicChargePlan as sinon.SinonStub).rejects(new Error('Repository error'));

    try {
      await getBasicChargePlanUsecase(
        basicChargeRepository,
        workUnitCtx,
        'plant1',
        'unit1',
        2021,
        2022
      );
    } catch (error) {
      expect(error).to.be.an('error');
      expect(error).to.equal('Repository error');
    }
  });

  it('should handle multiple data rows', async () => {
    const mockData = [
      {
        PLANT_CODE: 'plant1',
        UNIT_CODE: 'unit1',
        FISCAL_YEAR: 2021,
        OPERATION_INPUT: 100,
        MAINTENANCE_INPUT: 50,
        SUM: 150,
      },
      {
        PLANT_CODE: 'plant1',
        UNIT_CODE: 'unit2',
        FISCAL_YEAR: 2022,
        OPERATION_INPUT: 200,
        MAINTENANCE_INPUT: 100,
        SUM: 300,
      },
    ];

    (basicChargeRepository.getBasicChargePlan as sinon.SinonStub).resolves(mockData);

    const result = await getBasicChargePlanUsecase(
      basicChargeRepository,
      workUnitCtx,
      'plant1',
      undefined,
      2021,
      2022
    );

    expect(result).to.deep.equal([
      {
        'plant-id': 'plant1',
        'unit-id': 'unit1',
        'fiscal-year': 2021,
        'operation-input': 100,
        'maintenance-input': 50,
        sum: 150,
      },
      {
        'plant-id': 'plant1',
        'unit-id': 'unit2',
        'fiscal-year': 2022,
        'operation-input': 200,
        'maintenance-input': 100,
        sum: 300,
      },
    ]);
  });

  it('should handle fiscal year range', async () => {
    const mockData = [
      {
        PLANT_CODE: 'plant1',
        UNIT_CODE: 'unit1',
        FISCAL_YEAR: 2021,
        OPERATION_INPUT: 100,
        MAINTENANCE_INPUT: 50,
        SUM: 150,
      },
    ];

    (basicChargeRepository.getBasicChargePlan as sinon.SinonStub).resolves(mockData);

    const result = await getBasicChargePlanUsecase(
      basicChargeRepository,
      workUnitCtx,
      'plant1',
      'unit1',
      2020,
      2022
    );

    expect(result).to.deep.equal([
      {
        'plant-id': 'plant1',
        'unit-id': 'unit1',
        'fiscal-year': 2021,
        'operation-input': 100,
        'maintenance-input': 50,
        sum: 150,
      },
    ]);
  });

  it('should handle no fiscal year range', async () => {
    const mockData = [
      {
        PLANT_CODE: 'plant1',
        UNIT_CODE: 'unit1',
        FISCAL_YEAR: 2021,
        OPERATION_INPUT: 100,
        MAINTENANCE_INPUT: 50,
        SUM: 150,
      },
    ];

    (basicChargeRepository.getBasicChargePlan as sinon.SinonStub).resolves(mockData);

    const result = await getBasicChargePlanUsecase(
      basicChargeRepository,
      workUnitCtx,
      'plant1',
      'unit1',
      undefined,
      undefined
    );

    expect(result).to.deep.equal([
      {
        'plant-id': 'plant1',
        'unit-id': 'unit1',
        'fiscal-year': 2021,
        'operation-input': 100,
        'maintenance-input': 50,
        sum: 150,
      },
    ]);
  });

  it('should handle large data set', async () => {
    const mockData = Array.from({ length: 1000 }, (_, i) => ({
      PLANT_CODE: `plant${i}`,
      UNIT_CODE: `unit${i}`,
      FISCAL_YEAR: 2021,
      OPERATION_INPUT: 100,
      MAINTENANCE_INPUT: 50,
      SUM: 150,
    }));

    (basicChargeRepository.getBasicChargePlan as sinon.SinonStub).resolves(mockData);

    const result = await getBasicChargePlanUsecase(
      basicChargeRepository,
      workUnitCtx,
      'plant1',
      'unit1',
      2021,
      2022
    );

    expect(result).to.have.lengthOf(1000);
  });

  it('should handle negative operation input', async () => {
    const mockData = [
      {
        PLANT_CODE: 'plant1',
        UNIT_CODE: 'unit1',
        FISCAL_YEAR: 2021,
        OPERATION_INPUT: -100,
        MAINTENANCE_INPUT: 50,
        SUM: -50,
      },
    ];

    (basicChargeRepository.getBasicChargePlan as sinon.SinonStub).resolves(mockData);

    const result = await getBasicChargePlanUsecase(
      basicChargeRepository,
      workUnitCtx,
      'plant1',
      'unit1',
      2021,
      2022
    );

    expect(result).to.deep.equal([
      {
        'plant-id': 'plant1',
        'unit-id': 'unit1',
        'fiscal-year': 2021,
        'operation-input': -100,
        'maintenance-input': 50,
        sum: -50,
      },
    ]);
  });

  it('should handle negative maintenance input', async () => {
    const mockData = [
      {
        PLANT_CODE: 'plant1',
        UNIT_CODE: 'unit1',
        FISCAL_YEAR: 2021,
        OPERATION_INPUT: 100,
        MAINTENANCE_INPUT: -50,
        SUM: 50,
      },
    ];

    (basicChargeRepository.getBasicChargePlan as sinon.SinonStub).resolves(mockData);

    const result = await getBasicChargePlanUsecase(
      basicChargeRepository,
      workUnitCtx,
      'plant1',
      'unit1',
      2021,
      2022
    );

    expect(result).to.deep.equal([
      {
        'plant-id': 'plant1',
        'unit-id': 'unit1',
        'fiscal-year': 2021,
        'operation-input': 100,
        'maintenance-input': -50,
        sum: 50,
      },
    ]);
  });

  it('should handle zero operation input', async () => {
    const mockData = [
      {
        PLANT_CODE: 'plant1',
        UNIT_CODE: 'unit1',
        FISCAL_YEAR: 2021,
        OPERATION_INPUT: 0,
        MAINTENANCE_INPUT: 50,
        SUM: 50,
      },
    ];

    (basicChargeRepository.getBasicChargePlan as sinon.SinonStub).resolves(mockData);

    const result = await getBasicChargePlanUsecase(
      basicChargeRepository,
      workUnitCtx,
      'plant1',
      'unit1',
      2021,
      2022
    );

    expect(result).to.deep.equal([
      {
        'plant-id': 'plant1',
        'unit-id': 'unit1',
        'fiscal-year': 2021,
        'operation-input': 0,
        'maintenance-input': 50,
        sum: 50,
      },
    ]);
  });

  it('should handle zero maintenance input', async () => {
    const mockData = [
      {
        PLANT_CODE: 'plant1',
        UNIT_CODE: 'unit1',
        FISCAL_YEAR: 2021,
        OPERATION_INPUT: 100,
        MAINTENANCE_INPUT: 0,
        SUM: 100,
      },
    ];

    (basicChargeRepository.getBasicChargePlan as sinon.SinonStub).resolves(mockData);

    const result = await getBasicChargePlanUsecase(
      basicChargeRepository,
      workUnitCtx,
      'plant1',
      'unit1',
      2021,
      2022
    );

    expect(result).to.deep.equal([
      {
        'plant-id': 'plant1',
        'unit-id': 'unit1',
        'fiscal-year': 2021,
        'operation-input': 100,
        'maintenance-input': 0,
        sum: 100,
      },
    ]);
  });

  it('should handle zero operation and maintenance inputs', async () => {
    const mockData = [
      {
        PLANT_CODE: 'plant1',
        UNIT_CODE: 'unit1',
        FISCAL_YEAR: 2021,
        OPERATION_INPUT: 0,
        MAINTENANCE_INPUT: 0,
        SUM: 0,
      },
    ];

    (basicChargeRepository.getBasicChargePlan as sinon.SinonStub).resolves(mockData);

    const result = await getBasicChargePlanUsecase(
      basicChargeRepository,
      workUnitCtx,
      'plant1',
      'unit1',
      2021,
      2022
    );

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
});
