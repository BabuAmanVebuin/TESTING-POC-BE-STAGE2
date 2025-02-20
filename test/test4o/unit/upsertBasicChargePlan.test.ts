import { expect } from 'chai';
import { upsertBasicChargePlanUsecase } from '../../../src/application/use_cases/basicChargePlan/upsertBasicChargePlanUsecase';
import { BasicChargeRepositoryPort } from '../../../src/application/port/BasicChargeRepositoryPort';
import { BasicChargePlan } from '../../../src/domain/models/BasicCharge';
import sinon from 'sinon';

describe('upsertBasicChargePlanUsecase', () => {
  let basicChargeRepositoryMock: sinon.SinonStubbedInstance<BasicChargeRepositoryPort<any>>;
  let workUnitCtxMock: any;
  let basicChargePlans: BasicChargePlan[];

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
    basicChargePlans = [
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

    await upsertBasicChargePlanUsecase(basicChargeRepositoryMock, workUnitCtxMock, basicChargePlans);

    expect(basicChargeRepositoryMock.upsertBasicChargePlan.calledOnce).to.be.true;
    expect(basicChargeRepositoryMock.upsertBasicChargePlan.calledWith(workUnitCtxMock, basicChargePlans)).to.be.true;
  });

  it('should handle empty basic charge plans array', async () => {
    basicChargePlans = [];

    await upsertBasicChargePlanUsecase(basicChargeRepositoryMock, workUnitCtxMock, basicChargePlans);

    expect(basicChargeRepositoryMock.upsertBasicChargePlan.calledOnce).to.be.true;
    expect(basicChargeRepositoryMock.upsertBasicChargePlan.calledWith(workUnitCtxMock, basicChargePlans)).to.be.true;
  });

  it('should throw an error if upsertBasicChargePlan fails', async () => {
    basicChargeRepositoryMock.upsertBasicChargePlan.rejects(new Error('Database error'));

    try {
      await upsertBasicChargePlanUsecase(basicChargeRepositoryMock, workUnitCtxMock, basicChargePlans);
    } catch (error) {
      expect(error).to.be.instanceOf(Error);
      expect(error.message).to.equal('Database error');
    }
  });

  it('should pass the correct currentDateTime to the repository', async () => {
    const clock = sinon.useFakeTimers(new Date('2023-10-01T00:00:00Z').getTime());
    basicChargeRepositoryMock.upsertBasicChargePlan.resolves();

    await upsertBasicChargePlanUsecase(basicChargeRepositoryMock, workUnitCtxMock, basicChargePlans);

    expect(basicChargeRepositoryMock.upsertBasicChargePlan.calledOnce).to.be.true;
    const currentDateTime = basicChargeRepositoryMock.upsertBasicChargePlan.getCall(0).args[2];
    expect(currentDateTime).to.deep.equal(new Date('2023-10-01T00:00:00Z'));

    clock.restore();
  });

  it('should handle multiple basic charge plans', async () => {
    basicChargePlans.push({
      plantCode: 'P2',
      unitCode: 'U2',
      fiscalYear: 2024,
      operationInput: 200,
      maintenanceInput: 100,
      userId: 'user2',
    });

    basicChargeRepositoryMock.upsertBasicChargePlan.resolves();

    await upsertBasicChargePlanUsecase(basicChargeRepositoryMock, workUnitCtxMock, basicChargePlans);

    expect(basicChargeRepositoryMock.upsertBasicChargePlan.calledOnce).to.be.true;
    expect(basicChargeRepositoryMock.upsertBasicChargePlan.calledWith(workUnitCtxMock, basicChargePlans)).to.be.true;
  });

  it('should handle null operationInput and maintenanceInput', async () => {
    basicChargePlans = [
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

    await upsertBasicChargePlanUsecase(basicChargeRepositoryMock, workUnitCtxMock, basicChargePlans);

    expect(basicChargeRepositoryMock.upsertBasicChargePlan.calledOnce).to.be.true;
    expect(basicChargeRepositoryMock.upsertBasicChargePlan.calledWith(workUnitCtxMock, basicChargePlans)).to.be.true;
  });

  it('should handle undefined operationInput and maintenanceInput', async () => {
    basicChargePlans = [
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

    await upsertBasicChargePlanUsecase(basicChargeRepositoryMock, workUnitCtxMock, basicChargePlans);

    expect(basicChargeRepositoryMock.upsertBasicChargePlan.calledOnce).to.be.true;
    expect(basicChargeRepositoryMock.upsertBasicChargePlan.calledWith(workUnitCtxMock, basicChargePlans)).to.be.true;
  });

  it('should handle missing userId', async () => {
    basicChargePlans = [
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

    await upsertBasicChargePlanUsecase(basicChargeRepositoryMock, workUnitCtxMock, basicChargePlans);

    expect(basicChargeRepositoryMock.upsertBasicChargePlan.calledOnce).to.be.true;
    expect(basicChargeRepositoryMock.upsertBasicChargePlan.calledWith(workUnitCtxMock, basicChargePlans)).to.be.true;
  });

  it('should handle missing plantCode', async () => {
    basicChargePlans = [
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

    await upsertBasicChargePlanUsecase(basicChargeRepositoryMock, workUnitCtxMock, basicChargePlans);

    expect(basicChargeRepositoryMock.upsertBasicChargePlan.calledOnce).to.be.true;
    expect(basicChargeRepositoryMock.upsertBasicChargePlan.calledWith(workUnitCtxMock, basicChargePlans)).to.be.true;
  });

  it('should handle missing unitCode', async () => {
    basicChargePlans = [
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

    await upsertBasicChargePlanUsecase(basicChargeRepositoryMock, workUnitCtxMock, basicChargePlans);

    expect(basicChargeRepositoryMock.upsertBasicChargePlan.calledOnce).to.be.true;
    expect(basicChargeRepositoryMock.upsertBasicChargePlan.calledWith(workUnitCtxMock, basicChargePlans)).to.be.true;
  });

  it('should handle missing fiscalYear', async () => {
    basicChargePlans = [
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

    await upsertBasicChargePlanUsecase(basicChargeRepositoryMock, workUnitCtxMock, basicChargePlans);

    expect(basicChargeRepositoryMock.upsertBasicChargePlan.calledOnce).to.be.true;
    expect(basicChargeRepositoryMock.upsertBasicChargePlan.calledWith(workUnitCtxMock, basicChargePlans)).to.be.true;
  });

  it('should handle missing operationInput', async () => {
    basicChargePlans = [
      {
        plantCode: 'P1',
        unitCode: 'U1',
        fiscalYear: 2023,
        operationInput: undefined,
        maintenanceInput: 50,
        userId: 'user1',
      },
    ];

    basicChargeRepositoryMock.upsertBasicChargePlan.resolves();

    await upsertBasicChargePlanUsecase(basicChargeRepositoryMock, workUnitCtxMock, basicChargePlans);

    expect(basicChargeRepositoryMock.upsertBasicChargePlan.calledOnce).to.be.true;
    expect(basicChargeRepositoryMock.upsertBasicChargePlan.calledWith(workUnitCtxMock, basicChargePlans)).to.be.true;
  });

  it('should handle missing maintenanceInput', async () => {
    basicChargePlans = [
      {
        plantCode: 'P1',
        unitCode: 'U1',
        fiscalYear: 2023,
        operationInput: 100,
        maintenanceInput: undefined,
        userId: 'user1',
      },
    ];

    basicChargeRepositoryMock.upsertBasicChargePlan.resolves();

    await upsertBasicChargePlanUsecase(basicChargeRepositoryMock, workUnitCtxMock, basicChargePlans);

    expect(basicChargeRepositoryMock.upsertBasicChargePlan.calledOnce).to.be.true;
    expect(basicChargeRepositoryMock.upsertBasicChargePlan.calledWith(workUnitCtxMock, basicChargePlans)).to.be.true;
  });

  it('should handle null userId', async () => {
    basicChargePlans = [
      {
        plantCode: 'P1',
        unitCode: 'U1',
        fiscalYear: 2023,
        operationInput: 100,
        maintenanceInput: 50,
        userId: null,
      },
    ];

    basicChargeRepositoryMock.upsertBasicChargePlan.resolves();

    await upsertBasicChargePlanUsecase(basicChargeRepositoryMock, workUnitCtxMock, basicChargePlans);

    expect(basicChargeRepositoryMock.upsertBasicChargePlan.calledOnce).to.be.true;
    expect(basicChargeRepositoryMock.upsertBasicChargePlan.calledWith(workUnitCtxMock, basicChargePlans)).to.be.true;
  });

  it('should handle null plantCode', async () => {
    basicChargePlans = [
      {
        plantCode: null,
        unitCode: 'U1',
        fiscalYear: 2023,
        operationInput: 100,
        maintenanceInput: 50,
        userId: 'user1',
      },
    ];

    basicChargeRepositoryMock.upsertBasicChargePlan.resolves();

    await upsertBasicChargePlanUsecase(basicChargeRepositoryMock, workUnitCtxMock, basicChargePlans);

    expect(basicChargeRepositoryMock.upsertBasicChargePlan.calledOnce).to.be.true;
    expect(basicChargeRepositoryMock.upsertBasicChargePlan.calledWith(workUnitCtxMock, basicChargePlans)).to.be.true;
  });

  it('should handle null unitCode', async () => {
    basicChargePlans = [
      {
        plantCode: 'P1',
        unitCode: null,
        fiscalYear: 2023,
        operationInput: 100,
        maintenanceInput: 50,
        userId: 'user1',
      },
    ];

    basicChargeRepositoryMock.upsertBasicChargePlan.resolves();

    await upsertBasicChargePlanUsecase(basicChargeRepositoryMock, workUnitCtxMock, basicChargePlans);

    expect(basicChargeRepositoryMock.upsertBasicChargePlan.calledOnce).to.be.true;
    expect(basicChargeRepositoryMock.upsertBasicChargePlan.calledWith(workUnitCtxMock, basicChargePlans)).to.be.true;
  });

  it('should handle null fiscalYear', async () => {
    basicChargePlans = [
      {
        plantCode: 'P1',
        unitCode: 'U1',
        fiscalYear: null,
        operationInput: 100,
        maintenanceInput: 50,
        userId: 'user1',
      },
    ];

    basicChargeRepositoryMock.upsertBasicChargePlan.resolves();

    await upsertBasicChargePlanUsecase(basicChargeRepositoryMock, workUnitCtxMock, basicChargePlans);

    expect(basicChargeRepositoryMock.upsertBasicChargePlan.calledOnce).to.be.true;
    expect(basicChargeRepositoryMock.upsertBasicChargePlan.calledWith(workUnitCtxMock, basicChargePlans)).to.be.true;
  });

  it('should handle null operationInput', async () => {
    basicChargePlans = [
      {
        plantCode: 'P1',
        unitCode: 'U1',
        fiscalYear: 2023,
        operationInput: null,
        maintenanceInput: 50,
        userId: 'user1',
      },
    ];

    basicChargeRepositoryMock.upsertBasicChargePlan.resolves();

    await upsertBasicChargePlanUsecase(basicChargeRepositoryMock, workUnitCtxMock, basicChargePlans);

    expect(basicChargeRepositoryMock.upsertBasicChargePlan.calledOnce).to.be.true;
    expect(basicChargeRepositoryMock.upsertBasicChargePlan.calledWith(workUnitCtxMock, basicChargePlans)).to.be.true;
  });

  it('should handle null maintenanceInput', async () => {
    basicChargePlans = [
      {
        plantCode: 'P1',
        unitCode: 'U1',
        fiscalYear: 2023,
        operationInput: 100,
        maintenanceInput: null,
        userId: 'user1',
      },
    ];

    basicChargeRepositoryMock.upsertBasicChargePlan.resolves();

    await upsertBasicChargePlanUsecase(basicChargeRepositoryMock, workUnitCtxMock, basicChargePlans);

    expect(basicChargeRepositoryMock.upsertBasicChargePlan.calledOnce).to.be.true;
    expect(basicChargeRepositoryMock.upsertBasicChargePlan.calledWith(workUnitCtxMock, basicChargePlans)).to.be.true;
  });
});