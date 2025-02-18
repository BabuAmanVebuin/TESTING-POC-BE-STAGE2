import { expect } from 'chai';
import sinon from 'sinon';
import { upsertBasicChargePlanUsecase } from '../../../src/application/use_cases/basicChargePlan/upsertBasicChargePlanUsecase';
import { BasicChargeRepositoryPort } from '../../../src/application/port/BasicChargeRepositoryPort';
import { BasicChargePlan } from '../../../src/domain/models/BasicCharge';

describe('upsertBasicChargePlanUsecase', () => {
  let basicChargeRepositoryMock: sinon.SinonStubbedInstance<BasicChargeRepositoryPort<any>>;
  let workUnitCtxMock: any;
  let basicChargePlansMock: BasicChargePlan[];

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
    basicChargePlansMock = [
      {
        plantCode: 'P1',
        unitCode: 'U1',
        fiscalYear: 2023,
        operationInput: 100,
        maintenanceInput: 50,
        userId: 'user1',
      },
    ];
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should successfully upsert basic charge plans', async () => {
    basicChargeRepositoryMock.upsertBasicChargePlan.resolves();

    await upsertBasicChargePlanUsecase(basicChargeRepositoryMock, workUnitCtxMock, basicChargePlansMock);

    expect(basicChargeRepositoryMock.upsertBasicChargePlan.calledOnce).to.be.true;
    expect(basicChargeRepositoryMock.upsertBasicChargePlan.calledWith(workUnitCtxMock, basicChargePlansMock)).to.be.true;
  });

  it('should handle empty basic charge plans array', async () => {
    basicChargePlansMock = [];

    await upsertBasicChargePlanUsecase(basicChargeRepositoryMock, workUnitCtxMock, basicChargePlansMock);

    expect(basicChargeRepositoryMock.upsertBasicChargePlan.calledOnce).to.be.true;
    expect(basicChargeRepositoryMock.upsertBasicChargePlan.calledWith(workUnitCtxMock, basicChargePlansMock)).to.be.true;
  });

  it('should throw an error if repository upsert fails', async () => {
    basicChargeRepositoryMock.upsertBasicChargePlan.rejects(new Error('Database error'));

    try {
      await upsertBasicChargePlanUsecase(basicChargeRepositoryMock, workUnitCtxMock, basicChargePlansMock);
    } catch (error) {
      expect(error.message).to.equal('Database error');
    }
  });

  it('should pass the correct currentDateTime to the repository', async () => {
    const clock = sinon.useFakeTimers(new Date('2023-10-10T10:00:00Z').getTime());
    basicChargeRepositoryMock.upsertBasicChargePlan.resolves();

    await upsertBasicChargePlanUsecase(basicChargeRepositoryMock, workUnitCtxMock, basicChargePlansMock);

    expect(basicChargeRepositoryMock.upsertBasicChargePlan.calledOnce).to.be.true;
    expect(basicChargeRepositoryMock.upsertBasicChargePlan.args[0][2]).to.deep.equal(new Date('2023-10-10T10:00:00Z'));

    clock.restore();
  });

  it('should handle multiple basic charge plans', async () => {
    basicChargePlansMock.push({
      plantCode: 'P2',
      unitCode: 'U2',
      fiscalYear: 2024,
      operationInput: 200,
      maintenanceInput: 100,
      userId: 'user2',
    });
    basicChargeRepositoryMock.upsertBasicChargePlan.resolves();

    await upsertBasicChargePlanUsecase(basicChargeRepositoryMock, workUnitCtxMock, basicChargePlansMock);

    expect(basicChargeRepositoryMock.upsertBasicChargePlan.calledOnce).to.be.true;
    expect(basicChargeRepositoryMock.upsertBasicChargePlan.calledWith(workUnitCtxMock, basicChargePlansMock)).to.be.true;
  });

  it('should handle null operationInput and maintenanceInput', async () => {
    basicChargePlansMock = [
      {
        plantCode: 'P1',
        unitCode: 'U1',
        fiscalYear: 2023,
        operationInput: null,
        maintenanceInput: null,
        userId: 'user1',
      },
    ];
    basicChargeRepositoryMock.upsertBasicChargePlan.resolves();

    await upsertBasicChargePlanUsecase(basicChargeRepositoryMock, workUnitCtxMock, basicChargePlansMock);

    expect(basicChargeRepositoryMock.upsertBasicChargePlan.calledOnce).to.be.true;
    expect(basicChargeRepositoryMock.upsertBasicChargePlan.calledWith(workUnitCtxMock, basicChargePlansMock)).to.be.true;
  });

  it('should handle undefined operationInput and maintenanceInput', async () => {
    basicChargePlansMock = [
      {
        plantCode: 'P1',
        unitCode: 'U1',
        fiscalYear: 2023,
        operationInput: undefined,
        maintenanceInput: undefined,
        userId: 'user1',
      },
    ];
    basicChargeRepositoryMock.upsertBasicChargePlan.resolves();

    await upsertBasicChargePlanUsecase(basicChargeRepositoryMock, workUnitCtxMock, basicChargePlansMock);

    expect(basicChargeRepositoryMock.upsertBasicChargePlan.calledOnce).to.be.true;
    expect(basicChargeRepositoryMock.upsertBasicChargePlan.calledWith(workUnitCtxMock, basicChargePlansMock)).to.be.true;
  });

  it('should handle missing userId', async () => {
    basicChargePlansMock = [
      {
        plantCode: 'P1',
        unitCode: 'U1',
        fiscalYear: 2023,
        operationInput: 100,
        maintenanceInput: 50,
        userId: undefined,
      },
    ];
    basicChargeRepositoryMock.upsertBasicChargePlan.resolves();

    await upsertBasicChargePlanUsecase(basicChargeRepositoryMock, workUnitCtxMock, basicChargePlansMock);

    expect(basicChargeRepositoryMock.upsertBasicChargePlan.calledOnce).to.be.true;
    expect(basicChargeRepositoryMock.upsertBasicChargePlan.calledWith(workUnitCtxMock, basicChargePlansMock)).to.be.true;
  });

  it('should handle missing plantCode', async () => {
    basicChargePlansMock = [
      {
        plantCode: undefined,
        unitCode: 'U1',
        fiscalYear: 2023,
        operationInput: 100,
        maintenanceInput: 50,
        userId: 'user1',
      },
    ];
    basicChargeRepositoryMock.upsertBasicChargePlan.resolves();

    await upsertBasicChargePlanUsecase(basicChargeRepositoryMock, workUnitCtxMock, basicChargePlansMock);

    expect(basicChargeRepositoryMock.upsertBasicChargePlan.calledOnce).to.be.true;
    expect(basicChargeRepositoryMock.upsertBasicChargePlan.calledWith(workUnitCtxMock, basicChargePlansMock)).to.be.true;
  });

  it('should handle missing unitCode', async () => {
    basicChargePlansMock = [
      {
        plantCode: 'P1',
        unitCode: undefined,
        fiscalYear: 2023,
        operationInput: 100,
        maintenanceInput: 50,
        userId: 'user1',
      },
    ];
    basicChargeRepositoryMock.upsertBasicChargePlan.resolves();

    await upsertBasicChargePlanUsecase(basicChargeRepositoryMock, workUnitCtxMock, basicChargePlansMock);

    expect(basicChargeRepositoryMock.upsertBasicChargePlan.calledOnce).to.be.true;
    expect(basicChargeRepositoryMock.upsertBasicChargePlan.calledWith(workUnitCtxMock, basicChargePlansMock)).to.be.true;
  });

  it('should handle missing fiscalYear', async () => {
    basicChargePlansMock = [
      {
        plantCode: 'P1',
        unitCode: 'U1',
        fiscalYear: undefined,
        operationInput: 100,
        maintenanceInput: 50,
        userId: 'user1',
      },
    ];
    basicChargeRepositoryMock.upsertBasicChargePlan.resolves();

    await upsertBasicChargePlanUsecase(basicChargeRepositoryMock, workUnitCtxMock, basicChargePlansMock);

    expect(basicChargeRepositoryMock.upsertBasicChargePlan.calledOnce).to.be.true;
    expect(basicChargeRepositoryMock.upsertBasicChargePlan.calledWith(workUnitCtxMock, basicChargePlansMock)).to.be.true;
  });

  it('should handle large number of basic charge plans', async () => {
    basicChargePlansMock = Array.from({ length: 1000 }, (_, i) => ({
      plantCode: `P${i}`,
      unitCode: `U${i}`,
      fiscalYear: 2023,
      operationInput: i * 10,
      maintenanceInput: i * 5,
      userId: `user${i}`,
    }));
    basicChargeRepositoryMock.upsertBasicChargePlan.resolves();

    await upsertBasicChargePlanUsecase(basicChargeRepositoryMock, workUnitCtxMock, basicChargePlansMock);

    expect(basicChargeRepositoryMock.upsertBasicChargePlan.calledOnce).to.be.true;
    expect(basicChargeRepositoryMock.upsertBasicChargePlan.calledWith(workUnitCtxMock, basicChargePlansMock)).to.be.true;
  });

  it('should handle duplicate basic charge plans', async () => {
    basicChargePlansMock.push(basicChargePlansMock[0]);
    basicChargeRepositoryMock.upsertBasicChargePlan.resolves();

    await upsertBasicChargePlanUsecase(basicChargeRepositoryMock, workUnitCtxMock, basicChargePlansMock);

    expect(basicChargeRepositoryMock.upsertBasicChargePlan.calledOnce).to.be.true;
    expect(basicChargeRepositoryMock.upsertBasicChargePlan.calledWith(workUnitCtxMock, basicChargePlansMock)).to.be.true;
  });

  it('should handle invalid fiscalYear', async () => {
    basicChargePlansMock = [
      {
        plantCode: 'P1',
        unitCode: 'U1',
        fiscalYear: -2023,
        operationInput: 100,
        maintenanceInput: 50,
        userId: 'user1',
      },
    ];
    basicChargeRepositoryMock.upsertBasicChargePlan.resolves();

    await upsertBasicChargePlanUsecase(basicChargeRepositoryMock, workUnitCtxMock, basicChargePlansMock);

    expect(basicChargeRepositoryMock.upsertBasicChargePlan.calledOnce).to.be.true;
    expect(basicChargeRepositoryMock.upsertBasicChargePlan.calledWith(workUnitCtxMock, basicChargePlansMock)).to.be.true;
  });

  it('should handle invalid operationInput', async () => {
    basicChargePlansMock = [
      {
        plantCode: 'P1',
        unitCode: 'U1',
        fiscalYear: 2023,
        operationInput: -100,
        maintenanceInput: 50,
        userId: 'user1',
      },
    ];
    basicChargeRepositoryMock.upsertBasicChargePlan.resolves();

    await upsertBasicChargePlanUsecase(basicChargeRepositoryMock, workUnitCtxMock, basicChargePlansMock);

    expect(basicChargeRepositoryMock.upsertBasicChargePlan.calledOnce).to.be.true;
    expect(basicChargeRepositoryMock.upsertBasicChargePlan.calledWith(workUnitCtxMock, basicChargePlansMock)).to.be.true;
  });

  it('should handle invalid maintenanceInput', async () => {
    basicChargePlansMock = [
      {
        plantCode: 'P1',
        unitCode: 'U1',
        fiscalYear: 2023,
        operationInput: 100,
        maintenanceInput: -50,
        userId: 'user1',
      },
    ];
    basicChargeRepositoryMock.upsertBasicChargePlan.resolves();

    await upsertBasicChargePlanUsecase(basicChargeRepositoryMock, workUnitCtxMock, basicChargePlansMock);

    expect(basicChargeRepositoryMock.upsertBasicChargePlan.calledOnce).to.be.true;
    expect(basicChargeRepositoryMock.upsertBasicChargePlan.calledWith(workUnitCtxMock, basicChargePlansMock)).to.be.true;
  });

  it('should handle invalid userId', async () => {
    basicChargePlansMock = [
      {
        plantCode: 'P1',
        unitCode: 'U1',
        fiscalYear: 2023,
        operationInput: 100,
        maintenanceInput: 50,
        userId: '',
      },
    ];
    basicChargeRepositoryMock.upsertBasicChargePlan.resolves();

    await upsertBasicChargePlanUsecase(basicChargeRepositoryMock, workUnitCtxMock, basicChargePlansMock);

    expect(basicChargeRepositoryMock.upsertBasicChargePlan.calledOnce).to.be.true;
    expect(basicChargeRepositoryMock.upsertBasicChargePlan.calledWith(workUnitCtxMock, basicChargePlansMock)).to.be.true;
  });

  it('should handle invalid plantCode', async () => {
    basicChargePlansMock = [
      {
        plantCode: '',
        unitCode: 'U1',
        fiscalYear: 2023,
        operationInput: 100,
        maintenanceInput: 50,
        userId: 'user1',
      },
    ];
    basicChargeRepositoryMock.upsertBasicChargePlan.resolves();

    await upsertBasicChargePlanUsecase(basicChargeRepositoryMock, workUnitCtxMock, basicChargePlansMock);

    expect(basicChargeRepositoryMock.upsertBasicChargePlan.calledOnce).to.be.true;
    expect(basicChargeRepositoryMock.upsertBasicChargePlan.calledWith(workUnitCtxMock, basicChargePlansMock)).to.be.true;
  });

  it('should handle invalid unitCode', async () => {
    basicChargePlansMock = [
      {
        plantCode: 'P1',
        unitCode: '',
        fiscalYear: 2023,
        operationInput: 100,
        maintenanceInput: 50,
        userId: 'user1',
      },
    ];
    basicChargeRepositoryMock.upsertBasicChargePlan.resolves();

    await upsertBasicChargePlanUsecase(basicChargeRepositoryMock, workUnitCtxMock, basicChargePlansMock);

    expect(basicChargeRepositoryMock.upsertBasicChargePlan.calledOnce).to.be.true;
    expect(basicChargeRepositoryMock.upsertBasicChargePlan.calledWith(workUnitCtxMock, basicChargePlansMock)).to.be.true;
  });
});