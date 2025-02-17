// Imported from DPM-BE, commit d0e2f45544cc9890762f93cf3e8f224f15efd619
import { Response, Router } from "express"
import * as E from "fp-ts/lib/Either.js"

import logger from "../../../infrastructure/logger.js"
import { wrapInSnowflakeTransaction } from "../../../infrastructure/orm/snowflake/index.js"
import { ApplicationError } from "../../../application/errors/dpm/index.js"
import { StoppageResponceRecord } from "../../../domain/models/dpm/Stoppage.js"
import { HTTP_STATUS } from "../../../config/dpm/constant.js"
import { GenericApiResponse } from "../../../domain/models/dpm/ApiResponse.js"
import { asyncWrapper, logResponse } from "./util.js"
import { getStoppageController } from "../../controllers/dpm/Stoppage/stoppageController.js"

const handleResult = (res: Response, stoppageResult: E.Either<ApplicationError, StoppageResponceRecord[]>): void => {
  if (E.isRight(stoppageResult)) {
    if (stoppageResult.right.length === 0) {
      logResponse({
        Success: false,
        Message: res.__("ERROR.NO_DATA_FOUND"),
      } as GenericApiResponse)

      res.status(HTTP_STATUS.OK).json({
        Success: false,
        Message: res.__("ERROR.NO_DATA_FOUND"),
      } as GenericApiResponse)
    } else {
      logResponse({
        Success: true,
        Message: res.__("MESSAGE.SUCCESS"),
        Data: stoppageResult.right,
      } as GenericApiResponse)

      res.status(HTTP_STATUS.OK).json({
        Success: true,
        Message: res.__("MESSAGE.SUCCESS"),
        Data: stoppageResult.right,
      } as GenericApiResponse)
    }
  } else {
    const error: ApplicationError = stoppageResult.left
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
        })

        res.status(HTTP_STATUS.INTERNAL_SERVER).json({
          Success: false,
          Message: res.__("ERROR.INTERNAL_SERVER"),
        })
    }
  }
}

export const getStoppageData = (router: Router): void => {
  router.get(
    "/",
    asyncWrapper(async (req, res) => {
      logger.info("GET stoppages API started")
      await wrapInSnowflakeTransaction(async (snowflakeTransaction) => {
        const stoppageResult = await getStoppageController(
          {
            plantCode: String(req.query["plantCode"]),
            unitCode: String(req.query["unitCode"]),
            fiscalYear: String(req.query["fiscalYear"]),
          },
          snowflakeTransaction,
          req.__,
        )
        handleResult(res, stoppageResult)
      })
    }),
  )
}
