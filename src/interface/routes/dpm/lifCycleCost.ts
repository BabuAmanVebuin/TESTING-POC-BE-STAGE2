import Express from "express"
import { validation } from "./util.js"
import { getLifeCycleCostRequestDecoder } from "../../../domain/entities/dpm/decoders/lifeCycleCost.js"
import {
  consolidateGetLifeCycleCostRequest,
  getLifeCycleCostController,
} from "../../controllers/dpm/KPI003/getLifeCycleCostController.js"

const route = Express.Router()

export const lifeCycleCostRoutes = (router: Express.Router) => {
  router.use("/life-cycle-cost", route)

  route.get(
    "/summary",
    validation(consolidateGetLifeCycleCostRequest)(getLifeCycleCostRequestDecoder),
    getLifeCycleCostController,
  )
}
