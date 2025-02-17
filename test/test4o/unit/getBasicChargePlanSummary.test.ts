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
      getBasicChargeForecastSummary: async () => []
    };
  });

  it('should return an empty array when no data is found', async () => {
    const result = await getBasicChargePlanSummaryUsecase(mockRepository, {}, 'plant1');
    expect(result).to.be.an('array').that.is.empty;
  });

  it('should return data when repository returns data', async () => {
    const mockData: BasicChargePlanSummaryDataFromDB[] = [
      { PLANT_CODE: 'plant1', FISCAL_YEAR: 2021, VALUE: 100 },
      { PLANT_CODE: 'plant1', FISCAL_YEAR: 2022, VALUE: 200 }
    ];
    mockRepository.getBasicChargePlanSummary = async () => mockData;

    const result = await getBasicChargePlanSummaryUsecase(mockRepository, {}, 'plant1');
    expect(result).to.deep.equal([
      { 'plant-id': 'plant1', 'fiscal-year': 2021, value: 100 },
      { 'plant-id': 'plant1', 'fiscal-year': 2022, value: 200 }
    ]);
  });

  it('should filter data by start fiscal year', async () => {
    const mockData: BasicChargePlanSummaryDataFromDB[] = [
      { PLANT_CODE: 'plant1', FISCAL_YEAR: 2020, VALUE: 50 },
      { PLANT_CODE: 'plant1', FISCAL_YEAR: 2021, VALUE: 100 }
    ];
    mockRepository.getBasicChargePlanSummary = async () => mockData;

    const result = await getBasicChargePlanSummaryUsecase(mockRepository, {}, 'plant1', 2021);
    expect(result).to.deep.equal([
      { 'plant-id': 'plant1', 'fiscal-year': 2021, value: 100 }
    ]);
  });

  it('should filter data by end fiscal year', async () => {
    const mockData: BasicChargePlanSummaryDataFromDB[] = [
      { PLANT_CODE: 'plant1', FISCAL_YEAR: 2021, VALUE: 100 },
      { PLANT_CODE: 'plant1', FISCAL_YEAR: 2022, VALUE: 200 }
    ];
    mockRepository.getBasicChargePlanSummary = async () => mockData;

    const result = await getBasicChargePlanSummaryUsecase(mockRepository, {}, 'plant1', undefined, 2021);
    expect(result).to.deep.equal([
      { 'plant-id': 'plant1', 'fiscal-year': 2021, value: 100 }
    ]);
  });

  it('should filter data by start and end fiscal year', async () => {
    const mockData: BasicChargePlanSummaryDataFromDB[] = [
      { PLANT_CODE: 'plant1', FISCAL_YEAR: 2020, VALUE: 50 },
      { PLANT_CODE: 'plant1', FISCAL_YEAR: 2021, VALUE: 100 },
      { PLANT_CODE: 'plant1', FISCAL_YEAR: 2022, VALUE: 200 }
    ];
    mockRepository.getBasicChargePlanSummary = async () => mockData;

    const result = await getBasicChargePlanSummaryUsecase(mockRepository, {}, 'plant1', 2021, 2022);
    expect(result).to.deep.equal([
      { 'plant-id': 'plant1', 'fiscal-year': 2021, value: 100 },
      { 'plant-id': 'plant1', 'fiscal-year': 2022, value: 200 }
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
      { PLANT_CODE: 'plant1', FISCAL_YEAR: 2021, VALUE: 100 }
    ];
    mockRepository.getBasicChargePlanSummary = async () => mockData;

    const result = await getBasicChargePlanSummaryUsecase(mockRepository, {}, 'plant1');
    expect(result).to.deep.equal([
      { 'plant-id': 'plant1', 'fiscal-year': 2021, value: 100 }
    ]);
  });

  it('should handle empty plant code', async () => {
    const result = await getBasicChargePlanSummaryUsecase(mockRepository, {}, '');
    expect(result).to.be.an('array').that.is.empty;
  });

  it('should handle undefined plant code', async () => {
    const result = await getBasicChargePlanSummaryUsecase(mockRepository, {}, undefined as any);
    expect(result).to.be.an('array').that.is.empty;
  });

  it('should handle null plant code', async () => {
    const result = await getBasicChargePlanSummaryUsecase(mockRepository, {}, null as any);
    expect(result).to.be.an('array').that.is.empty;
  });

  it('should handle non-existent plant code', async () => {
    const result = await getBasicChargePlanSummaryUsecase(mockRepository, {}, 'non-existent');
    expect(result).to.be.an('array').that.is.empty;
  });

  it('should handle large dataset', async () => {
    const mockData: BasicChargePlanSummaryDataFromDB[] = Array.from({ length: 1000 }, (_, i) => ({
      PLANT_CODE: 'plant1',
      FISCAL_YEAR: 2000 + i,
      VALUE: i * 10
    }));
    mockRepository.getBasicChargePlanSummary = async () => mockData;

    const result = await getBasicChargePlanSummaryUsecase(mockRepository, {}, 'plant1');
    expect(result).to.have.lengthOf(1000);
  });

  it('should handle negative fiscal year', async () => {
    const mockData: BasicChargePlanSummaryDataFromDB[] = [
      { PLANT_CODE: 'plant1', FISCAL_YEAR: -2021, VALUE: 100 }
    ];
    mockRepository.getBasicChargePlanSummary = async () => mockData;

    const result = await getBasicChargePlanSummaryUsecase(mockRepository, {}, 'plant1');
    expect(result).to.deep.equal([
      { 'plant-id': 'plant1', 'fiscal-year': -2021, value: 100 }
    ]);
  });

  it('should handle zero fiscal year', async () => {
    const mockData: BasicChargePlanSummaryDataFromDB[] = [
      { PLANT_CODE: 'plant1', FISCAL_YEAR: 0, VALUE: 100 }
    ];
    mockRepository.getBasicChargePlanSummary = async () => mockData;

    const result = await getBasicChargePlanSummaryUsecase(mockRepository, {}, 'plant1');
    expect(result).to.deep.equal([
      { 'plant-id': 'plant1', 'fiscal-year': 0, value: 100 }
    ]);
  });

  it('should handle large fiscal year', async () => {
    const mockData: BasicChargePlanSummaryDataFromDB[] = [
      { PLANT_CODE: 'plant1', FISCAL_YEAR: 9999, VALUE: 100 }
    ];
    mockRepository.getBasicChargePlanSummary = async () => mockData;

    const result = await getBasicChargePlanSummaryUsecase(mockRepository, {}, 'plant1');
    expect(result).to.deep.equal([
      { 'plant-id': 'plant1', 'fiscal-year': 9999, value: 100 }
    ]);
  });

  it('should handle negative value', async () => {
    const mockData: BasicChargePlanSummaryDataFromDB[] = [
      { PLANT_CODE: 'plant1', FISCAL_YEAR: 2021, VALUE: -100 }
    ];
    mockRepository.getBasicChargePlanSummary = async () => mockData;

    const result = await getBasicChargePlanSummaryUsecase(mockRepository, {}, 'plant1');
    expect(result).to.deep.equal([
      { 'plant-id': 'plant1', 'fiscal-year': 2021, value: -100 }
    ]);
  });

  it('should handle zero value', async () => {
    const mockData: BasicChargePlanSummaryDataFromDB[] = [
      { PLANT_CODE: 'plant1', FISCAL_YEAR: 2021, VALUE: 0 }
    ];
    mockRepository.getBasicChargePlanSummary = async () => mockData;

    const result = await getBasicChargePlanSummaryUsecase(mockRepository, {}, 'plant1');
    expect(result).to.deep.equal([
      { 'plant-id': 'plant1', 'fiscal-year': 2021, value: 0 }
    ]);
  });

  it('should handle large value', async () => {
    const mockData: BasicChargePlanSummaryDataFromDB[] = [
      { PLANT_CODE: 'plant1', FISCAL_YEAR: 2021, VALUE: 999999999 }
    ];
    mockRepository.getBasicChargePlanSummary = async () => mockData;

    const result = await getBasicChargePlanSummaryUsecase(mockRepository, {}, 'plant1');
    expect(result).to.deep.equal([
      { 'plant-id': 'plant1', 'fiscal-year': 2021, value: 999999999 }
    ]);
  });

  it('should handle multiple plants', async () => {
    const mockData: BasicChargePlanSummaryDataFromDB[] = [
      { PLANT_CODE: 'plant1', FISCAL_YEAR: 2021, VALUE: 100 },
      { PLANT_CODE: 'plant2', FISCAL_YEAR: 2021, VALUE: 200 }
    ];
    mockRepository.getBasicChargePlanSummary = async () => mockData;

    const result = await getBasicChargePlanSummaryUsecase(mockRepository, {}, 'plant1');
    expect(result).to.deep.equal([
      { 'plant-id': 'plant1', 'fiscal-year': 2021, value: 100 }
    ]);
  });
});
