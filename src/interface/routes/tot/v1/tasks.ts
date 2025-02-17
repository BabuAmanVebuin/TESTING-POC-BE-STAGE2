// Initially copied from ToT-BE, commit 545c1dd02ed8df920e315645df162212e80b2a03
import Express from "express"
import { createChainMemoRequestDecoder } from "../../../../domain/entities/tot/v1/createChainMemo.js"
import { createTaskAssigneesRequestDecoder } from "../../../../domain/entities/tot/v1/createTaskAssignees.js"
import { createTaskForecastDecoder } from "../../../../domain/entities/tot/v1/createTaskForecast.js"
import { createTasksRequestDecoder } from "../../../../domain/entities/tot/v1/createTasks.js"
import { deleteChainMemoRequestDecoder } from "../../../../domain/entities/tot/v1/deleteChainMemo.js"
import { deleteTaskAssigneesRequestDecoder } from "../../../../domain/entities/tot/v1/deleteTaskAssignees.js"
import { deleteTaskForecastByIdRequestDecoder } from "../../../../domain/entities/tot/v1/deleteTaskForecastById.js"
import { getChainMemosRequestDecoder } from "../../../../domain/entities/tot/v1/getChainMemos.js"
import { getEventTemplatesByIdRequestDecoder } from "../../../../domain/entities/tot/v1/getEventTemplatesById.js"
import { getTaskByIdRequestDecoder } from "../../../../domain/entities/tot/v1/getTaskById.js"
import { getTaskCountDecoder } from "../../../../domain/entities/tot/v1/getTaskCount.js"
import { getTaskForecastListRequestDecoder } from "../../../../domain/entities/tot/v1/getTaskForecastList.js"
import { getTasksRequestDecoder } from "../../../../domain/entities/tot/v1/getTasks.js"
import { getTasksWithAuditsDecoder } from "../../../../domain/entities/tot/v1/getTaskWithAudits.js"
import { putTaskAssigneesRequestDecoder } from "../../../../domain/entities/tot/v1/putTaskAssignees.js"
import { updateSapTaskStatusRequestDecoder } from "../../../../domain/entities/tot/v1/updateSapTaskStatus.js"
import { updateTakeoverInfoRequestDecoder } from "../../../../domain/entities/tot/v1/updateTakeoverInfo.js"
import { updateTaskAuditOperateTimestampDecoder } from "../../../../domain/entities/tot/v1/updateTaskAuditOperateTimestamp.js"
import { updateTaskForecastDecoder } from "../../../../domain/entities/tot/v1/updateTaskForecast.js"
import { updateTasksRequestDecoder } from "../../../../domain/entities/tot/v1/updateTasks.js"
import { updateTaskStatusRequestDecoder } from "../../../../domain/entities/tot/v1/updateTaskStatus.js"
import {
  consolidatecreateChainMemoRequest,
  createChainMemoController,
} from "../../../controllers/tot/v1/createChainMemoController.js"
import {
  consolidatecreateTaskAssigneeRequest,
  createTaskAssigneesController,
} from "../../../controllers/tot/v1/createTaskAssigneesController.js"
import {
  consolidatecreateTaskForecastRequest,
  createTaskForecastController,
} from "../../../controllers/tot/v1/createTaskForecastController.js"
import {
  consolidatecreateTasksRequest,
  createTasksController,
} from "../../../controllers/tot/v1/createTasksController.js"
import {
  consolidatedeleteChainMemoRequest,
  deleteChainMemoController,
} from "../../../controllers/tot/v1/deleteChainMemoController.js"
import {
  consolidatedeleteTaskAssigneeRequest,
  deleteTaskAssigneesController,
} from "../../../controllers/tot/v1/deleteTaskAssigneesController.js"
import {
  consolidateDeleteTaskForecastByIdRequest,
  deleteTaskForecastByIdController,
} from "../../../controllers/tot/v1/deleteTaskForecastByIdController.js"
import {
  consolidategetChainMemosRequest,
  getChainMemosController,
} from "../../../controllers/tot/v1/getChainMemosController.js"
import {
  consolidategetEventTemplatesByIdRequest,
  getEventTemplatesByIdController,
} from "../../../controllers/tot/v1/getEventTemplatesByIdController.js"
import {
  consolidategetTaskByIdRequest,
  getTaskByIdController,
} from "../../../controllers/tot/v1/getTaskByIdController.js"
import {
  consolidateGetTaskCountRequest,
  getGetTaskCountController,
} from "../../../controllers/tot/v1/getTaskCountController.js"
import {
  consolidategetTaskForecastListRequest,
  getTaskForecastListController,
} from "../../../controllers/tot/v1/getTaskForecastController.js"
import { getTaskMastersController } from "../../../controllers/tot/v1/getTaskMastersController.js"
import { consolidategetTasksRequest, getTasksController } from "../../../controllers/tot/v1/getTasksController.js"
import {
  consolidateGetTaskWithAuditsRequest,
  getGetTaskWithAuditsController,
} from "../../../controllers/tot/v1/getTaskWithAuditsController.js"
import {
  consolidateputTaskAssigneesRequest,
  putTaskAssigneesController,
} from "../../../controllers/tot/v1/putTaskAssigneesController.js"
import {
  consolidateupdateSapTaskStatusRequest,
  updateSapTaskStatusController,
} from "../../../controllers/tot/v1/updateSapTaskStatusController.js"
import {
  consolidateupdateTakeoverInfoRequest,
  updateTakeoverInfoController,
} from "../../../controllers/tot/v1/updateTakeoverInfoController.js"
import {
  consolidateUpdateTaskAuditOperateTimestampRequest,
  updateTaskAuditOperateTimestampController,
} from "../../../controllers/tot/v1/updateTaskAuditOperateTimestampController.js"
import {
  consolidateUpdateTaskForecastRequest,
  updateTaskForecastController,
} from "../../../controllers/tot/v1/updateTaskForecastController.js"
import {
  consolidateupdateTasksRequest,
  updateTasksController,
} from "../../../controllers/tot/v1/updateTasksController.js"
import {
  consolidateupdateTaskStatusRequest,
  updateTaskStatusController,
} from "../../../controllers/tot/v1/updateTaskStatusController.js"
import { overrideResponse } from "../../../decorators.js"
import { validation } from "./util.js"

