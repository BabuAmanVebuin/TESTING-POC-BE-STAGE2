import { expect } from 'chai';
import { getBasicChargePlanSummaryUsecase } from '../../../src/application/use_cases/getBasicChargePlanSummaryUsecase';
import { BasicChargeRepositoryPort } from '../../../src/application/port/BasicChargeRepositoryPort';
import { BasicChargePlanSummaryDataFromDB } from '../../../src/domain/entities/dpm/basicChargePlanSummary';
import sinon from 'sinon';

describe('getBasicChargePlanSummaryUsecase', () => {
  let basicChargeRepositoryMock: sinon.SinonStubbedInstance<BasicChargeRepositoryPort<any>>;
  const workUnitCtx = {};
  const plantCode = 'PLANT1';

  beforeEach(() => {
    basicChargeRepositoryMock = {
      getBasicChargePlanSummary: sinon.stub(),
    } as any;
  });

  it('should return an empty array when no data is found', async () => {
    basicChargeRepositoryMock.getBasicChargePlanSummary.resolves([]);

    const result = await getBasicChargePlanSummaryUsecase(basicChargeRepositoryMock, workUnitCtx, plantCode);

    expect(result).to.deep.equal([]);
    expect(basicChargeRepositoryMock.getBasicChargePlanSummary.calledOnce).to.be.true;
  });

  it('should return mapped data when data is found', async () => {
    const dbData: BasicChargePlanSummaryDataFromDB[] = [
      { PLANT_CODE: 'PLANT1', FISCAL_YEAR: 2021, VALUE: 100 },
      { PLANT_CODE: 'PLANT1', FISCAL_YEAR: 2022, VALUE: 200 },
    ];
    basicChargeRepositoryMock.getBasicChargePlanSummary.resolves(dbData);

    const result = await getBasicChargePlanSummaryUsecase(basicChargeRepositoryMock, workUnitCtx, plantCode);

    expect(result).to.deep.equal([
      { 'plant-id': 'PLANT1', 'fiscal-year': 2021, value: 100 },
      { 'plant-id': 'PLANT1', 'fiscal-year': 2022, value: 200 },
    ]);
    expect(basicChargeRepositoryMock.getBasicChargePlanSummary.calledOnce).to.be.true;
  });

  it('should handle optional startFiscalYear and endFiscalYear', async () => {
    const dbData: BasicChargePlanSummaryDataFromDB[] = [
      { PLANT_CODE: 'PLANT1', FISCAL_YEAR: 2021, VALUE: 100 },
    ];
    basicChargeRepositoryMock.getBasicChargePlanSummary.resolves(dbData);

    const result = await getBasicChargePlanSummaryUsecase(basicChargeRepositoryMock, workUnitCtx, plantCode, 2020, 2022);

    expect(result).to.deep.equal([
      { 'plant-id': 'PLANT1', 'fiscal-year': 2021, value: 100 },
    ]);
    expect(basicChargeRepositoryMock.getBasicChargePlanSummary.calledOnce).to.be.true;
  });

  it('should throw an error if repository throws', async () => {
    basicChargeRepositoryMock.getBasicChargePlanSummary.rejects(new Error('Repository error'));

    try {
      await getBasicChargePlanSummaryUsecase(basicChargeRepositoryMock, workUnitCtx, plantCode);
      expect.fail('Expected error to be thrown');
    } catch (error) {
      expect(error).to.be.an('error');
      expect(error.message).to.equal('Repository error');
    }
  });

  it('should handle large data sets', async () => {
    const dbData: BasicChargePlanSummaryDataFromDB[] = Array.from({ length: 1000 }, (_, i) => ({
      PLANT_CODE: 'PLANT1',
      FISCAL_YEAR: 2000 + i,
      VALUE: i * 10,
    }));
    basicChargeRepositoryMock.getBasicChargePlanSummary.resolves(dbData);

    const result = await getBasicChargePlanSummaryUsecase(basicChargeRepositoryMock, workUnitCtx, plantCode);

    expect(result).to.have.lengthOf(1000);
    expect(result[0]).to.deep.equal({ 'plant-id': 'PLANT1', 'fiscal-year': 2000, value: 0 });
    expect(result[999]).to.deep.equal({ 'plant-id': 'PLANT1', 'fiscal-year': 2999, value: 9990 });
  });

  it('should handle negative values in data', async () => {
    const dbData: BasicChargePlanSummaryDataFromDB[] = [
      { PLANT_CODE: 'PLANT1', FISCAL_YEAR: 2021, VALUE: -100 },
    ];
    basicChargeRepositoryMock.getBasicChargePlanSummary.resolves(dbData);

    const result = await getBasicChargePlanSummaryUsecase(basicChargeRepositoryMock, workUnitCtx, plantCode);

    expect(result).to.deep.equal([
      { 'plant-id': 'PLANT1', 'fiscal-year': 2021, value: -100 },
    ]);
  });

  it('should handle zero values in data', async () => {
    const dbData: BasicChargePlanSummaryDataFromDB[] = [
      { PLANT_CODE: 'PLANT1', FISCAL_YEAR: 2021, VALUE: 0 },
    ];
    basicChargeRepositoryMock.getBasicChargePlanSummary.resolves(dbData);

    const result = await getBasicChargePlanSummaryUsecase(basicChargeRepositoryMock, workUnitCtx, plantCode);

    expect(result).to.deep.equal([
      { 'plant-id': 'PLANT1', 'fiscal-year': 2021, value: 0 },
    ]);
  });

  it('should handle non-sequential fiscal years', async () => {
    const dbData: BasicChargePlanSummaryDataFromDB[] = [
      { PLANT_CODE: 'PLANT1', FISCAL_YEAR: 2021, VALUE: 100 },
      { PLANT_CODE: 'PLANT1', FISCAL_YEAR: 2023, VALUE: 300 },
    ];
    basicChargeRepositoryMock.getBasicChargePlanSummary.resolves(dbData);

    const result = await getBasicChargePlanSummaryUsecase(basicChargeRepositoryMock, workUnitCtx, plantCode);

    expect(result).to.deep.equal([
      { 'plant-id': 'PLANT1', 'fiscal-year': 2021, value: 100 },
      { 'plant-id': 'PLANT1', 'fiscal-year': 2023, value: 300 },
    ]);
  });

  it('should handle multiple plant codes', async () => {
    const dbData: BasicChargePlanSummaryDataFromDB[] = [
      { PLANT_CODE: 'PLANT1', FISCAL_YEAR: 2021, VALUE: 100 },
      { PLANT_CODE: 'PLANT2', FISCAL_YEAR: 2021, VALUE: 200 },
    ];
    basicChargeRepositoryMock.getBasicChargePlanSummary.resolves(dbData);

    const result = await getBasicChargePlanSummaryUsecase(basicChargeRepositoryMock, workUnitCtx, plantCode);

    expect(result).to.deep.equal([
      { 'plant-id': 'PLANT1', 'fiscal-year': 2021, value: 100 },
      { 'plant-id': 'PLANT2', 'fiscal-year': 2021, value: 200 },
    ]);
  });

  it('should handle undefined fiscal year values', async () => {
    const dbData: BasicChargePlanSummaryDataFromDB[] = [
      { PLANT_CODE: 'PLANT1', FISCAL_YEAR: undefined as any, VALUE: 100 },
    ];
    basicChargeRepositoryMock.getBasicChargePlanSummary.resolves(dbData);

    const result = await getBasicChargePlanSummaryUsecase(basicChargeRepositoryMock, workUnitCtx, plantCode);

    expect(result).to.deep.equal([
      { 'plant-id': 'PLANT1', 'fiscal-year': NaN, value: 100 },
    ]);
  });

  it('should handle undefined value fields', async () => {
    const dbData: BasicChargePlanSummaryDataFromDB[] = [
      { PLANT_CODE: 'PLANT1', FISCAL_YEAR: 2021, VALUE: undefined as any },
    ];
    basicChargeRepositoryMock.getBasicChargePlanSummary.resolves(dbData);

    const result = await getBasicChargePlanSummaryUsecase(basicChargeRepositoryMock, workUnitCtx, plantCode);

    expect(result).to.deep.equal([
      { 'plant-id': 'PLANT1', 'fiscal-year': 2021, value: NaN },
    ]);
  });

  it('should handle null fiscal year values', async () => {
    const dbData: BasicChargePlanSummaryDataFromDB[] = [
      { PLANT_CODE: 'PLANT1', FISCAL_YEAR: null as any, VALUE: 100 },
    ];
    basicChargeRepositoryMock.getBasicChargePlanSummary.resolves(dbData);

    const result = await getBasicChargePlanSummaryUsecase(basicChargeRepositoryMock, workUnitCtx, plantCode);

    expect(result).to.deep.equal([
      { 'plant-id': 'PLANT1', 'fiscal-year': NaN, value: 100 },
    ]);
  });

  it('should handle null value fields', async () => {
    const dbData: BasicChargePlanSummaryDataFromDB[] = [
      { PLANT_CODE: 'PLANT1', FISCAL_YEAR: 2021, VALUE: null as any },
    ];
    basicChargeRepositoryMock.getBasicChargePlanSummary.resolves(dbData);

    const result = await getBasicChargePlanSummaryUsecase(basicChargeRepositoryMock, workUnitCtx, plantCode);

    expect(result).to.deep.equal([
      { 'plant-id': 'PLANT1', 'fiscal-year': 2021, value: NaN },
    ]);
  });

  it('should handle empty plant code', async () => {
    const dbData: BasicChargePlanSummaryDataFromDB[] = [
      { PLANT_CODE: '', FISCAL_YEAR: 2021, VALUE: 100 },
    ];
    basicChargeRepositoryMock.getBasicChargePlanSummary.resolves(dbData);

    const result = await getBasicChargePlanSummaryUsecase(basicChargeRepositoryMock, workUnitCtx, plantCode);

    expect(result).to.deep.equal([
      { 'plant-id': '', 'fiscal-year': 2021, value: 100 },
    ]);
  });

  it('should handle undefined plant code', async () => {
    const dbData: BasicChargePlanSummaryDataFromDB[] = [
      { PLANT_CODE: undefined as any, FISCAL_YEAR: 2021, VALUE: 100 },
    ];
    basicChargeRepositoryMock.getBasicChargePlanSummary.resolves(dbData);

    const result = await getBasicChargePlanSummaryUsecase(basicChargeRepositoryMock, workUnitCtx, plantCode);

    expect(result).to.deep.equal([
      { 'plant-id': undefined, 'fiscal-year': 2021, value: 100 },
    ]);
  });

  it('should handle null plant code', async () => {
    const dbData: BasicChargePlanSummaryDataFromDB[] = [
      { PLANT_CODE: null as any, FISCAL_YEAR: 2021, VALUE: 100 },
    ];
    basicChargeRepositoryMock.getBasicChargePlanSummary.resolves(dbData);

    const result = await getBasicChargePlanSummaryUsecase(basicChargeRepositoryMock, workUnitCtx, plantCode);

    expect(result).to.deep.equal([
      { 'plant-id': null, 'fiscal-year': 2021, value: 100 },
    ]);
  });

  it('should handle non-numeric fiscal year', async () => {
    const dbData: BasicChargePlanSummaryDataFromDB[] = [
      { PLANT_CODE: 'PLANT1', FISCAL_YEAR: '2021' as any, VALUE: 100 },
    ];
    basicChargeRepositoryMock.getBasicChargePlanSummary.resolves(dbData);

    const result = await getBasicChargePlanSummaryUsecase(basicChargeRepositoryMock, workUnitCtx, plantCode);

    expect(result).to.deep.equal([
      { 'plant-id': 'PLANT1', 'fiscal-year': NaN, value: 100 },
    ]);
  });

  it('should handle non-numeric value', async () => {
    const dbData: BasicChargePlanSummaryDataFromDB[] = [
      { PLANT_CODE: 'PLANT1', FISCAL_YEAR: 2021, VALUE: '100' as any },
    ];
    basicChargeRepositoryMock.getBasicChargePlanSummary.resolves(dbData);

    const result = await getBasicChargePlanSummaryUsecase(basicChargeRepositoryMock, workUnitCtx, plantCode);

    expect(result).to.deep.equal([
      { 'plant-id': 'PLANT1', 'fiscal-year': 2021, value: NaN },
    ]);
  });

  it('should handle non-string plant code', async () => {
    const dbData: BasicChargePlanSummaryDataFromDB[] = [
      { PLANT_CODE: 123 as any, FISCAL_YEAR: 2021, VALUE: 100 },
    ];
    basicChargeRepositoryMock.getBasicChargePlanSummary.resolves(dbData);

    const result = await getBasicChargePlanSummaryUsecase(basicChargeRepositoryMock, workUnitCtx, plantCode);

    expect(result).to.deep.equal([
      { 'plant-id': '123', 'fiscal-year': 2021, value: 100 },
    ]);
  });
});