import { QueryTypes } from "sequelize"
import { Request } from "express"
import {
  Asset,
  assetTaskGroupQuery,
  getPowerPlantUnitTeamRelationAPIResponse,
  getPowerPlantUnitTeamRelationRequest,
  getPowerPlantUnitTeamRelationResponse,
  plantQuery,
  Team,
  teamQueryResponse,
} from "../../../../domain/entities/tot/v1/getPowerPlantUnitTeamRelation.js"
import { cmnSequelize, sequelize } from "../../../../infrastructure/orm/sqlize/index.js"
import { extractValue, jsonOrEmptyResponse } from "../../../decorators.js"
import { Constants } from "../../../../config/constants.js"
import { handleDbError, PowerPlantIdNotFoundError, send404Response } from "./utils.js"
import logger from "../../../../infrastructure/logger.js"

/* get asset task group query by plant id*/
const selectAssetTaskGroupQuery = `SELECT 
  TG.PLANT_ID 'power-plant-id',
  TG.ASSET_TASK_GROUP_ID 'asset-task-group-id',
  TG.ASSET_TASK_GROUP_NAME 'asset-task-group-name',
  TGH.HOURS_PER_DAY 'hours-per-day'
FROM 
  m_asset_task_group_hours TGH
INNER join m_asset_task_group TG on TGH.ASSET_TASK_GROUP_ID = TG.ASSET_TASK_GROUP_ID 
WHERE
  TG.PLANT_ID IN (:plantId)
GROUP BY TG.PLANT_ID,
  TG.ASSET_TASK_GROUP_ID,
  TG.ASSET_TASK_GROUP_NAME,
  TGH.HOURS_PER_DAY
ORDER BY TG.ASSET_TASK_GROUP_ID ASC;`

/* get team details query by asset task group id */
const selectTeamQuery = `SELECT 
  T1.ASSET_TASK_GROUP_ID 'asset-task-group-id',
  T1.ASSET_GROUP_ID 'asset-group-id', 
  T1.TEAM_ID 'team-id', 
  T2.TEAM_NAME 'team-name',
  GTO.OPERATION_ID 'operation-id', 
  O.OPERATION_NAME 'operation-name'
FROM 
  m_asset_task_group AS T1
  inner join m_team AS T2 on T1.team_id = T2.team_id
  left outer join t_asset_task_group_team_operation GTO ON T1.TEAM_ID = GTO.TEAM_ID
  left outer join m_operation O ON GTO.OPERATION_ID = O.OPERATION_ID
WHERE
  T1.ASSET_TASK_GROUP_ID IN (:assetTaskGroupId)
ORDER BY 
  T1.TEAM_ID ASC;`

/** get power-plant data */
const buildPowerPlantQuery = (plantId: string): string => {
  const whereCondition = plantId ? `WHERE PLANT_ID= '${plantId}'` : ""

  /** get power-plant query */
  const selectPlantQuery = `SELECT 
    PLANT_ID 'power-plant-id', 
    PLANT_TEXT 'power-plant-name'
  FROM 
    m_plant
    ${whereCondition}
  `
  return selectPlantQuery
}

/**
 * Get power-plant-unit-team-relation function
 *
 * @async
 * @param {(getPowerPlantUnitTeamRelationRequest | Record<string, any>)} input
 * @returns {Promise<getAssetTaskGroupsAPIResponse>} getPowerPlantUnitTeamRelationAPIResponse
 */
