// Initially copied from ToT-BE, commit 545c1dd02ed8df920e315645df162212e80b2a03
import Express from "express"
import { createTaskTypeRequestDecoder } from "../../../../domain/entities/tot/v1/createTaskType.js"
import { getTaskTypeAuditRequestDecoder } from "../../../../domain/entities/tot/v1/getAuditByTaskType.js"
import { getTaskTypeAuditWithTaskRequestDecoder } from "../../../../domain/entities/tot/v1/getTaskTypeAuditWithTask.js"
import { deleteTaskTypesRequestDecoder } from "../../../../domain/entities/tot/v1/deleteTaskTypes.js"
import { updateTaskTypeRequestDecoder } from "../../../../domain/entities/tot/v1/updateTaskType.js"
import {
  consolidatecreateTaskTypeRequest,
  createTaskTypeController,
} from "../../../controllers/tot/v1/createTaskTypeController.js"
import {
  consolidategetTaskTypeAuditRequest,
  getTaskTypeAuditController,
} from "../../../controllers/tot/v1/getAuditByTaskTypeController.js"
import {
  consolidategetTaskTypeAuditWithTaskRequest,
  getTaskTypeAuditWithTaskController,
} from "../../../controllers/tot/v1/getTaskTypeAuditWithTaskController.js"
import { getTaskTypeController } from "../../../controllers/tot/v1/getTaskTypeController.js"
import {
  consolidateDeleteTaskTypeRequest,
  deleteTaskTypeController,
} from "../../../controllers/tot/v1/deleteTaskTypeController.js"
import {
  consolidateupdateTaskTypeRequest,
  updateTaskTypeController,
} from "../../../controllers/tot/v1/updateTaskTypeController.js"

import { validation } from "./util.js"

const route = Express.Router()

export const TaskTypeRoutes = (router: Express.Router) => {
  router.use("/task-types", route)

  //get task Type
  route.get("/", getTaskTypeController)

  // create Task Type
  route.post("/", validation(consolidatecreateTaskTypeRequest)(createTaskTypeRequestDecoder), createTaskTypeController)

  // update Task Type
  route.patch("/", validation(consolidateupdateTaskTypeRequest)(updateTaskTypeRequestDecoder), updateTaskTypeController)

  //deleteTaskTypes
  route.delete(
    "/:taskTypeId",
    validation(consolidateDeleteTaskTypeRequest)(deleteTaskTypesRequestDecoder),
    deleteTaskTypeController,
  )

  //get task audit  group by task type
  route.get(
    "/audits",
    validation(consolidategetTaskTypeAuditRequest)(getTaskTypeAuditRequestDecoder),
    getTaskTypeAuditController,
  )

  //get task audit group by task type with tasks
  route.get(
    "/audits-with-tasks",
    validation(consolidategetTaskTypeAuditWithTaskRequest)(getTaskTypeAuditWithTaskRequestDecoder),
    getTaskTypeAuditWithTaskController,
  )
}
