// Initially copied from ToT-BE, commit 545c1dd02ed8df920e315645df162212e80b2a03
import { Request } from "express"
import { QueryTypes } from "sequelize"

import {
  getToTUsersRequest,
  getToTUsersAPIResponse,
  getToTUsersResponse,
} from "../../../../domain/entities/tot/v1/getToTUsers.js"
import { sequelize } from "../../../../infrastructure/orm/sqlize/index.js"
import { extractValue, jsonResponse } from "../../../decorators.js"

/* get user function */
export const getToTUsers = async (
  postValidationInput: getToTUsersRequest | Record<string, any>,
): Promise<getToTUsersAPIResponse> => {
  const input = postValidationInput as getToTUsersRequest

  /* get user query */
  const userQuery = `SELECT
      T1.USER_ID 'user-id',
      T1.USER_NAME 'user-name',
      T2.TEAM_ID 'team-id',
      T2.TEAM_NAME 'team-name'
    FROM
      m_user_tot T1 JOIN
      m_team T2 ON T1.TEAM_ID = T2.TEAM_ID
    WHERE T1.PLANT_ID = :plantId AND T1.ASSET_TASK_GROUP_ID = :assetTaskGroupId
    ORDER BY USER_NAME ASC;`

  type Row = {
    "user-id": string
    "user-name": string
    "team-id": number
    "team-name": string
  }
  const rows = await sequelize.query<Row>(userQuery, {
    raw: true,
    type: QueryTypes.SELECT,
    replacements: {
      plantId: input["power-plant-id"],
      assetTaskGroupId: input["asset-task-group-id"],
    },
  })

  const teams = new Map<number, getToTUsersResponse>()

  rows.forEach((row, _idx, _arr) => {
    if (teams.get(row["team-id"]) === undefined) {
      teams.set(row["team-id"], {
        "team-id": row["team-id"],
        "team-name": row["team-name"],
        users: [],
      })
    }

    ;(teams.get(row["team-id"]) as getToTUsersResponse).users.push({
      "user-id": row["user-id"],
      "user-name": row["user-name"],
    })
  })

  return {
    code: 200,
    body: [...teams.values()],
  }
}

/* consolidate user request parameter */

export const consolidategetToTUsersRequest = (req: Request): getToTUsersRequest | Record<string, any> => ({
  "power-plant-id": req.query["power-plant-id"],
  "asset-task-group-id": Number(req.query["asset-task-group-id"]),
})

export const getToTUsersController = jsonResponse(extractValue(consolidategetToTUsersRequest)(getToTUsers))
