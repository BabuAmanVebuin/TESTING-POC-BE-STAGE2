// Imported from DPM-BE, commit d0e2f45544cc9890762f93cf3e8f224f15efd619
import express from "express"
import { getAvailability } from "../../../../interface/routes/dpm/getAvailability.js"
import { getKPI002 } from "../../../../interface/routes/dpm/getKPI002.js"
import { getStoppageData } from "../../../../interface/routes/dpm/stoppageData.js"
import { getSales } from "../../../../interface/routes/dpm/getSales.js"
import { getKPI005Data } from "../../../../interface/routes/dpm/getKPI005.js"
import { getOPEX } from "../../../../interface/routes/dpm/getOPEX.js"
import { getSpread } from "../../../../interface/routes/dpm/getSpread.js"
import { getSpreadMarket } from "../../../../interface/routes/dpm/getSpreadMarket.js"
import { getBasicProfit } from "../../../../interface/routes/dpm/getBasicProfit.js"
import { getNegativeSpreads } from "../../../../interface/routes/dpm/getNegativeSpreads.js"
import { getNegativeSpreadHours } from "../../../../interface/routes/dpm/getNegativeSpreadHours.js"
import { getSpreadPPA } from "../../../../interface/routes/dpm/getSpreadPPA.js"
import { getKPI004Data } from "../../../../interface/routes/dpm/getKPI004.js"
import { getEBITDA } from "../../../../interface/routes/dpm/getEBITDA.js"
import { getEBITDAEstimates } from "../../../../interface/routes/dpm/getEBITDAEstimates.js"
import { getSalesUnitPrice } from "../../../../interface/routes/dpm/getSalesUnitPrice.js"
import { getOperationCost } from "../../../../interface/routes/dpm/getOperationCost.js"
import { getGenerationOutputMarket } from "../../../../interface/routes/dpm/getGenerationOutputMarket.js"
import { getGenerationOutputPPA } from "../../../../interface/routes/dpm/getGenerationOutputPPA.js"
import { getGenerationOutput } from "../../../../interface/routes/dpm/getGenerationOutput.js"
import { getGenerationOutputEstimates } from "../../../../interface/routes/dpm/getGenerationOutputEstimates.js"
import { getGrossMarginMarket } from "../../../../interface/routes/dpm/getGrossMarginMarket.js"
import { getGrossMarginPPA } from "../../../../interface/routes/dpm/getGrossMarginPPA.js"
import { getGrossMargin } from "../../../../interface/routes/dpm/getGrossMargin.js"
import { getHeatRate } from "../../../../interface/routes/dpm/getHeatRate.js"
import { getBasicCharge } from "../../../../interface/routes/dpm/getBasicCharge.js"
import { getUnitStartupModes } from "../../../../interface/routes/dpm/getUnitStartupModes.js"
import { getStartStopCosts } from "../../../../interface/routes/dpm/getStartStopCosts.js"
import { getStartStopCounts } from "../../../../interface/routes/dpm/getStartStopCounts.js"
import { getThermalEfficiency } from "../../../../interface/routes/dpm/getThermalEfficiency.js"
import { getMaintenanceCost } from "../../../../interface/routes/dpm/getMaintenanceCost.js"

export const createAvailabilityRouter = (router: express.Router): express.Router => {
  const route = express.Router()
  router.use("/availability", route)
  getAvailability(route)
  return router
}

export const createScreenKPI002Router = (router: express.Router): express.Router => {
  const route = express.Router()
  router.use("/screenkpi002", route)
  getKPI002(route)
  return router
}

export const createStoppageRouter = (router: express.Router): express.Router => {
  const route = express.Router()
  router.use("/stoppages", route)
  getStoppageData(route)
  return router
}

export const createSalesRouter = (router: express.Router): express.Router => {
  const route = express.Router()
  router.use("/sales", route)
  getSales(route)
  return router
}

export const createSalesUnitPriceRouter = (router: express.Router): express.Router => {
  const route = express.Router()
  router.use("/sales-unit-price", route)
  getSalesUnitPrice(route)
  return router
}

export const createKPI005Router = (router: express.Router): express.Router => {
  const route = express.Router()
  router.use("/kpi005", route)
  getKPI005Data(route)
  return router
}

