// Imported from DPM-BE, commit d0e2f45544cc9890762f93cf3e8f224f15efd619
import * as E from "fp-ts/lib/Either.js"
import { asyncWrapper, logResponse } from "./util.js"
import { Response, Router } from "express"
import { wrapInSnowflakeTransaction } from "../../../infrastructure/orm/snowflake/index.js"
import logger from "../../../infrastructure/logger.js"
import { ApplicationError } from "../../../application/errors/dpm/index.js"
import { HTTP_STATUS } from "../../../config/dpm/constant.js"
import { negativeSpreadRepository } from "../../../infrastructure/repositories/dpm/snowflake/NegativeSpreadRepositorySnowflake.js"
import { getNegativeSpreadHoursController } from "../../controllers/dpm/getNegativeSpreads/getNegativeSpreadHoursController.js"

/**
 * Function for handle get negative hours spread
 * @param res Express res
 * @param negativeSpreadResult
 */
const handleResult = (res: Response, negativeSpreadResult: E.Either<ApplicationError, any>): void => {
  if (E.isRight(negativeSpreadResult)) {
    logResponse({
      Success: true,
      Message: res.__("MESSAGE.SUCCESS"),
      Data: negativeSpreadResult.right,
    })

    res.status(HTTP_STATUS.OK).json({
      Success: true,
      Message: res.__("MESSAGE.SUCCESS"),
      Data: negativeSpreadResult.right,
    })
  } else {
    const error: ApplicationError = negativeSpreadResult.left
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
      case "InvalidFiscalYearError":
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
 * Router function for get negative hours Spread
 * @param router Express router
 * @param connection db connection
 */
export const getNegativeSpreadHours = (router: Router): void => {
  router.get(
    "/",
    asyncWrapper(async (req, res) => {
      logger.info("GET negative-spreads-hours API started")
      await wrapInSnowflakeTransaction(async (snowflakeTransaction) => {
        const negativeSpreadRepositorySnowflake = await negativeSpreadRepository(snowflakeTransaction)
        const result = await getNegativeSpreadHoursController(
          {
            plantCode: String(req.query["plantCode"]),
            unitCode: String(req.query["unitCode"]),
            fiscalYear: String(req.query["fiscalYear"]),
          },
          negativeSpreadRepositorySnowflake,
          req.__,
        )
        handleResult(res, result)
      })
    }),
  )
}
