// Initially copied from ToT-BE, commit 545c1dd02ed8df920e315645df162212e80b2a03

import { Request } from "express"
import { BaseError } from "sequelize"

import { createToTUserPreferencesRequest } from "../../../../domain/entities/tot/v1/createTotUserPreference.js"
/*import { sequelize } from '../../../infrastructure/orm/sqlize/index.ts'*/
import { userTotModel } from "../../../../infrastructure/orm/sqlize/models/userToT/index.js"
import { emptyResponse, extractValue, Result } from "../../../../interface/decorators.js"

import { handleDbError, poorlyShapedRequest } from "./utils.js"

/* create user preferences function */
const createTotUserPreferences = async (input: createToTUserPreferencesRequest): Promise<Result> => {
  try {
    /* check user exists */
    const userAlreadyExists = await userTotModel.findOne({
      where: { user_id: input["user-id"] },
    })

    if (userAlreadyExists != null) {
      return {
        code: 409,
        body: "Conflict",
      }
    }

    /* user user model create query */
    const result = await userTotModel.create({
      user_id: input["user-id"],
      user_name: input["user-name"],
      plant_id: input["power-plant-id"],
      asset_task_group_id: input["asset-task-group-id"],
      team_id: input["team-id"],
    })

    return {
      code: 201,
      body: {
        message: "Created",
        value: result,
      },
    }
  } catch (error) {
    handleDbError("createHotUserPreference.js", error as BaseError)
    return {
      code: 404,
      body: {
        message: "Error during Insert request.  Data has been logged.  Please try again.",
        error,
      },
    }
  }
}

/* consolidate user request parameter */
export const consolidatecreateToTUserPreferencesRequest = (
  req: Request,
): createToTUserPreferencesRequest | poorlyShapedRequest => ({
  "user-id": req.params.userId,
  "user-name": req.body["user-name"],
  "power-plant-id": req.body["power-plant-id"],
  "asset-task-group-id": Number(req.body["asset-task-group-id"]),
  "team-id": Number(req.body["team-id"]),
})

export const createToTUserPreferenceController = emptyResponse(
  extractValue(consolidatecreateToTUserPreferencesRequest)(createTotUserPreferences),
)
