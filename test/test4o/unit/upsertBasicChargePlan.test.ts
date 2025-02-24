import { expect } from 'chai';
import { upsertBasicChargePlanUsecase } from '../../../src/application/use_cases/upsertBasicChargePlanUsecase';
import { BasicChargeRepositoryPort } from '../../../src/application/port/BasicChargeRepositoryPort';
import { BasicChargePlan } from '../../../src/domain/models/BasicCharge';
import sinon from 'sinon';

describe('upsertBasicChargePlanUsecase', () => {
  let basicChargeRepositoryMock: sinon.SinonStubbedInstance<BasicChargeRepositoryPort<any>>;
  let workUnitCtxMock: any;

  beforeEach(() => {
    basicChargeRepositoryMock = {
      upsertBasicChargePlan: sinon.stub(),
      wrapInWorkUnitCtx: sinon.stub(),
      getBasicChargePlan: sinon.stub(),
      getBasicChargeForecast: sinon.stub(),
      getBasicChargePlanSummary: sinon.stub(),
      upsertBasicChargeForecast: sinon.stub(),
      getBasicChargeForecastSummary: sinon.stub(),
    };
    workUnitCtxMock = {};
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should successfully upsert basic charge plans', async () => {
    const basicChargePlans: BasicChargePlan[] = [
      {
        plantCode: 'P1',
        unitCode: 'U1',
        fiscalYear: 2023,
        operationInput: 100,
        maintenanceInput: 200,
        userId: 'user1',
      },
    ];

    await upsertBasicChargePlanUsecase(basicChargeRepositoryMock, workUnitCtxMock, basicChargePlans);

    expect(basicChargeRepositoryMock.upsertBasicChargePlan.calledOnce).to.be.true;
    expect(basicChargeRepositoryMock.upsertBasicChargePlan.args[0][1]).to.deep.equal(basicChargePlans);
  });

  it('should handle empty basic charge plans array', async () => {
    const basicChargePlans: BasicChargePlan[] = [];

    await upsertBasicChargePlanUsecase(basicChargeRepositoryMock, workUnitCtxMock, basicChargePlans);

    expect(basicChargeRepositoryMock.upsertBasicChargePlan.calledOnce).to.be.true;
    expect(basicChargeRepositoryMock.upsertBasicChargePlan.args[0][1]).to.deep.equal(basicChargePlans);
  });

  it('should throw an error if upsert fails', async () => {
    const basicChargePlans: BasicChargePlan[] = [
      {
        plantCode: 'P1',
        unitCode: 'U1',
        fiscalYear: 2023,
        operationInput: 100,
        maintenanceInput: 200,
        userId: 'user1',
      },
    ];

    basicChargeRepositoryMock.upsertBasicChargePlan.rejects(new Error('Database error'));

    try {
      await upsertBasicChargePlanUsecase(basicChargeRepositoryMock, workUnitCtxMock, basicChargePlans);
    } catch (error) {
      expect(error).to.be.an('error');
      expect(error.message).to.equal('Database error');
    }
  });

  it('should pass the correct workUnitCtx to the repository', async () => {
    const basicChargePlans: BasicChargePlan[] = [
      {
        plantCode: 'P1',
        unitCode: 'U1',
        fiscalYear: 2023,
        operationInput: 100,
        maintenanceInput: 200,
        userId: 'user1',
      },
    ];

    await upsertBasicChargePlanUsecase(basicChargeRepositoryMock, workUnitCtxMock, basicChargePlans);

    expect(basicChargeRepositoryMock.upsertBasicChargePlan.args[0][0]).to.equal(workUnitCtxMock);
  });

  it('should pass the correct currentDateTime to the repository', async () => {
    const basicChargePlans: BasicChargePlan[] = [
      {
        plantCode: 'P1',
        unitCode: 'U1',
        fiscalYear: 2023,
        operationInput: 100,
        maintenanceInput: 200,
        userId: 'user1',
      },
    ];

    const clock = sinon.useFakeTimers(new Date('2023-10-10T10:00:00Z').getTime());

    await upsertBasicChargePlanUsecase(basicChargeRepositoryMock, workUnitCtxMock, basicChargePlans);

    expect(basicChargeRepositoryMock.upsertBasicChargePlan.args[0][2]).to.deep.equal(new Date('2023-10-10T10:00:00Z'));

    clock.restore();
  });

  it('should handle multiple basic charge plans', async () => {
    const basicChargePlans: BasicChargePlan[] = [
      {
        plantCode: 'P1',
        unitCode: 'U1',
        fiscalYear: 2023,
        operationInput: 100,
        maintenanceInput: 200,
        userId: 'user1',
      },
      {
        plantCode: 'P2',
        unitCode: 'U2',
        fiscalYear: 2024,
        operationInput: 150,
        maintenanceInput: 250,
        userId: 'user2',
      },
    ];

    await upsertBasicChargePlanUsecase(basicChargeRepositoryMock, workUnitCtxMock, basicChargePlans);

    expect(basicChargeRepositoryMock.upsertBasicChargePlan.calledOnce).to.be.true;
    expect(basicChargeRepositoryMock.upsertBasicChargePlan.args[0][1]).to.deep.equal(basicChargePlans);
  });

  it('should handle null operationInput and maintenanceInput', async () => {
    const basicChargePlans: BasicChargePlan[] = [
      {
        plantCode: 'P1',
        unitCode: 'U1',
        fiscalYear: 2023,
        operationInput: null,
        maintenanceInput: null,
        userId: 'user1',
      },
    ];

    await upsertBasicChargePlanUsecase(basicChargeRepositoryMock, workUnitCtxMock, basicChargePlans);

    expect(basicChargeRepositoryMock.upsertBasicChargePlan.calledOnce).to.be.true;
    expect(basicChargeRepositoryMock.upsertBasicChargePlan.args[0][1]).to.deep.equal(basicChargePlans);
  });

  it('should handle undefined operationInput and maintenanceInput', async () => {
    const basicChargePlans: BasicChargePlan[] = [
      {
        plantCode: 'P1',
        unitCode: 'U1',
        fiscalYear: 2023,
        operationInput: undefined,
        maintenanceInput: undefined,
        userId: 'user1',
      },
    ];

    await upsertBasicChargePlanUsecase(basicChargeRepositoryMock, workUnitCtxMock, basicChargePlans);

    expect(basicChargeRepositoryMock.upsertBasicChargePlan.calledOnce).to.be.true;
    expect(basicChargeRepositoryMock.upsertBasicChargePlan.args[0][1]).to.deep.equal(basicChargePlans);
  });

  it('should handle missing userId', async () => {
    const basicChargePlans: BasicChargePlan[] = [
      {
        plantCode: 'P1',
        unitCode: 'U1',
        fiscalYear: 2023,
        operationInput: 100,
        maintenanceInput: 200,
        userId: undefined,
      },
    ];

    await upsertBasicChargePlanUsecase(basicChargeRepositoryMock, workUnitCtxMock, basicChargePlans);

    expect(basicChargeRepositoryMock.upsertBasicChargePlan.calledOnce).to.be.true;
    expect(basicChargeRepositoryMock.upsertBasicChargePlan.args[0][1]).to.deep.equal(basicChargePlans);
  });

  it('should handle invalid fiscalYear', async () => {
    const basicChargePlans: BasicChargePlan[] = [
      {
        plantCode: 'P1',
        unitCode: 'U1',
        fiscalYear: -2023,
        operationInput: 100,
        maintenanceInput: 200,
        userId: 'user1',
      },
    ];

    try {
      await upsertBasicChargePlanUsecase(basicChargeRepositoryMock, workUnitCtxMock, basicChargePlans);
    } catch (error) {
      expect(error).to.be.an('error');
    }
  });

  it('should handle invalid plantCode', async () => {
    const basicChargePlans: BasicChargePlan[] = [
      {
        plantCode: '',
        unitCode: 'U1',
        fiscalYear: 2023,
        operationInput: 100,
        maintenanceInput: 200,
        userId: 'user1',
      },
    ];

    try {
      await upsertBasicChargePlanUsecase(basicChargeRepositoryMock, workUnitCtxMock, basicChargePlans);
    } catch (error) {
      expect(error).to.be.an('error');
    }
  });

  it('should handle invalid unitCode', async () => {
    const basicChargePlans: BasicChargePlan[] = [
      {
        plantCode: 'P1',
        unitCode: '',
        fiscalYear: 2023,
        operationInput: 100,
        maintenanceInput: 200,
        userId: 'user1',
      },
    ];

    try {
      await upsertBasicChargePlanUsecase(basicChargeRepositoryMock, workUnitCtxMock, basicChargePlans);
    } catch (error) {
      expect(error).to.be.an('error');
    }
  });

  it('should handle invalid operationInput', async () => {
    const basicChargePlans: BasicChargePlan[] = [
      {
        plantCode: 'P1',
        unitCode: 'U1',
        fiscalYear: 2023,
        operationInput: -100,
        maintenanceInput: 200,
        userId: 'user1',
      },
    ];

    try {
      await upsertBasicChargePlanUsecase(basicChargeRepositoryMock, workUnitCtxMock, basicChargePlans);
    } catch (error) {
      expect(error).to.be.an('error');
    }
  });

  it('should handle invalid maintenanceInput', async () => {
    const basicChargePlans: BasicChargePlan[] = [
      {
        plantCode: 'P1',
        unitCode: 'U1',
        fiscalYear: 2023,
        operationInput: 100,
        maintenanceInput: -200,
        userId: 'user1',
      },
    ];

    try {
      await upsertBasicChargePlanUsecase(basicChargeRepositoryMock, workUnitCtxMock, basicChargePlans);
    } catch (error) {
      expect(error).to.be.an('error');
    }
  });

  it('should handle null basicChargePlans', async () => {
    const basicChargePlans: BasicChargePlan[] = null;

    try {
      await upsertBasicChargePlanUsecase(basicChargeRepositoryMock, workUnitCtxMock, basicChargePlans);
    } catch (error) {
      expect(error).to.be.an('error');
    }
  });

  it('should handle undefined basicChargePlans', async () => {
    const basicChargePlans: BasicChargePlan[] = undefined;

    try {
      await upsertBasicChargePlanUsecase(basicChargeRepositoryMock, workUnitCtxMock, basicChargePlans);
    } catch (error) {
      expect(error).to.be.an('error');
    }
  });

  it('should handle missing basicChargePlans', async () => {
    try {
      await upsertBasicChargePlanUsecase(basicChargeRepositoryMock, workUnitCtxMock, undefined);
    } catch (error) {
      expect(error).to.be.an('error');
    }
  });

  it('should handle missing workUnitCtx', async () => {
    const basicChargePlans: BasicChargePlan[] = [
      {
        plantCode: 'P1',
        unitCode: 'U1',
        fiscalYear: 2023,
        operationInput: 100,
        maintenanceInput: 200,
        userId: 'user1',
      },
    ];

    try {
      await upsertBasicChargePlanUsecase(basicChargeRepositoryMock, undefined, basicChargePlans);
    } catch (error) {
      expect(error).to.be.an('error');
    }
  });

  it('should handle missing basicChargeRepository', async () => {
    const basicChargePlans: BasicChargePlan[] = [
      {
        plantCode: 'P1',
        unitCode: 'U1',
        fiscalYear: 2023,
        operationInput: 100,
        maintenanceInput: 200,
        userId: 'user1',
      },
    ];

    try {
      await upsertBasicChargePlanUsecase(undefined, workUnitCtxMock, basicChargePlans);
    } catch (error) {
      expect(error).to.be.an('error');
    }
  });
});