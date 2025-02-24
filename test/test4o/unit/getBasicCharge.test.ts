import { expect } from 'chai';
import { generateBasicChargeResponseUseCase } from '../../../src/application/use_cases/dpm/generateBasicChargeResponseUseCase';
import { BasicChargeRepositoryPort } from '../../../src/application/port/repositories/dpm/BasicChargeRepositoryPort';
import { getKpi003ResponseTimeRangeUseCase } from '../../../src/application/use_cases/dpm/getKpi003ResponseTimeRangeUseCase';
import sinon from 'sinon';

describe('generateBasicChargeResponseUseCase', () => {
  let basicChargeRepositoryMock: sinon.SinonStubbedInstance<BasicChargeRepositoryPort>;
  let tMock: sinon.SinonStub;
  let getKpi003ResponseTimeRangeUseCaseMock: sinon.SinonStub;

  beforeEach(() => {
    basicChargeRepositoryMock = {
      getBasicCharge: sinon.stub(),
    } as any;

    tMock = sinon.stub();
    getKpi003ResponseTimeRangeUseCaseMock = sinon.stub();
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should generate BasicChargeJson successfully with valid inputs', async () => {
    const plantCode = 'PLANT1';
    const unitCode = 'UNIT1';
    const timestamp = 1622548800;
    const expectedBasicCharge = [{ FiscalYear: 2021, Annual: 1000, Monthly: 100 }];

    getKpi003ResponseTimeRangeUseCaseMock.returns({
      annualEstimatesStart: { year: 2021 },
    });

    basicChargeRepositoryMock.getBasicCharge.resolves(expectedBasicCharge);

    tMock.withArgs('VALUE.PREFIX_YEN').returns('¥');
    tMock.withArgs('VALUE.SUFFIX_OKU').returns('Oku');

    const result = await generateBasicChargeResponseUseCase(
      plantCode,
      unitCode,
      timestamp,
      basicChargeRepositoryMock,
      tMock
    );

    expect(result).to.deep.equal({
      PlantCode: plantCode,
      UnitCode: unitCode,
      Prefix: '¥',
      Suffix: 'Oku',
      BasicCharge: expectedBasicCharge,
    });
  });

  it('should handle null unitCode', async () => {
    const plantCode = 'PLANT1';
    const unitCode = null;
    const timestamp = 1622548800;
    const expectedBasicCharge = [{ FiscalYear: 2021, Annual: 1000, Monthly: 100 }];

    getKpi003ResponseTimeRangeUseCaseMock.returns({
      annualEstimatesStart: { year: 2021 },
    });

    basicChargeRepositoryMock.getBasicCharge.resolves(expectedBasicCharge);

    tMock.withArgs('VALUE.PREFIX_YEN').returns('¥');
    tMock.withArgs('VALUE.SUFFIX_OKU').returns('Oku');

    const result = await generateBasicChargeResponseUseCase(
      plantCode,
      unitCode,
      timestamp,
      basicChargeRepositoryMock,
      tMock
    );

    expect(result).to.deep.equal({
      PlantCode: plantCode,
      UnitCode: unitCode,
      Prefix: '¥',
      Suffix: 'Oku',
      BasicCharge: expectedBasicCharge,
    });
  });

  it('should throw an error if getBasicCharge fails', async () => {
    const plantCode = 'PLANT1';
    const unitCode = 'UNIT1';
    const timestamp = 1622548800;

    getKpi003ResponseTimeRangeUseCaseMock.returns({
      annualEstimatesStart: { year: 2021 },
    });

    basicChargeRepositoryMock.getBasicCharge.rejects(new Error('Database error'));

    tMock.withArgs('VALUE.PREFIX_YEN').returns('¥');
    tMock.withArgs('VALUE.SUFFIX_OKU').returns('Oku');

    try {
      await generateBasicChargeResponseUseCase(
        plantCode,
        unitCode,
        timestamp,
        basicChargeRepositoryMock,
        tMock
      );
    } catch (error) {
      expect(error).to.be.an('error');
      expect(error.message).to.equal('Database error');
    }
  });

  it('should handle empty BasicCharge result', async () => {
    const plantCode = 'PLANT1';
    const unitCode = 'UNIT1';
    const timestamp = 1622548800;

    getKpi003ResponseTimeRangeUseCaseMock.returns({
      annualEstimatesStart: { year: 2021 },
    });

    basicChargeRepositoryMock.getBasicCharge.resolves([]);

    tMock.withArgs('VALUE.PREFIX_YEN').returns('¥');
    tMock.withArgs('VALUE.SUFFIX_OKU').returns('Oku');

    const result = await generateBasicChargeResponseUseCase(
      plantCode,
      unitCode,
      timestamp,
      basicChargeRepositoryMock,
      tMock
    );

    expect(result).to.deep.equal({
      PlantCode: plantCode,
      UnitCode: unitCode,
      Prefix: '¥',
      Suffix: 'Oku',
      BasicCharge: [],
    });
  });

  it('should handle invalid timestamp', async () => {
    const plantCode = 'PLANT1';
    const unitCode = 'UNIT1';
    const timestamp = -1;

    getKpi003ResponseTimeRangeUseCaseMock.throws(new Error('Invalid timestamp'));

    try {
      await generateBasicChargeResponseUseCase(
        plantCode,
        unitCode,
        timestamp,
        basicChargeRepositoryMock,
        tMock
      );
    } catch (error) {
      expect(error).to.be.an('error');
      expect(error.message).to.equal('Invalid timestamp');
    }
  });

  it('should handle missing translation keys', async () => {
    const plantCode = 'PLANT1';
    const unitCode = 'UNIT1';
    const timestamp = 1622548800;
    const expectedBasicCharge = [{ FiscalYear: 2021, Annual: 1000, Monthly: 100 }];

    getKpi003ResponseTimeRangeUseCaseMock.returns({
      annualEstimatesStart: { year: 2021 },
    });

    basicChargeRepositoryMock.getBasicCharge.resolves(expectedBasicCharge);

    tMock.withArgs('VALUE.PREFIX_YEN').returns(undefined);
    tMock.withArgs('VALUE.SUFFIX_OKU').returns(undefined);

    const result = await generateBasicChargeResponseUseCase(
      plantCode,
      unitCode,
      timestamp,
      basicChargeRepositoryMock,
      tMock
    );

    expect(result).to.deep.equal({
      PlantCode: plantCode,
      UnitCode: unitCode,
      Prefix: undefined,
      Suffix: undefined,
      BasicCharge: expectedBasicCharge,
    });
  });

  it('should handle large timestamp values', async () => {
    const plantCode = 'PLANT1';
    const unitCode = 'UNIT1';
    const timestamp = 9999999999;
    const expectedBasicCharge = [{ FiscalYear: 2286, Annual: 1000, Monthly: 100 }];

    getKpi003ResponseTimeRangeUseCaseMock.returns({
      annualEstimatesStart: { year: 2286 },
    });

    basicChargeRepositoryMock.getBasicCharge.resolves(expectedBasicCharge);

    tMock.withArgs('VALUE.PREFIX_YEN').returns('¥');
    tMock.withArgs('VALUE.SUFFIX_OKU').returns('Oku');

    const result = await generateBasicChargeResponseUseCase(
      plantCode,
      unitCode,
      timestamp,
      basicChargeRepositoryMock,
      tMock
    );

    expect(result).to.deep.equal({
      PlantCode: plantCode,
      UnitCode: unitCode,
      Prefix: '¥',
      Suffix: 'Oku',
      BasicCharge: expectedBasicCharge,
    });
  });

  it('should handle zero timestamp', async () => {
    const plantCode = 'PLANT1';
    const unitCode = 'UNIT1';
    const timestamp = 0;
    const expectedBasicCharge = [{ FiscalYear: 1970, Annual: 1000, Monthly: 100 }];

    getKpi003ResponseTimeRangeUseCaseMock.returns({
      annualEstimatesStart: { year: 1970 },
    });

    basicChargeRepositoryMock.getBasicCharge.resolves(expectedBasicCharge);

    tMock.withArgs('VALUE.PREFIX_YEN').returns('¥');
    tMock.withArgs('VALUE.SUFFIX_OKU').returns('Oku');

    const result = await generateBasicChargeResponseUseCase(
      plantCode,
      unitCode,
      timestamp,
      basicChargeRepositoryMock,
      tMock
    );

    expect(result).to.deep.equal({
      PlantCode: plantCode,
      UnitCode: unitCode,
      Prefix: '¥',
      Suffix: 'Oku',
      BasicCharge: expectedBasicCharge,
    });
  });

  it('should handle undefined plantCode', async () => {
    const plantCode = undefined;
    const unitCode = 'UNIT1';
    const timestamp = 1622548800;

    getKpi003ResponseTimeRangeUseCaseMock.returns({
      annualEstimatesStart: { year: 2021 },
    });

    try {
      await generateBasicChargeResponseUseCase(
        plantCode,
        unitCode,
        timestamp,
        basicChargeRepositoryMock,
        tMock
      );
    } catch (error) {
      expect(error).to.be.an('error');
      expect(error.message).to.equal('Invalid plantCode');
    }
  });

  it('should handle undefined unitCode', async () => {
    const plantCode = 'PLANT1';
    const unitCode = undefined;
    const timestamp = 1622548800;
    const expectedBasicCharge = [{ FiscalYear: 2021, Annual: 1000, Monthly: 100 }];

    getKpi003ResponseTimeRangeUseCaseMock.returns({
      annualEstimatesStart: { year: 2021 },
    });

    basicChargeRepositoryMock.getBasicCharge.resolves(expectedBasicCharge);

    tMock.withArgs('VALUE.PREFIX_YEN').returns('¥');
    tMock.withArgs('VALUE.SUFFIX_OKU').returns('Oku');

    const result = await generateBasicChargeResponseUseCase(
      plantCode,
      unitCode,
      timestamp,
      basicChargeRepositoryMock,
      tMock
    );

    expect(result).to.deep.equal({
      PlantCode: plantCode,
      UnitCode: unitCode,
      Prefix: '¥',
      Suffix: 'Oku',
      BasicCharge: expectedBasicCharge,
    });
  });

  it('should handle undefined timestamp', async () => {
    const plantCode = 'PLANT1';
    const unitCode = 'UNIT1';
    const timestamp = undefined;

    getKpi003ResponseTimeRangeUseCaseMock.throws(new Error('Invalid timestamp'));

    try {
      await generateBasicChargeResponseUseCase(
        plantCode,
        unitCode,
        timestamp,
        basicChargeRepositoryMock,
        tMock
      );
    } catch (error) {
      expect(error).to.be.an('error');
      expect(error.message).to.equal('Invalid timestamp');
    }
  });

  it('should handle null plantCode', async () => {
    const plantCode = null;
    const unitCode = 'UNIT1';
    const timestamp = 1622548800;

    getKpi003ResponseTimeRangeUseCaseMock.returns({
      annualEstimatesStart: { year: 2021 },
    });

    try {
      await generateBasicChargeResponseUseCase(
        plantCode,
        unitCode,
        timestamp,
        basicChargeRepositoryMock,
        tMock
      );
    } catch (error) {
      expect(error).to.be.an('error');
      expect(error.message).to.equal('Invalid plantCode');
    }
  });

  it('should handle empty plantCode', async () => {
    const plantCode = '';
    const unitCode = 'UNIT1';
    const timestamp = 1622548800;

    getKpi003ResponseTimeRangeUseCaseMock.returns({
      annualEstimatesStart: { year: 2021 },
    });

    try {
      await generateBasicChargeResponseUseCase(
        plantCode,
        unitCode,
        timestamp,
        basicChargeRepositoryMock,
        tMock
      );
    } catch (error) {
      expect(error).to.be.an('error');
      expect(error.message).to.equal('Invalid plantCode');
    }
  });

  it('should handle empty unitCode', async () => {
    const plantCode = 'PLANT1';
    const unitCode = '';
    const timestamp = 1622548800;
    const expectedBasicCharge = [{ FiscalYear: 2021, Annual: 1000, Monthly: 100 }];

    getKpi003ResponseTimeRangeUseCaseMock.returns({
      annualEstimatesStart: { year: 2021 },
    });

    basicChargeRepositoryMock.getBasicCharge.resolves(expectedBasicCharge);

    tMock.withArgs('VALUE.PREFIX_YEN').returns('¥');
    tMock.withArgs('VALUE.SUFFIX_OKU').returns('Oku');

    const result = await generateBasicChargeResponseUseCase(
      plantCode,
      unitCode,
      timestamp,
      basicChargeRepositoryMock,
      tMock
    );

    expect(result).to.deep.equal({
      PlantCode: plantCode,
      UnitCode: unitCode,
      Prefix: '¥',
      Suffix: 'Oku',
      BasicCharge: expectedBasicCharge,
    });
  });

  it('should handle empty timestamp', async () => {
    const plantCode = 'PLANT1';
    const unitCode = 'UNIT1';
    const timestamp = '';

    getKpi003ResponseTimeRangeUseCaseMock.throws(new Error('Invalid timestamp'));

    try {
      await generateBasicChargeResponseUseCase(
        plantCode,
        unitCode,
        timestamp,
        basicChargeRepositoryMock,
        tMock
      );
    } catch (error) {
      expect(error).to.be.an('error');
      expect(error.message).to.equal('Invalid timestamp');
    }
  });

  it('should handle null timestamp', async () => {
    const plantCode = 'PLANT1';
    const unitCode = 'UNIT1';
    const timestamp = null;

    getKpi003ResponseTimeRangeUseCaseMock.throws(new Error('Invalid timestamp'));

    try {
      await generateBasicChargeResponseUseCase(
        plantCode,
        unitCode,
        timestamp,
        basicChargeRepositoryMock,
        tMock
      );
    } catch (error) {
      expect(error).to.be.an('error');
      expect(error.message).to.equal('Invalid timestamp');
    }
  });

  it('should handle missing getBasicCharge method', async () => {
    const plantCode = 'PLANT1';
    const unitCode = 'UNIT1';
    const timestamp = 1622548800;

    getKpi003ResponseTimeRangeUseCaseMock.returns({
      annualEstimatesStart: { year: 2021 },
    });

    basicChargeRepositoryMock.getBasicCharge = undefined;

    try {
      await generateBasicChargeResponseUseCase(
        plantCode,
        unitCode,
        timestamp,
        basicChargeRepositoryMock,
        tMock
      );
    } catch (error) {
      expect(error).to.be.an('error');
      expect(error.message).to.equal('getBasicCharge is not a function');
    }
  });

  it('should handle missing translation function', async () => {
    const plantCode = 'PLANT1';
    const unitCode = 'UNIT1';
    const timestamp = 1622548800;
    const expectedBasicCharge = [{ FiscalYear: 2021, Annual: 1000, Monthly: 100 }];

    getKpi003ResponseTimeRangeUseCaseMock.returns({
      annualEstimatesStart: { year: 2021 },
    });

    basicChargeRepositoryMock.getBasicCharge.resolves(expectedBasicCharge);

    tMock = undefined;

    try {
      await generateBasicChargeResponseUseCase(
        plantCode,
        unitCode,
        timestamp,
        basicChargeRepositoryMock,
        tMock
      );
    } catch (error) {
      expect(error).to.be.an('error');
      expect(error.message).to.equal('t is not a function');
    }
  });
});