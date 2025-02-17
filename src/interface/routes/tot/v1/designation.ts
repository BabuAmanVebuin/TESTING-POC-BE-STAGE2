// Initially copied from ToT-BE, commit 545c1dd02ed8df920e315645df162212e80b2a03

import Express from "express"
import { getDesignationController } from "../../../controllers/tot/v1/getDesignationController.js"

const route = Express.Router()

export const Designation = (router: Express.Router) => {
  router.use("", route)
  // getDesignation
  route.get("/designation", getDesignationController)
}