export const createOPEXRouter = (router: express.Router): express.Router => {
  const route = express.Router()
  router.use("/opex", route)
  getOPEX(route)
  return router
}

export const createSpreadRouter = (router: express.Router): express.Router => {
  const route = express.Router()
  router.use("/spread", route)
  getSpread(route)
  return router
}

export const createSpreadMarketRouter = (router: express.Router): express.Router => {
  const route = express.Router()
  router.use("/spread-market", route)
  getSpreadMarket(route)
  return router
}

export const createBasicProfitRouter = (router: express.Router): express.Router => {
  const route = express.Router()
  router.use("/basicprofit", route)
  getBasicProfit(route)
  return router
}

export const createNegativeSpreads = (router: express.Router): express.Router => {
  const route = express.Router()
  router.use("/negative-spreads", route)
  getNegativeSpreads(route)
  return router
}

export const createNegativeSpreadsHours = (router: express.Router): express.Router => {
  const route = express.Router()
  router.use("/negative-spread-hours", route)
  getNegativeSpreadHours(route)
  return router
}
export const createSpreadPPARouter = (router: express.Router): express.Router => {
  const route = express.Router()
  router.use("/spread-ppa", route)
  getSpreadPPA(route)
  return router
}

export const createKPI004Router = (router: express.Router): express.Router => {
  const route = express.Router()
  router.use("/kpi004", route)
  getKPI004Data(route)
  return router
}

export const createEBITDA = (router: express.Router): express.Router => {
  const route = express.Router()
  router.use("/ebitda", route)
  getEBITDA(route)
  getEBITDAEstimates(route)
  return router
}
export const createOperationCostRouter = (router: express.Router): express.Router => {
  const route = express.Router()
  router.use("/operation-cost", route)
  getOperationCost(route)
  return router
}

export const createGenerationOutputMarket = (router: express.Router): express.Router => {
  const route = express.Router()
  router.use("/generation-output-market", route)
  getGenerationOutputMarket(route)
  return router
}

export const createGenerationOutputPPA = (router: express.Router): express.Router => {
  const route = express.Router()
  router.use("/generation-output-ppa", route)
  getGenerationOutputPPA(route)
  return router
}

export const createGenerationOutput = (router: express.Router): express.Router => {
  const route = express.Router()
  router.use("/generation-output", route)
  getGenerationOutput(route)
  getGenerationOutputEstimates(route)
  return router
}

export const createGrossMarginMarketRouter = (router: express.Router): express.Router => {
  const route = express.Router()
  router.use("/grossmargin-market", route)
  getGrossMarginMarket(route)
  return router
}

export const createGrossMarginPPARouter = (router: express.Router): express.Router => {
  const route = express.Router()
  router.use("/grossmargin-ppa", route)
  getGrossMarginPPA(route)
  return router
}

export const createGrossMarginRouter = (router: express.Router): express.Router => {
  const route = express.Router()
  router.use("/grossmargin", route)
  getGrossMargin(route)
  return router
}

export const createHeatRateRouter = (router: express.Router): express.Router => {
  const route = express.Router()
  router.use("/heatrate", route)
  getHeatRate(route)
  return router
}

export const createBasicChargeRouter = (router: express.Router): express.Router => {
  const route = express.Router()
  router.use("/basic-charge", route)
  getBasicCharge(route)
  return router
}

export const cerateUnitStartupModes = (router: express.Router): express.Router => {
  const route = express.Router()
  router.use("/unit-startup-modes", route)
  getUnitStartupModes(route)
  return router
}

export const createStartStopCosts = (router: express.Router): express.Router => {
  const route = express.Router()
  router.use("/start-stop-costs", route)
  getStartStopCosts(route)
  return router
}

export const createStartStopCounts = (router: express.Router): express.Router => {
  const route = express.Router()
  router.use("/start-stop-counts", route)
  getStartStopCounts(route)
  return router
}

export const createThermalEfficiencyRouter = (router: express.Router): express.Router => {
  const route = express.Router()
  router.use("/thermal-efficiency", route)
  getThermalEfficiency(route)
  return router
}

export const createMaintenanceCostRouter = (router: express.Router): express.Router => {
  const route = express.Router()
  router.use("/maintenance-cost", route)
  getMaintenanceCost(route)
  return router
}
