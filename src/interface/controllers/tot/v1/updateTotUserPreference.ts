// Initially copied from ToT-BE, commit 545c1dd02ed8df920e315645df162212e80b2a03

import { Request } from "express"
import { BaseError } from "sequelize"

import {
  updateToTUserPreferencesAPIResponse,
  updateToTUserPreferencesRequest,
} from "../../../../domain/entities/tot/v1/updateToTUserPreferences.js"
import { userTotModel } from "../../../../infrastructure/orm/sqlize/models/userToT/index.js"
import { emptyResponse, extractValue } from "../../../decorators.js"

import { handleDbError, poorlyShapedRequest } from "./utils.js"

/* update user preferences function */
const updateToTUserPreferences = async (
  input: updateToTUserPreferencesRequest,
): Promise<updateToTUserPreferencesAPIResponse> => {
  try {
    /* update param in user table */
    await userTotModel.update(
      {
        asset_task_group_id: input["asset-task-group-id"],
        plant_id: input["power-plant-id"],
        team_id: input["team-id"],
        user_name: input["user-name"],
        device_token: input["device-token"],
      },
      {
        where: {
          user_id: input["user-id"],
        },
        returning: true,
      },
    )
    return {
      code: 204,
      body: "OK",
    }
  } catch (error) {
    handleDbError("createHotUserPreference.js", error as BaseError)
    return {
      code: 400,
      body: "Error during Insert request.  Data has been logged.  Please try again.",
    }
  }
}

/* consolidate user request parameter */
export const consolidateupdateToTUserPreferencesRequest = (
  req: Request,
): updateToTUserPreferencesRequest | poorlyShapedRequest => ({
  "user-id": req.params.userId,
  "user-name": req.body["user-name"],
  "power-plant-id": req.body["power-plant-id"],
  "asset-task-group-id": Number(req.body["asset-task-group-id"]),
  "team-id": Number(req.body["team-id"]),
  "device-token": req.body["device-token"],
})

export const updateToTUserPreferenceController = emptyResponse(
  extractValue(consolidateupdateToTUserPreferencesRequest)(updateToTUserPreferences),
)
