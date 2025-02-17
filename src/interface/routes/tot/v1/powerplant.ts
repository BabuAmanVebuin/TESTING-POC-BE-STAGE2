import Express from "express"
import { createPowerPlantUnitTeamRelationRequestDecoder } from "../../../../domain/entities/tot/v1/createPowerPlantUnitTeamRelation.js"
import {
  consolidateCreatePowerPlantUnitTeamRelationRequest,
  createPowerPlantUnitTeamRelationController,
} from "../../../controllers/tot/v1/createPowerPlantUnitTeamRelationController.js"
import { getPowerPlantUnitTeamRelationRequestDecoder } from "../../../../domain/entities/tot/v1/getPowerPlantUnitTeamRelation.js"
import { updatePowerPlantUnitTeamRelationRequestDecoder } from "../../../../domain/entities/tot/v1/updatePowerPlantUnitTeamRelation.js"
import {
  consolidateGetPowerPlantUnitTeamRelationRequest,
  getPowerPlantUnitTeamRelationController,
} from "../../../controllers/tot/v1/getPowerPlantUnitTeamRelationController.js"
import {
  consolidateUpdatePowerPlantUnitTeamRelationRequest,
  updatePowerPlantUnitTeamRelationController,
} from "../../../controllers/tot/v1/updatePowerPlantUnitTeamRelationController.js"
import { validation } from "./util.js"
const route = Express.Router()

export const PowerPlantRoutes = (router: Express.Router) => {
  router.use("/power-plant", route)

  // getPowerPlantUnitTeamRelation
  route.get(
    "/power-plant-unit-team-relation",
    validation(consolidateGetPowerPlantUnitTeamRelationRequest)(getPowerPlantUnitTeamRelationRequestDecoder),
    getPowerPlantUnitTeamRelationController,
  )

  // updatePowerPlantUnitTeamRelation
  route.patch(
    "/power-plant-unit-team-relation",
    validation(consolidateUpdatePowerPlantUnitTeamRelationRequest)(updatePowerPlantUnitTeamRelationRequestDecoder),
    updatePowerPlantUnitTeamRelationController,
  )

  // createPowerPlantUnitTeamRelation
  route.post(
    "/power-plant-unit-team-relation",
    validation(consolidateCreatePowerPlantUnitTeamRelationRequest)(createPowerPlantUnitTeamRelationRequestDecoder),
    createPowerPlantUnitTeamRelationController,
  )
}
