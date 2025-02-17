import { Request } from "express"
import { QueryTypes, Transaction } from "sequelize"

import { cmnSequelize, sequelize } from "../../../../infrastructure/orm/sqlize/index.js"
import { extractValue, jsonOrEmptyResponse } from "../../../decorators.js"
import logger from "../../../../infrastructure/logger.js"
import { Constants } from "../../../../config/constants.js"

import {
  AssetTaskGroupIdsNotFoundError,
  handleDbError,
  InvalidAssetTaskGroupNameError,
  OperationIdsNotFoundError,
  PowerPlantIdNotFoundError,
  send400Response,
  send404Response,
  setDifference,
} from "./utils.js"
import {
  Asset,
  createPowerPlantUnitTeamRelationAPIResponse,
  createPowerPlantUnitTeamRelationRequest,
  Team,
} from "../../../../domain/entities/tot/v1/createPowerPlantUnitTeamRelation.js"

/**
 * create powerplant unit team relation function
 *
 * @async
 * @param {(createPowerPlantUnitTeamRelationRequest | Record<string, any>)} postValidationInput
 * @returns {Promise<createPowerPlantUnitTeamRelationAPIResponse>} createPowerPlantUnitTeamRelationAPI
 */
const createPowerPlantUnitTeamRelation = async (
  postValidationInput: createPowerPlantUnitTeamRelationRequest | Record<string, any>,
): Promise<createPowerPlantUnitTeamRelationAPIResponse> => {
  const input = postValidationInput as createPowerPlantUnitTeamRelationRequest

  /** select power-plant-id */
  const selectPlantIdQuery = `SELECT PLANT_ID FROM m_plant WHERE PLANT_ID = :plantId;`

  /** select existing assetTaskGroup */
  const selectExistingAssetTaskGroupIdQuery = `SELECT 
      DISTINCT ASSET_TASK_GROUP_ID
    FROM m_asset_task_group
      WHERE ASSET_TASK_GROUP_ID IN (:assetTaskGroupId);`

  /** get existing operation-id query */
  const selectExistingOperationIdQuery = "SELECT OPERATION_ID FROM m_operation WHERE OPERATION_ID IN (:operationId)"

  /** get asset-task-group-id query */
  const selectassetTaskGroupIdQuery = `SELECT distinct ASSET_TASK_GROUP_ID 'asset-task-group-id' FROM m_asset_task_group order by ASSET_TASK_GROUP_ID DESC LIMIT 1;`

  /** getAssetTaskGroupName query */
  const selectAssetTaskGroupNameQuery = `SELECT ASSET_TASK_GROUP_NAME, ASSET_GROUP_ID 
  FROM m_asset_task_group 
  WHERE ASSET_TASK_GROUP_ID = :assetTaskGroupId
  GROUP BY ASSET_TASK_GROUP_NAME, ASSET_GROUP_ID;
  `

  /** insert team query */
  const insertTeamQuery = `INSERT INTO m_team (TEAM_NAME)
  VALUES
  (
  :teamName);`

  /** insert asset-task-group query */
  const insertAssetTaskGroupQuery = `INSERT IGNORE INTO m_asset_task_group
  (
  ASSET_TASK_GROUP_ID,  
  ASSET_GROUP_ID,
  PLANT_ID,
  TEAM_ID,
  ASSET_TASK_GROUP_NAME)
  VALUES
  (
  :assetTaskGroupId,
  :assetGroupId,
  :plantId,
  :teamId,
  :assetTaskGroupName)`

  /** insert asset-task-group-hours-per-day query */
  const insertAssetTaskGroupHoursPerDayQuery = `INSERT IGNORE INTO m_asset_task_group_hours
          (ASSET_TASK_GROUP_ID,
          HOURS_PER_DAY)
          VALUES
          (
          :assetTaskGroupId,
          :hoursPerDay)`

  /** insert asset-task-group-team-operation relation query */
  const insertAssetTaskGroupWithTeamOperationQuery = `INSERT IGNORE INTO t_asset_task_group_team_operation
          (ASSET_TASK_GROUP_ID,
          TEAM_ID,
          OPERATION_ID)
          VALUES(
             :assetTaskGroupId,
             :teamId,
             :operationId);`

  try {
    const result = await sequelize.transaction<createPowerPlantUnitTeamRelationAPIResponse>(
      async (transaction: Transaction) => {
        // validate power-plant-id
        const plantResult = await cmnSequelize.query<{ PLANT_ID: string }>(selectPlantIdQuery, {
          replacements: {
            plantId: input[Constants.FIELDS.POWER_PLANT_ID],
          },
          raw: true,
          plain: true,
          type: QueryTypes.SELECT,
        })

        if (!plantResult) {
          throw new PowerPlantIdNotFoundError(input[Constants.FIELDS.POWER_PLANT_ID])
        }

        /** get operation-id and asset-task-group-id list from request*/
        let operationIdList: number[] = []
        const assetTaskGroupIdList: number[] = []
        input.asset.forEach((eachAsset: Asset) => {
          eachAsset[Constants.FIELDS.TEAM].forEach((eachTeam: Team) => {
            if (eachTeam[Constants.FIELDS.OPERATION_ID]) {
              operationIdList.push(...eachTeam[Constants.FIELDS.OPERATION_ID])
            }
          })
          eachAsset[Constants.FIELDS.ASSET_TASK_GROUP_ID] &&
            assetTaskGroupIdList.push(eachAsset[Constants.FIELDS.ASSET_TASK_GROUP_ID]!)
        })

        // make operation-id list unique
        operationIdList = Array.from(new Set(operationIdList))

        // validate asset-task-group-id
        if (assetTaskGroupIdList.length) {
          /** get existing asset-task-group-id */
          let existingAssetTaskGroupIdResult: {
            ASSET_TASK_GROUP_ID: string
          }[] = []
          existingAssetTaskGroupIdResult = await sequelize.query<{
            ASSET_TASK_GROUP_ID: string
          }>(selectExistingAssetTaskGroupIdQuery, {
            raw: true,
            type: QueryTypes.SELECT,
            replacements: {
              assetTaskGroupId: assetTaskGroupIdList,
            },
            transaction,
          })
          const existingAssetTaskGroupIdSet = new Set(
            existingAssetTaskGroupIdResult.map((value) => value.ASSET_TASK_GROUP_ID),
          )
          const assetTaskGroupIdSet = new Set(assetTaskGroupIdList)

          // check difference between requested asset-task-group-id and existing asset-task-group-id
          const notFoundAssetTaskGroupIdSet = setDifference(assetTaskGroupIdSet, existingAssetTaskGroupIdSet)

          if (notFoundAssetTaskGroupIdSet.size > 0) {
            throw new AssetTaskGroupIdsNotFoundError([...notFoundAssetTaskGroupIdSet])
          }
        }

        if (operationIdList.length) {
          /** get existing operation-id */
          let existingOperationIdResult: { OPERATION_ID: string }[] = []
          existingOperationIdResult = await sequelize.query<{
            OPERATION_ID: string
          }>(selectExistingOperationIdQuery, {
            raw: true,
            type: QueryTypes.SELECT,
            replacements: {
              operationId: operationIdList,
            },
            transaction,
          })
          const existingOperationIdSet = new Set(existingOperationIdResult.map((value) => value.OPERATION_ID))
          const operationIdSet = new Set(operationIdList)

          // check difference between requested operation-id and existing operation-id
          const notFoundOperationIdSet = setDifference(operationIdSet, existingOperationIdSet)

          if (notFoundOperationIdSet.size > 0) {
            throw new OperationIdsNotFoundError(notFoundOperationIdSet)
          }
        }

        /** get asset-task-group records for get last asset-task-group-id */
        const selectassetTaskGroupIdData = await sequelize.query<{
          "asset-task-group-id": number
        }>(selectassetTaskGroupIdQuery, {
          raw: true,
          plain: true,
          type: QueryTypes.SELECT,
          transaction,
        })

        let maxAssetTaskGroupId = selectassetTaskGroupIdData
          ? selectassetTaskGroupIdData[Constants.FIELDS.ASSET_TASK_GROUP_ID]
          : 0

        for (const asset of input.asset) {
          let newAssetTaskGroupId
          let assetGroupIds: string[] = []
          // if request contain new asset-task-group-id then validate it
          if (asset[Constants.FIELDS.ASSET_TASK_GROUP_ID]) {
            newAssetTaskGroupId = asset[Constants.FIELDS.ASSET_TASK_GROUP_ID]

            /** get assetTaskGroupName query */
            const selectassetTaskGroupNameResult = await sequelize.query<{
              ASSET_TASK_GROUP_NAME: string
              ASSET_GROUP_ID: string
            }>(selectAssetTaskGroupNameQuery, {
              raw: true,
              type: QueryTypes.SELECT,
              replacements: {
                assetTaskGroupId: asset[Constants.FIELDS.ASSET_TASK_GROUP_ID],
              },
              transaction,
            })

            if (selectassetTaskGroupNameResult.length) {
              if (
                asset[Constants.FIELDS.ASSET_TASK_GROUP_NAME] !==
                selectassetTaskGroupNameResult[0].ASSET_TASK_GROUP_NAME
              ) {
                throw new InvalidAssetTaskGroupNameError(asset[Constants.FIELDS.ASSET_TASK_GROUP_NAME])
              }
            }

            // existing asset-group-id
            assetGroupIds = selectassetTaskGroupNameResult.map((value) => value.ASSET_GROUP_ID)
          } else {
            // increament of asset-task-group-id for insert new record
            maxAssetTaskGroupId = maxAssetTaskGroupId + 1
            newAssetTaskGroupId = maxAssetTaskGroupId
            // asset-group-id
            assetGroupIds = asset[Constants.FIELDS.ASSET_GROUP_ID]
          }

          for (const team of asset.teams) {
            // insert new team
            const [teamId] = await sequelize.query(insertTeamQuery, {
              raw: true,
              type: QueryTypes.INSERT,
              transaction,
              replacements: {
                teamName: team[Constants.FIELDS.TEAM_NAME],
              },
            })

            for (const assetGroup of assetGroupIds) {
              // insert asset-task-group
              await sequelize.query(insertAssetTaskGroupQuery, {
                raw: true,
                type: QueryTypes.INSERT,
                transaction,
                replacements: {
                  assetTaskGroupId: newAssetTaskGroupId,
                  assetGroupId: assetGroup,
                  assetTaskGroupName: asset[Constants.FIELDS.ASSET_TASK_GROUP_NAME],
                  plantId: input[Constants.FIELDS.POWER_PLANT_ID],
                  teamId: teamId,
                },
              })

              // if asset-task-group-id is not defined in request
              if (!asset[Constants.FIELDS.ASSET_TASK_GROUP_ID]) {
                // insert asset-task-group-hours-per-day
                await sequelize.query(insertAssetTaskGroupHoursPerDayQuery, {
                  raw: true,
                  type: QueryTypes.INSERT,
                  transaction,
                  replacements: {
                    hoursPerDay: asset[Constants.FIELDS.HOURS_PER_DAY] + ":00",
                    assetTaskGroupId: newAssetTaskGroupId,
                  },
                })
              }

              for (const operation of team[Constants.FIELDS.OPERATION_ID]) {
                // insert asset-task-group-team-operation relation
                await sequelize.query(insertAssetTaskGroupWithTeamOperationQuery, {
                  raw: true,
                  type: QueryTypes.INSERT,
                  transaction,
                  replacements: {
                    assetTaskGroupId: newAssetTaskGroupId,
                    teamId: teamId,
                    operationId: operation,
                  },
                })
              }
            }
          }
        }
        return {
          code: Constants.STATUS_CODES.CREATE_SUCCESS_CODE,
          body: Constants.SUCCESS_MESSAGES.SUCCESS,
        } as createPowerPlantUnitTeamRelationAPIResponse
      },
    )
    return result
  } catch (err: any) {
    logger.error(err)
    handleDbError("createPowerPlantUnitTeamRelation", err)
    if (
      err instanceof PowerPlantIdNotFoundError ||
      err instanceof AssetTaskGroupIdsNotFoundError ||
      err instanceof OperationIdsNotFoundError
    ) {
      return send404Response(err)
    }

    if (err instanceof InvalidAssetTaskGroupNameError) {
      return send400Response(err)
    }

    return {
      code: Constants.ERROR_CODES.BAD_REQUEST,
      body: Constants.ERROR_MESSAGES.BAD_REQUEST,
    }
  }
}

