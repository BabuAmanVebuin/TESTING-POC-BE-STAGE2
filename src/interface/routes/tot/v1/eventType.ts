// Initially copied from ToT-BE, commit 545c1dd02ed8df920e315645df162212e80b2a03
import Express from "express"
import { createEventTypesRequestDecoder } from "../../../../domain/entities/tot/v1/createEventTypes.js"
import { getEventTypeAuditWithTaskRequestDecoder } from "../../../../domain/entities/tot/v1/getEventTypeWithTaskCount.js"
import { deleteEventTypesRequestDecoder } from "../../../../domain/entities/tot/v1/deleteEventTypes.js"
import { updateEventTypesRequestDecoder } from "../../../../domain/entities/tot/v1/updateEventTypes.js"
import {
  consolidatecreateEventTypeRequest,
  createEventTypesController,
} from "../../../controllers/tot/v1/createEventTypesController.js"
import { getEventTypeController } from "../../../controllers/tot/v1/getEventTypeController.js"
import {
  consolidategetEventTypeWithTaskCountRequest,
  getEventTypeWithTaskCountController,
} from "../../../controllers/tot/v1/getEventTypeWithTaskCountController.js"
import {
  consolidateDeleteEventTypesRequest,
  deleteEventTypesController,
} from "../../../controllers/tot/v1/deleteEventTypesController.js"
import {
  consolidateupdateEventTypesRequest,
  updateEventTypesController,
} from "../../../controllers/tot/v1/updateEventTypesController.js"

import { validation } from "./util.js"
import {
  consolidateCreateEventTemplateRequest,
  createEventTemplateController,
} from "../../../controllers/tot/v1/createEventTemplateController.js"
import { createEventTemplateRequestDecoder } from "../../../../domain/entities/tot/v1/createEventTemplate.js"

const route = Express.Router()

export const EventTypeRoutes = (router: Express.Router) => {
  router.use("/event-types", route)

  //get event type
  route.get("/", getEventTypeController)

  // createEventTypes
  route.post(
    "/",
    validation(consolidatecreateEventTypeRequest)(createEventTypesRequestDecoder),
    createEventTypesController,
  )

  // updateEventTypes
  route.patch(
    "/",
    validation(consolidateupdateEventTypesRequest)(updateEventTypesRequestDecoder),
    updateEventTypesController,
  )

  //deleteEventTypes
  route.delete(
    "/:eventTypeId",
    validation(consolidateDeleteEventTypesRequest)(deleteEventTypesRequestDecoder),
    deleteEventTypesController,
  )

  //get event type with task count
  route.get(
    "/:assetTaskGroupId/task-count",
    validation(consolidategetEventTypeWithTaskCountRequest)(getEventTypeAuditWithTaskRequestDecoder),
    getEventTypeWithTaskCountController,
  )

  // create event-template
  route.post(
    "/event-template",
    validation(consolidateCreateEventTemplateRequest)(createEventTemplateRequestDecoder),
    createEventTemplateController,
  )
}
