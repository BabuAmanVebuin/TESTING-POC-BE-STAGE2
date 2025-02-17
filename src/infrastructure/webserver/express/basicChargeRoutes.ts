import Express from "express"
import { validation } from "../../../interface/routes/dpm/util.js"
import {
  consolidateGetBasicChargePlanRequest,
  getBasicChargePlanController,
} from "../../../interface/controllers/dpm/KPI003/getBasicChargePlanController.js"
import { upsertBasicChargeForecastRequestDecoder } from "../../../domain/entities/dpm/decoders/basicChargeForecastDecoder.js"
import {
  getBasicChargePlanRequestDecoder,
  upsertBasicChargePlanRequestDecoder,
} from "../../../domain/entities/dpm/decoders/basicChargePlanDecoder.js"
import { BasicChargeRepositorySequelizeMySQL } from "../../repositories/dpm/BasicChargeRepositorySequelizeMySQL.js"
import {
  consolidateUpsertBasicChargePlanRequest,
  upsertBasicChargePlanController,
} from "../../../interface/controllers/dpm/KPI003/upsertBasicChargePlanController.js"
import { getBasicChargeForecastRequestDecoder } from "../../../domain/entities/dpm/decoders/basicChargeForecastDecoder.js"
import {
  consolidateGetBasicChargeForecastRequest,
  getBasicChargeForecastController,
} from "../../../interface/controllers/dpm/KPI003/getBasicChargeForecastController.js"
import {
  consolidateGetBasicChargePlanSummaryRequest,
  getBasicChargePlanSummaryController,
} from "../../../interface/controllers/dpm/KPI003/getBasicChargePlanSummaryController.js"
import { getBasicChargePlanPlanSummaryRequestDecoder } from "../../../domain/entities/dpm/decoders/basicChargePlanSummaryDecoder.js"
import {
  consolidateUpsertBasicChargeForecastRequest,
  upsertBasicChargeForecastController,
} from "../../../interface/controllers/dpm/KPI003/upsertBasicChargeForecastController.js"
import { getBasicChargeForecastSummaryRequestDecoder } from "../../../domain/entities/dpm/decoders/basicChargeForecastSummaryDecoder.js"
import {
  consolidateGetBasicChargeForecastSummaryRequest,
  getBasicChargeForecastSummaryController,
} from "../../../interface/controllers/dpm/KPI003/getBasicChargeForecastSummaryController.js"

const route = Express.Router()

export const BasicChargeRoutes = (router: Express.Router): void => {
  router.use("/basic-charge", route)

  // GET Basic charge plan API
  route.get(
    "/plan",
    validation(consolidateGetBasicChargePlanRequest)(getBasicChargePlanRequestDecoder),
    getBasicChargePlanController(BasicChargeRepositorySequelizeMySQL),
  )

  // PUT Basic charge plan API
  route.put(
    "/plan",
    validation(consolidateUpsertBasicChargePlanRequest)(upsertBasicChargePlanRequestDecoder),
    upsertBasicChargePlanController(BasicChargeRepositorySequelizeMySQL),
  )

  // GET Basic charge forecast API
  route.get(
    "/forecast",
    validation(consolidateGetBasicChargeForecastRequest)(getBasicChargeForecastRequestDecoder),
    getBasicChargeForecastController(BasicChargeRepositorySequelizeMySQL),
  )

  // GET Basic charge plan summary API
  route.get(
    "/plan/summary",
    validation(consolidateGetBasicChargePlanSummaryRequest)(getBasicChargePlanPlanSummaryRequestDecoder),
    getBasicChargePlanSummaryController(BasicChargeRepositorySequelizeMySQL),
  )

  // PUT Basic charge forecast API
  route.put(
    "/forecast",
    validation(consolidateUpsertBasicChargeForecastRequest)(upsertBasicChargeForecastRequestDecoder),
    upsertBasicChargeForecastController(BasicChargeRepositorySequelizeMySQL),
  )

  // PUT Basic charge forecast Summary API
  route.get(
    "/forecast/summary",
    validation(consolidateGetBasicChargeForecastSummaryRequest)(getBasicChargeForecastSummaryRequestDecoder),
    getBasicChargeForecastSummaryController(BasicChargeRepositorySequelizeMySQL),
  )
}