/**
 * consolidate PowerPlant Unit Team Relation request parameter
 *
 * @param {Request} req
 * @returns {(createPowerPlantUnitTeamRelationRequest | Record<string, any>)} createPowerPlantUnitTeamRelationRequest
 */
export const consolidateCreatePowerPlantUnitTeamRelationRequest = (
  req: Request,
): createPowerPlantUnitTeamRelationRequest | Record<string, any> => ({
  asset: Array.isArray(req.body[Constants.FIELDS.ASSET])
    ? req.body[Constants.FIELDS.ASSET].map((assetbody: Record<string, any>) => ({
        "asset-task-group-id": assetbody[Constants.FIELDS.ASSET_TASK_GROUP_ID],
        "asset-task-group-name": assetbody[Constants.FIELDS.ASSET_TASK_GROUP_NAME],
        "hours-per-day": assetbody[Constants.FIELDS.HOURS_PER_DAY],
        "asset-group-id": assetbody[Constants.FIELDS.ASSET_GROUP_ID],
        teams: Array.isArray(assetbody[Constants.FIELDS.TEAM])
          ? assetbody[Constants.FIELDS.TEAM].map((teamBody: Record<string, any>) => ({
              "team-name": teamBody[Constants.FIELDS.TEAM_NAME],
              "team-id": teamBody[Constants.FIELDS.TEAM_ID],
              "operation-id": teamBody[Constants.FIELDS.OPERATION_ID],
            }))
          : assetbody[Constants.FIELDS.TEAM],
      }))
    : req.body[Constants.FIELDS.ASSET],
  "power-plant-id": req.body[Constants.FIELDS.POWER_PLANT_ID],
})

/**
 * create PowerPlant Unit Team Relation Controller
 *
 * @type {*} export
 */
export const createPowerPlantUnitTeamRelationController = jsonOrEmptyResponse(
  extractValue(consolidateCreatePowerPlantUnitTeamRelationRequest)(createPowerPlantUnitTeamRelation),
  [Constants.STATUS_CODES.CREATE_SUCCESS_CODE, Constants.ERROR_CODES.NOT_FOUND_CODE, Constants.ERROR_CODES.BAD_REQUEST],
)
