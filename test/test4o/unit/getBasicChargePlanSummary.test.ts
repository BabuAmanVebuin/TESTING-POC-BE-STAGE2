import { expect } from 'chai';
import sinon from 'sinon';
import { getBasicChargePlanSummaryUsecase } from '../../../src/application/use_cases/dpm/getBasicChargePlanSummaryUsecase';
import { BasicChargeRepositoryPort } from '../../../src/application/port/BasicChargeRepositoryPort';
import { BasicChargePlanSummaryDataFromDB } from '../../../src/domain/entities/dpm/basicChargePlanSummary';

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

    const result = await getBasicChargePlanSummaryUsecase(
      basicChargeRepositoryMock,
      workUnitCtx,
      'plant1'
    );

    expect(result).to.be.an('array').that.is.empty;
  });

  it('should return mapped data when data is found', async () => {
    const dbData: BasicChargePlanSummaryDataFromDB[] = [
      { PLANT_CODE: 'plant1', FISCAL_YEAR: 2021, VALUE: 100 },
      { PLANT_CODE: 'plant1', FISCAL_YEAR: 2022, VALUE: 200 },
    ];
    basicChargeRepositoryMock.getBasicChargePlanSummary.resolves(dbData);

    const result = await getBasicChargePlanSummaryUsecase(
      basicChargeRepositoryMock,
      workUnitCtx,
      'plant1'
    );

    expect(result).to.deep.equal([
      { 'plant-id': 'plant1', 'fiscal-year': 2021, value: 100 },
      { 'plant-id': 'plant1', 'fiscal-year': 2022, value: 200 },
    ]);
  });

  it('should handle startFiscalYear filter correctly', async () => {
    const dbData: BasicChargePlanSummaryDataFromDB[] = [
      { PLANT_CODE: 'plant1', FISCAL_YEAR: 2021, VALUE: 100 },
    ];
    basicChargeRepositoryMock.getBasicChargePlanSummary.resolves(dbData);

    const result = await getBasicChargePlanSummaryUsecase(
      basicChargeRepositoryMock,
      workUnitCtx,
      'plant1',
      2021
    );

    expect(result).to.deep.equal([
      { 'plant-id': 'plant1', 'fiscal-year': 2021, value: 100 },
    ]);
  });

  it('should handle endFiscalYear filter correctly', async () => {
    const dbData: BasicChargePlanSummaryDataFromDB[] = [
      { PLANT_CODE: 'plant1', FISCAL_YEAR: 2020, VALUE: 50 },
    ];
    basicChargeRepositoryMock.getBasicChargePlanSummary.resolves(dbData);

    const result = await getBasicChargePlanSummaryUsecase(
      basicChargeRepositoryMock,
      workUnitCtx,
      'plant1',
      undefined,
      2020
    );

    expect(result).to.deep.equal([
      { 'plant-id': 'plant1', 'fiscal-year': 2020, value: 50 },
    ]);
  });

  it('should handle both startFiscalYear and endFiscalYear filters correctly', async () => {
    const dbData: BasicChargePlanSummaryDataFromDB[] = [
      { PLANT_CODE: 'plant1', FISCAL_YEAR: 2021, VALUE: 100 },
    ];
    basicChargeRepositoryMock.getBasicChargePlanSummary.resolves(dbData);

    const result = await getBasicChargePlanSummaryUsecase(
      basicChargeRepositoryMock,
      workUnitCtx,
      'plant1',
      2021,
      2021
    );

    expect(result).to.deep.equal([
      { 'plant-id': 'plant1', 'fiscal-year': 2021, value: 100 },
    ]);
  });

  it('should throw an error if repository throws an error', async () => {
    basicChargeRepositoryMock.getBasicChargePlanSummary.rejects(new Error('Database error'));

    try {
      await getBasicChargePlanSummaryUsecase(
        basicChargeRepositoryMock,
        workUnitCtx,
        'plant1'
      );
      expect.fail('Expected error to be thrown');
    } catch (error) {
      expect(error).to.be.an('error').with.property('message', 'Database error');
    }
  });

  it('should call repository with correct parameters', async () => {
    const dbData: BasicChargePlanSummaryDataFromDB[] = [
      { PLANT_CODE: 'plant1', FISCAL_YEAR: 2021, VALUE: 100 },
    ];
    basicChargeRepositoryMock.getBasicChargePlanSummary.resolves(dbData);

    await getBasicChargePlanSummaryUsecase(
      basicChargeRepositoryMock,
      workUnitCtx,
      'plant1',
      2021,
      2022
    );

    expect(basicChargeRepositoryMock.getBasicChargePlanSummary.calledOnceWith(
      workUnitCtx,
      'plant1',
      2021,
      2022
    )).to.be.true;
  });

  it('should handle large data sets efficiently', async () => {
    const largeDataSet: BasicChargePlanSummaryDataFromDB[] = Array.from({ length: 1000 }, (_, i) => ({
      PLANT_CODE: 'plant1',
      FISCAL_YEAR: 2000 + i,
      VALUE: i * 10,
    }));
    basicChargeRepositoryMock.getBasicChargePlanSummary.resolves(largeDataSet);

    const result = await getBasicChargePlanSummaryUsecase(
      basicChargeRepositoryMock,
      workUnitCtx,
      'plant1'
    );

    expect(result).to.have.lengthOf(1000);
    expect(result[0]).to.deep.equal({ 'plant-id': 'plant1', 'fiscal-year': 2000, value: 0 });
    expect(result[999]).to.deep.equal({ 'plant-id': 'plant1', 'fiscal-year': 2999, value: 9990 });
  });

  it('should handle non-numeric values gracefully', async () => {
    const dbData: BasicChargePlanSummaryDataFromDB[] = [
      { PLANT_CODE: 'plant1', FISCAL_YEAR: 2021, VALUE: NaN },
    ];
    basicChargeRepositoryMock.getBasicChargePlanSummary.resolves(dbData);

    const result = await getBasicChargePlanSummaryUsecase(
      basicChargeRepositoryMock,
      workUnitCtx,
      'plant1'
    );

    expect(result).to.deep.equal([
      { 'plant-id': 'plant1', 'fiscal-year': 2021, value: NaN },
    ]);
  });

  it('should handle negative values correctly', async () => {
    const dbData: BasicChargePlanSummaryDataFromDB[] = [
      { PLANT_CODE: 'plant1', FISCAL_YEAR: 2021, VALUE: -100 },
    ];
    basicChargeRepositoryMock.getBasicChargePlanSummary.resolves(dbData);

    const result = await getBasicChargePlanSummaryUsecase(
      basicChargeRepositoryMock,
      workUnitCtx,
      'plant1'
    );

    expect(result).to.deep.equal([
      { 'plant-id': 'plant1', 'fiscal-year': 2021, value: -100 },
    ]);
  });

  it('should handle zero values correctly', async () => {
    const dbData: BasicChargePlanSummaryDataFromDB[] = [
      { PLANT_CODE: 'plant1', FISCAL_YEAR: 2021, VALUE: 0 },
    ];
    basicChargeRepositoryMock.getBasicChargePlanSummary.resolves(dbData);

    const result = await getBasicChargePlanSummaryUsecase(
      basicChargeRepositoryMock,
      workUnitCtx,
      'plant1'
    );

    expect(result).to.deep.equal([
      { 'plant-id': 'plant1', 'fiscal-year': 2021, value: 0 },
    ]);
  });

  it('should handle undefined fiscal year gracefully', async () => {
    const dbData: BasicChargePlanSummaryDataFromDB[] = [
      { PLANT_CODE: 'plant1', FISCAL_YEAR: undefined as any, VALUE: 100 },
    ];
    basicChargeRepositoryMock.getBasicChargePlanSummary.resolves(dbData);

    const result = await getBasicChargePlanSummaryUsecase(
      basicChargeRepositoryMock,
      workUnitCtx,
      'plant1'
    );

    expect(result).to.deep.equal([
      { 'plant-id': 'plant1', 'fiscal-year': undefined, value: 100 },
    ]);
  });

  it('should handle undefined plant code gracefully', async () => {
    const dbData: BasicChargePlanSummaryDataFromDB[] = [
      { PLANT_CODE: undefined as any, FISCAL_YEAR: 2021, VALUE: 100 },
    ];
    basicChargeRepositoryMock.getBasicChargePlanSummary.resolves(dbData);

    const result = await getBasicChargePlanSummaryUsecase(
      basicChargeRepositoryMock,
      workUnitCtx,
      'plant1'
    );

    expect(result).to.deep.equal([
      { 'plant-id': undefined, 'fiscal-year': 2021, value: 100 },
    ]);
  });

  it('should handle undefined value gracefully', async () => {
    const dbData: BasicChargePlanSummaryDataFromDB[] = [
      { PLANT_CODE: 'plant1', FISCAL_YEAR: 2021, VALUE: undefined as any },
    ];
    basicChargeRepositoryMock.getBasicChargePlanSummary.resolves(dbData);

    const result = await getBasicChargePlanSummaryUsecase(
      basicChargeRepositoryMock,
      workUnitCtx,
      'plant1'
    );

    expect(result).to.deep.equal([
      { 'plant-id': 'plant1', 'fiscal-year': 2021, value: undefined },
    ]);
  });

  it('should handle null fiscal year gracefully', async () => {
    const dbData: BasicChargePlanSummaryDataFromDB[] = [
      { PLANT_CODE: 'plant1', FISCAL_YEAR: null as any, VALUE: 100 },
    ];
    basicChargeRepositoryMock.getBasicChargePlanSummary.resolves(dbData);

    const result = await getBasicChargePlanSummaryUsecase(
      basicChargeRepositoryMock,
      workUnitCtx,
      'plant1'
    );

    expect(result).to.deep.equal([
      { 'plant-id': 'plant1', 'fiscal-year': null, value: 100 },
    ]);
  });

  it('should handle null plant code gracefully', async () => {
    const dbData: BasicChargePlanSummaryDataFromDB[] = [
      { PLANT_CODE: null as any, FISCAL_YEAR: 2021, VALUE: 100 },
    ];
    basicChargeRepositoryMock.getBasicChargePlanSummary.resolves(dbData);

    const result = await getBasicChargePlanSummaryUsecase(
      basicChargeRepositoryMock,
      workUnitCtx,
      'plant1'
    );

    expect(result).to.deep.equal([
      { 'plant-id': null, 'fiscal-year': 2021, value: 100 },
    ]);
  });

  it('should handle null value gracefully', async () => {
    const dbData: BasicChargePlanSummaryDataFromDB[] = [
      { PLANT_CODE: 'plant1', FISCAL_YEAR: 2021, VALUE: null as any },
    ];
    basicChargeRepositoryMock.getBasicChargePlanSummary.resolves(dbData);

    const result = await getBasicChargePlanSummaryUsecase(
      basicChargeRepositoryMock,
      workUnitCtx,
      'plant1'
    );

    expect(result).to.deep.equal([
      { 'plant-id': 'plant1', 'fiscal-year': 2021, value: null },
    ]);
  });

  it('should handle mixed data types gracefully', async () => {
    const dbData: BasicChargePlanSummaryDataFromDB[] = [
      { PLANT_CODE: 'plant1', FISCAL_YEAR: 2021, VALUE: '100' as any },
    ];
    basicChargeRepositoryMock.getBasicChargePlanSummary.resolves(dbData);

    const result = await getBasicChargePlanSummaryUsecase(
      basicChargeRepositoryMock,
      workUnitCtx,
      'plant1'
    );

    expect(result).to.deep.equal([
      { 'plant-id': 'plant1', 'fiscal-year': 2021, value: 100 },
    ]);
  });

  it('should handle empty plant code gracefully', async () => {
    const dbData: BasicChargePlanSummaryDataFromDB[] = [
      { PLANT_CODE: '', FISCAL_YEAR: 2021, VALUE: 100 },
    ];
    basicChargeRepositoryMock.getBasicChargePlanSummary.resolves(dbData);

    const result = await getBasicChargePlanSummaryUsecase(
      basicChargeRepositoryMock,
      workUnitCtx,
      ''
    );

    expect(result).to.deep.equal([
      { 'plant-id': '', 'fiscal-year': 2021, value: 100 },
    ]);
  });

  it('should handle empty fiscal year gracefully', async () => {
    const dbData: BasicChargePlanSummaryDataFromDB[] = [
      { PLANT_CODE: 'plant1', FISCAL_YEAR: 0, VALUE: 100 },
    ];
    basicChargeRepositoryMock.getBasicChargePlanSummary.resolves(dbData);

    const result = await getBasicChargePlanSummaryUsecase(
      basicChargeRepositoryMock,
      workUnitCtx,
      'plant1'
    );

    expect(result).to.deep.equal([
      { 'plant-id': 'plant1', 'fiscal-year': 0, value: 100 },
    ]);
  });
});