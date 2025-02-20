import { expect } from 'chai';
import { generateBasicChargeResponseUseCase } from '../../../src/application/use_cases/dpm/generateBasicChargeResponseUseCase';
import { BasicChargeRepositoryPort } from '../../../src/application/port/repositories/dpm/BasicChargeRepositoryPort';
import sinon from 'sinon';

describe('generateBasicChargeResponseUseCase', () => {
  let basicChargeRepositoryMock: sinon.SinonStubbedInstance<BasicChargeRepositoryPort>;
  let tMock: sinon.SinonStub;

  beforeEach(() => {
    basicChargeRepositoryMock = {
      getBasicCharge: sinon.stub(),
    } as any;

    tMock = sinon.stub();
    tMock.withArgs("VALUE.PREFIX_YEN").returns("¥");
    tMock.withArgs("VALUE.SUFFIX_OKU").returns("Oku");
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should generate BasicChargeJson successfully with valid inputs', async () => {
    const plantCode = 'PLANT1';
    const unitCode = 'UNIT1';
    const timestamp = 1625097600;
    const basicChargeData = [{ FiscalYear: 2021, Annual: 1000, Monthly: 100 }];

    basicChargeRepositoryMock.getBasicCharge.resolves(basicChargeData);

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
      Prefix: "¥",
      Suffix: "Oku",
      BasicCharge: basicChargeData,
    });
  });

  it('should handle null unitCode and generate BasicChargeJson', async () => {
    const plantCode = 'PLANT1';
    const unitCode = null;
    const timestamp = 1625097600;
    const basicChargeData = [{ FiscalYear: 2021, Annual: 1000, Monthly: 100 }];

    basicChargeRepositoryMock.getBasicCharge.resolves(basicChargeData);

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
      Prefix: "¥",
      Suffix: "Oku",
      BasicCharge: basicChargeData,
    });
  });

  it('should throw an error if getBasicCharge fails', async () => {
    const plantCode = 'PLANT1';
    const unitCode = 'UNIT1';
    const timestamp = 1625097600;

    basicChargeRepositoryMock.getBasicCharge.rejects(new Error('Database error'));

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

  it('should handle empty result from getBasicCharge', async () => {
    const plantCode = 'PLANT1';
    const unitCode = 'UNIT1';
    const timestamp = 1625097600;

    basicChargeRepositoryMock.getBasicCharge.resolves([]);

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
      Prefix: "¥",
      Suffix: "Oku",
      BasicCharge: [],
    });
  });

  it('should handle invalid timestamp gracefully', async () => {
    const plantCode = 'PLANT1';
    const unitCode = 'UNIT1';
    const timestamp = -1;

    basicChargeRepositoryMock.getBasicCharge.resolves([]);

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
      Prefix: "¥",
      Suffix: "Oku",
      BasicCharge: [],
    });
  });

  it('should handle missing translation keys gracefully', async () => {
    const plantCode = 'PLANT1';
    const unitCode = 'UNIT1';
    const timestamp = 1625097600;
    const basicChargeData = [{ FiscalYear: 2021, Annual: 1000, Monthly: 100 }];

    tMock.withArgs("VALUE.PREFIX_YEN").returns(undefined);
    tMock.withArgs("VALUE.SUFFIX_OKU").returns(undefined);

    basicChargeRepositoryMock.getBasicCharge.resolves(basicChargeData);

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
      BasicCharge: basicChargeData,
    });
  });

  it('should handle large timestamp values', async () => {
    const plantCode = 'PLANT1';
    const unitCode = 'UNIT1';
    const timestamp = 9999999999;
    const basicChargeData = [{ FiscalYear: 2021, Annual: 1000, Monthly: 100 }];

    basicChargeRepositoryMock.getBasicCharge.resolves(basicChargeData);

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
      Prefix: "¥",
      Suffix: "Oku",
      BasicCharge: basicChargeData,
    });
  });

  it('should handle zero timestamp value', async () => {
    const plantCode = 'PLANT1';
    const unitCode = 'UNIT1';
    const timestamp = 0;
    const basicChargeData = [{ FiscalYear: 2021, Annual: 1000, Monthly: 100 }];

    basicChargeRepositoryMock.getBasicCharge.resolves(basicChargeData);

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
      Prefix: "¥",
      Suffix: "Oku",
      BasicCharge: basicChargeData,
    });
  });

  it('should handle undefined unitCode', async () => {
    const plantCode = 'PLANT1';
    const unitCode = undefined;
    const timestamp = 1625097600;
    const basicChargeData = [{ FiscalYear: 2021, Annual: 1000, Monthly: 100 }];

    basicChargeRepositoryMock.getBasicCharge.resolves(basicChargeData);

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
      Prefix: "¥",
      Suffix: "Oku",
      BasicCharge: basicChargeData,
    });
  });

  it('should handle undefined plantCode', async () => {
    const plantCode = undefined;
    const unitCode = 'UNIT1';
    const timestamp = 1625097600;
    const basicChargeData = [{ FiscalYear: 2021, Annual: 1000, Monthly: 100 }];

    basicChargeRepositoryMock.getBasicCharge.resolves(basicChargeData);

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
      Prefix: "¥",
      Suffix: "Oku",
      BasicCharge: basicChargeData,
    });
  });

  it('should handle undefined timestamp', async () => {
    const plantCode = 'PLANT1';
    const unitCode = 'UNIT1';
    const timestamp = undefined;
    const basicChargeData = [{ FiscalYear: 2021, Annual: 1000, Monthly: 100 }];

    basicChargeRepositoryMock.getBasicCharge.resolves(basicChargeData);

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
      Prefix: "¥",
      Suffix: "Oku",
      BasicCharge: basicChargeData,
    });
  });

  it('should handle empty plantCode', async () => {
    const plantCode = '';
    const unitCode = 'UNIT1';
    const timestamp = 1625097600;
    const basicChargeData = [{ FiscalYear: 2021, Annual: 1000, Monthly: 100 }];

    basicChargeRepositoryMock.getBasicCharge.resolves(basicChargeData);

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
      Prefix: "¥",
      Suffix: "Oku",
      BasicCharge: basicChargeData,
    });
  });

  it('should handle empty unitCode', async () => {
    const plantCode = 'PLANT1';
    const unitCode = '';
    const timestamp = 1625097600;
    const basicChargeData = [{ FiscalYear: 2021, Annual: 1000, Monthly: 100 }];

    basicChargeRepositoryMock.getBasicCharge.resolves(basicChargeData);

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
      Prefix: "¥",
      Suffix: "Oku",
      BasicCharge: basicChargeData,
    });
  });

  it('should handle empty timestamp', async () => {
    const plantCode = 'PLANT1';
    const unitCode = 'UNIT1';
    const timestamp = '';
    const basicChargeData = [{ FiscalYear: 2021, Annual: 1000, Monthly: 100 }];

    basicChargeRepositoryMock.getBasicCharge.resolves(basicChargeData);

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
      Prefix: "¥",
      Suffix: "Oku",
      BasicCharge: basicChargeData,
    });
  });

  it('should handle null plantCode', async () => {
    const plantCode = null;
    const unitCode = 'UNIT1';
    const timestamp = 1625097600;
    const basicChargeData = [{ FiscalYear: 2021, Annual: 1000, Monthly: 100 }];

    basicChargeRepositoryMock.getBasicCharge.resolves(basicChargeData);

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
      Prefix: "¥",
      Suffix: "Oku",
      BasicCharge: basicChargeData,
    });
  });

  it('should handle null timestamp', async () => {
    const plantCode = 'PLANT1';
    const unitCode = 'UNIT1';
    const timestamp = null;
    const basicChargeData = [{ FiscalYear: 2021, Annual: 1000, Monthly: 100 }];

    basicChargeRepositoryMock.getBasicCharge.resolves(basicChargeData);

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
      Prefix: "¥",
      Suffix: "Oku",
      BasicCharge: basicChargeData,
    });
  });

  it('should handle missing translation function', async () => {
    const plantCode = 'PLANT1';
    const unitCode = 'UNIT1';
    const timestamp = 1625097600;
    const basicChargeData = [{ FiscalYear: 2021, Annual: 1000, Monthly: 100 }];

    basicChargeRepositoryMock.getBasicCharge.resolves(basicChargeData);

    const result = await generateBasicChargeResponseUseCase(
      plantCode,
      unitCode,
      timestamp,
      basicChargeRepositoryMock,
      undefined
    );

    expect(result).to.deep.equal({
      PlantCode: plantCode,
      UnitCode: unitCode,
      Prefix: undefined,
      Suffix: undefined,
      BasicCharge: basicChargeData,
    });
  });

  it('should handle missing repository', async () => {
    const plantCode = 'PLANT1';
    const unitCode = 'UNIT1';
    const timestamp = 1625097600;

    try {
      await generateBasicChargeResponseUseCase(
        plantCode,
        unitCode,
        timestamp,
        undefined,
        tMock
      );
    } catch (error) {
      expect(error).to.be.an('error');
    }
  });
});