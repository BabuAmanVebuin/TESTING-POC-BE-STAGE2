// Imported from DPM-BE, commit d0e2f45544cc9890762f93cf3e8f224f15efd619
import { Response, Router } from "express"
import * as E from "fp-ts/lib/Either.js"

import { SnowflakeTransaction, wrapInSnowflakeTransaction } from "../../../infrastructure/orm/snowflake/index.js"
import { ApplicationError } from "../../../application/errors/dpm/index.js"
import { KPI005ResponseData } from "../../../domain/models/dpm/Kpi005.js"
import { HTTP_STATUS } from "../../../config/dpm/constant.js"
import { GenericApiResponse } from "../../../domain/models/dpm/ApiResponse.js"
import { asyncWrapper, logResponse } from "./util.js"
import logger from "../../../infrastructure/logger.js"
import { getKPI005Controller } from "../../controllers/dpm/KPI005/getKPI005Controller.js"

const handleResult = (res: Response, stoppageResult: E.Either<ApplicationError, KPI005ResponseData>): void => {
  if (E.isRight(stoppageResult)) {
    if (!stoppageResult.right) {
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
      })

      res.status(HTTP_STATUS.OK).json({
        Success: true,
        Message: res.__("MESSAGE.SUCCESS"),
        Data: stoppageResult.right,
      })
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
        } as GenericApiResponse)

        res.status(HTTP_STATUS.INTERNAL_SERVER).json({
          Success: false,
          Message: res.__("ERROR.INTERNAL_SERVER"),
        } as GenericApiResponse)
    }
  }
}

export const getKPI005Data = (router: Router): void => {
  router.get(
    "/",
    asyncWrapper(async (req, res) => {
      await wrapInSnowflakeTransaction(async (snowflakeTransaction: SnowflakeTransaction) => {
        logger.info("GET kpi005 API started")

        const stoppageResult = await getKPI005Controller(
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
