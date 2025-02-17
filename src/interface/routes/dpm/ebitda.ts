import Express from "express"
import { validation } from "./util.js"
import { getEbitdaForecastRequestDecoder } from "../../../domain/entities/dpm/decoders/ebitdaForecastDecoder.js"
import {
  consolidateGetEbitdaForecastRequest,
  getEbitdaForecastController,
} from "../../controllers/dpm/KPI003/getEBITDAForecastController.js"
import { getEbitdaPlanRequestDecoder } from "../../../domain/entities/dpm/decoders/ebitdaPlanDecoder.js"
import {
  consolidateGetEbitdaPlanRequest,
  getEbitdaPlanController,
} from "../../controllers/dpm/KPI003/getEBITDAPlanController.js"
import { getEbitdaForecastSummaryRequestDecoder } from "../../../domain/entities/dpm/decoders/ebitdaForecastSummaryDecoder.js"
import {
  consolidateGetEbitdaForecastSummaryRequest,
  getEbitdaForecastSummaryController,
} from "../../controllers/dpm/KPI003/getEBITDAForecastSummaryController.js"
import { getEbitdaPlanSummaryRequestDecoder } from "../../../domain/entities/dpm/decoders/ebitdaPlanDecoderSummary.js"
import {
  consolidateGetEbitdaPlanSummaryRequest,
  getEbitdaPlanSummaryController,
} from "../../controllers/dpm/KPI003/getEBITDAPlanSummaryController.js"
import {
  consolidateGetEbitdaSummaryRequest,
  getEbitdaSummaryController,
} from "../../controllers/dpm/KPI003/getEBITDASummaryController.js"
import { getEbitdaSummaryRequestDecoder } from "../../../domain/entities/dpm/decoders/getEbitdaSummaryDecoder.js"

const route = Express.Router()

export const ebitdaRoutes = (router: Express.Router) => {
  router.use("/ebitda", route)

  route.get(
    "/summary",
    validation(consolidateGetEbitdaSummaryRequest)(getEbitdaSummaryRequestDecoder),
    getEbitdaSummaryController,
  )

  route.get(
    "/forecast",
    validation(consolidateGetEbitdaForecastRequest)(getEbitdaForecastRequestDecoder),
    getEbitdaForecastController,
  )

  route.get(
    "/forecast/summary",
    validation(consolidateGetEbitdaForecastSummaryRequest)(getEbitdaForecastSummaryRequestDecoder),
    getEbitdaForecastSummaryController,
  )

  route.get("/plan", validation(consolidateGetEbitdaPlanRequest)(getEbitdaPlanRequestDecoder), getEbitdaPlanController)

  route.get(
    "/plan/summary",
    validation(consolidateGetEbitdaPlanSummaryRequest)(getEbitdaPlanSummaryRequestDecoder),
    getEbitdaPlanSummaryController,
  )
}