const route = Express.Router()

export const TaskRoutes = (router: Express.Router) => {
  router.use("/tasks", route)
  // getTasks
  route.get("/", validation(consolidategetTasksRequest)(getTasksRequestDecoder), getTasksController)
  // createTasks
  route.post("/", validation(consolidatecreateTasksRequest)(createTasksRequestDecoder), createTasksController)

  // updateTasks
  route.patch("/", validation(consolidateupdateTasksRequest)(updateTasksRequestDecoder), updateTasksController)

  // consolidateupdateTakeoverInfoRequest
  route.patch(
    "/takeover-info",
    validation(consolidateupdateTakeoverInfoRequest)(updateTakeoverInfoRequestDecoder),
    updateTakeoverInfoController,
  )

  route.delete(
    "/assignees",
    validation(consolidatedeleteTaskAssigneeRequest)(deleteTaskAssigneesRequestDecoder),
    deleteTaskAssigneesController,
  )

  route.put(
    "/assignees",
    validation(consolidateputTaskAssigneesRequest)(putTaskAssigneesRequestDecoder),
    putTaskAssigneesController,
  )

  // getTaskMasters (There are no parameters passed, no validation needed)
  route.get("/masters", getTaskMastersController)

  // getChainMemos
  route.get(
    "/:taskId/chain-memos/",
    validation(consolidategetChainMemosRequest)(getChainMemosRequestDecoder),
    getChainMemosController,
  )

  // getChainMemos -> They chained the url for this so I am keeping both versions.
  route.get(
    "/:taskId/chain-memo/",
    validation(consolidategetChainMemosRequest)(getChainMemosRequestDecoder),
    overrideResponse(200, "tot/getChainMemos.json"),
  )

  // createChainMemo
  route.post(
    "/:taskId/chain-memos/",
    validation(consolidatecreateChainMemoRequest)(createChainMemoRequestDecoder),
    createChainMemoController,
  )

  route.post(
    "/:taskId/chain-memo/",
    validation(consolidatecreateChainMemoRequest)(createChainMemoRequestDecoder),
    createChainMemoController,
  )

  // updateTaskStatus
  route.patch(
    "/:taskId/status",
    validation(consolidateupdateTaskStatusRequest)(updateTaskStatusRequestDecoder),
    updateTaskStatusController,
  )

  // getEventTemplatesById
  route.get(
    "/event-types/:eventTypeId/event-templates/",
    validation(consolidategetEventTemplatesByIdRequest)(getEventTemplatesByIdRequestDecoder),
    getEventTemplatesByIdController,
  )

  // deleteChainMemo
  route.delete(
    "/chain-memos/:chainMemoId",
    validation(consolidatedeleteChainMemoRequest)(deleteChainMemoRequestDecoder),
    deleteChainMemoController,
  )

  // get task with audits
  route.get(
    "/task-with-audits",
    validation(consolidateGetTaskWithAuditsRequest)(getTasksWithAuditsDecoder),
    getGetTaskWithAuditsController,
  )

  // get task count for planeed and unplanned tasks
  route.get("/task-count", validation(consolidateGetTaskCountRequest)(getTaskCountDecoder), getGetTaskCountController)

  // getTaskForecast
  route.get(
    "/task-forecast",
    validation(consolidategetTaskForecastListRequest)(getTaskForecastListRequestDecoder),
    getTaskForecastListController,
  )

  // updateSapTaskStatus
  route.patch(
    "/:saptaskCategoryId/update-status",
    validation(consolidateupdateSapTaskStatusRequest)(updateSapTaskStatusRequestDecoder),
    updateSapTaskStatusController,
  )

  // update task forecast
  route.put(
    "/task-forecast/:taskForecastId",
    validation(consolidateUpdateTaskForecastRequest)(updateTaskForecastDecoder),
    updateTaskForecastController,
  )

  // add new task forecast
  route.post(
    "/task-forecast",
    validation(consolidatecreateTaskForecastRequest)(createTaskForecastDecoder),
    createTaskForecastController,
  )

  // delete Task Forecast by id
  route.delete(
    "/task-forecast/:taskForecastId",
    validation(consolidateDeleteTaskForecastByIdRequest)(deleteTaskForecastByIdRequestDecoder),
    deleteTaskForecastByIdController,
  )

  //createTaskAssignee
  route.post(
    "/assignees",
    validation(consolidatecreateTaskAssigneeRequest)(createTaskAssigneesRequestDecoder),
    createTaskAssigneesController,
  )

  //updateTaskAuditOperateTimestamp
  route.put(
    "/:taskId/task-audits",
    validation(consolidateUpdateTaskAuditOperateTimestampRequest)(updateTaskAuditOperateTimestampDecoder),
    updateTaskAuditOperateTimestampController,
  )
  // getTaskById
  route.get("/:taskId/", validation(consolidategetTaskByIdRequest)(getTaskByIdRequestDecoder), getTaskByIdController)
}
