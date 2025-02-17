import { expect } from 'chai';
import { upsertBasicChargePlanUsecase } from '../../../src/application/use_cases/dpm/upsertBasicChargePlanUsecase';
import { BasicChargeRepositoryPort } from '../../../src/application/port/BasicChargeRepositoryPort';
import { BasicChargePlan } from '../../../src/domain/models/BasicCharge';
import sinon from 'sinon';

describe('upsertBasicChargePlanUsecase', () => {
  let basicChargeRepositoryMock: sinon.SinonStubbedInstance<BasicChargeRepositoryPort<any>>;
  let workUnitCtxMock: any;
  let currentDateTime: Date;

  beforeEach(() => {
    basicChargeRepositoryMock = sinon.createStubInstance<BasicChargeRepositoryPort<any>>(Object);
    workUnitCtxMock = {};
    currentDateTime = new Date();
  });

  it('should upsert basic charge plans successfully', async () => {
    const basicChargePlans: BasicChargePlan[] = [
      {
        plantCode: 'P001',
        unitCode: 'U001',
        fiscalYear: 2023,
        operationInput: 100,
        maintenanceInput: 50,
        userId: 'user1',
      },
    ];

    basicChargeRepositoryMock.upsertBasicChargePlan.resolves();

    await upsertBasicChargePlanUsecase(basicChargeRepositoryMock, workUnitCtxMock, basicChargePlans);

    expect(basicChargeRepositoryMock.upsertBasicChargePlan.calledOnce).to.be.true;
    expect(basicChargeRepositoryMock.upsertBasicChargePlan.calledWith(workUnitCtxMock, basicChargePlans, sinon.match.date)).to.be.true;
  });

  it('should handle empty basic charge plans array', async () => {
    const basicChargePlans: BasicChargePlan[] = [];

    basicChargeRepositoryMock.upsertBasicChargePlan.resolves();

    await upsertBasicChargePlanUsecase(basicChargeRepositoryMock, workUnitCtxMock, basicChargePlans);

    expect(basicChargeRepositoryMock.upsertBasicChargePlan.calledOnce).to.be.true;
    expect(basicChargeRepositoryMock.upsertBasicChargePlan.calledWith(workUnitCtxMock, basicChargePlans, sinon.match.date)).to.be.true;
  });

  it('should throw an error if upsertBasicChargePlan fails', async () => {
    const basicChargePlans: BasicChargePlan[] = [
      {
        plantCode: 'P001',
        unitCode: 'U001',
        fiscalYear: 2023,
        operationInput: 100,
        maintenanceInput: 50,
        userId: 'user1',
      },
    ];

    basicChargeRepositoryMock.upsertBasicChargePlan.rejects(new Error('Database error'));

    try {
      await upsertBasicChargePlanUsecase(basicChargeRepositoryMock, workUnitCtxMock, basicChargePlans);
      expect.fail('Expected error to be thrown');
    } catch (error) {
      expect(error).to.be.instanceOf(Error);
      expect(error).to.equal('Database error');
    }
  });

  it('should handle null operationInput and maintenanceInput', async () => {
    const basicChargePlans: BasicChargePlan[] = [
      {
        plantCode: 'P001',
        unitCode: 'U001',
        fiscalYear: 2023,
        operationInput: null,
        maintenanceInput: null,
        userId: 'user1',
      },
    ];

    basicChargeRepositoryMock.upsertBasicChargePlan.resolves();

    await upsertBasicChargePlanUsecase(basicChargeRepositoryMock, workUnitCtxMock, basicChargePlans);

    expect(basicChargeRepositoryMock.upsertBasicChargePlan.calledOnce).to.be.true;
    expect(basicChargeRepositoryMock.upsertBasicChargePlan.calledWith(workUnitCtxMock, basicChargePlans, sinon.match.date)).to.be.true;
  });

  it('should handle multiple basic charge plans', async () => {
    const basicChargePlans: BasicChargePlan[] = [
      {
        plantCode: 'P001',
        unitCode: 'U001',
        fiscalYear: 2023,
        operationInput: 100,
        maintenanceInput: 50,
        userId: 'user1',
      },
      {
        plantCode: 'P002',
        unitCode: 'U002',
        fiscalYear: 2024,
        operationInput: 200,
        maintenanceInput: 100,
        userId: 'user2',
      },
    ];

    basicChargeRepositoryMock.upsertBasicChargePlan.resolves();

    await upsertBasicChargePlanUsecase(basicChargeRepositoryMock, workUnitCtxMock, basicChargePlans);

    expect(basicChargeRepositoryMock.upsertBasicChargePlan.calledOnce).to.be.true;
    expect(basicChargeRepositoryMock.upsertBasicChargePlan.calledWith(workUnitCtxMock, basicChargePlans, sinon.match.date)).to.be.true;
  });

  it('should handle undefined operationInput and maintenanceInput', async () => {
    const basicChargePlans: BasicChargePlan[] = [
      {
        plantCode: 'P001',
        unitCode: 'U001',
        fiscalYear: 2023,
        operationInput: 0,
        maintenanceInput: undefined,
        userId: 'user1',
      },
    ];

    basicChargeRepositoryMock.upsertBasicChargePlan.resolves();

    await upsertBasicChargePlanUsecase(basicChargeRepositoryMock, workUnitCtxMock, basicChargePlans);

    expect(basicChargeRepositoryMock.upsertBasicChargePlan.calledOnce).to.be.true;
    expect(basicChargeRepositoryMock.upsertBasicChargePlan.calledWith(workUnitCtxMock, basicChargePlans, sinon.match.date)).to.be.true;
  });

  it('should handle negative operationInput and maintenanceInput', async () => {
    const basicChargePlans: BasicChargePlan[] = [
      {
        plantCode: 'P001',
        unitCode: 'U001',
        fiscalYear: 2023,
        operationInput: -100,
        maintenanceInput: -50,
        userId: 'user1',
      },
    ];

    basicChargeRepositoryMock.upsertBasicChargePlan.resolves();

    await upsertBasicChargePlanUsecase(basicChargeRepositoryMock, workUnitCtxMock, basicChargePlans);

    expect(basicChargeRepositoryMock.upsertBasicChargePlan.calledOnce).to.be.true;
    expect(basicChargeRepositoryMock.upsertBasicChargePlan.calledWith(workUnitCtxMock, basicChargePlans, sinon.match.date)).to.be.true;
  });

  it('should handle zero operationInput and maintenanceInput', async () => {
    const basicChargePlans: BasicChargePlan[] = [
      {
        plantCode: 'P001',
        unitCode: 'U001',
        fiscalYear: 2023,
        operationInput: 0,
        maintenanceInput: 0,
        userId: 'user1',
      },
    ];

    basicChargeRepositoryMock.upsertBasicChargePlan.resolves();

    await upsertBasicChargePlanUsecase(basicChargeRepositoryMock, workUnitCtxMock, basicChargePlans);

    expect(basicChargeRepositoryMock.upsertBasicChargePlan.calledOnce).to.be.true;
    expect(basicChargeRepositoryMock.upsertBasicChargePlan.calledWith(workUnitCtxMock, basicChargePlans, sinon.match.date)).to.be.true;
  });

  it('should handle large numbers for operationInput and maintenanceInput', async () => {
    const basicChargePlans: BasicChargePlan[] = [
      {
        plantCode: 'P001',
        unitCode: 'U001',
        fiscalYear: 2023,
        operationInput: 1e9,
        maintenanceInput: 1e9,
        userId: 'user1',
      },
    ];

    basicChargeRepositoryMock.upsertBasicChargePlan.resolves();

    await upsertBasicChargePlanUsecase(basicChargeRepositoryMock, workUnitCtxMock, basicChargePlans);

    expect(basicChargeRepositoryMock.upsertBasicChargePlan.calledOnce).to.be.true;
    expect(basicChargeRepositoryMock.upsertBasicChargePlan.calledWith(workUnitCtxMock, basicChargePlans, sinon.match.date)).to.be.true;
  });

  it('should handle string userId', async () => {
    const basicChargePlans: BasicChargePlan[] = [
      {
        plantCode: 'P001',
        unitCode: 'U001',
        fiscalYear: 2023,
        operationInput: 100,
        maintenanceInput: 50,
        userId: 'user1',
      },
    ];

    basicChargeRepositoryMock.upsertBasicChargePlan.resolves();

    await upsertBasicChargePlanUsecase(basicChargeRepositoryMock, workUnitCtxMock, basicChargePlans);

    expect(basicChargeRepositoryMock.upsertBasicChargePlan.calledOnce).to.be.true;
    expect(basicChargeRepositoryMock.upsertBasicChargePlan.calledWith(workUnitCtxMock, basicChargePlans, sinon.match.date)).to.be.true;
  });

  it('should handle numeric userId', async () => {
    const basicChargePlans: BasicChargePlan[] = [
      {
        plantCode: 'P001',
        unitCode: 'U001',
        fiscalYear: 2023,
        operationInput: 100,
        maintenanceInput: 50,
        userId: '12345',
      },
    ];

    basicChargeRepositoryMock.upsertBasicChargePlan.resolves();

    await upsertBasicChargePlanUsecase(basicChargeRepositoryMock, workUnitCtxMock, basicChargePlans);

    expect(basicChargeRepositoryMock.upsertBasicChargePlan.calledOnce).to.be.true;
    expect(basicChargeRepositoryMock.upsertBasicChargePlan.calledWith(workUnitCtxMock, basicChargePlans, sinon.match.date)).to.be.true;
  });

  it('should handle empty string userId', async () => {
    const basicChargePlans: BasicChargePlan[] = [
      {
        plantCode: 'P001',
        unitCode: 'U001',
        fiscalYear: 2023,
        operationInput: 100,
        maintenanceInput: 50,
        userId: '',
      },
    ];

    basicChargeRepositoryMock.upsertBasicChargePlan.resolves();

    await upsertBasicChargePlanUsecase(basicChargeRepositoryMock, workUnitCtxMock, basicChargePlans);

    expect(basicChargeRepositoryMock.upsertBasicChargePlan.calledOnce).to.be.true;
    expect(basicChargeRepositoryMock.upsertBasicChargePlan.calledWith(workUnitCtxMock, basicChargePlans, sinon.match.date)).to.be.true;
  });

  it('should handle null userId', async () => {
    const basicChargePlans: BasicChargePlan[] = [
      {
        plantCode: 'P001',
        unitCode: 'U001',
        fiscalYear: 2023,
        operationInput: 100,
        maintenanceInput: 50,
        userId: null,
      },
    ];

    basicChargeRepositoryMock.upsertBasicChargePlan.resolves();

    await upsertBasicChargePlanUsecase(basicChargeRepositoryMock, workUnitCtxMock, basicChargePlans);

    expect(basicChargeRepositoryMock.upsertBasicChargePlan.calledOnce).to.be.true;
    expect(basicChargeRepositoryMock.upsertBasicChargePlan.calledWith(workUnitCtxMock, basicChargePlans, sinon.match.date)).to.be.true;
  });

  it('should handle undefined userId', async () => {
    const basicChargePlans: BasicChargePlan[] = [
      {
        plantCode: 'P001',
        unitCode: 'U001',
        fiscalYear: 2023,
        operationInput: 100,
        maintenanceInput: 50,
        userId: undefined,
      },
    ];

    basicChargeRepositoryMock.upsertBasicChargePlan.resolves();

    await upsertBasicChargePlanUsecase(basicChargeRepositoryMock, workUnitCtxMock, basicChargePlans);

    expect(basicChargeRepositoryMock.upsertBasicChargePlan.calledOnce).to.be.true;
    expect(basicChargeRepositoryMock.upsertBasicChargePlan.calledWith(workUnitCtxMock, basicChargePlans, sinon.match.date)).to.be.true;
  });

  it('should handle special characters in userId', async () => {
    const basicChargePlans: BasicChargePlan[] = [
      {
        plantCode: 'P001',
        unitCode: 'U001',
        fiscalYear: 2023,
        operationInput: 100,
        maintenanceInput: 50,
        userId: '!@#$%^&*()',
      },
    ];

    basicChargeRepositoryMock.upsertBasicChargePlan.resolves();

    await upsertBasicChargePlanUsecase(basicChargeRepositoryMock, workUnitCtxMock, basicChargePlans);

    expect(basicChargeRepositoryMock.upsertBasicChargePlan.calledOnce).to.be.true;
    expect(basicChargeRepositoryMock.upsertBasicChargePlan.calledWith(workUnitCtxMock, basicChargePlans, sinon.match.date)).to.be.true;
  });

  it('should handle empty plantCode', async () => {
    const basicChargePlans: BasicChargePlan[] = [
      {
        plantCode: '',
        unitCode: 'U001',
        fiscalYear: 2023,
        operationInput: 100,
        maintenanceInput: 50,
        userId: 'user1',
      },
    ];

    basicChargeRepositoryMock.upsertBasicChargePlan.resolves();

    await upsertBasicChargePlanUsecase(basicChargeRepositoryMock, workUnitCtxMock, basicChargePlans);

    expect(basicChargeRepositoryMock.upsertBasicChargePlan.calledOnce).to.be.true;
    expect(basicChargeRepositoryMock.upsertBasicChargePlan.calledWith(workUnitCtxMock, basicChargePlans, sinon.match.date)).to.be.true;
  });

  it('should handle empty unitCode', async () => {
    const basicChargePlans: BasicChargePlan[] = [
      {
        plantCode: 'P001',
        unitCode: '',
        fiscalYear: 2023,
        operationInput: 100,
        maintenanceInput: 50,
        userId: 'user1',
      },
    ];

    basicChargeRepositoryMock.upsertBasicChargePlan.resolves();

    await upsertBasicChargePlanUsecase(basicChargeRepositoryMock, workUnitCtxMock, basicChargePlans);

    expect(basicChargeRepositoryMock.upsertBasicChargePlan.calledOnce).to.be.true;
    expect(basicChargeRepositoryMock.upsertBasicChargePlan.calledWith(workUnitCtxMock, basicChargePlans, sinon.match.date)).to.be.true;
  });

  it('should handle future fiscalYear', async () => {
    const basicChargePlans: BasicChargePlan[] = [
      {
        plantCode: 'P001',
        unitCode: 'U001',
        fiscalYear: 2050,
        operationInput: 100,
        maintenanceInput: 50,
        userId: 'user1',
      },
    ];

    basicChargeRepositoryMock.upsertBasicChargePlan.resolves();

    await upsertBasicChargePlanUsecase(basicChargeRepositoryMock, workUnitCtxMock, basicChargePlans);

    expect(basicChargeRepositoryMock.upsertBasicChargePlan.calledOnce).to.be.true;
    expect(basicChargeRepositoryMock.upsertBasicChargePlan.calledWith(workUnitCtxMock, basicChargePlans, sinon.match.date)).to.be.true;
  });
});
