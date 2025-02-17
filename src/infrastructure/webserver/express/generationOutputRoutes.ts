import Express from "express"
import {
  consolidateUpsertGenerationOutputPlanRequest,
  upsertGenerationOutputPlanController,
} from "../../../interface/controllers/dpm/KPI003/upsertGenerationOutputPlanController.js"
import { validation } from "../../../interface/routes/dpm/util.js"
import { GenerationOutputRepositorySequelizeMysql } from "../../repositories/dpm/GenerationOutputRepositorySequelizeMySQL.js"
import {
  getGenerationOutputPlanRequestDecoder,
  upsertGenerationOutputPlanRequestDecoder,
} from "../../../domain/entities/dpm/decoders/generationOutputPlanDecoder.js"
import {
  consolidateGetGenerationOutputPlanRequest,
  getGenerationOutputPlanController,
} from "../../../interface/controllers/dpm/KPI003/getGenerationOutputPlanController.js"
import {
  consolidateGetGenerationOutputForecastRequest,
  getGenerationOutputForecastController,
} from "../../../interface/controllers/dpm/KPI003/getGenerationOutputForecastController.js"
import {
  getGenerationOutputForecastRequestDecoder,
  upsertGenerationOutputForecastRequestDecoder,
} from "../../../domain/entities/dpm/decoders/generationOutputForecastDecoder.js"
import {
  consolidateUpsertGenerationOutputForecastRequest,
  upsertGenerationOutputForecastController,
} from "../../../interface/controllers/dpm/KPI003/upsertGenerationOutputForecastController.js"
import { getGenerationOutputForecastSummaryRequestDecoder } from "../../../domain/entities/dpm/decoders/generationOutputForecastSummaryDecoder.js"
import {
  consolidateGetGenerationOutputForecastSummaryRequest,
  getGenerationOutputForecastSummaryController,
} from "../../../interface/controllers/dpm/KPI003/getGenerationOutputForecastSummaryController.js"
import {
  consolidateGetGenerationOutputPlanSummaryRequest,
  getGenerationOutputPlanSummaryController,
} from "../../../interface/controllers/dpm/KPI003/getGenerationOutputPlanSummaryController.js"
import { getGenerationOutputPlanSummaryRequestDecoder } from "../../../domain/entities/dpm/decoders/generationOutputPlanSummaryDecoder.js"
import {
  consolidateGetGenerationOutputSummaryRequest,
  getGenerationOutputSummaryController,
} from "../../../interface/controllers/dpm/KPI003/getGenerationOutputSummaryController.js"
import { getGenerationOutputSummaryRequestDecoder } from "../../../domain/entities/dpm/decoders/generationOutputSummaryDecoder.js"

const route = Express.Router()

export const GenerationOutputRoutes = (router: Express.Router): void => {
  router.use("/generation-output", route)
  route.get(
    "/summary",
    validation(consolidateGetGenerationOutputSummaryRequest)(getGenerationOutputSummaryRequestDecoder),
    getGenerationOutputSummaryController,
  )
  route.put(
    "/plan",
    validation(consolidateUpsertGenerationOutputPlanRequest)(upsertGenerationOutputPlanRequestDecoder),
    upsertGenerationOutputPlanController(GenerationOutputRepositorySequelizeMysql),
  )
  route.get(
    "/plan",
    validation(consolidateGetGenerationOutputPlanRequest)(getGenerationOutputPlanRequestDecoder),
    getGenerationOutputPlanController(GenerationOutputRepositorySequelizeMysql),
  )
  route.get(
    "/plan/summary",
    validation(consolidateGetGenerationOutputPlanSummaryRequest)(getGenerationOutputPlanSummaryRequestDecoder),
    getGenerationOutputPlanSummaryController(GenerationOutputRepositorySequelizeMysql),
  )
  route.get(
    "/forecast",
    validation(consolidateGetGenerationOutputForecastRequest)(getGenerationOutputForecastRequestDecoder),
    getGenerationOutputForecastController,
  )
  route.get(
    "/forecast/summary",
    validation(consolidateGetGenerationOutputForecastSummaryRequest)(getGenerationOutputForecastSummaryRequestDecoder),
    getGenerationOutputForecastSummaryController,
  )
  route.put(
    "/forecast",
    validation(consolidateUpsertGenerationOutputForecastRequest)(upsertGenerationOutputForecastRequestDecoder),
    upsertGenerationOutputForecastController,
  )
}
