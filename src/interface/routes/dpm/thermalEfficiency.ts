import Express from "express"
import { validation } from "./util.js"
import {
  getThermalEfficiencyForecastRequestDecoder,
  putThermalEfficiencyForecastRequestDecoder,
} from "../../../domain/entities/dpm/decoders/thermalEfficiencyForecastDecoder.js"
import {
  consolidateGetThermalEfficiencyForecastRequest,
  getThermalEfficiencyForecastController,
} from "../../controllers/dpm/KPI003/getThermalEfficiencyForecastController.js"
import {
  consolidatePutThermalEfficiencyForecastRequest,
  putThermalEfficiencyForecastController,
} from "../../controllers/dpm/KPI003/putThermalEfficiencyForecastController.js"
import {
  consolidateGetThermalEfficiencyForecastSummaryRequest,
  getThermalEfficiencyForecastSummaryController,
} from "../../controllers/dpm/KPI003/getThermalEfficiencyForecastSummaryController.js"
import { getThermalEfficiencyForecastSummaryRequestDecoder } from "../../../domain/entities/dpm/decoders/thermalEfficiencyForecastSummaryDecoder.js"
import { getThermalEfficiencyPlanSummaryRequestDecoder } from "../../../domain/entities/dpm/decoders/thermalEfficiencyPlanSummaryDecoder.js"
import {
  consolidateGetThermalEfficiencyPlanSummaryRequest,
  getThermalEfficiencyPlanSummaryController,
} from "../../controllers/dpm/KPI003/getThermalEfficiencyPlanSummaryController.js"

const route = Express.Router()

export const thermalEfficiencyRoutes = (router: Express.Router) => {
  router.use("/thermal-efficiency", route)

  route.get(
    "/forecast",
    validation(consolidateGetThermalEfficiencyForecastRequest)(getThermalEfficiencyForecastRequestDecoder),
    getThermalEfficiencyForecastController,
  )

  route.put(
    "/forecast",
    validation(consolidatePutThermalEfficiencyForecastRequest)(putThermalEfficiencyForecastRequestDecoder),
    putThermalEfficiencyForecastController,
  )

  route.get(
    "/forecast/summary",
    validation(consolidateGetThermalEfficiencyForecastSummaryRequest)(
      getThermalEfficiencyForecastSummaryRequestDecoder,
    ),
    getThermalEfficiencyForecastSummaryController,
  )

  route.get(
    "/plan/summary",
    validation(consolidateGetThermalEfficiencyPlanSummaryRequest)(getThermalEfficiencyPlanSummaryRequestDecoder),
    getThermalEfficiencyPlanSummaryController,
  )
}
