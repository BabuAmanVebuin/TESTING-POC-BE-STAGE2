// Imported from DPM-BE, commit d0e2f45544cc9890762f93cf3e8f224f15efd619
import * as E from "fp-ts/lib/Either.js"
import { asyncWrapper, logResponse } from "./util.js"
import { Response, Router } from "express"

import { wrapInSnowflakeTransaction } from "../../../infrastructure/orm/snowflake/index.js"
import logger from "../../../infrastructure/logger.js"
import { ApplicationError } from "../../../application/errors/dpm/index.js"
import { StartStopCountsAPIResponse } from "../../../domain/models/dpm/StartStopCounts.js"
import { GenericApiResponse } from "../../../domain/models/dpm/ApiResponse.js"
import { HTTP_STATUS } from "../../../config/dpm/constant.js"
import { getStartStopCountsController } from "../../controllers/dpm/startStopCounts/getStartStopCountsController.js"
import { StartStopCountRepository } from "../../../infrastructure/repositories/dpm/snowflake/StartStopCountRepositorySnowflake.js"

/**
 * Function for handle response
 * @param res Express request
 * @param startStopCountResult result
 */
const handleResult = (
  res: Response,
  startStopCountResult: E.Either<ApplicationError, StartStopCountsAPIResponse>,
): void => {
  if (E.isRight(startStopCountResult)) {
    logResponse({
      Success: true,
      Message: res.__("MESSAGE.SUCCESS"),
      Data: startStopCountResult.right,
    })

    res.status(HTTP_STATUS.OK).json({
      Success: true,
      Message: res.__("MESSAGE.SUCCESS"),
      Data: startStopCountResult.right,
    })
  } else {
    const error: ApplicationError = startStopCountResult.left
    switch (error._tag) {
      case "InvalidPlantCodeError":
        logResponse({
          Success: false,
          Message: error.message,
        } as GenericApiResponse)

        res.status(HTTP_STATUS.BAD_REQUEST).json({
          Success: false,
          Message: error.message,
        } as GenericApiResponse)
        break
      case "InvalidPlantAndUnitCodeError":
        logResponse({
          Success: false,
          Message: error.message,
        } as GenericApiResponse)

        res.status(HTTP_STATUS.BAD_REQUEST).json({
          Success: false,
          Message: error.message,
        } as GenericApiResponse)
        break
      case "InvalidFiscalYearError":
        logResponse({
          Success: false,
          Message: error.message,
        } as GenericApiResponse)

        res.status(HTTP_STATUS.BAD_REQUEST).json({
          Success: false,
          Message: error.message,
        } as GenericApiResponse)
        break
      default:
        logResponse({
          Success: false,
          Message: res.__("ERROR.INTERNAL_SERVER"),
        } as GenericApiResponse)

        res.status(HTTP_STATUS.INTERNAL_SERVER).json({
          Success: false,
          Message: res.__("ERROR.INTERNAL_SERVER"),
        } as GenericApiResponse)
    }
  }
}

export const getStartStopCounts = (router: Router): void => {
  router.get(
    "/",
    asyncWrapper(async (req, res) => {
      logger.info("GET StartStopCount API started")
      await wrapInSnowflakeTransaction(async (snowflakeTransaction) => {
        const startStopCountRepository = await StartStopCountRepository(snowflakeTransaction)
        const stoppageResult = await getStartStopCountsController(
          {
            plantCode: String(req.query["plantCode"]),
            unitCode: String(req.query["unitCode"]),
            fiscalYear: String(req.query["fiscalYear"]),
          },
          startStopCountRepository,
          req.__,
        )
        handleResult(res, stoppageResult)
      })
    }),
  )
}
