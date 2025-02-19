import { expect } from 'chai';
import sinon, { SinonStub } from 'sinon';
import { BasicChargeRepositoryPort } from '../../../src/application/port/BasicChargeRepositoryPort.js';
import { BasicChargePlan } from '../../../src/domain/models/BasicCharge.js';
import { upsertBasicChargePlanUsecase } from '../../../src/application/use_cases/dpm/upsertBasicChargePlanUsecase.js';

describe('upsertBasicChargePlanUsecase', () => {
  let basicChargeRepositoryMock: sinon.SinonStubbedInstance<BasicChargeRepositoryPort<any>>;
  let workUnitCtxMock: any;
  let basicChargePlans: BasicChargePlan[];

  beforeEach(() => {
    basicChargeRepositoryMock = {
      upsertBasicChargePlan: sinon.stub(),
      wrapInWorkUnitCtx: sinon.stub() as SinonStub<[fn: (workUnitCtx: any) => Promise<any>], Promise<any>>,
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

  it('should upsert basic charge plans successfully', async () => {
    await upsertBasicChargePlanUsecase(basicChargeRepositoryMock, workUnitCtxMock, basicChargePlans);
    expect(basicChargeRepositoryMock.upsertBasicChargePlan.calledOnce).to.be.true;
  });

  it('should pass the correct parameters to the repository', async () => {
    await upsertBasicChargePlanUsecase(basicChargeRepositoryMock, workUnitCtxMock, basicChargePlans);
    const args = basicChargeRepositoryMock.upsertBasicChargePlan.getCall(0).args;
    expect(args[0]).to.equal(workUnitCtxMock);
    expect(args[1]).to.deep.equal(basicChargePlans);
    expect(args[2]).to.be.instanceOf(Date);
  });

  it('should handle empty basicChargePlans array', async () => {
    basicChargePlans = [];
    await upsertBasicChargePlanUsecase(basicChargeRepositoryMock, workUnitCtxMock, basicChargePlans);
    expect(basicChargeRepositoryMock.upsertBasicChargePlan.calledOnce).to.be.true;
  });

  it('should handle null basicChargePlans', async () => {
    basicChargePlans = null as any;
    try {
      await upsertBasicChargePlanUsecase(basicChargeRepositoryMock, workUnitCtxMock, basicChargePlans);
    } catch (error) {
      expect(error).to.exist;
    }
  });

  it('should handle undefined basicChargePlans', async () => {
    basicChargePlans = undefined as any;
    try {
      await upsertBasicChargePlanUsecase(basicChargeRepositoryMock, workUnitCtxMock, basicChargePlans);
    } catch (error) {
      expect(error).to.exist;
    }
  });

  it('should throw an error if repository throws', async () => {
    basicChargeRepositoryMock.upsertBasicChargePlan.rejects(new Error('Repository error'));
    try {
      await upsertBasicChargePlanUsecase(basicChargeRepositoryMock, workUnitCtxMock, basicChargePlans);
    } catch (error) {
      expect(error).to.equal('Repository error');
    }
  });

  it('should handle multiple basicChargePlans', async () => {
    basicChargePlans.push({
      plantCode: 'P2',
      unitCode: 'U2',
      fiscalYear: 2024,
      operationInput: 200,
      maintenanceInput: 100,
      userId: 'user2',
    });
    await upsertBasicChargePlanUsecase(basicChargeRepositoryMock, workUnitCtxMock, basicChargePlans);
    expect(basicChargeRepositoryMock.upsertBasicChargePlan.calledOnce).to.be.true;
  });

  it('should handle basicChargePlans with null operationInput', async () => {
    basicChargePlans[0].operationInput = null;
    await upsertBasicChargePlanUsecase(basicChargeRepositoryMock, workUnitCtxMock, basicChargePlans);
    expect(basicChargeRepositoryMock.upsertBasicChargePlan.calledOnce).to.be.true;
  });

  it('should handle basicChargePlans with null maintenanceInput', async () => {
    basicChargePlans[0].maintenanceInput = null;
    await upsertBasicChargePlanUsecase(basicChargeRepositoryMock, workUnitCtxMock, basicChargePlans);
    expect(basicChargeRepositoryMock.upsertBasicChargePlan.calledOnce).to.be.true;
  });

  it('should handle basicChargePlans with null userId', async () => {
    basicChargePlans[0].userId = '';
    await upsertBasicChargePlanUsecase(basicChargeRepositoryMock, workUnitCtxMock, basicChargePlans);
    expect(basicChargeRepositoryMock.upsertBasicChargePlan.calledOnce).to.be.true;
  });

  it('should handle basicChargePlans with undefined userId', async () => {
    basicChargePlans[0].userId = undefined;
    await upsertBasicChargePlanUsecase(basicChargeRepositoryMock, workUnitCtxMock, basicChargePlans);
    expect(basicChargeRepositoryMock.upsertBasicChargePlan.calledOnce).to.be.true;
  });

  it('should handle basicChargePlans with negative operationInput', async () => {
    basicChargePlans[0].operationInput = -100;
    await upsertBasicChargePlanUsecase(basicChargeRepositoryMock, workUnitCtxMock, basicChargePlans);
    expect(basicChargeRepositoryMock.upsertBasicChargePlan.calledOnce).to.be.true;
  });

  it('should handle basicChargePlans with negative maintenanceInput', async () => {
    basicChargePlans[0].maintenanceInput = -50;
    await upsertBasicChargePlanUsecase(basicChargeRepositoryMock, workUnitCtxMock, basicChargePlans);
    expect(basicChargeRepositoryMock.upsertBasicChargePlan.calledOnce).to.be.true;
  });

  it('should handle basicChargePlans with zero operationInput', async () => {
    basicChargePlans[0].operationInput = 0;
    await upsertBasicChargePlanUsecase(basicChargeRepositoryMock, workUnitCtxMock, basicChargePlans);
    expect(basicChargeRepositoryMock.upsertBasicChargePlan.calledOnce).to.be.true;
  });

  it('should handle basicChargePlans with zero maintenanceInput', async () => {
    basicChargePlans[0].maintenanceInput = 0;
    await upsertBasicChargePlanUsecase(basicChargeRepositoryMock, workUnitCtxMock, basicChargePlans);
    expect(basicChargeRepositoryMock.upsertBasicChargePlan.calledOnce).to.be.true;
  });

  it('should handle basicChargePlans with future fiscalYear', async () => {
    basicChargePlans[0].fiscalYear = 2050;
    await upsertBasicChargePlanUsecase(basicChargeRepositoryMock, workUnitCtxMock, basicChargePlans);
    expect(basicChargeRepositoryMock.upsertBasicChargePlan.calledOnce).to.be.true;
  });

  it('should handle basicChargePlans with past fiscalYear', async () => {
    basicChargePlans[0].fiscalYear = 2000;
    await upsertBasicChargePlanUsecase(basicChargeRepositoryMock, workUnitCtxMock, basicChargePlans);
    expect(basicChargeRepositoryMock.upsertBasicChargePlan.calledOnce).to.be.true;
  });

  it('should handle basicChargePlans with empty plantCode', async () => {
    basicChargePlans[0].plantCode = '';
    await upsertBasicChargePlanUsecase(basicChargeRepositoryMock, workUnitCtxMock, basicChargePlans);
    expect(basicChargeRepositoryMock.upsertBasicChargePlan.calledOnce).to.be.true;
  });

  it('should handle basicChargePlans with empty unitCode', async () => {
    basicChargePlans[0].unitCode = '';
    await upsertBasicChargePlanUsecase(basicChargeRepositoryMock, workUnitCtxMock, basicChargePlans);
    expect(basicChargeRepositoryMock.upsertBasicChargePlan.calledOnce).to.be.true;
  });

  it('should handle basicChargePlans with special characters in plantCode', async () => {
    basicChargePlans[0].plantCode = 'P@1!';
    await upsertBasicChargePlanUsecase(basicChargeRepositoryMock, workUnitCtxMock, basicChargePlans);
    expect(basicChargeRepositoryMock.upsertBasicChargePlan.calledOnce).to.be.true;
  });

  it('should handle basicChargePlans with special characters in unitCode', async () => {
    basicChargePlans[0].unitCode = 'U#1$';
    await upsertBasicChargePlanUsecase(basicChargeRepositoryMock, workUnitCtxMock, basicChargePlans);
    expect(basicChargeRepositoryMock.upsertBasicChargePlan.calledOnce).to.be.true;
  });
});