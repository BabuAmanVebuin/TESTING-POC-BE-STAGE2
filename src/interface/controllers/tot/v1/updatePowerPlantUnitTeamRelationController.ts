import { Request } from "express"
import { QueryTypes, Transaction } from "sequelize"

import { cmnSequelize, sequelize } from "../../../../infrastructure/orm/sqlize/index.js"
import { extractValue, jsonOrEmptyResponse } from "../../../decorators.js"
import logger from "../../../../infrastructure/logger.js"
import { Constants } from "../../../../config/constants.js"

import {
  AssetTaskGroupIdsNotFoundError,
  handleDbError,
  OperationIdsNotFoundError,
  PowerPlantIdNotFoundError,
  send404Response,
  setDifference,
  TeamIdsNotFoundError,
} from "./utils.js"
import {
  Asset,
  updatePowerPlantUnitTeamRelationAPIResponse,
  updatePowerPlantUnitTeamRelationRequest,
  Team,
} from "../../../../domain/entities/tot/v1/updatePowerPlantUnitTeamRelation.js"

/**
 * Update powerplant unit team relation function
 *
 * @async
 * @param {(updatePowerPlantUnitTeamRelationRequest | Record<string, any>)} postValidationInput
 * @returns {Promise<updatePowerPlantUnitTeamRelationAPIResponse>} updatePowerPlantUnitTeamRelationAPI
 */
