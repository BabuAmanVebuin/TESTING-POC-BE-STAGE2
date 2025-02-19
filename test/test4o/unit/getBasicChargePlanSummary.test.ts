import { expect } from 'chai';
import { getBasicChargePlanSummaryUsecase } from '../../../src/application/use_cases/dpm/getBasicChargePlanSummaryUsecase.js';
import { BasicChargeRepositoryPort } from '../../../src/application/port/BasicChargeRepositoryPort.js';
import sinon, { SinonStub } from 'sinon';

describe('getBasicChargePlanSummaryUsecase', () => {
  let basicChargeRepositoryMock: sinon.SinonStubbedInstance<BasicChargeRepositoryPort<any>>;
  let workUnitCtx: any;

  beforeEach(() => {
    basicChargeRepositoryMock = {
      getBasicChargePlanSummary: sinon.stub(),
      wrapInWorkUnitCtx: sinon.stub() as SinonStub<[fn: (workUnitCtx: any) => Promise<any>], Promise<any>>,
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

  it('should call repository with correct parameters', async () => {
    await getBasicChargePlanSummaryUsecase(basicChargeRepositoryMock, workUnitCtx, 'PLANT1', 2020, 2022);
    expect(basicChargeRepositoryMock.getBasicChargePlanSummary.calledOnceWith(workUnitCtx, 'PLANT1', 2020, 2022)).to.be.true;
  });

  it('should handle repository errors gracefully', async () => {
    basicChargeRepositoryMock.getBasicChargePlanSummary.rejects(new Error('Database error'));
    try {
      await getBasicChargePlanSummaryUsecase(basicChargeRepositoryMock, workUnitCtx, 'PLANT1');
    } catch (error) {
      expect(error).to.equal('Database error');
    }
  });

  it('should return data for a specific fiscal year range', async () => {
    const dbData = [
      { PLANT_CODE: 'PLANT1', FISCAL_YEAR: 2021, VALUE: 150 },
    ];
    basicChargeRepositoryMock.getBasicChargePlanSummary.resolves(dbData);
    const result = await getBasicChargePlanSummaryUsecase(basicChargeRepositoryMock, workUnitCtx, 'PLANT1', 2021, 2021);
    expect(result).to.deep.equal([
      { 'plant-id': 'PLANT1', 'fiscal-year': 2021, value: 150 },
    ]);
  });

  it('should return data when only start fiscal year is provided', async () => {
    const dbData = [
      { PLANT_CODE: 'PLANT1', FISCAL_YEAR: 2021, VALUE: 150 },
      { PLANT_CODE: 'PLANT1', FISCAL_YEAR: 2022, VALUE: 250 },
    ];
    basicChargeRepositoryMock.getBasicChargePlanSummary.resolves(dbData);
    const result = await getBasicChargePlanSummaryUsecase(basicChargeRepositoryMock, workUnitCtx, 'PLANT1', 2021);
    expect(result).to.deep.equal([
      { 'plant-id': 'PLANT1', 'fiscal-year': 2021, value: 150 },
      { 'plant-id': 'PLANT1', 'fiscal-year': 2022, value: 250 },
    ]);
  });

  it('should return data when only end fiscal year is provided', async () => {
    const dbData = [
      { PLANT_CODE: 'PLANT1', FISCAL_YEAR: 2020, VALUE: 100 },
      { PLANT_CODE: 'PLANT1', FISCAL_YEAR: 2021, VALUE: 150 },
    ];
    basicChargeRepositoryMock.getBasicChargePlanSummary.resolves(dbData);
    const result = await getBasicChargePlanSummaryUsecase(basicChargeRepositoryMock, workUnitCtx, 'PLANT1', undefined, 2021);
    expect(result).to.deep.equal([
      { 'plant-id': 'PLANT1', 'fiscal-year': 2020, value: 100 },
      { 'plant-id': 'PLANT1', 'fiscal-year': 2021, value: 150 },
    ]);
  });

  it('should handle empty plant code gracefully', async () => {
    basicChargeRepositoryMock.getBasicChargePlanSummary.resolves([]);
    const result = await getBasicChargePlanSummaryUsecase(basicChargeRepositoryMock, workUnitCtx, '');
    expect(result).to.deep.equal([]);
  });

  it('should handle null plant code gracefully', async () => {
    basicChargeRepositoryMock.getBasicChargePlanSummary.resolves([]);
    const result = await getBasicChargePlanSummaryUsecase(basicChargeRepositoryMock, workUnitCtx, null as any);
    expect(result).to.deep.equal([]);
  });

  it('should handle undefined plant code gracefully', async () => {
    basicChargeRepositoryMock.getBasicChargePlanSummary.resolves([]);
    const result = await getBasicChargePlanSummaryUsecase(basicChargeRepositoryMock, workUnitCtx, undefined as any);
    expect(result).to.deep.equal([]);
  });

  it('should handle large data sets efficiently', async () => {
    const dbData = Array.from({ length: 1000 }, (_, i) => ({
      PLANT_CODE: 'PLANT1',
      FISCAL_YEAR: 2000 + i,
      VALUE: i * 10,
    }));
    basicChargeRepositoryMock.getBasicChargePlanSummary.resolves(dbData);
    const result = await getBasicChargePlanSummaryUsecase(basicChargeRepositoryMock, workUnitCtx, 'PLANT1');
    expect(result).to.have.lengthOf(1000);
  });

  it('should handle non-numeric fiscal year values gracefully', async () => {
    const dbData = [
      { PLANT_CODE: 'PLANT1', FISCAL_YEAR: '2021' as any, VALUE: 100 },
    ];
    basicChargeRepositoryMock.getBasicChargePlanSummary.resolves(dbData);
    const result = await getBasicChargePlanSummaryUsecase(basicChargeRepositoryMock, workUnitCtx, 'PLANT1');
    expect(result).to.deep.equal([
      { 'plant-id': 'PLANT1', 'fiscal-year': 2021, value: 100 },
    ]);
  });

  it('should handle non-numeric value fields gracefully', async () => {
    const dbData = [
      { PLANT_CODE: 'PLANT1', FISCAL_YEAR: 2021, VALUE: '100' as any },
    ];
    basicChargeRepositoryMock.getBasicChargePlanSummary.resolves(dbData);
    const result = await getBasicChargePlanSummaryUsecase(basicChargeRepositoryMock, workUnitCtx, 'PLANT1');
    expect(result).to.deep.equal([
      { 'plant-id': 'PLANT1', 'fiscal-year': 2021, value: 100 },
    ]);
  });

  it('should handle negative value fields gracefully', async () => {
    const dbData = [
      { PLANT_CODE: 'PLANT1', FISCAL_YEAR: 2021, VALUE: -100 },
    ];
    basicChargeRepositoryMock.getBasicChargePlanSummary.resolves(dbData);
    const result = await getBasicChargePlanSummaryUsecase(basicChargeRepositoryMock, workUnitCtx, 'PLANT1');
    expect(result).to.deep.equal([
      { 'plant-id': 'PLANT1', 'fiscal-year': 2021, value: -100 },
    ]);
  });

  it('should handle zero value fields gracefully', async () => {
    const dbData = [
      { PLANT_CODE: 'PLANT1', FISCAL_YEAR: 2021, VALUE: 0 },
    ];
    basicChargeRepositoryMock.getBasicChargePlanSummary.resolves(dbData);
    const result = await getBasicChargePlanSummaryUsecase(basicChargeRepositoryMock, workUnitCtx, 'PLANT1');
    expect(result).to.deep.equal([
      { 'plant-id': 'PLANT1', 'fiscal-year': 2021, value: 0 },
    ]);
  });

  it('should handle duplicate fiscal years gracefully', async () => {
    const dbData = [
      { PLANT_CODE: 'PLANT1', FISCAL_YEAR: 2021, VALUE: 100 },
      { PLANT_CODE: 'PLANT1', FISCAL_YEAR: 2021, VALUE: 200 },
    ];
    basicChargeRepositoryMock.getBasicChargePlanSummary.resolves(dbData);
    const result = await getBasicChargePlanSummaryUsecase(basicChargeRepositoryMock, workUnitCtx, 'PLANT1');
    expect(result).to.deep.equal([
      { 'plant-id': 'PLANT1', 'fiscal-year': 2021, value: 100 },
      { 'plant-id': 'PLANT1', 'fiscal-year': 2021, value: 200 },
    ]);
  });

  it('should handle large fiscal year values gracefully', async () => {
    const dbData = [
      { PLANT_CODE: 'PLANT1', FISCAL_YEAR: 9999, VALUE: 100 },
    ];
    basicChargeRepositoryMock.getBasicChargePlanSummary.resolves(dbData);
    const result = await getBasicChargePlanSummaryUsecase(basicChargeRepositoryMock, workUnitCtx, 'PLANT1');
    expect(result).to.deep.equal([
      { 'plant-id': 'PLANT1', 'fiscal-year': 9999, value: 100 },
    ]);
  });

  it('should handle small fiscal year values gracefully', async () => {
    const dbData = [
      { PLANT_CODE: 'PLANT1', FISCAL_YEAR: 0, VALUE: 100 },
    ];
    basicChargeRepositoryMock.getBasicChargePlanSummary.resolves(dbData);
    const result = await getBasicChargePlanSummaryUsecase(basicChargeRepositoryMock, workUnitCtx, 'PLANT1');
    expect(result).to.deep.equal([
      { 'plant-id': 'PLANT1', 'fiscal-year': 0, value: 100 },
    ]);
  });

  it('should handle non-existent plant code gracefully', async () => {
    basicChargeRepositoryMock.getBasicChargePlanSummary.resolves([]);
    const result = await getBasicChargePlanSummaryUsecase(basicChargeRepositoryMock, workUnitCtx, 'NON_EXISTENT_PLANT');
    expect(result).to.deep.equal([]);
  });

  it('should handle undefined fiscal year range gracefully', async () => {
    const dbData = [
      { PLANT_CODE: 'PLANT1', FISCAL_YEAR: 2021, VALUE: 100 },
    ];
    basicChargeRepositoryMock.getBasicChargePlanSummary.resolves(dbData);
    const result = await getBasicChargePlanSummaryUsecase(basicChargeRepositoryMock, workUnitCtx, 'PLANT1', undefined, undefined);
    expect(result).to.deep.equal([
      { 'plant-id': 'PLANT1', 'fiscal-year': 2021, value: 100 },
    ]);
  });
});