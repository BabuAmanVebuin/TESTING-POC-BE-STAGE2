// Initially copied from ToT-BE, commit 545c1dd02ed8df920e315645df162212e80b2a03

import Express from "express"
import { getSapTaskCategoryController } from "../../../controllers/tot/v1/getSapTaskCategoryController.js"

const route = Express.Router()

export const SapTaskCategory = (router: Express.Router) => {
  router.use("", route)
  // getSAPTaskCategory
  route.get("/sap-task-category", getSapTaskCategoryController)
}
