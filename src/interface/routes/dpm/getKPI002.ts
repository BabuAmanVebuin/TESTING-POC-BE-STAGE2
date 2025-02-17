// Imported from DPM-BE, commit d0e2f45544cc9890762f93cf3e8f224f15efd619
import * as E from "fp-ts/lib/Either.js"
import { asyncWrapper, logResponse } from "./util.js"
import { Response, Router } from "express"

import { wrapInSnowflakeTransaction } from "../../../infrastructure/orm/snowflake/index.js"
import { ApplicationError } from "../../../application/errors/dpm/index.js"
import { Kpi002Json } from "../../../domain/models/dpm/Kpi002Json.js"
import { HTTP_STATUS } from "../../../config/dpm/constant.js"
import logger from "../../../infrastructure/logger.js"
import { kpi003RepositorySnowflake } from "../../../infrastructure/repositories/dpm/snowflake/kpi003RepositorySnowflake.js"
import { getKPI002Controller } from "../../controllers/dpm/getKPI002Controller.js"
import { createConnection } from "../../../infrastructure/orm/sqlize/dpm/index.js"
import { kpiResponseCacheRepositorySequelizeMySQL } from "../../../infrastructure/repositories/dpm/kpiResponseCacheRepositoryPortSequelizeMySQL.js"

const handleResult = (res: Response, eKpi002Json: E.Either<ApplicationError, Kpi002Json | null>): void => {
  if (E.isRight(eKpi002Json)) {
    if (eKpi002Json.right === null) {
      logResponse(res.__("ERROR.NO_DATA_FOUND"))
      res.status(HTTP_STATUS.NOT_FOUND).send(res.__("ERROR.NO_DATA_FOUND"))
    } else {
      logResponse(eKpi002Json.right)
      res.status(HTTP_STATUS.OK).send(eKpi002Json.right)
    }
  } else {
    const error: ApplicationError = eKpi002Json.left
    switch (error._tag) {
      case "InvalidPlantCodeError":
        logResponse(error.message)
        res.status(HTTP_STATUS.NOT_FOUND).send(error.message)
        break
      case "InvalidPlantAndUnitCodeError":
        logResponse(error.message)
        res.status(HTTP_STATUS.NOT_FOUND).send(error.message)
        break
      default:
        logResponse(res.__("ERROR.INTERNAL_SERVER"))
        res.status(HTTP_STATUS.INTERNAL_SERVER).end(res.__("ERROR.INTERNAL_SERVER"))
    }
  }
}

export const getKPI002 = (router: Router): void => {
  router.get(
    "/",
    asyncWrapper(async (req, res) => {
      logger.info(`GET screenkpi002 API started`)
      const connection = createConnection()
      const mysqlRepository = await kpiResponseCacheRepositorySequelizeMySQL(connection)
      await wrapInSnowflakeTransaction(async (snowflakeTransaction) => {
        const kpi003Repository = await kpi003RepositorySnowflake(snowflakeTransaction)
        const kpi002Json = await getKPI002Controller(
          {
            plantCode: String(req.query["plantCode"]),
            unitCode: String(req.query["unitCode"]),
          },
          kpi003Repository,
          mysqlRepository,
          req.__,
        )
        handleResult(res, kpi002Json)
      })
    }),
  )
}