const getPowerPlantUnitTeamRelation = async (
  input: getPowerPlantUnitTeamRelationRequest | Record<string, any>,
): Promise<getPowerPlantUnitTeamRelationAPIResponse> => {
  try {
    /** power-plant-unit-team-relation response*/
    let powerPlantUnitTeamRelationResponse: getPowerPlantUnitTeamRelationResponse[] = []

    /** Build get-power-plant records query */
    const getPowerplantQuery = buildPowerPlantQuery(input[Constants.FIELDS.POWER_PLANT_ID])

    /** get power-plant records */
    const plant = await cmnSequelize.query<plantQuery>(getPowerplantQuery, {
      raw: true,
      type: QueryTypes.SELECT,
    })

    if (input[Constants.FIELDS.POWER_PLANT_ID] && !plant.length) {
      throw new PowerPlantIdNotFoundError(input[Constants.FIELDS.POWER_PLANT_ID])
    }

    // add power-plant-id, power-plant-name and asset to powerPlantUnitTeamRelationResponse
    powerPlantUnitTeamRelationResponse = plant.map((eachPlant) => ({
      "power-plant-id": eachPlant[Constants.FIELDS.POWER_PLANT_ID],
      "power-plant-name": eachPlant[Constants.FIELDS.POWER_PLANT_NAME],
      asset: [],
    }))

    /** get plant-id list */
    const plantList = plant.map((value) => value[Constants.FIELDS.POWER_PLANT_ID])

    /** get asset-task-group records */
    const assetTaskGroupData = await sequelize.query<assetTaskGroupQuery>(selectAssetTaskGroupQuery, {
      replacements: {
        plantId: plantList,
      },
      raw: true,
      type: QueryTypes.SELECT,
    })

    // if asset-task-group relation exists
    if (assetTaskGroupData.length) {
      // assetTaskGroupId list
      const assetTaskGroupId = assetTaskGroupData.map(
        (value: assetTaskGroupQuery) => value[Constants.FIELDS.ASSET_TASK_GROUP_ID],
      )

      /** get team by assetTaskGroupId */
      const team = await sequelize.query<teamQueryResponse>(selectTeamQuery, {
        replacements: {
          assetTaskGroupId: assetTaskGroupId,
        },
        raw: true,
        type: QueryTypes.SELECT,
      })

      const teamData: teamQueryResponse[][] = []
      const assetGroupData: string[][] = []
      // sort team data by asset-task-group-id
      team.map((eachTeam) => {
        if (teamData[eachTeam[Constants.FIELDS.ASSET_TASK_GROUP_ID]] === undefined) {
          teamData[eachTeam[Constants.FIELDS.ASSET_TASK_GROUP_ID]] = []
        }

        // sort team-operation data by asset-task-group-id
        teamData[eachTeam[Constants.FIELDS.ASSET_TASK_GROUP_ID]].push(eachTeam)

        // sort asset-group-id by asset-task-group-id
        if (assetGroupData[eachTeam[Constants.FIELDS.ASSET_TASK_GROUP_ID]] === undefined) {
          assetGroupData[eachTeam[Constants.FIELDS.ASSET_TASK_GROUP_ID]] = []
        }

        if (
          !assetGroupData[eachTeam[Constants.FIELDS.ASSET_TASK_GROUP_ID]].includes(
            eachTeam[Constants.FIELDS.ASSET_GROUP_ID],
          )
        ) {
          assetGroupData[eachTeam[Constants.FIELDS.ASSET_TASK_GROUP_ID]].push(eachTeam[Constants.FIELDS.ASSET_GROUP_ID])
          // sort asset-group-id
          assetGroupData[eachTeam[Constants.FIELDS.ASSET_TASK_GROUP_ID]].sort()
        }
      })

      /** prepare power-plant-unit-team-relation response*/
      assetTaskGroupData.map((assettaskgroup) => {
        const assetTaskGroupId = assettaskgroup[Constants.FIELDS.ASSET_TASK_GROUP_ID]
        // prepare power-plant-unit-team-relation asset object
        const powerPlantUnitTeamRelationAsset: Asset[] = [
          {
            "asset-task-group-id": assetTaskGroupId,
            "asset-task-group-name": assettaskgroup[Constants.FIELDS.ASSET_TASK_GROUP_NAME],
            "hours-per-day": assettaskgroup[Constants.FIELDS.HOURS_PER_DAY],
            "asset-group-id": assetGroupData[assetTaskGroupId],
            teams: extractTeamInfo(teamData[assetTaskGroupId]),
          },
        ]

        // add asset to powerPlantUnitTeamRelationResponse
        powerPlantUnitTeamRelationResponse.forEach((eachRelation: getPowerPlantUnitTeamRelationResponse) => {
          if (eachRelation[Constants.FIELDS.POWER_PLANT_ID] === assettaskgroup[Constants.FIELDS.POWER_PLANT_ID]) {
            eachRelation.asset.push(...powerPlantUnitTeamRelationAsset)
          }
        })
      })
    }

    return {
      code: Constants.STATUS_CODES.SUCCESS_CODE,
      body: powerPlantUnitTeamRelationResponse,
    }
  } catch (err: any) {
    logger.error(err)
    handleDbError("getPowerPlantUnitTeamRelation", err)
    if (err instanceof PowerPlantIdNotFoundError) {
      return send404Response(err)
    }
    return {
      code: Constants.ERROR_CODES.BAD_REQUEST,
      body: Constants.ERROR_MESSAGES.BAD_REQUEST,
    }
  }
}

