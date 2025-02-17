// Imported from DPM-BE, commit d0e2f45544cc9890762f93cf3e8f224f15efd619
import { Response, Router } from "express"
import * as E from "fp-ts/lib/Either.js"
import { wrapInSnowflakeTransaction } from "../../../infrastructure/orm/snowflake/index.js"
import { ApplicationError } from "../../../application/errors/dpm/index.js"
import { getStartupModeResponse } from "../../../domain/models/dpm/StartupModes.js"
import { HTTP_STATUS } from "../../../config/dpm/constant.js"
import { asyncWrapper, logResponse } from "./util.js"
import logger from "../../../infrastructure/logger.js"
import { getUnitStartupModesRepositorySnowflake } from "../../../infrastructure/repositories/dpm/snowflake/getUnitStartupModesRepositorySnowflake.js"
import { getUnitStartupModesController } from "../../controllers/dpm/getUnitStartupModes/getUnitStartupModesController.js"

/**
 * Function for handle get startUpModeResponse
 * @param res Express res
 * @param startupModeResponse
 */
const handleResult = (res: Response, startupModeResponse: E.Either<ApplicationError, getStartupModeResponse>): void => {
  if (E.isRight(startupModeResponse)) {
    logResponse({
      Success: true,
      Message: res.__("MESSAGE.SUCCESS"),
      Data: startupModeResponse.right,
    })

    res.status(HTTP_STATUS.OK).json({
      Success: true,
      Message: res.__("MESSAGE.SUCCESS"),
      Data: startupModeResponse.right,
    })
  } else {
    const error: ApplicationError = startupModeResponse.left
    switch (error._tag) {
      case "InvalidPlantCodeError":
        logResponse({
          Success: false,
          Message: error.message,
        })

        res.status(HTTP_STATUS.BAD_REQUEST).json({
          Success: false,
          Message: error.message,
        })
        break
      case "InvalidPlantAndUnitCodeError":
        logResponse({
          Success: false,
          Message: error.message,
        })

        res.status(HTTP_STATUS.BAD_REQUEST).json({
          Success: false,
          Message: error.message,
        })
        break
      default:
        logResponse({
          Success: false,
          Message: res.__("ERROR.INTERNAL_SERVER"),
        })

        res.status(HTTP_STATUS.INTERNAL_SERVER).json({
          Success: false,
          Message: res.__("ERROR.INTERNAL_SERVER"),
        })
    }
  }
}
/**
 * Router function for get Startup Modes Controller
 * @param router Express router
 * @param connection db connection
 */
export const getUnitStartupModes = (router: Router): void => {
  router.get(
    "/",
    asyncWrapper(async (req, res) => {
      logger.info("GET unitstartupmodes API started")
      await wrapInSnowflakeTransaction(async (snowflakeTransaction) => {
        const kpi003Repository = await getUnitStartupModesRepositorySnowflake(snowflakeTransaction)
        const result = await getUnitStartupModesController(
          {
            plantCode: String(req.query["plantCode"]),
            unitCode: String(req.query["unitCode"]),
          },
          kpi003Repository,
          req.__,
        )
        handleResult(res, result)
      })
    }),
  )
}
