// Initially copied from ToT-BE, commit 545c1dd02ed8df920e315645df162212e80b2a03
import Express from "express"
import { getTaskCategoryRequestDecoder } from "../../../../domain/entities/tot/v1/getAuditByCategory.js"

import {
  consolidategetTaskCategoryReportRequest,
  taskCategoryControllerContolller,
} from "../../../controllers/tot/v1/getAuditByCategoryController.js"
import { getTaskCategoryController } from "../../../controllers/tot/v1/getTaskCategoryController.js"

import { validation } from "./util.js"

const route = Express.Router()

export const TaskCategoryRoutes = (router: Express.Router) => {
  router.use("/task-category", route)

  //get taskCategory
  route.get("/", getTaskCategoryController)

  //get task audit  group by category
  route.get(
    "/audits",
    validation(consolidategetTaskCategoryReportRequest)(getTaskCategoryRequestDecoder),
    taskCategoryControllerContolller,
  )
}
