import Express from "express"
import { validation } from "./util.js"
import { getNetPresentValueRequestDecoder } from "../../../domain/entities/dpm/decoders/netPresentValueDecoder.js"
import {
  consolidateGetNetPresentValueRequest,
  getNetPresentValueController,
} from "../../controllers/dpm/KPI003/getNetPresentValueController.js"

const route = Express.Router()

export const netPresentValueRoutes = (router: Express.Router) => {
  router.use("/net-present-value", route)

  route.get(
    "/summary",
    validation(consolidateGetNetPresentValueRequest)(getNetPresentValueRequestDecoder),
    getNetPresentValueController,
  )
}
