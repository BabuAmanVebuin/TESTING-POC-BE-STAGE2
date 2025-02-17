// Imported from DPM-BE, commit d0e2f45544cc9890762f93cf3e8f224f15efd619
import { Response, Router } from "express"
import { Either, isRight } from "fp-ts/lib/Either.js"
import { ApplicationError } from "../../../application/errors/dpm/index.js"
import { SpreadJson } from "../../../domain/models/dpm/KPI003/Index.js"
import { HTTP_STATUS } from "../../../config/dpm/constant.js"
import { getSpreadController } from "../../controllers/dpm/KPI003/getSpreadController.js"
import { asyncWrapper, logResponse } from "./util.js"
import logger from "../../../infrastructure/logger.js"
import { SnowflakeTransaction, wrapInSnowflakeTransaction } from "../../../infrastructure/orm/snowflake/index.js"
import { createConnection } from "../../../infrastructure/orm/sqlize/dpm/index.js"
import { kpiResponseCacheRepositorySequelizeMySQL } from "../../../infrastructure/repositories/dpm/kpiResponseCacheRepositoryPortSequelizeMySQL.js"
import { kpi003RepositorySnowflake } from "../../../infrastructure/repositories/dpm/snowflake/kpi003RepositorySnowflake.js"

// Function to handle the result of the Spread API request
const handleResult = (res: Response, spreadJson: Either<ApplicationError, SpreadJson>): void => {
  if (isRight(spreadJson)) {
    logResponse(spreadJson.right)
    res.status(HTTP_STATUS.OK).send(spreadJson.right)
  } else {
    const error: ApplicationError = spreadJson.left
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
export const getSpread = (router: Router): void => {
  router.get(
    "/",
    asyncWrapper(async (req, res) => {
      logger.info(`GET Spread API started`)
      const connection = createConnection()
      const kpiResponseCacheRepository = await kpiResponseCacheRepositorySequelizeMySQL(connection)
      await wrapInSnowflakeTransaction(async (snowflakeTransaction: SnowflakeTransaction) => {
        const kpi003Repository = await kpi003RepositorySnowflake(snowflakeTransaction)
        const spreadJson = await getSpreadController(
          {
            plantCode: String(req.query["plantCode"]),
            unitCode: String(req.query["unitCode"]),
            epochSeconds: Number(req.query["epochSeconds"]),
          },
          kpi003Repository,
          kpiResponseCacheRepository,
          req.__,
        )
        handleResult(res, spreadJson)
      })
    }),
  )
}
