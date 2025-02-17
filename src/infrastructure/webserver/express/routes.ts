// Initially copied from ToT-BE, commit 545c1dd02ed8df920e315645df162212e80b2a03
// Imported from DPM-BE, commit d0e2f45544cc9890762f93cf3e8f224f15efd619
import express from "express"
import { apiDocs } from "./apiDocs.js"
import { UserRoutes } from "../../../interface/routes/tot/v1/user.js"
import { RoutineTaskTemplate } from "../../../interface/routes/tot/v1/RoutineTaskTemplate.js"
import { Designation } from "../../../interface/routes/tot/v1/designation.js"
import { TaskRoutes } from "../../../interface/routes/tot/v1/tasks.js"
import { AssetRoutes } from "../../../interface/routes/tot/v1/assets.js"
import { EventTypeRoutes } from "../../../interface/routes/tot/v1/eventType.js"
import { TaskTypeRoutes } from "../../../interface/routes/tot/v1/taskType.js"
import { TaskCategoryRoutes } from "../../../interface/routes/tot/v1/taskCategory.js"
import { SapTaskCategory } from "../../../interface/routes/tot/v1/sapTaskCategory.js"
import { Operation } from "../../../interface/routes/tot/v1/operation.js"
import { NotificationRoutes } from "../../../interface/routes/tot/v1/notifications.js"
import { PowerPlantRoutes } from "../../../interface/routes/tot/v1/powerplant.js"
import {
  createAvailabilityRouter,
  createBasicChargeRouter,
  createBasicProfitRouter,
  createEBITDA,
  createGenerationOutputMarket,
  createGenerationOutputPPA,
  createGenerationOutput,
  createGrossMarginMarketRouter,
  createGrossMarginPPARouter,
  createGrossMarginRouter,
  createHeatRateRouter,
  createKPI004Router,
  createKPI005Router,
  createNegativeSpreads,
  createNegativeSpreadsHours,
  createOPEXRouter,
  createOperationCostRouter,
  createSalesRouter,
  createSalesUnitPriceRouter,
  createScreenKPI002Router,
  createSpreadMarketRouter,
  createSpreadPPARouter,
  createStoppageRouter,
  createSpreadRouter,
  cerateUnitStartupModes,
  createStartStopCosts,
  createStartStopCounts,
  createThermalEfficiencyRouter,
  createMaintenanceCostRouter,
} from "./dpm/routes.js"
import { GenerationOutputRoutes } from "./generationOutputRoutes.js"
import { thermalEfficiencyRoutes } from "../../../interface/routes/dpm/thermalEfficiency.js"
import { grossMarginRoutes } from "../../../interface/routes/dpm/grossMargin.js"
import { OpexRoutes } from "./opexRoutes.js"
import { BasicChargeRoutes } from "./basicChargeRoutes.js"
import { ebitdaRoutes } from "../../../interface/routes/dpm/ebitda.js"
import { netPresentValueRoutes } from "../../../interface/routes/dpm/netPresentValue.js"
import { FuelPriceRoutes } from "./fuelPriceRoutes.js"
import { lifeCycleCostRoutes } from "../../../interface/routes/dpm/lifCycleCost.js"
import { HeatrateRoutes } from "./heatRateRoutes.js"
export const createRouter = (): express.Router => {
  const router = express.Router()

  router.get("/status", (_req, res) => {
    res.status(200).end()
  })

  apiDocs(router)
  UserRoutes(router)
  RoutineTaskTemplate(router)
  Designation(router)
  TaskRoutes(router)
  AssetRoutes(router)
  TaskTypeRoutes(router)
  EventTypeRoutes(router)
  TaskCategoryRoutes(router)
  SapTaskCategory(router)
  Operation(router)
  NotificationRoutes(router)
  PowerPlantRoutes(router)
  GenerationOutputRoutes(router)
  OpexRoutes(router)
  // #region DPM
  createAvailabilityRouter(router)
  createScreenKPI002Router(router)
  createStoppageRouter(router)
  createSalesRouter(router)
  createSalesUnitPriceRouter(router)
  createKPI005Router(router)
  createOPEXRouter(router)
  createSpreadRouter(router)
  createSpreadMarketRouter(router)
  createBasicProfitRouter(router)
  createNegativeSpreads(router)
  createNegativeSpreadsHours(router)
  createSpreadPPARouter(router)
  createKPI004Router(router)
  createEBITDA(router)
  ebitdaRoutes(router)
  createOperationCostRouter(router)
  createGenerationOutputMarket(router)
  createGenerationOutputPPA(router)
  createGenerationOutput(router)
  createGrossMarginMarketRouter(router)
  createGrossMarginPPARouter(router)
  createGrossMarginRouter(router)
  grossMarginRoutes(router)
  createHeatRateRouter(router)
  HeatrateRoutes(router)
  createBasicChargeRouter(router)
  cerateUnitStartupModes(router)
  createStartStopCosts(router)
  createStartStopCounts(router)
  createThermalEfficiencyRouter(router)
  thermalEfficiencyRoutes(router)
  createMaintenanceCostRouter(router)
  BasicChargeRoutes(router)
  netPresentValueRoutes(router)
  lifeCycleCostRoutes(router)
  FuelPriceRoutes(router)
  // #endregion DPM
  return router
}
