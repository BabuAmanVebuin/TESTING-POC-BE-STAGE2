import Express from "express"
import { validation } from "./util.js"
import { getGrossMarginForecastRequestDecoder } from "../../../domain/entities/dpm/decoders/grossMarginForecast.js"
import {
  consolidateGetGrossMarginForecastRequest,
  getGrossMarginForecastController,
} from "../../controllers/dpm/KPI003/getGrossMarginForecastController.js"
import { getGrossMarginForecastSummaryRequestDecoder } from "../../../domain/entities/dpm/decoders/grossMarginForecastSummary.js"
import {
  consolidateGetGrossMarginForecastSummaryRequest,
  getGrossMarginForecastSummaryController,
} from "../../controllers/dpm/KPI003/getGrossMarginForecastSummaryController.js"
import { getGrossMarginSummaryRequestDecoder } from "../../../domain/entities/dpm/decoders/grossMarginSummary.js"
import {
  consolidateGetGrossMarginSummaryRequest,
  getGrossMarginSummaryController,
} from "../../controllers/dpm/KPI003/getGrossMarginSummaryController.js"

const route = Express.Router()

export const grossMarginRoutes = (router: Express.Router) => {
  router.use("/grossmargin", route)

  route.get(
    "/forecast",
    validation(consolidateGetGrossMarginForecastRequest)(getGrossMarginForecastRequestDecoder),
    getGrossMarginForecastController,
  )

  route.get(
    "/forecast/summary",
    validation(consolidateGetGrossMarginForecastSummaryRequest)(getGrossMarginForecastSummaryRequestDecoder),
    getGrossMarginForecastSummaryController,
  )

  route.get(
    "/summary",
    validation(consolidateGetGrossMarginSummaryRequest)(getGrossMarginSummaryRequestDecoder),
    getGrossMarginSummaryController,
  )
}