const updatePowerPlantUnitTeamRelation = async (
  postValidationInput: updatePowerPlantUnitTeamRelationRequest | Record<string, any>,
): Promise<updatePowerPlantUnitTeamRelationAPIResponse> => {
  const input = postValidationInput as updatePowerPlantUnitTeamRelationRequest

  /** select power-plant-id */
  const selectPlantIdQuery = `SELECT PLANT_ID FROM m_plant WHERE PLANT_ID = :plantId;`

  /** select existing assetTaskGroup */
  const selectExistingAssetTaskGroupIdQuery = `SELECT 
      DISTINCT ASSET_TASK_GROUP_ID
    FROM m_asset_task_group
      WHERE ASSET_TASK_GROUP_ID IN (:assetTaskGroupId);`

  /** get existing team-id query */
  const selectExistingTeamIdQuery = "SELECT TEAM_ID FROM m_team WHERE TEAM_ID IN (:teamId);"

  /** get existing operation-id query */
  const selectExistingOperationIdQuery = "SELECT OPERATION_ID FROM m_operation WHERE OPERATION_ID IN (:operationId);"

  /** update asset-task-group-name */
  const updateAssetTaskGroupQuery = `UPDATE m_asset_task_group
    SET ASSET_TASK_GROUP_NAME = :assetTaskGroupName
    WHERE ASSET_TASK_GROUP_ID = :assetTaskGroupId;`

  /** update hours-per-day */
  const updateHoursPerDayQuery = `UPDATE m_asset_task_group_hours
    SET HOURS_PER_DAY = :hoursPerDay
    WHERE ASSET_TASK_GROUP_ID = :assetTaskGroupId;`

  /** select existing team-id, and asset-task-group-name in m_asset_task_group */
  const selectExistingTeamIdInUnitQuery = `SELECT 
    ASSET_GROUP_ID, TEAM_ID, ASSET_TASK_GROUP_NAME
      FROM m_asset_task_group
    WHERE ASSET_TASK_GROUP_ID IN (:assetTaskGroupId);`

  /** select existing operation-id from t_asset_task_group_team_operation by asset-group-id and team-id */
  const selectExistingOperationQuery = `SELECT
    OPERATION_ID
  FROM
    t_asset_task_group_team_operation
  WHERE
    ASSET_TASK_GROUP_ID = :assetTaskGroupId
    AND TEAM_ID = :teamId;`

  /** insert record in m_asset_task_group */
  const insertAssetTaskGroupQuery = `INSERT IGNORE INTO m_asset_task_group (
    ASSET_TASK_GROUP_ID,  
    ASSET_GROUP_ID,
    PLANT_ID,
    TEAM_ID,
    ASSET_TASK_GROUP_NAME
  ) VALUES (
    :assetTaskGroupId,
    :assetGroupId,
    :plantId,
    :teamId,
    :assetTaskGroupName
  )`

  /** update team-name */
  const updateTeamNameQuery = `UPDATE m_team SET TEAM_NAME = :teamName WHERE TEAM_ID = :teamId;`

  /** insert asset-task-group-team-operation relation query */
  const insertAssetTaskGroupWithTeamOperationQuery = `INSERT IGNORE INTO t_asset_task_group_team_operation (
    ASSET_TASK_GROUP_ID,
    TEAM_ID,
    OPERATION_ID
  ) VALUES (
    :assetTaskGroupId,
    :teamId,
    :operationId
  );`

  try {
    const result = await sequelize.transaction<updatePowerPlantUnitTeamRelationAPIResponse>(
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

        /** get asset-task-group-id, team-id and operation-id list from request */
        const assetTaskGroupIdList: number[] = []
        let operationIdList: number[] = []
        const teamIdList: number[] = []
        input.asset.forEach((eachAsset: Asset) => {
          eachAsset[Constants.FIELDS.TEAM] &&
            eachAsset[Constants.FIELDS.TEAM]!.forEach((eachTeam: Team) => {
              if (eachTeam[Constants.FIELDS.OPERATION_ID]) {
                operationIdList.push(...eachTeam[Constants.FIELDS.OPERATION_ID]!)
              }
              teamIdList.push(eachTeam[Constants.FIELDS.TEAM_ID])
            })
          assetTaskGroupIdList.push(eachAsset[Constants.FIELDS.ASSET_TASK_GROUP_ID])
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

        // validate team-id
        if (teamIdList.length) {
          /** get existing team-id */
          let existingTeamIdResult: { TEAM_ID: string }[] = []
          existingTeamIdResult = await sequelize.query<{
            TEAM_ID: string
          }>(selectExistingTeamIdQuery, {
            raw: true,
            type: QueryTypes.SELECT,
            replacements: {
              teamId: teamIdList,
            },
            transaction,
          })
          const existingTeamIdSet = new Set(existingTeamIdResult.map((value) => value.TEAM_ID))
          const teamIdSet = new Set(teamIdList)

          // check difference between requested team-id and existing team-id
          const notFoundTeamIdSet = setDifference(teamIdSet, existingTeamIdSet)

          if (notFoundTeamIdSet.size > 0) {
            throw new TeamIdsNotFoundError([...notFoundTeamIdSet])
          }
        }

        // validate operation-id
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

        // update asset data
        await Promise.all(
          input.asset.map(async (eachAsset) => {
            // if hours-per-day exists in request
            if (eachAsset[Constants.FIELDS.HOURS_PER_DAY]) {
              // update hours-per-day
              await sequelize.query(updateHoursPerDayQuery, {
                raw: true,
                type: QueryTypes.UPDATE,
                transaction,
                replacements: {
                  hoursPerDay: eachAsset[Constants.FIELDS.HOURS_PER_DAY] + ":00",
                  assetTaskGroupId: eachAsset[Constants.FIELDS.ASSET_TASK_GROUP_ID],
                },
              })
            }

            // if asset-task-group-name exists in request
            if (eachAsset[Constants.FIELDS.ASSET_TASK_GROUP_NAME]) {
              // update asset-task-group-name
              await sequelize.query(updateAssetTaskGroupQuery, {
                raw: true,
                type: QueryTypes.UPDATE,
                transaction,
                replacements: {
                  assetTaskGroupName: eachAsset[Constants.FIELDS.ASSET_TASK_GROUP_NAME],
                  assetTaskGroupId: eachAsset[Constants.FIELDS.ASSET_TASK_GROUP_ID],
                },
              })
            }

            // if asset-group-id exists in request
            if (eachAsset[Constants.FIELDS.ASSET_GROUP_ID]) {
              /** fetch existing team-id and asset-task-group from m_asset_task_group */
              const existingTeamResult = await sequelize.query<{
                ASSET_GROUP_ID: string
                TEAM_ID: number
                ASSET_TASK_GROUP_NAME: string
              }>(selectExistingTeamIdInUnitQuery, {
                raw: true,
                type: QueryTypes.SELECT,
                replacements: {
                  assetTaskGroupId: eachAsset[Constants.FIELDS.ASSET_TASK_GROUP_ID],
                },
                transaction,
              })

              // make unique list of existing team-id and asset-group-id
              const assetTaskGroupName = existingTeamResult[0].ASSET_TASK_GROUP_NAME
              const existingAssetGroupId: string[] = []
              const existingTeamId: number[] = []
              existingTeamResult.forEach((team) => {
                !existingAssetGroupId.includes(team.ASSET_GROUP_ID) && existingAssetGroupId.push(team.ASSET_GROUP_ID)
                !existingTeamId.includes(team.TEAM_ID) && existingTeamId.push(team.TEAM_ID)
              })

              const existingAssetGroupIdSet = new Set(existingAssetGroupId)
              const newAssetGroupIdSet = new Set(eachAsset[Constants.FIELDS.ASSET_GROUP_ID])

              // check difference between requested asset-group-id and existing asset-group-id
              const newAssetGroupId = [...setDifference(newAssetGroupIdSet, existingAssetGroupIdSet)]

              // if new asset-group-id found then insert it for all teams of asset-task-group-id
              if (newAssetGroupId.length) {
                // insert asset-group-id data
                await Promise.all(
                  existingTeamId.map(async (eachExistingTeamId) => {
                    await Promise.all(
                      newAssetGroupId.map(async (eachAssetGroupId) => {
                        // insert asset-group-id
                        await sequelize.query(insertAssetTaskGroupQuery, {
                          raw: true,
                          type: QueryTypes.INSERT,
                          transaction,
                          replacements: {
                            assetTaskGroupId: eachAsset[Constants.FIELDS.ASSET_TASK_GROUP_ID],
                            assetGroupId: eachAssetGroupId,
                            plantId: input[Constants.FIELDS.POWER_PLANT_ID],
                            teamId: eachExistingTeamId,
                            assetTaskGroupName: assetTaskGroupName,
                          },
                        })
                      }),
                    )
                  }),
                )
              }
            }

            // if teams exists in request
            if (eachAsset[Constants.FIELDS.TEAM]) {
              // update teams data
              await Promise.all(
                eachAsset[Constants.FIELDS.TEAM]!.map(async (eachTeam) => {
                  // update team-name if it is exist in request
                  if (eachTeam[Constants.FIELDS.TEAM_NAME]) {
                    // update team-name
                    await sequelize.query(updateTeamNameQuery, {
                      raw: true,
                      type: QueryTypes.UPDATE,
                      transaction,
                      replacements: {
                        teamId: eachTeam[Constants.FIELDS.TEAM_ID],
                        teamName: eachTeam[Constants.FIELDS.TEAM_NAME],
                      },
                    })
                  }

                  // insert operation-id if it is exist in request
                  if (eachTeam[Constants.FIELDS.OPERATION_ID]) {
                    /** fetch existing operation-id */
                    const existingOperationIdResult = await sequelize.query<{
                      OPERATION_ID: number
                    }>(selectExistingOperationQuery, {
                      raw: true,
                      type: QueryTypes.SELECT,
                      replacements: {
                        assetTaskGroupId: eachAsset[Constants.FIELDS.ASSET_TASK_GROUP_ID],
                        teamId: eachTeam[Constants.FIELDS.TEAM_ID],
                      },
                      transaction,
                    })

                    const operationIds = existingOperationIdResult.map((value) => value.OPERATION_ID)
                    const existingOperationIdSet = new Set(operationIds)
                    const newOperationIdSet = new Set(eachTeam[Constants.FIELDS.OPERATION_ID])

                    // check difference between requested operation-id and existing operation-id
                    const newOperationId = [...setDifference(newOperationIdSet, existingOperationIdSet)]
                    if (newOperationId.length) {
                      await Promise.all(
                        newOperationId.map(async (eachOperationId) => {
                          // insert operation-id
                          await sequelize.query(insertAssetTaskGroupWithTeamOperationQuery, {
                            raw: true,
                            type: QueryTypes.INSERT,
                            transaction,
                            replacements: {
                              assetTaskGroupId: eachAsset[Constants.FIELDS.ASSET_TASK_GROUP_ID],
                              teamId: eachTeam[Constants.FIELDS.TEAM_ID],
                              operationId: eachOperationId,
                            },
                          })
                        }),
                      )
                    }
                  }
                }),
              )
            }
          }),
        )

        return {
          code: Constants.STATUS_CODES.SUCCESS_CODE,
          body: Constants.SUCCESS_MESSAGES.SUCCESS,
        } as updatePowerPlantUnitTeamRelationAPIResponse
      },
    )
    return result
  } catch (err: any) {
    logger.error(err)
    handleDbError("updatePowerPlantUnitTeamRelation", err)
    if (
      err instanceof PowerPlantIdNotFoundError ||
      err instanceof AssetTaskGroupIdsNotFoundError ||
      err instanceof TeamIdsNotFoundError ||
      err instanceof OperationIdsNotFoundError
    ) {
      return send404Response(err)
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
 * @returns {(updatePowerPlantUnitTeamRelationRequest | Record<string, any>)} updatePowerPlantUnitTeamRelationRequest
 */
export const consolidateUpdatePowerPlantUnitTeamRelationRequest = (
  req: Request,
): updatePowerPlantUnitTeamRelationRequest | Record<string, any> => ({
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
 * Update PowerPlant Unit Team Relation Controller
 *
 * @type {*} export
 */
export const updatePowerPlantUnitTeamRelationController = jsonOrEmptyResponse(
  extractValue(consolidateUpdatePowerPlantUnitTeamRelationRequest)(updatePowerPlantUnitTeamRelation),
  [Constants.STATUS_CODES.CREATE_SUCCESS_CODE, Constants.ERROR_CODES.NOT_FOUND_CODE, Constants.ERROR_CODES.BAD_REQUEST],
)
