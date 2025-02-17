import Express from "express"
import { validation } from "../../../interface/routes/dpm/util.js"
import {
  consolidateGetHeatRateForecastRequest,
  getHeatRateForecastController,
} from "../../../interface/controllers/dpm/KPI003/getHeatRateForecastController.js"
import {
  consolidateGetHeatRatePlanRequest,
  getHeatRatePlanController,
} from "../../../interface/controllers/dpm/KPI003/getHeatRatePlanController.js"
import { getHeatRateForecastRequestDecoder } from "../../../domain/entities/dpm/decoders/heatRateForecastDecoder.js"
import { GenerationOutputRepositorySequelizeMysql } from "../../repositories/dpm/GenerationOutputRepositorySequelizeMySQL.js"
import { getHeatRatePlanSummaryController } from "../../../interface/controllers/dpm/KPI003/getHeatRatePlanSummaryController.js"
import { getHeatRatePlanSummaryRequestDecoder } from "../../../domain/entities/dpm/decoders/heatRatePlanSummaryDecoder.js"
import { getHeatRatePlanRequestDecoder } from "../../../domain/entities/dpm/decoders/heatRatePlanDecoder.js"
import { getHeatRateForecastSummaryRequestDecoder } from "../../../domain/entities/dpm/decoders/heatRateForecastSummaryDecoder.js"
import {
  consolidateGetHeatRateForecastSummaryRequest,
  getHeatRateForecastSummaryController,
} from "../../../interface/controllers/dpm/KPI003/getHeatRateForecastSummaryController.js"
import {
  consolidateGetHeatRateSummaryRequest,
  getHeatRateSummaryController,
} from "../../../interface/controllers/dpm/KPI003/getHeatRateSummaryController.js"
import { getHeatRateSummaryRequestDecoder } from "../../../domain/entities/dpm/decoders/heatRateSummaryDecoder.js"

const route = Express.Router()

export const HeatrateRoutes = (router: Express.Router): void => {
  router.use("/heatrate", route)
  route.get(
    "/summary",
    validation(consolidateGetHeatRateSummaryRequest)(getHeatRateSummaryRequestDecoder),
    getHeatRateSummaryController(GenerationOutputRepositorySequelizeMysql),
  )
  route.get(
    "/forecast",
    validation(consolidateGetHeatRateForecastRequest)(getHeatRateForecastRequestDecoder),
    getHeatRateForecastController,
  )
  route.get(
    "/plan",
    validation(consolidateGetHeatRatePlanRequest)(getHeatRatePlanRequestDecoder),
    getHeatRatePlanController(GenerationOutputRepositorySequelizeMysql),
  )
  route.get(
    "/forecast/summary",
    validation(consolidateGetHeatRateForecastSummaryRequest)(getHeatRateForecastSummaryRequestDecoder),
    getHeatRateForecastSummaryController,
  )
  route.get(
    "/plan/summary",
    validation(consolidateGetHeatRatePlanRequest)(getHeatRatePlanSummaryRequestDecoder),
    getHeatRatePlanSummaryController(GenerationOutputRepositorySequelizeMysql),
  )
}
