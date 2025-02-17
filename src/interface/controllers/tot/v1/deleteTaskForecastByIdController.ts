// Initially copied from ToT-BE, commit 545c1dd02ed8df920e315645df162212e80b2a03
import { Request } from "express"
import { QueryTypes } from "sequelize"

import {
  deleteTaskForecastByIdAPIResponse,
  deleteTaskForecastByIdRequest,
  deleteTaskForecastByIdQueryResponse,
} from "../../../../domain/entities/tot/v1/deleteTaskForecastById.js"
import { sequelize } from "../../../../infrastructure/orm/sqlize/index.js"
import { jsonResponse, extractValue } from "../../../decorators.js"
import { Constants } from "../../../../config/constants.js"
import { TaskForecastIdNotFoundError, send404Response } from "./utils.js"

/**
 * Query to get task forecast data from database
 */
const getTaskForecastQuery = `
SELECT 
    TASK_FORECAST_ID 'task-forecast-id'
FROM t_task_forecast
WHERE TASK_FORECAST_ID = :taskForecastId LIMIT 1
`
/**
 * Query to delete task forecast
 */
const deleteTaskForecastByIdQuery = `
DELETE FROM t_task_forecast WHERE TASK_FORECAST_ID = :taskForecastId LIMIT 1
`

/**  delete task forecast info by id function */
const deleteTaskForecastById = async (
  postValidationInput: deleteTaskForecastByIdRequest | Record<string, any>,
): Promise<deleteTaskForecastByIdAPIResponse> => {
  try {
    const input = postValidationInput as deleteTaskForecastByIdRequest

    const taskForecastId = input[Constants.FIELDS.TASK_FORECAST_ID]

    let arrTaskForecastReord: deleteTaskForecastByIdQueryResponse[]

    const sequelizeTransactionResponse = await sequelize.transaction(async (transaction) => {
      /**
       * Query for validating task forecast id
       */
      arrTaskForecastReord = await sequelize.query<deleteTaskForecastByIdQueryResponse>(getTaskForecastQuery, {
        raw: true,
        type: QueryTypes.SELECT,
        transaction,
        replacements: { taskForecastId },
      })

      /**
       * If task forecast id not found in database, then thorw error
       */
      if (arrTaskForecastReord.length == 0) {
        throw new TaskForecastIdNotFoundError(taskForecastId)
      }

      /**
       * Deleting task forecast id
       */
      await sequelize.query(deleteTaskForecastByIdQuery, {
        raw: true,
        type: QueryTypes.DELETE,
        transaction,
        replacements: { taskForecastId },
      })

      return {
        code: 200,
        body: "OK",
      }
    })

    return sequelizeTransactionResponse
  } catch (err) {
    if (err instanceof TaskForecastIdNotFoundError) {
      return send404Response(err)
    }

    return {
      code: 400,
      body: "Bad Request",
    }
  }
}

/* consolidate delete task forecast by id request parameter */
export const consolidateDeleteTaskForecastByIdRequest = (
  req: Request,
): deleteTaskForecastByIdRequest | Record<string, any> => ({
  "task-forecast-id": Number(req.params.taskForecastId),
})

export const deleteTaskForecastByIdController = jsonResponse(
  extractValue(consolidateDeleteTaskForecastByIdRequest)(deleteTaskForecastById),
)
