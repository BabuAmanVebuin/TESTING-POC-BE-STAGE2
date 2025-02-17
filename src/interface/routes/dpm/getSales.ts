// Imported from DPM-BE, commit d0e2f45544cc9890762f93cf3e8f224f15efd619
import * as E from "fp-ts/lib/Either.js"
import { asyncWrapper, logResponse } from "./util.js"
import { Response, Router } from "express"
import { SnowflakeTransaction, wrapInSnowflakeTransaction } from "../../../infrastructure/orm/snowflake/index.js"
import { ApplicationError } from "../../../application/errors/dpm/index.js"
import { salesPriceResponse } from "../../../domain/entities/dpm/getSalesPrice.js"
import { HTTP_STATUS } from "../../../config/dpm/constant.js"
import { getSalesPriceController } from "../../controllers/dpm/Sales/getSalesPriceController.js"
import logger from "../../../infrastructure/logger.js"

/**
 * Function result response Handler
 * @param res Express Response
 * @param stoppageResult
 */
const handleResult = (res: Response, stoppageResult: E.Either<ApplicationError, salesPriceResponse>): void => {
  /**
   * Handel Response
   */
  if (E.isRight(stoppageResult)) {
    logResponse(stoppageResult.right)
    res.status(HTTP_STATUS.OK).send(stoppageResult.right)
  } else {
    const error: ApplicationError = stoppageResult.left
    switch (error._tag) {
      case "InvalidPlantAndUnitCodeError":
        logResponse(error.message)
        res.status(HTTP_STATUS.NOT_FOUND).send(error.message)
        break
      case "InvalidFiscalYearError":
        logResponse(error.message)
        res.status(HTTP_STATUS.BAD_REQUEST).send(error.message)
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
 * Get Sales Data
 * @param router Express Router
 * @param connection Data base connection
 */
export const getSales = (router: Router): void => {
  /**
   * Express router for GET sales
   */
  router.get(
    "/:plantId/:unitId/:fiscalYear",
    asyncWrapper(async (req, res) => {
      await wrapInSnowflakeTransaction(async (snowflakeTransaction: SnowflakeTransaction) => {
        logger.info(`GET sales API started`)
        /**
         * Request controller
         */
        const salesResult = await getSalesPriceController(
          {
            plantId: String(req.params["plantId"]),
            unitId: String(req.params["unitId"]),
            fiscalYear: String(req.params["fiscalYear"]),
          },
          snowflakeTransaction,
          req.__,
        )
        // Result Handler
        handleResult(res, salesResult)
      })
    }),
  )
}
