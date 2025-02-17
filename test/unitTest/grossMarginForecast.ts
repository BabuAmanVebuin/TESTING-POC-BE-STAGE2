import { expect } from "chai"

import { Transaction } from "sequelize"
import {
  startTransaction,
  startTransactionCmn,
  closeTransactionCmn,
  closeTransaction,
  insertFixtureCmn,
} from "../integration/sequelize/index.js"
import {
  calculateTruncedGrossMarginTestFn,
  getFluelUnitCalorificValueMasterTestFn,
  getPPAThermalEfficiencyMasterTestFn,
} from "../../src/interface/controllers/dpm/KPI003/helper/businessPlan/grossMarginHelper.js"
import {
  ppaMaster,
  fuelUnitMaster,
  thermalEfficiency,
  generationOutput,
  result,
  fuelPrice,
} from "./testData/grossMarginForecast.js"
import { getGrossMarginForecastRequest } from "../../src/domain/entities/dpm/grossMarginForecast.js"
import { calcTestFn } from "../../src/interface/controllers/dpm/KPI003/helper/businessPlan/thermalEfficiencyHelper.js"
import {
  currentFiscalYearSfData,
  unitList,
  stoppageList,
  recoveryMaster,
  decreaseMaster,
} from "./testData/thermalEfficiencyForecast.js"
import { getTransactionCmn } from "../../src/infrastructure/orm/sqlize/index.js"

const testFn = calculateTruncedGrossMarginTestFn
const thermalEfficiencyTestFn = calcTestFn
const ppaMasterFn = getPPAThermalEfficiencyMasterTestFn
const fuelUnitMasterFn = getFluelUnitCalorificValueMasterTestFn

const testPPAMaster = ppaMaster
const testFuelUnitMaster = fuelUnitMaster
const testThermalEfficiency = thermalEfficiency
const testGenerationOutput = generationOutput
const testFuelPrice = fuelPrice
const testResult = result

const testCurrentData = currentFiscalYearSfData
const testUnitList = unitList
const testStoppageList = stoppageList
const testRecoveryMaster = recoveryMaster
const testDecreaseMaster = decreaseMaster

type requestType = getGrossMarginForecastRequest
// type recoveryMasterType = Record<string, recoveryType>

const beforeHookFixtures = async (
  cmnTransaction: Transaction,

  _transaction: Transaction,
) => insertFixtureCmn("insertGrossMarginMaster.sql", cmnTransaction)

describe("gross margin forecast", () => {
  before(async () =>
    startTransaction((transaction) =>
      startTransactionCmn(async (cmnTransaction) => await beforeHookFixtures(cmnTransaction, transaction)),
    ),
  )

  after(async () => {
    await closeTransactionCmn()
    await closeTransaction()
  })

  it("calculate gross margin forecast", async () => {
    const input: requestType = {
      "plant-id": "HE_",
      "unit-id": "HE_A100",
    }
    let res = await testFn(
      input["plant-id"],
      [input["unit-id"]],
      testGenerationOutput,
      testFuelPrice,
      [2024, 2025, 2026, 2027, 2028, 2029, 2030, 2031, 2032, 2033],
      testThermalEfficiency,
      testPPAMaster,
      testFuelUnitMaster,
    )

    expect(res).to.eql(testResult.filter((x) => x["unit-id"] === input["unit-id"]))

    input["unit-id"] = "HE_A200"
    res = await testFn(
      input["plant-id"],
      [input["unit-id"]],
      testGenerationOutput,
      testFuelPrice,
      [2024, 2025, 2026, 2027, 2028, 2029, 2030, 2031, 2032, 2033],
      testThermalEfficiency,
      testPPAMaster,
      testFuelUnitMaster,
    )

    expect(res).to.eql(testResult.filter((x) => x["unit-id"] === input["unit-id"]))

    input["unit-id"] = "HE_A300"
    res = await testFn(
      input["plant-id"],
      [input["unit-id"]],
      testGenerationOutput,
      testFuelPrice,
      [2024, 2025, 2026, 2027, 2028, 2029, 2030, 2031, 2032, 2033],
      testThermalEfficiency,
      testPPAMaster,
      testFuelUnitMaster,
    )

    expect(res).to.eql(testResult.filter((x) => x["unit-id"] === input["unit-id"]))
  })

  it("calculate gross margin forecast: there are null data", async () => {
    const input: requestType = {
      "plant-id": "HE_",
      "unit-id": "HE_A100",
    }

    testGenerationOutput["HE_A100:2028"].sum = null as unknown as number
    let res = await testFn(
      input["plant-id"],
      [input["unit-id"]],
      testGenerationOutput,
      testFuelPrice,
      [2024, 2025, 2026, 2027, 2028, 2029, 2030, 2031, 2032, 2033],
      testThermalEfficiency,
      testPPAMaster,
      testFuelUnitMaster,
    )

    expect(Math.max(...res.map((x) => x["fiscal-year"]))).to.eql(2027)
    testFuelPrice["HE_:2026"].value = null
    res = await testFn(
      input["plant-id"],
      [input["unit-id"]],
      testGenerationOutput,
      testFuelPrice,
      [2024, 2025, 2026, 2027, 2028, 2029, 2030, 2031, 2032, 2033],
      testThermalEfficiency,
      testPPAMaster,
      testFuelUnitMaster,
    )

    expect(Math.max(...res.map((x) => x["fiscal-year"]))).to.eql(2025)
  })

  it("calculate thermal efficiency forecast to calculate gross margin", () => {
    const res = thermalEfficiencyTestFn(
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

    expect(res).to.eql(Object.values(testThermalEfficiency))
  })

  it("formatted master data", async () => {
    const cmnTransaction = getTransactionCmn()
    const input: requestType = {
      "plant-id": "HE_",
      "unit-id": "HE_A100",
    }

    const ppaMaster = await ppaMasterFn(input, cmnTransaction)
    const fuelUnitMaster = await fuelUnitMasterFn(input, cmnTransaction)

    expect(ppaMaster[input["unit-id"]]).to.eql(testPPAMaster[input["unit-id"]])
    expect(fuelUnitMaster[input["unit-id"]]).to.eql(testFuelUnitMaster[input["unit-id"]])
  })
})
