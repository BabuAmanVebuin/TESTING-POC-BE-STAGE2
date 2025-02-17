import { expect } from "chai"

import {
  calcAndResTestFn,
  getDecreaseMasterTestFn,
  getRecoveryMasterTestFn,
} from "../../src/interface/controllers/dpm/KPI003/helper/businessPlan/thermalEfficiencyHelper.js"
import {
  currentFiscalYearSfData,
  decreaseMaster,
  recoveryMaster,
  result,
  stoppageList,
  unitList,
} from "./testData/thermalEfficiencyForecast.js"
import { Transaction } from "sequelize"
import {
  startTransaction,
  startTransactionCmn,
  closeTransactionCmn,
  closeTransaction,
  insertFixtureCmn,
} from "../integration/sequelize/index.js"
import { decreaseType, recoveryType } from "../../src/domain/entities/dpm/thermalEfficiencyForecast.js"
import { getTransactionCmn } from "../../src/infrastructure/orm/sqlize/index.js"

const testFn = calcAndResTestFn
const recoveryMasterFn = getRecoveryMasterTestFn
const decreaseMasterFn = getDecreaseMasterTestFn

const testCurrentData = currentFiscalYearSfData
const testUnitList = unitList
const testStoppageList = stoppageList
const testRecoveryMaster = recoveryMaster
const testDecreaseMaster = decreaseMaster
const testResult = result

type decreaseMasterType = Record<string, decreaseType>
type recoveryMasterType = Record<string, recoveryType>

const beforeHookFixtures = async (
  cmnTransaction: Transaction,

  _transaction: Transaction,
) => insertFixtureCmn("insertThermalEfficiencyMaster.sql", cmnTransaction)

describe("thermal efficiency forecast", () => {
  before(async () =>
    startTransaction((transaction) =>
      startTransactionCmn(async (cmnTransaction) => await beforeHookFixtures(cmnTransaction, transaction)),
    ),
  )

  after(async () => {
    await closeTransactionCmn()
    await closeTransaction()
  })

  it("calculate thermal efficiency forecast", () => {
    const res = testFn(
      "HE_",
      2024,
      2033,
      testCurrentData,
      {},
      testUnitList,
      testStoppageList,
      testRecoveryMaster,
      testDecreaseMaster,
    )

    expect(res).to.eql(testResult)
  })

  it("formatted master data", async () => {
    const unitList = ["HE_A100", "HE_A200", "HE_A300"]
    const recoveryMaster: recoveryMasterType = {
      ["HE_A100:FFF"]: {
        "unit-id": "HE_A100",
        "thermal-efficiency-recovery": 0.35,
        "type-of-stoppage-text": "FFF",
      },
      ["HE_A100:MMH"]: {
        "unit-id": "HE_A100",
        "thermal-efficiency-recovery": 0,
        "type-of-stoppage-text": "MMH",
      },
      ["HE_A200:FFF"]: {
        "unit-id": "HE_A200",
        "thermal-efficiency-recovery": 0.35,
        "type-of-stoppage-text": "FFF",
      },
      ["HE_A200:MMH"]: {
        "unit-id": "HE_A200",
        "thermal-efficiency-recovery": 0,
        "type-of-stoppage-text": "MMH",
      },
      ["HE_A300:FFF"]: {
        "unit-id": "HE_A300",
        "thermal-efficiency-recovery": 0.35,
        "type-of-stoppage-text": "FFF",
      },
      ["HE_A300:MMC"]: {
        "unit-id": "HE_A300",
        "thermal-efficiency-recovery": 0.3,
        "type-of-stoppage-text": "MMC",
      },
    }

    const decreaseMaster: decreaseMasterType = {
      ["HE_A100"]: {
        "unit-id": "HE_A100",
        "thermal-efficiency-decrease": 0.17,
      },
      ["HE_A200"]: {
        "unit-id": "HE_A200",
        "thermal-efficiency-decrease": 0.17,
      },
      ["HE_A300"]: {
        "unit-id": "HE_A300",
        "thermal-efficiency-decrease": 0.17,
      },
    }
    const cmnTransaction = getTransactionCmn()

    const recoveryRes = await recoveryMasterFn(unitList, cmnTransaction)
    const decreaseRes = await decreaseMasterFn(unitList, cmnTransaction)

    expect(recoveryRes).to.eql(recoveryMaster)
    expect(decreaseRes).to.eql(decreaseMaster)
  })
})
