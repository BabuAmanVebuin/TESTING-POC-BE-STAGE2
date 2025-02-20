import { expect } from 'chai';
import { getBasicChargePlanSummaryUsecase } from '../../../src/application/use_cases/dpm/getBasicChargePlanSummaryUsecase';
import { BasicChargeRepositoryPort } from '../../../src/application/port/BasicChargeRepositoryPort';
import sinon from 'sinon';

describe('getBasicChargePlanSummaryUsecase', () => {
  let basicChargeRepositoryMock: sinon.SinonStubbedInstance<BasicChargeRepositoryPort<any>>;
  let workUnitCtx: any;

  beforeEach(() => {
    basicChargeRepositoryMock = {
      getBasicChargePlanSummary: sinon.stub(),
      wrapInWorkUnitCtx: sinon.stub(),
      getBasicChargePlan: sinon.stub(),
      getBasicChargeForecast: sinon.stub(),
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
    basicChargeRepositoryMock.getBasicChargePlanSummary.resolves([]);
    const result = await getBasicChargePlanSummaryUsecase(basicChargeRepositoryMock, workUnitCtx, 'PLANT1');
    expect(result).to.deep.equal([]);
  });

  it('should return mapped data when data is found', async () => {
    const dbData = [
      { PLANT_CODE: 'PLANT1', FISCAL_YEAR: 2021, VALUE: 100 },
      { PLANT_CODE: 'PLANT1', FISCAL_YEAR: 2022, VALUE: 200 },
    ];
    basicChargeRepositoryMock.getBasicChargePlanSummary.resolves(dbData);
    const result = await getBasicChargePlanSummaryUsecase(basicChargeRepositoryMock, workUnitCtx, 'PLANT1');
    expect(result).to.deep.equal([
      { 'plant-id': 'PLANT1', 'fiscal-year': 2021, value: 100 },
      { 'plant-id': 'PLANT1', 'fiscal-year': 2022, value: 200 },
    ]);
  });

  it('should handle startFiscalYear filter correctly', async () => {
    const dbData = [{ PLANT_CODE: 'PLANT1', FISCAL_YEAR: 2021, VALUE: 100 }];
    basicChargeRepositoryMock.getBasicChargePlanSummary.resolves(dbData);
    const result = await getBasicChargePlanSummaryUsecase(basicChargeRepositoryMock, workUnitCtx, 'PLANT1', 2021);
    expect(result).to.deep.equal([{ 'plant-id': 'PLANT1', 'fiscal-year': 2021, value: 100 }]);
  });

  it('should handle endFiscalYear filter correctly', async () => {
    const dbData = [{ PLANT_CODE: 'PLANT1', FISCAL_YEAR: 2020, VALUE: 50 }];
    basicChargeRepositoryMock.getBasicChargePlanSummary.resolves(dbData);
    const result = await getBasicChargePlanSummaryUsecase(basicChargeRepositoryMock, workUnitCtx, 'PLANT1', undefined, 2020);
    expect(result).to.deep.equal([{ 'plant-id': 'PLANT1', 'fiscal-year': 2020, value: 50 }]);
  });

  it('should handle both startFiscalYear and endFiscalYear filters correctly', async () => {
    const dbData = [
      { PLANT_CODE: 'PLANT1', FISCAL_YEAR: 2021, VALUE: 100 },
      { PLANT_CODE: 'PLANT1', FISCAL_YEAR: 2022, VALUE: 200 },
    ];
    basicChargeRepositoryMock.getBasicChargePlanSummary.resolves(dbData);
    const result = await getBasicChargePlanSummaryUsecase(basicChargeRepositoryMock, workUnitCtx, 'PLANT1', 2021, 2022);
    expect(result).to.deep.equal([
      { 'plant-id': 'PLANT1', 'fiscal-year': 2021, value: 100 },
      { 'plant-id': 'PLANT1', 'fiscal-year': 2022, value: 200 },
    ]);
  });

  it('should throw an error if repository throws an error', async () => {
    basicChargeRepositoryMock.getBasicChargePlanSummary.rejects(new Error('Database error'));
    try {
      await getBasicChargePlanSummaryUsecase(basicChargeRepositoryMock, workUnitCtx, 'PLANT1');
    } catch (error) {
      expect(error).to.be.an('error');
      expect(error.message).to.equal('Database error');
    }
  });

  it('should call repository with correct parameters', async () => {
    const dbData = [{ PLANT_CODE: 'PLANT1', FISCAL_YEAR: 2021, VALUE: 100 }];
    basicChargeRepositoryMock.getBasicChargePlanSummary.resolves(dbData);
    await getBasicChargePlanSummaryUsecase(basicChargeRepositoryMock, workUnitCtx, 'PLANT1', 2021, 2022);
    expect(basicChargeRepositoryMock.getBasicChargePlanSummary.calledOnceWith(workUnitCtx, 'PLANT1', 2021, 2022)).to.be.true;
  });

  it('should handle large data sets correctly', async () => {
    const dbData = Array.from({ length: 1000 }, (_, i) => ({
      PLANT_CODE: 'PLANT1',
      FISCAL_YEAR: 2000 + i,
      VALUE: i,
    }));
    basicChargeRepositoryMock.getBasicChargePlanSummary.resolves(dbData);
    const result = await getBasicChargePlanSummaryUsecase(basicChargeRepositoryMock, workUnitCtx, 'PLANT1');
    expect(result).to.have.lengthOf(1000);
    expect(result[0]).to.deep.equal({ 'plant-id': 'PLANT1', 'fiscal-year': 2000, value: 0 });
  });

  it('should handle negative values correctly', async () => {
    const dbData = [{ PLANT_CODE: 'PLANT1', FISCAL_YEAR: 2021, VALUE: -100 }];
    basicChargeRepositoryMock.getBasicChargePlanSummary.resolves(dbData);
    const result = await getBasicChargePlanSummaryUsecase(basicChargeRepositoryMock, workUnitCtx, 'PLANT1');
    expect(result).to.deep.equal([{ 'plant-id': 'PLANT1', 'fiscal-year': 2021, value: -100 }]);
  });

  it('should handle zero values correctly', async () => {
    const dbData = [{ PLANT_CODE: 'PLANT1', FISCAL_YEAR: 2021, VALUE: 0 }];
    basicChargeRepositoryMock.getBasicChargePlanSummary.resolves(dbData);
    const result = await getBasicChargePlanSummaryUsecase(basicChargeRepositoryMock, workUnitCtx, 'PLANT1');
    expect(result).to.deep.equal([{ 'plant-id': 'PLANT1', 'fiscal-year': 2021, value: 0 }]);
  });

  it('should handle non-sequential fiscal years correctly', async () => {
    const dbData = [
      { PLANT_CODE: 'PLANT1', FISCAL_YEAR: 2020, VALUE: 100 },
      { PLANT_CODE: 'PLANT1', FISCAL_YEAR: 2022, VALUE: 200 },
    ];
    basicChargeRepositoryMock.getBasicChargePlanSummary.resolves(dbData);
    const result = await getBasicChargePlanSummaryUsecase(basicChargeRepositoryMock, workUnitCtx, 'PLANT1');
    expect(result).to.deep.equal([
      { 'plant-id': 'PLANT1', 'fiscal-year': 2020, value: 100 },
      { 'plant-id': 'PLANT1', 'fiscal-year': 2022, value: 200 },
    ]);
  });

  it('should handle multiple plants correctly', async () => {
    const dbData = [
      { PLANT_CODE: 'PLANT1', FISCAL_YEAR: 2021, VALUE: 100 },
      { PLANT_CODE: 'PLANT2', FISCAL_YEAR: 2021, VALUE: 200 },
    ];
    basicChargeRepositoryMock.getBasicChargePlanSummary.resolves(dbData);
    const result = await getBasicChargePlanSummaryUsecase(basicChargeRepositoryMock, workUnitCtx, 'PLANT1');
    expect(result).to.deep.equal([{ 'plant-id': 'PLANT1', 'fiscal-year': 2021, value: 100 }]);
  });

  it('should handle undefined plantCode correctly', async () => {
    try {
      await getBasicChargePlanSummaryUsecase(basicChargeRepositoryMock, workUnitCtx, undefined as any);
    } catch (error) {
      expect(error).to.be.an('error');
    }
  });

  it('should handle null plantCode correctly', async () => {
    try {
      await getBasicChargePlanSummaryUsecase(basicChargeRepositoryMock, workUnitCtx, null as any);
    } catch (error) {
      expect(error).to.be.an('error');
    }
  });

  it('should handle empty string plantCode correctly', async () => {
    try {
      await getBasicChargePlanSummaryUsecase(basicChargeRepositoryMock, workUnitCtx, '');
    } catch (error) {
      expect(error).to.be.an('error');
    }
  });

  it('should handle undefined startFiscalYear correctly', async () => {
    const dbData = [{ PLANT_CODE: 'PLANT1', FISCAL_YEAR: 2021, VALUE: 100 }];
    basicChargeRepositoryMock.getBasicChargePlanSummary.resolves(dbData);
    const result = await getBasicChargePlanSummaryUsecase(basicChargeRepositoryMock, workUnitCtx, 'PLANT1', undefined);
    expect(result).to.deep.equal([{ 'plant-id': 'PLANT1', 'fiscal-year': 2021, value: 100 }]);
  });

  it('should handle undefined endFiscalYear correctly', async () => {
    const dbData = [{ PLANT_CODE: 'PLANT1', FISCAL_YEAR: 2021, VALUE: 100 }];
    basicChargeRepositoryMock.getBasicChargePlanSummary.resolves(dbData);
    const result = await getBasicChargePlanSummaryUsecase(basicChargeRepositoryMock, workUnitCtx, 'PLANT1', 2021, undefined);
    expect(result).to.deep.equal([{ 'plant-id': 'PLANT1', 'fiscal-year': 2021, value: 100 }]);
  });

  it('should handle null startFiscalYear correctly', async () => {
    const dbData = [{ PLANT_CODE: 'PLANT1', FISCAL_YEAR: 2021, VALUE: 100 }];
    basicChargeRepositoryMock.getBasicChargePlanSummary.resolves(dbData);
    const result = await getBasicChargePlanSummaryUsecase(basicChargeRepositoryMock, workUnitCtx, 'PLANT1', null as any);
    expect(result).to.deep.equal([{ 'plant-id': 'PLANT1', 'fiscal-year': 2021, value: 100 }]);
  });

  it('should handle null endFiscalYear correctly', async () => {
    const dbData = [{ PLANT_CODE: 'PLANT1', FISCAL_YEAR: 2021, VALUE: 100 }];
    basicChargeRepositoryMock.getBasicChargePlanSummary.resolves(dbData);
    const result = await getBasicChargePlanSummaryUsecase(basicChargeRepositoryMock, workUnitCtx, 'PLANT1', 2021, null as any);
    expect(result).to.deep.equal([{ 'plant-id': 'PLANT1', 'fiscal-year': 2021, value: 100 }]);
  });

  it('should handle invalid fiscal year range correctly', async () => {
    const dbData = [];
    basicChargeRepositoryMock.getBasicChargePlanSummary.resolves(dbData);
    const result = await getBasicChargePlanSummaryUsecase(basicChargeRepositoryMock, workUnitCtx, 'PLANT1', 2022, 2021);
    expect(result).to.deep.equal([]);
  });
});