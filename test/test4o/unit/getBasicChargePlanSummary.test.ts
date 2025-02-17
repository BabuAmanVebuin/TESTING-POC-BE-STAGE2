import { expect } from 'chai';
import { getBasicChargePlanSummaryUsecase } from '../../../src/application/use_cases/dpm/getBasicChargePlanSummaryUsecase';
import { BasicChargeRepositoryPort } from '../../../src/application/port/BasicChargeRepositoryPort';
import { BasicChargePlanSummaryDataFromDB } from '../../../src/domain/entities/dpm/basicChargePlanSummary';

describe('getBasicChargePlanSummaryUsecase', () => {
  let mockRepository: BasicChargeRepositoryPort<any>;

  beforeEach(() => {
    mockRepository = {
      wrapInWorkUnitCtx: async (fn) => await fn({}),
      getBasicChargePlanSummary: async () => [],
      getBasicChargePlan: async () => [],
      getBasicChargeForecast: async () => [],
      upsertBasicChargePlan: async () => {},
      upsertBasicChargeForecast: async () => {},
      getBasicChargeForecastSummary: async () => [],
    };
  });

  it('should return an empty array when no data is found', async () => {
    const result = await getBasicChargePlanSummaryUsecase(mockRepository, {}, 'plant1');
    expect(result).to.be.an('array').that.is.empty;
  });

  it('should return data when repository returns data', async () => {
    const mockData: BasicChargePlanSummaryDataFromDB[] = [
      { PLANT_CODE: 'plant1', FISCAL_YEAR: 2021, VALUE: 1000 },
      { PLANT_CODE: 'plant1', FISCAL_YEAR: 2022, VALUE: 1500 },
    ];
    mockRepository.getBasicChargePlanSummary = async () => mockData;

    const result = await getBasicChargePlanSummaryUsecase(mockRepository, {}, 'plant1');
    expect(result).to.deep.equal([
      { 'plant-id': 'plant1', 'fiscal-year': 2021, value: 1000 },
      { 'plant-id': 'plant1', 'fiscal-year': 2022, value: 1500 },
    ]);
  });

  it('should filter data by start fiscal year', async () => {
    const mockData: BasicChargePlanSummaryDataFromDB[] = [
      { PLANT_CODE: 'plant1', FISCAL_YEAR: 2020, VALUE: 800 },
      { PLANT_CODE: 'plant1', FISCAL_YEAR: 2021, VALUE: 1000 },
    ];
    mockRepository.getBasicChargePlanSummary = async () => mockData;

    const result = await getBasicChargePlanSummaryUsecase(mockRepository, {}, 'plant1', 2021);
    expect(result).to.deep.equal([
      { 'plant-id': 'plant1', 'fiscal-year': 2021, value: 1000 },
    ]);
  });

  it('should filter data by end fiscal year', async () => {
    const mockData: BasicChargePlanSummaryDataFromDB[] = [
      { PLANT_CODE: 'plant1', FISCAL_YEAR: 2021, VALUE: 1000 },
      { PLANT_CODE: 'plant1', FISCAL_YEAR: 2022, VALUE: 1500 },
    ];
    mockRepository.getBasicChargePlanSummary = async () => mockData;

    const result = await getBasicChargePlanSummaryUsecase(mockRepository, {}, 'plant1', undefined, 2021);
    expect(result).to.deep.equal([
      { 'plant-id': 'plant1', 'fiscal-year': 2021, value: 1000 },
    ]);
  });

  it('should filter data by start and end fiscal year', async () => {
    const mockData: BasicChargePlanSummaryDataFromDB[] = [
      { PLANT_CODE: 'plant1', FISCAL_YEAR: 2020, VALUE: 800 },
      { PLANT_CODE: 'plant1', FISCAL_YEAR: 2021, VALUE: 1000 },
      { PLANT_CODE: 'plant1', FISCAL_YEAR: 2022, VALUE: 1500 },
    ];
    mockRepository.getBasicChargePlanSummary = async () => mockData;

    const result = await getBasicChargePlanSummaryUsecase(mockRepository, {}, 'plant1', 2021, 2022);
    expect(result).to.deep.equal([
      { 'plant-id': 'plant1', 'fiscal-year': 2021, value: 1000 },
      { 'plant-id': 'plant1', 'fiscal-year': 2022, value: 1500 },
    ]);
  });

  it('should handle repository errors gracefully', async () => {
    mockRepository.getBasicChargePlanSummary = async () => {
      throw new Error('Database error');
    };

    try {
      await getBasicChargePlanSummaryUsecase(mockRepository, {}, 'plant1');
    } catch (error) {
      expect(error).to.be.an('error').with.property('message', 'Database error');
    }
  });

  it('should return correct data format', async () => {
    const mockData: BasicChargePlanSummaryDataFromDB[] = [
      { PLANT_CODE: 'plant1', FISCAL_YEAR: 2021, VALUE: 1000 },
    ];
    mockRepository.getBasicChargePlanSummary = async () => mockData;

    const result = await getBasicChargePlanSummaryUsecase(mockRepository, {}, 'plant1');
    expect(result).to.be.an('array').with.lengthOf(1);
    expect(result[0]).to.have.all.keys('plant-id', 'fiscal-year', 'value');
  });

  it('should handle large datasets efficiently', async () => {
    const mockData: BasicChargePlanSummaryDataFromDB[] = Array.from({ length: 1000 }, (_, i) => ({
      PLANT_CODE: 'plant1',
      FISCAL_YEAR: 2000 + i,
      VALUE: i * 100,
    }));
    mockRepository.getBasicChargePlanSummary = async () => mockData;

    const result = await getBasicChargePlanSummaryUsecase(mockRepository, {}, 'plant1');
    expect(result).to.have.lengthOf(1000);
  });

  it('should return empty array for non-existent plant code', async () => {
    const mockData: BasicChargePlanSummaryDataFromDB[] = [
      { PLANT_CODE: 'plant2', FISCAL_YEAR: 2021, VALUE: 1000 },
    ];
    mockRepository.getBasicChargePlanSummary = async () => mockData;

    const result = await getBasicChargePlanSummaryUsecase(mockRepository, {}, 'plant1');
    expect(result).to.be.an('array').that.is.empty;
  });

  it('should handle undefined fiscal year filters', async () => {
    const mockData: BasicChargePlanSummaryDataFromDB[] = [
      { PLANT_CODE: 'plant1', FISCAL_YEAR: 2021, VALUE: 1000 },
    ];
    mockRepository.getBasicChargePlanSummary = async () => mockData;

    const result = await getBasicChargePlanSummaryUsecase(mockRepository, {}, 'plant1', undefined, undefined);
    expect(result).to.deep.equal([
      { 'plant-id': 'plant1', 'fiscal-year': 2021, value: 1000 },
    ]);
  });

  it('should handle null fiscal year filters', async () => {
    const mockData: BasicChargePlanSummaryDataFromDB[] = [
      { PLANT_CODE: 'plant1', FISCAL_YEAR: 2021, VALUE: 1000 },
    ];
    mockRepository.getBasicChargePlanSummary = async () => mockData;

    const result = await getBasicChargePlanSummaryUsecase(mockRepository, {}, 'plant1', null, null);
    expect(result).to.deep.equal([
      { 'plant-id': 'plant1', 'fiscal-year': 2021, value: 1000 },
    ]);
  });

  it('should handle zero value in data', async () => {
    const mockData: BasicChargePlanSummaryDataFromDB[] = [
      { PLANT_CODE: 'plant1', FISCAL_YEAR: 2021, VALUE: 0 },
    ];
    mockRepository.getBasicChargePlanSummary = async () => mockData;

    const result = await getBasicChargePlanSummaryUsecase(mockRepository, {}, 'plant1');
    expect(result).to.deep.equal([
      { 'plant-id': 'plant1', 'fiscal-year': 2021, value: 0 },
    ]);
  });

  it('should handle negative value in data', async () => {
    const mockData: BasicChargePlanSummaryDataFromDB[] = [
      { PLANT_CODE: 'plant1', FISCAL_YEAR: 2021, VALUE: -500 },
    ];
    mockRepository.getBasicChargePlanSummary = async () => mockData;

    const result = await getBasicChargePlanSummaryUsecase(mockRepository, {}, 'plant1');
    expect(result).to.deep.equal([
      { 'plant-id': 'plant1', 'fiscal-year': 2021, value: -500 },
    ]);
  });

  it('should handle non-sequential fiscal years', async () => {
    const mockData: BasicChargePlanSummaryDataFromDB[] = [
      { PLANT_CODE: 'plant1', FISCAL_YEAR: 2021, VALUE: 1000 },
      { PLANT_CODE: 'plant1', FISCAL_YEAR: 2023, VALUE: 1500 },
    ];
    mockRepository.getBasicChargePlanSummary = async () => mockData;

    const result = await getBasicChargePlanSummaryUsecase(mockRepository, {}, 'plant1');
    expect(result).to.deep.equal([
      { 'plant-id': 'plant1', 'fiscal-year': 2021, value: 1000 },
      { 'plant-id': 'plant1', 'fiscal-year': 2023, value: 1500 },
    ]);
  });

  it('should handle duplicate fiscal years in data', async () => {
    const mockData: BasicChargePlanSummaryDataFromDB[] = [
      { PLANT_CODE: 'plant1', FISCAL_YEAR: 2021, VALUE: 1000 },
      { PLANT_CODE: 'plant1', FISCAL_YEAR: 2021, VALUE: 1500 },
    ];
    mockRepository.getBasicChargePlanSummary = async () => mockData;

    const result = await getBasicChargePlanSummaryUsecase(mockRepository, {}, 'plant1');
    expect(result).to.deep.equal([
      { 'plant-id': 'plant1', 'fiscal-year': 2021, value: 1000 },
      { 'plant-id': 'plant1', 'fiscal-year': 2021, value: 1500 },
    ]);
  });

  it('should handle large fiscal year values', async () => {
    const mockData: BasicChargePlanSummaryDataFromDB[] = [
      { PLANT_CODE: 'plant1', FISCAL_YEAR: 9999, VALUE: 1000 },
    ];
    mockRepository.getBasicChargePlanSummary = async () => mockData;

    const result = await getBasicChargePlanSummaryUsecase(mockRepository, {}, 'plant1');
    expect(result).to.deep.equal([
      { 'plant-id': 'plant1', 'fiscal-year': 9999, value: 1000 },
    ]);
  });

  it('should handle small fiscal year values', async () => {
    const mockData: BasicChargePlanSummaryDataFromDB[] = [
      { PLANT_CODE: 'plant1', FISCAL_YEAR: 1, VALUE: 1000 },
    ];
    mockRepository.getBasicChargePlanSummary = async () => mockData;

    const result = await getBasicChargePlanSummaryUsecase(mockRepository, {}, 'plant1');
    expect(result).to.deep.equal([
      { 'plant-id': 'plant1', 'fiscal-year': 1, value: 1000 },
    ]);
  });

  it('should handle non-integer fiscal year values', async () => {
    const mockData: BasicChargePlanSummaryDataFromDB[] = [
      { PLANT_CODE: 'plant1', FISCAL_YEAR: 2021.5, VALUE: 1000 },
    ];
    mockRepository.getBasicChargePlanSummary = async () => mockData;

    const result = await getBasicChargePlanSummaryUsecase(mockRepository, {}, 'plant1');
    expect(result).to.deep.equal([
      { 'plant-id': 'plant1', 'fiscal-year': 2021.5, value: 1000 },
    ]);
  });
});
