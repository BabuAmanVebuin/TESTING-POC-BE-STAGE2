// Initially copied from DPM-BE, commit d0e2f45544cc9890762f93cf3e8f224f15efd619
import { isRight, Either } from "fp-ts/lib/Either.js"
import { Response, Router } from "express"
import { ApplicationError } from "../../../application/errors/dpm/index.js"
import { AvailabilityJson } from "../../../domain/models/dpm/KPI003/Index.js"
import logger from "../../../infrastructure/logger.js"
import { HTTP_STATUS } from "../../../config/dpm/constant.js"
import { wrapInSnowflakeTransaction } from "../../../infrastructure/orm/snowflake/index.js"
import { kpi003RepositorySnowflake } from "../../../infrastructure/repositories/dpm/snowflake/kpi003RepositorySnowflake.js"
import { getAvailabilityController } from "../../controllers/dpm/KPI003/getAvailabilityController.js"
import { asyncWrapper, logResponse } from "./util.js"
import { createConnection } from "../../../infrastructure/orm/sqlize/dpm/index.js"
import { kpiResponseCacheRepositorySequelizeMySQL } from "../../../infrastructure/repositories/dpm/kpiResponseCacheRepositoryPortSequelizeMySQL.js"

// Function to handle the result of the Availability API request
const handleResult = (res: Response, availabilityJson: Either<ApplicationError, AvailabilityJson>): void => {
  if (isRight(availabilityJson)) {
    logResponse(availabilityJson.right)
    res.status(HTTP_STATUS.OK).send(availabilityJson.right)
  } else {
    const error: ApplicationError = availabilityJson.left
    switch (error._tag) {
      case "InvalidPlantCodeError":
        logResponse(error.message)
        res.status(HTTP_STATUS.NOT_FOUND).send(error.message)
        break
      case "InvalidPlantAndUnitCodeError":
        logResponse(error.message)
        res.status(HTTP_STATUS.NOT_FOUND).send(error.message)
        break
      case "InvalidEpochTimeStampError":
        logResponse(error.message)
        res.status(HTTP_STATUS.BAD_REQUEST).send(error.message)
        break
      default:
        logResponse(res.__("ERROR.INTERNAL_SERVER"))
        res.status(HTTP_STATUS.INTERNAL_SERVER).end(res.__("ERROR.INTERNAL_SERVER"))
    }
  }
}

// Handler for the GET Availability API endpoint
export const getAvailability = (router: Router): void => {
  router.get(
    "/",
    asyncWrapper(async (req, res) => {
      logger.info(`GET Availability API started`) // Logging a message indicating the start of the Availability API request
      const connection = createConnection()
      const kpiResponseCacheRepository = await kpiResponseCacheRepositorySequelizeMySQL(connection)
      await wrapInSnowflakeTransaction(async (snowflakeTransaction) => {
        const kpi003Repository = await kpi003RepositorySnowflake(snowflakeTransaction)
        const availabilityJson = await getAvailabilityController(
          {
            plantCode: String(req.query["plantCode"]),
            unitCode: String(req.query["unitCode"]),
            epochSeconds: Number(req.query["epochSeconds"]),
          },
          kpi003Repository,
          kpiResponseCacheRepository,
          req.__,
        )
        handleResult(res, availabilityJson)
      })
    }),
  )
}
