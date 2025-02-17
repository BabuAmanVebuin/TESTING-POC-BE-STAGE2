// Initially copied from ToT-BE, commit 545c1dd02ed8df920e315645df162212e80b2a03

import * as Express from "express"
import * as swaggerUI from "swagger-ui-express"
import YAML from "yamljs"

export const apiDocs = (router: Express.Router): void => {
  // Serves static swagger.yaml
  const swaggerDocument = YAML.load("./_api-docs/swagger.yaml") as swaggerUI.JsonObject

  // Serves Swagger UI
  router.use("/api-docs", swaggerUI.serve)
  router.get("/api-docs", swaggerUI.setup(swaggerDocument))
}
