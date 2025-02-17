
import { expect } from 'chai';
import { getBasicChargePlanUsecase } from '../../../src/application/use_cases/dpm/getBasicChargePlanUsecase';
import { BasicChargeRepositoryPort } from '../../../src/application/port/BasicChargeRepositoryPort';
import sinon from 'sinon';

describe('getBasicChargePlanUsecase', () => {
  let basicChargeRepositoryMock: sinon.SinonStubbedInstance<BasicChargeRepositoryPort<any>>;

  beforeEach(() => {
    basicChargeRepositoryMock = {
      wrapInWorkUnitCtx: sinon.stub(),
      getBasicChargePlan: sinon.stub(),
      getBasicChargeForecast: sinon.stub(),
      getBasicChargePlanSummary: sinon.stub(),
      upsertBasicChargePlan: sinon.stub(),
      upsertBasicChargeForecast: sinon.stub(),
      getBasicChargeForecastSummary: sinon.stub(),
    };
  });

  it('should return basic charge plans successfully', async () => {
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

    basicChargeRepositoryMock.getBasicChargePlan.resolves(mockData);

    const result = await getBasicChargePlanUsecase(
      basicChargeRepositoryMock,
      {},
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

  it('should handle empty result set', async () => {
    basicChargeRepositoryMock.getBasicChargePlan.resolves([]);

    const result = await getBasicChargePlanUsecase(
      basicChargeRepositoryMock,
      {},
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

    basicChargeRepositoryMock.getBasicChargePlan.resolves(mockData);

    const result = await getBasicChargePlanUsecase(
      basicChargeRepositoryMock,
      {},
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

    basicChargeRepositoryMock.getBasicChargePlan.resolves(mockData);

    const result = await getBasicChargePlanUsecase(
      basicChargeRepositoryMock,
      {},
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

  it('should handle both null operation and maintenance input', async () => {
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

    basicChargeRepositoryMock.getBasicChargePlan.resolves(mockData);

    const result = await getBasicChargePlanUsecase(
      basicChargeRepositoryMock,
      {},
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
        UNIT_CODE: null,
        FISCAL_YEAR: 2021,
        OPERATION_INPUT: 100,
        MAINTENANCE_INPUT: 50,
        SUM: 150,
      },
    ];

    basicChargeRepositoryMock.getBasicChargePlan.resolves(mockData);

    const result = await getBasicChargePlanUsecase(
      basicChargeRepositoryMock,
      {},
      'plant1',
      undefined,
      2021,
      2022
    );

    expect(result).to.deep.equal([
      {
        'plant-id': 'plant1',
        'unit-id': null,
        'fiscal-year': 2021,
        'operation-input': 100,
        'maintenance-input': 50,
        sum: 150,
      },
    ]);
  });

  it('should handle missing fiscal year range', async () => {
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

    basicChargeRepositoryMock.getBasicChargePlan.resolves(mockData);

    const result = await getBasicChargePlanUsecase(
      basicChargeRepositoryMock,
      {},
      'plant1'
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
    basicChargeRepositoryMock.getBasicChargePlan.rejects(new Error('Repository error'));

    try {
      await getBasicChargePlanUsecase(
        basicChargeRepositoryMock,
        {},
        'plant1',
        'unit1',
        2021,
        2022
      );
    } catch (error) {
      expect(error.message).to.equal('Repository error');
    }
  });

  it('should handle multiple records', async () => {
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

    basicChargeRepositoryMock.getBasicChargePlan.resolves(mockData);

    const result = await getBasicChargePlanUsecase(
      basicChargeRepositoryMock,
      {},
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

  it('should handle fiscal year filter', async () => {
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

    basicChargeRepositoryMock.getBasicChargePlan.resolves(mockData);

    const result = await getBasicChargePlanUsecase(
      basicChargeRepositoryMock,
      {},
      'plant1',
      'unit1',
      2021,
      2021
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

  it('should handle no fiscal year filter', async () => {
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

    basicChargeRepositoryMock.getBasicChargePlan.resolves(mockData);

    const result = await getBasicChargePlanUsecase(
      basicChargeRepositoryMock,
      {},
      'plant1',
      'unit1'
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

  it('should handle missing plant code', async () => {
    try {
      await getBasicChargePlanUsecase(
        basicChargeRepositoryMock,
        {},
        ''
      );
    } catch (error) {
      expect(error.message).to.equal('Plant code is required');
    }
  });

  it('should handle invalid fiscal year range', async () => {
    try {
      await getBasicChargePlanUsecase(
        basicChargeRepositoryMock,
        {},
        'plant1',
        'unit1',
        2022,
        2021
      );
    } catch (error) {
      expect(error.message).to.equal('Invalid fiscal year range');
    }
  });

  it('should handle valid fiscal year range', async () => {
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

    basicChargeRepositoryMock.getBasicChargePlan.resolves(mockData);

    const result = await getBasicChargePlanUsecase(
      basicChargeRepositoryMock,
      {},
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

  it('should handle missing repository', async () => {
    try {
      await getBasicChargePlanUsecase(
        null as any,
        {},
        'plant1',
        'unit1',
        2021,
        2022
      );
    } catch (error) {
      expect(error.message).to.equal('Repository is required');
    }
  });

  it('should handle missing work unit context', async () => {
    try {
      await getBasicChargePlanUsecase(
        basicChargeRepositoryMock,
        null as any,
        'plant1',
        'unit1',
        2021,
        2022
      );
    } catch (error) {
      expect(error.message).to.equal('Work unit context is required');
    }
  });

  it('should handle missing plant code in data', async () => {
    const mockData = [
      {
        PLANT_CODE: null,
        UNIT_CODE: 'unit1',
        FISCAL_YEAR: 2021,
        OPERATION_INPUT: 100,
        MAINTENANCE_INPUT: 50,
        SUM: 150,
      },
    ];

    basicChargeRepositoryMock.getBasicChargePlan.resolves(mockData);

    const result = await getBasicChargePlanUsecase(
      basicChargeRepositoryMock,
      {},
      'plant1',
      'unit1',
      2021,
      2022
    );

    expect(result).to.deep.equal([
      {
        'plant-id': null,
        'unit-id': 'unit1',
        'fiscal-year': 2021,
        'operation-input': 100,
        'maintenance-input': 50,
        sum: 150,
      },
    ]);
  });

  it('should handle missing unit code in data', async () => {
    const mockData = [
      {
        PLANT_CODE: 'plant1',
        UNIT_CODE: null,
        FISCAL_YEAR: 2021,
        OPERATION_INPUT: 100,
        MAINTENANCE_INPUT: 50,
        SUM: 150,
      },
    ];

    basicChargeRepositoryMock.getBasicChargePlan.resolves(mockData);

    const result = await getBasicChargePlanUsecase(
      basicChargeRepositoryMock,
      {},
      'plant1',
      'unit1',
      2021,
      2022
    );

    expect(result).to.deep.equal([
      {
        'plant-id': 'plant1',
        'unit-id': null,
        'fiscal-year': 2021,
        'operation-input': 100,
        'maintenance-input': 50,
        sum: 150,
      },
    ]);
  });

  it('should handle missing fiscal year in data', async () => {
    const mockData = [
      {
        PLANT_CODE: 'plant1',
        UNIT_CODE: 'unit1',
        FISCAL_YEAR: null,
        OPERATION_INPUT: 100,
        MAINTENANCE_INPUT: 50,
        SUM: 150,
      },
    ];

    basicChargeRepositoryMock.getBasicChargePlan.resolves(mockData);

    const result = await getBasicChargePlanUsecase(
      basicChargeRepositoryMock,
      {},
      'plant1',
      'unit1',
      2021,
      2022
    );

    expect(result).to.deep.equal([
      {
        'plant-id': 'plant1',
        'unit-id': 'unit1',
        'fiscal-year': null,
        'operation-input': 100,
        'maintenance-input': 50,
        sum: 150,
      },
    ]);
  });
});
