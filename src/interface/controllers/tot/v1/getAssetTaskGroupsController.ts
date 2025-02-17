// Initially copied from ToT-BE, commit 545c1dd02ed8df920e315645df162212e80b2a03
import { Request } from "express"
import { QueryTypes } from "sequelize"

import {
  getAssetTaskGroupsRequest,
  getAssetTaskGroupsAPIResponse,
  getAssetTaskGroupsResponse,
} from "../../../../domain/entities/tot/v1/getAssetTaskGroups.js"
import { sequelize } from "../../../../infrastructure/orm/sqlize/index.js"
import { jsonResponse, extractValue } from "../../../decorators.js"

/* get asset task group query by plant id*/
const QUERY = `SELECT 
DISTINCT(TG.ASSET_TASK_GROUP_ID),
TG.ASSET_TASK_GROUP_NAME,
TGH.HOURS_PER_DAY
FROM 
m_asset_task_group TG,m_asset_task_group_hours TGH 
WHERE 
TG.PLANT_ID = :plantId AND
TGH.ASSET_TASK_GROUP_ID = TG.ASSET_TASK_GROUP_ID
ORDER BY ASSET_TASK_GROUP_ID ASC;`

type queryResponse = {
  ASSET_TASK_GROUP_ID: string
  ASSET_TASK_GROUP_NAME: string
  HOURS_PER_DAY: string
}

/* get team details query by asset task group id */
const TEAM_QUERY = `SELECT 
DISTINCT(T1.TEAM_ID) as TEAM_ID, T2.TEAM_NAME,
GTO.OPERATION_ID, O.OPERATION_NAME
FROM 
  m_asset_task_group AS T1
  inner join m_team AS T2 on T1.team_id = T2.team_id
  left outer join t_asset_task_group_team_operation GTO ON T1.TEAM_ID = GTO.TEAM_ID
  left outer join m_operation O ON GTO.OPERATION_ID = O.OPERATION_ID AND GTO.OPERATION_ID = O.OPERATION_ID
WHERE
  T1.ASSET_TASK_GROUP_ID = :assetTaskGroupId
ORDER BY 
  T1.TEAM_ID ASC;`

/**
 * Description Team Query Response
 *
 * @typedef {teamQueryResponse} Team Query Response
 */
type teamQueryResponse = {
  TEAM_ID: string
  TEAM_NAME: string
  OPERATION_ID: string
  OPERATION_NAME: string
}

/**
 * Description get asset task group function
 *
 * @async
 * @param {(getAssetTaskGroupsRequest | Record<string, any>)} postValidationInput
 * @returns {Promise<getAssetTaskGroupsAPIResponse>} AssetTaskGroupsAPIResponse
 */
const getAssetTaskGroups = async (
  postValidationInput: getAssetTaskGroupsRequest | Record<string, any>,
): Promise<getAssetTaskGroupsAPIResponse> => {
  const input = postValidationInput as getAssetTaskGroupsRequest
  const assetTaskGroupData: queryResponse[] = await sequelize.query<queryResponse>(QUERY, {
    replacements: {
      plantId: input["power-plant-id"],
    },
    raw: true,
    type: QueryTypes.SELECT,
  })
  const teamQueries = assetTaskGroupData.map(
    (x) =>
      sequelize.query<teamQueryResponse>(TEAM_QUERY, {
        replacements: { assetTaskGroupId: x.ASSET_TASK_GROUP_ID },
        raw: true,
        type: QueryTypes.SELECT,
      }) as Promise<teamQueryResponse[]>,
  )
  const teamData = await Promise.all(teamQueries)
  const assetGroupAndTeamData = assetTaskGroupData.map((x, i) => [x, teamData[i]])

  const ret: getAssetTaskGroupsResponse[] = assetGroupAndTeamData.map(([assettaskgroup, team]) => ({
    "asset-task-group-id": Number((assettaskgroup as queryResponse).ASSET_TASK_GROUP_ID),
    "asset-task-group-name": (assettaskgroup as queryResponse).ASSET_TASK_GROUP_NAME,
    "hours-per-day": (assettaskgroup as queryResponse).HOURS_PER_DAY,
    teams: extractTeamInfo(team as teamQueryResponse[]),
  }))

  return {
    code: 200,
    body: ret,
  }
}

/**
 * Description Extract operation on the bases of teamId
 *
 * @param {teamQueryResponse[]} arrTeamData
 * @returns {*} finalAssetTaskGroupTeamOperation
 */
const extractTeamInfo = (arrTeamData: teamQueryResponse[]) => {
  let arrResponse: any = []
  if (arrTeamData.length > 0) {
    const arrTeams: any = {}
    arrTeamData.map((objEachTeamInfo: teamQueryResponse) => {
      if (typeof arrTeams[`id_${objEachTeamInfo["TEAM_ID"]}`] === "undefined") {
        arrTeams[`id_${objEachTeamInfo["TEAM_ID"]}`] = {
          "team-id": objEachTeamInfo["TEAM_ID"],
          "team-name": objEachTeamInfo["TEAM_NAME"],
          operation: [],
        }
      }
    })
    arrTeamData.map((objEachTeamInfo: teamQueryResponse) => {
      const blankOperation = arrTeams[`id_${objEachTeamInfo["TEAM_ID"]}`]["operation"]
        ? arrTeams[`id_${objEachTeamInfo["TEAM_ID"]}`]["operation"]
        : []
      let Operation: any
      if (objEachTeamInfo["OPERATION_ID"] !== null) {
        Operation = {
          "operation-id": objEachTeamInfo["OPERATION_ID"],
          "operation-name": objEachTeamInfo["OPERATION_NAME"],
        }
      }

      const OperationArr = [...blankOperation, Operation]
      arrTeams[`id_${objEachTeamInfo["TEAM_ID"]}`]["operation"] =
        objEachTeamInfo["OPERATION_ID"] === null ? [] : OperationArr
    })

    const finalAssetTaskGroupTeamOperation = Object.values(arrTeams)

    arrResponse = finalAssetTaskGroupTeamOperation
  }
  return arrResponse
}

/* consolidate user request parameter */

/**
 * Description consolidategetAssetTaskGroupsRequest
 *
 * @param {Request} req
 * @returns {(getAssetTaskGroupsRequest | Record<string, any>)}
 */
export const consolidategetAssetTaskGroupsRequest = (
  req: Request,
): getAssetTaskGroupsRequest | Record<string, any> => ({
  "power-plant-id": req.query["power-plant-id"],
})

/**
 * Description getAssetTaskGroups
 *
 * @type {*}
 */
export const getAssetTaskGroupsController = jsonResponse(
  extractValue(consolidategetAssetTaskGroupsRequest)(getAssetTaskGroups),
)
