import Express from "express"
import { validation } from "../../../interface/routes/dpm/util.js"
import {
  getOpexPlanRequestDecoder,
  upsertOpexPlanRequestDecoder,
} from "../../../domain/entities/dpm/decoders/opexPlanDecoder.js"
import { OpexRepositorySequelizeMysql } from "../../repositories/dpm/OpexRepositorySequelizeMySQL.js"
import {
  consolidateGetOpexPlanRequest,
  getOpexPlanController,
} from "../../../interface/controllers/dpm/KPI003/getOpexPlanController.js"
import {
  consolidateUpsertOpexPlanRequest,
  upsertOpexPlanController,
} from "../../../interface/controllers/dpm/KPI003/upsertOpexPlanController.js"
import {
  consolidateGetOpexForecastRequest,
  getOpexForecastController,
} from "../../../interface/controllers/dpm/KPI003/getOpexForecastController.js"
import {
  getOpexForecastRequestDecoder,
  upsertOpexForecastRequestDecoder,
} from "../../../domain/entities/dpm/decoders/opexForecastDecoder.js"
import {
  consolidateUpsertOpexForecastRequest,
  upsertOpexForecastController,
} from "../../../interface/controllers/dpm/KPI003/upsertOpexForecastController.js"
import {
  consolidateGetOpexForecastSummaryRequest,
  getOpexForecastSummaryController,
} from "../../../interface/controllers/dpm/KPI003/getOpexForecastSummaryController.js"
import { getOpexForecastSummaryRequestDecoder } from "../../../domain/entities/dpm/decoders/opexForecastSummaryDecoder.js"
import {
  consolidateGetOpexPlanSummaryRequest,
  getOpexPlanSummaryController,
} from "../../../interface/controllers/dpm/KPI003/getOpexPlanSummaryController.js"
import { getOpexPlanSummaryRequestDecoder } from "../../../domain/entities/dpm/decoders/opexPlanSummaryDecoder.js"
import {
  consolidateGetOpexSummaryRequest,
  getOpexSummaryController,
} from "../../../interface/controllers/dpm/KPI003/getOpexSummaryController.js"
import { getOpexSummaryRequestDecoder } from "../../../domain/entities/dpm/decoders/opexSummaryDecoder.js"

const route = Express.Router()

export const OpexRoutes = (router: Express.Router): void => {
  router.use("/opex", route)
  route.get(
    "/summary",
    validation(consolidateGetOpexSummaryRequest)(getOpexSummaryRequestDecoder),
    getOpexSummaryController,
  )
  route.get(
    "/plan",
    validation(consolidateGetOpexPlanRequest)(getOpexPlanRequestDecoder),
    getOpexPlanController(OpexRepositorySequelizeMysql),
  )
  route.get(
    "/plan/summary",
    validation(consolidateGetOpexPlanSummaryRequest)(getOpexPlanSummaryRequestDecoder),
    getOpexPlanSummaryController(OpexRepositorySequelizeMysql),
  )
  route.put(
    "/plan",
    validation(consolidateUpsertOpexPlanRequest)(upsertOpexPlanRequestDecoder),
    upsertOpexPlanController(OpexRepositorySequelizeMysql),
  )
  route.get(
    "/forecast",
    validation(consolidateGetOpexForecastRequest)(getOpexForecastRequestDecoder),
    getOpexForecastController,
  )
  route.get(
    "/forecast/summary",
    validation(consolidateGetOpexForecastSummaryRequest)(getOpexForecastSummaryRequestDecoder),
    getOpexForecastSummaryController,
  )
  route.put(
    "/forecast",
    validation(consolidateUpsertOpexForecastRequest)(upsertOpexForecastRequestDecoder),
    upsertOpexForecastController,
  )
}
