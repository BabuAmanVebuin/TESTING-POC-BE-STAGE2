// Imported from DPM-BE, commit d0e2f45544cc9890762f93cf3e8f224f15efd619
import * as E from "fp-ts/lib/Either.js"
import { asyncWrapper, logResponse } from "./util.js"
import { Response, Router } from "express"
import { wrapInSnowflakeTransaction } from "../../../infrastructure/orm/snowflake/index.js"
import logger from "../../../infrastructure/logger.js"
import { ApplicationError } from "../../../application/errors/dpm/index.js"
import { HTTP_STATUS } from "../../../config/dpm/constant.js"
import { StartStopCostsRepositorSnowflake } from "../../../infrastructure/repositories/dpm/snowflake/StartStopCostsRepositorySnowflake.js"
import { getStartStopCostsController } from "../../controllers/dpm/StartStopCost/getStartStopCostsController.js"
import { GenericApiResponse } from "../../../domain/models/dpm/ApiResponse.js"

/**
 * Function for handle response
 * @param res Express request
 * @param stoppageResult result
 */
const handleResult = (res: Response, stoppageResult: E.Either<ApplicationError, any>): void => {
  if (E.isRight(stoppageResult)) {
    logResponse({
      Success: true,
      Message: res.__("MESSAGE.SUCCESS"),
      Data: stoppageResult.right,
    })

    res.status(HTTP_STATUS.OK).json({
      Success: true,
      Message: res.__("MESSAGE.SUCCESS"),
      Data: stoppageResult.right,
    })
  } else {
    const error: ApplicationError = stoppageResult.left
    switch (error._tag) {
      case "InvalidPlantCodeError":
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
      case "InvalidStartupMode":
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

export const getStartStopCosts = (router: Router): void => {
  router.get(
    "/",
    asyncWrapper(async (req, res) => {
      logger.info("GET StartStopCosts API started")
      await wrapInSnowflakeTransaction(async (snowflakeTransaction) => {
        const startStopCostsRepositorSnowflake = await StartStopCostsRepositorSnowflake(snowflakeTransaction)
        const stoppageResult = await getStartStopCostsController(
          {
            plantCode: String(req.query["plantCode"]),
            unitCode: String(req.query["unitCode"]),
            fiscalYear: String(req.query["fiscalYear"]),
            startupMode: String(req.query["startupMode"]),
          },
          startStopCostsRepositorSnowflake,
          req.__,
        )
        handleResult(res, stoppageResult)
      })
    }),
  )
}
