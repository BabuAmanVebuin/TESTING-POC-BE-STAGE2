// Imported from DPM-BE, commit d0e2f45544cc9890762f93cf3e8f224f15efd619
import { Response, Router } from "express"
import * as E from "fp-ts/lib/Either.js"
import { ApplicationError } from "../../../application/errors/dpm/index.js"
import { GenericApiResponse } from "../../../domain/models/dpm/ApiResponse.js"
import { EBITDAResponseType } from "../../../domain/models/dpm/kpi003Estimations.js"
import { HTTP_STATUS } from "../../../config/dpm/constant.js"
import { getEBITDAEstimatesController } from "../../controllers/dpm/KPI003/getEBITDAEstimatesController.js"
import { asyncWrapper, logResponse } from "./util.js"
import logger from "../../../infrastructure/logger.js"
import { SnowflakeTransaction, wrapInSnowflakeTransaction } from "../../../infrastructure/orm/snowflake/index.js"
import { KPI003EstimationRepositorySnowflake } from "../../../infrastructure/repositories/dpm/snowflake/Kpi003EstimationRepositorySnowflake.js"

/**
 * Function to handle API response
 * @param res
 * @param
 */
const handleResult = (res: Response, result: E.Either<ApplicationError, EBITDAResponseType>): void => {
  if (E.isRight(result)) {
    logResponse({
      Success: true,
      Message: res.__("MESSAGE.SUCCESS"),
      Data: result.right,
    })
    res.status(HTTP_STATUS.OK).json({
      Success: true,
      Message: res.__("MESSAGE.SUCCESS"),
      Data: result.right,
    })
  } else {
    const error: ApplicationError = result.left
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
      case "InvalidForecastCategoryError":
        logResponse({
          Success: false,
          Message: error.message,
        } as GenericApiResponse)

        res.status(HTTP_STATUS.BAD_REQUEST).json({
          Success: false,
          Message: error.message,
        } as GenericApiResponse)
        break
      case "InvalidGranularityCategoryError":
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
/**
 * Function for create router
 * @param router
 * @param connection
 */
export const getEBITDAEstimates = (router: Router): void => {
  router.get(
    "/estimates",
    asyncWrapper(async (req, res) => {
      logger.info("GET EBITDAEstimates API started")
      //request controller
      await wrapInSnowflakeTransaction(async (snowflakeTransaction: SnowflakeTransaction) => {
        const kpi003EstimationRepository = await KPI003EstimationRepositorySnowflake(snowflakeTransaction)
        const EBITDAResult = await getEBITDAEstimatesController(
          {
            plantCode: String(req.query?.plantCode),
            unitCode: String(req.query?.unitCode),
            forecastCategory: String(req.query?.forecastCategory),
            granularity: String(req.query.granularity),
          },
          kpi003EstimationRepository,
          req.__,
        )
        handleResult(res, EBITDAResult)
      })
    }),
  )
}
