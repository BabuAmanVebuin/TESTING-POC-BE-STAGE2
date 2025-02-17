// Imported from DPM-BE, commit d0e2f45544cc9890762f93cf3e8f224f15efd619
import { isRight, Either } from "fp-ts/lib/Either.js"
import { asyncWrapper, logResponse } from "./util.js"
import { Response, Router } from "express"

import { wrapInSnowflakeTransaction } from "../../../infrastructure/orm/snowflake/index.js"
import logger from "../../../infrastructure/logger.js"
import { ApplicationError } from "../../../application/errors/dpm/index.js"
import { BasicChargeJson } from "../../../domain/models/dpm/BasicChargeJson.js"
import { HTTP_STATUS } from "../../../config/dpm/constant.js"
import { basicChargeRepositorySnowflake } from "../../../infrastructure/repositories/dpm/snowflake/basicChargeRepositorySnowflake.js"
import { getBasicChargeController } from "../../controllers/dpm/getBasicChargeController.js"

// Function to handle the result of the BasicCharge API request
const handleResult = (res: Response, basicChargeJson: Either<ApplicationError, BasicChargeJson>): void => {
  if (isRight(basicChargeJson)) {
    logResponse(basicChargeJson.right)
    res.status(HTTP_STATUS.OK).send(basicChargeJson.right)
  } else {
    const error: ApplicationError = basicChargeJson.left
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

// Handler for the GET BasicCharge API endpoint
export const getBasicCharge = (router: Router): void => {
  router.get(
    "/",
    asyncWrapper(async (req, res) => {
      logger.info(`GET BasicCharge API started`) // Logging a message indicating the start of the BasicCharge API request
      await wrapInSnowflakeTransaction(async (snowflakeTransaction) => {
        const basicChargeRepository = await basicChargeRepositorySnowflake(snowflakeTransaction)
        const basicChargeJson = await getBasicChargeController(
          {
            plantCode: String(req.query["plantCode"]),
            unitCode: String(req.query["unitCode"]),
            epochSeconds: Number(req.query["epochSeconds"]),
          },
          basicChargeRepository,
          req.__,
        )
        handleResult(res, basicChargeJson)
      })
    }),
  )
}
