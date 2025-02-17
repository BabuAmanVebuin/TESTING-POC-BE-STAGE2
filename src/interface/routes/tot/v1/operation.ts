// Initially copied from ToT-BE, commit 545c1dd02ed8df920e315645df162212e80b2a03
import Express from "express"
import { createOperationEventTypeRequestDecoder } from "../../../../domain/entities/tot/v1/createOperationEventType.js"
import { updateOperationEventTypeRequestDecoder } from "../../../../domain/entities/tot/v1/updateOperationEventType.js"
import {
  consolidateCreateOperationEventTypeRequest,
  createOperationEventTypeController,
} from "../../../controllers/tot/v1/createOperationEventTypeController.js"
import { getOperationController } from "../../../controllers/tot/v1/getOperationController.js"
import { getOperationEventTemplateController } from "../../../controllers/tot/v1/getOperationEventTemplateController.js"
import {
  consolidateUpdateOperationEventTypeRequest,
  updateOperationEventTypeController,
} from "../../../controllers/tot/v1/updateOperationEventTypeController.js"
import { validation } from "./util.js"

const route = Express.Router()

export const Operation = (router: Express.Router) => {
  router.use("", route)
  // getOperation
  route.get("/operation", getOperationController)

  //get operation event template
  route.get("/operation/operation-event-template", getOperationEventTemplateController)

  // create operation-event-type relation
  route.post(
    "/operation/operation-event-type",
    validation(consolidateCreateOperationEventTypeRequest)(createOperationEventTypeRequestDecoder),
    createOperationEventTypeController,
  )

  // update operation-event-type relation
  route.patch(
    "/operation/operation-event-type",
    validation(consolidateUpdateOperationEventTypeRequest)(updateOperationEventTypeRequestDecoder),
    updateOperationEventTypeController,
  )
}