/**
 * Extract operation on the bases of teamId
 *
 * @param {teamQueryResponse[]} arrTeamData
 * @returns {*} finalTeamOperation
 */
const extractTeamInfo = (arrTeamData: teamQueryResponse[]) => {
  const teams: Team[] = []
  // prepare teams array
  arrTeamData.map((eachTeamData) => {
    const isExists = teams.some((eachTeam) => {
      if (eachTeam[Constants.FIELDS.TEAM_ID] === eachTeamData[Constants.FIELDS.TEAM_ID]) {
        if (eachTeamData[Constants.FIELDS.OPERATION_ID]) {
          // add operation to team
          const isOperationExists = eachTeam[Constants.FIELDS.OPERATION].find(
            (value) => value[Constants.FIELDS.OPERATION_ID] === eachTeamData[Constants.FIELDS.OPERATION_ID],
          )
          if (!isOperationExists) {
            eachTeam[Constants.FIELDS.OPERATION].push({
              "operation-id": eachTeamData[Constants.FIELDS.OPERATION_ID],
              "operation-name": eachTeamData[Constants.FIELDS.OPERATION_NAME],
            })
          }
        }

        return true
      }
      return false
    })

    // add team object to teams if it is not exist in it
    if (!isExists) {
      const newTeam = {
        "team-id": eachTeamData[Constants.FIELDS.TEAM_ID],
        "team-name": eachTeamData[Constants.FIELDS.TEAM_NAME],
        operation: [
          {
            "operation-id": eachTeamData[Constants.FIELDS.OPERATION_ID],
            "operation-name": eachTeamData[Constants.FIELDS.OPERATION_NAME],
          },
        ],
      }
      teams.push(newTeam)
    }
  })

  return teams
}

/**
 * consolidate getPowerPlantUnitTeamRelationRequest
 *
 * @param {Request} req
 * @returns {(getPowerPlantUnitTeamRelationRequest | Record<string, any>)}
 */
export const consolidateGetPowerPlantUnitTeamRelationRequest = (
  req: Request,
): getPowerPlantUnitTeamRelationRequest | Record<string, any> => ({
  "power-plant-id": req.query[Constants.FIELDS.POWER_PLANT_ID],
})

/**
 * getPowerPlantUnitTeamRelation controller
 *
 * @type {*}
 */
export const getPowerPlantUnitTeamRelationController = jsonOrEmptyResponse(
  extractValue(consolidateGetPowerPlantUnitTeamRelationRequest)(getPowerPlantUnitTeamRelation),
  [Constants.STATUS_CODES.SUCCESS_CODE, Constants.ERROR_CODES.NOT_FOUND_CODE, Constants.ERROR_CODES.BAD_REQUEST],
)
