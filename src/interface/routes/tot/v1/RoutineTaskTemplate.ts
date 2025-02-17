// Initially copied from ToT-BE, commit 545c1dd02ed8df920e315645df162212e80b2a03

import Express from "express"
import {
  deleteRoutineTaskTemplateDecoder,
  RoutineTaskTemplateRequestDecoder,
  getRoutineTaskTemplateDecoder,
} from "../../../../domain/entities/tot/v1/RoutineTaskTemplate.js"
import {
  consolidatecreateRoutineTaskTemplateRequest,
  createRoutineTaskTemplateController,
} from "../../../controllers/tot/v1/createRoutineTaskTemplateController.js"
import {
  consolidatedeleteRoutineTaskTemplateRequest,
  deleteRoutineTaskTemplateController,
} from "../../../controllers/tot/v1/deleteRoutineTaskTemplateController.js"
import {
  consolidategetRoutineTaskTemplateRequest,
  getRoutineTaskTemplateController,
} from "../../../controllers/tot/v1/getRoutineTaskTemplateController.js"
import {
  consolidateupdateRoutineTaskTemplateRequest,
  updateRoutineTaskTemplateController,
} from "../../../controllers/tot/v1/updateRoutineTaskTemplateController.js"
import { validation } from "./util.js"

const route = Express.Router()

export const RoutineTaskTemplate = (router: Express.Router) => {
  router.use("", route)
  // getRoutineTaskTemplate
  route.get(
    "/routine-task-template",
    validation(consolidategetRoutineTaskTemplateRequest)(getRoutineTaskTemplateDecoder),
    getRoutineTaskTemplateController,
  )

  // createRoutineTaskTemplate
  route.post(
    "/routine-task-template",
    validation(consolidatecreateRoutineTaskTemplateRequest)(RoutineTaskTemplateRequestDecoder),
    createRoutineTaskTemplateController,
  )

  // updateRoutineTaskTemplate
  route.patch(
    "/routine-task-template/:routineTaskTemplateId",
    validation(consolidateupdateRoutineTaskTemplateRequest)(RoutineTaskTemplateRequestDecoder),
    updateRoutineTaskTemplateController,
  )

  // deleteRoutineTaskTemplate
  route.delete(
    "/routine-task-template/:routineTaskTemplateId",
    validation(consolidatedeleteRoutineTaskTemplateRequest)(deleteRoutineTaskTemplateDecoder),
    deleteRoutineTaskTemplateController,
  )
}
