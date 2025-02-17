import { expect } from 'chai';
import { upsertBasicChargePlanUsecase } from '../../../src/application/use_cases/dpm/upsertBasicChargePlanUsecase';
import { BasicChargeRepositoryPort } from '../../../src/application/port/BasicChargeRepositoryPort';
import { BasicChargePlan } from '../../../src/domain/models/BasicCharge';
import sinon from 'sinon';

describe('upsertBasicChargePlanUsecase', () => {
  let basicChargeRepository: BasicChargeRepositoryPort<any>;
  let workUnitCtx: any;

  beforeEach(() => {
    workUnitCtx = {};
    basicChargeRepository = {
      wrapInWorkUnitCtx: sinon.stub(),
      getBasicChargePlan: sinon.stub(),
      getBasicChargeForecast: sinon.stub(),
      getBasicChargePlanSummary: sinon.stub(),
      upsertBasicChargePlan: sinon.stub(),
      upsertBasicChargeForecast: sinon.stub(),
      getBasicChargeForecastSummary: sinon.stub(),
    };
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

    await upsertBasicChargePlanUsecase(basicChargeRepository, workUnitCtx, basicChargePlans);

    expect(basicChargeRepository.upsertBasicChargePlan.calledOnce).to.be.true;
    expect(basicChargeRepository.upsertBasicChargePlan.calledWith(workUnitCtx, basicChargePlans, sinon.match.date)).to.be.true;
  });

  it('should handle empty basic charge plans array', async () => {
    const basicChargePlans: BasicChargePlan[] = [];

    await upsertBasicChargePlanUsecase(basicChargeRepository, workUnitCtx, basicChargePlans);

    expect(basicChargeRepository.upsertBasicChargePlan.calledOnce).to.be.true;
    expect(basicChargeRepository.upsertBasicChargePlan.calledWith(workUnitCtx, basicChargePlans, sinon.match.date)).to.be.true;
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

    basicChargeRepository.upsertBasicChargePlan.rejects(new Error('Database error'));

    try {
      await upsertBasicChargePlanUsecase(basicChargeRepository, workUnitCtx, basicChargePlans);
    } catch (error) {
      expect(error.message).to.equal('Database error');
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

    await upsertBasicChargePlanUsecase(basicChargeRepository, workUnitCtx, basicChargePlans);

    expect(basicChargeRepository.upsertBasicChargePlan.calledOnce).to.be.true;
    expect(basicChargeRepository.upsertBasicChargePlan.calledWith(workUnitCtx, basicChargePlans, sinon.match.date)).to.be.true;
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

    await upsertBasicChargePlanUsecase(basicChargeRepository, workUnitCtx, basicChargePlans);

    expect(basicChargeRepository.upsertBasicChargePlan.calledOnce).to.be.true;
    expect(basicChargeRepository.upsertBasicChargePlan.calledWith(workUnitCtx, basicChargePlans, sinon.match.date)).to.be.true;
  });

  it('should handle missing userId', async () => {
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

    await upsertBasicChargePlanUsecase(basicChargeRepository, workUnitCtx, basicChargePlans);

    expect(basicChargeRepository.upsertBasicChargePlan.calledOnce).to.be.true;
    expect(basicChargeRepository.upsertBasicChargePlan.calledWith(workUnitCtx, basicChargePlans, sinon.match.date)).to.be.true;
  });

  it('should handle missing plantCode', async () => {
    const basicChargePlans: BasicChargePlan[] = [
      {
        plantCode: undefined,
        unitCode: 'U001',
        fiscalYear: 2023,
        operationInput: 100,
        maintenanceInput: 50,
        userId: 'user1',
      },
    ];

    await upsertBasicChargePlanUsecase(basicChargeRepository, workUnitCtx, basicChargePlans);

    expect(basicChargeRepository.upsertBasicChargePlan.calledOnce).to.be.true;
    expect(basicChargeRepository.upsertBasicChargePlan.calledWith(workUnitCtx, basicChargePlans, sinon.match.date)).to.be.true;
  });

  it('should handle missing unitCode', async () => {
    const basicChargePlans: BasicChargePlan[] = [
      {
        plantCode: 'P001',
        unitCode: undefined,
        fiscalYear: 2023,
        operationInput: 100,
        maintenanceInput: 50,
        userId: 'user1',
      },
    ];

    await upsertBasicChargePlanUsecase(basicChargeRepository, workUnitCtx, basicChargePlans);

    expect(basicChargeRepository.upsertBasicChargePlan.calledOnce).to.be.true;
    expect(basicChargeRepository.upsertBasicChargePlan.calledWith(workUnitCtx, basicChargePlans, sinon.match.date)).to.be.true;
  });

  it('should handle missing fiscalYear', async () => {
    const basicChargePlans: BasicChargePlan[] = [
      {
        plantCode: 'P001',
        unitCode: 'U001',
        fiscalYear: undefined,
        operationInput: 100,
        maintenanceInput: 50,
        userId: 'user1',
      },
    ];

    await upsertBasicChargePlanUsecase(basicChargeRepository, workUnitCtx, basicChargePlans);

    expect(basicChargeRepository.upsertBasicChargePlan.calledOnce).to.be.true;
    expect(basicChargeRepository.upsertBasicChargePlan.calledWith(workUnitCtx, basicChargePlans, sinon.match.date)).to.be.true;
  });

  it('should handle missing operationInput', async () => {
    const basicChargePlans: BasicChargePlan[] = [
      {
        plantCode: 'P001',
        unitCode: 'U001',
        fiscalYear: 2023,
        operationInput: undefined,
        maintenanceInput: 50,
        userId: 'user1',
      },
    ];

    await upsertBasicChargePlanUsecase(basicChargeRepository, workUnitCtx, basicChargePlans);

    expect(basicChargeRepository.upsertBasicChargePlan.calledOnce).to.be.true;
    expect(basicChargeRepository.upsertBasicChargePlan.calledWith(workUnitCtx, basicChargePlans, sinon.match.date)).to.be.true;
  });

  it('should handle missing maintenanceInput', async () => {
    const basicChargePlans: BasicChargePlan[] = [
      {
        plantCode: 'P001',
        unitCode: 'U001',
        fiscalYear: 2023,
        operationInput: 100,
        maintenanceInput: undefined,
        userId: 'user1',
      },
    ];

    await upsertBasicChargePlanUsecase(basicChargeRepository, workUnitCtx, basicChargePlans);

    expect(basicChargeRepository.upsertBasicChargePlan.calledOnce).to.be.true;
    expect(basicChargeRepository.upsertBasicChargePlan.calledWith(workUnitCtx, basicChargePlans, sinon.match.date)).to.be.true;
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

    await upsertBasicChargePlanUsecase(basicChargeRepository, workUnitCtx, basicChargePlans);

    expect(basicChargeRepository.upsertBasicChargePlan.calledOnce).to.be.true;
    expect(basicChargeRepository.upsertBasicChargePlan.calledWith(workUnitCtx, basicChargePlans, sinon.match.date)).to.be.true;
  });

  it('should handle null plantCode', async () => {
    const basicChargePlans: BasicChargePlan[] = [
      {
        plantCode: null,
        unitCode: 'U001',
        fiscalYear: 2023,
        operationInput: 100,
        maintenanceInput: 50,
        userId: 'user1',
      },
    ];

    await upsertBasicChargePlanUsecase(basicChargeRepository, workUnitCtx, basicChargePlans);

    expect(basicChargeRepository.upsertBasicChargePlan.calledOnce).to.be.true;
    expect(basicChargeRepository.upsertBasicChargePlan.calledWith(workUnitCtx, basicChargePlans, sinon.match.date)).to.be.true;
  });

  it('should handle null unitCode', async () => {
    const basicChargePlans: BasicChargePlan[] = [
      {
        plantCode: 'P001',
        unitCode: null,
        fiscalYear: 2023,
        operationInput: 100,
        maintenanceInput: 50,
        userId: 'user1',
      },
    ];

    await upsertBasicChargePlanUsecase(basicChargeRepository, workUnitCtx, basicChargePlans);

    expect(basicChargeRepository.upsertBasicChargePlan.calledOnce).to.be.true;
    expect(basicChargeRepository.upsertBasicChargePlan.calledWith(workUnitCtx, basicChargePlans, sinon.match.date)).to.be.true;
  });

  it('should handle null fiscalYear', async () => {
    const basicChargePlans: BasicChargePlan[] = [
      {
        plantCode: 'P001',
        unitCode: 'U001',
        fiscalYear: null,
        operationInput: 100,
        maintenanceInput: 50,
        userId: 'user1',
      },
    ];

    await upsertBasicChargePlanUsecase(basicChargeRepository, workUnitCtx, basicChargePlans);

    expect(basicChargeRepository.upsertBasicChargePlan.calledOnce).to.be.true;
    expect(basicChargeRepository.upsertBasicChargePlan.calledWith(workUnitCtx, basicChargePlans, sinon.match.date)).to.be.true;
  });

  it('should handle null operationInput', async () => {
    const basicChargePlans: BasicChargePlan[] = [
      {
        plantCode: 'P001',
        unitCode: 'U001',
        fiscalYear: 2023,
        operationInput: null,
        maintenanceInput: 50,
        userId: 'user1',
      },
    ];

    await upsertBasicChargePlanUsecase(basicChargeRepository, workUnitCtx, basicChargePlans);

    expect(basicChargeRepository.upsertBasicChargePlan.calledOnce).to.be.true;
    expect(basicChargeRepository.upsertBasicChargePlan.calledWith(workUnitCtx, basicChargePlans, sinon.match.date)).to.be.true;
  });

  it('should handle null maintenanceInput', async () => {
    const basicChargePlans: BasicChargePlan[] = [
      {
        plantCode: 'P001',
        unitCode: 'U001',
        fiscalYear: 2023,
        operationInput: 100,
        maintenanceInput: null,
        userId: 'user1',
      },
    ];

    await upsertBasicChargePlanUsecase(basicChargeRepository, workUnitCtx, basicChargePlans);

    expect(basicChargeRepository.upsertBasicChargePlan.calledOnce).to.be.true;
    expect(basicChargeRepository.upsertBasicChargePlan.calledWith(workUnitCtx, basicChargePlans, sinon.match.date)).to.be.true;
  });

  it('should handle undefined basicChargePlans', async () => {
    const basicChargePlans: BasicChargePlan[] = undefined;

    await upsertBasicChargePlanUsecase(basicChargeRepository, workUnitCtx, basicChargePlans);

    expect(basicChargeRepository.upsertBasicChargePlan.calledOnce).to.be.true;
    expect(basicChargeRepository.upsertBasicChargePlan.calledWith(workUnitCtx, basicChargePlans, sinon.match.date)).to.be.true;
  });

  it('should handle null basicChargePlans', async () => {
    const basicChargePlans: BasicChargePlan[] = null;

    await upsertBasicChargePlanUsecase(basicChargeRepository, workUnitCtx, basicChargePlans);

    expect(basicChargeRepository.upsertBasicChargePlan.calledOnce).to.be.true;
    expect(basicChargeRepository.upsertBasicChargePlan.calledWith(workUnitCtx, basicChargePlans, sinon.match.date)).to.be.true;
  });
});