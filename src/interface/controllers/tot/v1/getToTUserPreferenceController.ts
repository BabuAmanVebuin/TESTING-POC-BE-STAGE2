// Initially copied from ToT-BE, commit 545c1dd02ed8df920e315645df162212e80b2a03
import { Request } from "express"
import { QueryTypes, Transaction } from "sequelize"

import {
  getToTUserPreferenceRequest,
  getToTUserPreferenceAPIResponse,
} from "../../../../domain/entities/tot/v1/getToTUserPreference.js"
import { sequelize, wrapInTransaction } from "../../../../infrastructure/orm/sqlize/index.js"
import { extractValue, jsonResponse } from "../../../decorators.js"
import { Constants } from "../../../../config/constants.js"
import logger from "../../../../infrastructure/logger.js"

/* define constant table name */
const TABLE = "m_user_tot"
const ASSETTASKGROUPTEAMOPERATIONTABLE = "t_asset_task_group_team_operation"
const ASSETTASKGROUPTABLE = "m_asset_task_group"
const OPERATIONTABLE = "m_operation"
type taskGroupData = {
  "asset-group-id": string
}

type operation = {
  "operation-id": number
  "operation-name": string
}

type userData = {
  "power-plant-id": string
  "user-name": string
  "asset-task-group-id": string
  "team-id": string
  "device-token": string
}

/**
 * Description get asset task group
 *
 * @param {string} assetTaskGroupId
 * @returns {Promise<taskGroupData[]>} taskGroup
 */
const getAssetTaskGroup = (transaction: Transaction, assetTaskGroupId: string): Promise<taskGroupData[]> => {
  return sequelize.query(
    `SELECT 
  ASSET_GROUP_ID as 'asset-group-id'
  FROM ${ASSETTASKGROUPTABLE} 
  WHERE ASSET_TASK_GROUP_ID = :assetTaskGroupId`,
    {
      replacements: { assetTaskGroupId },
      raw: true,
      plain: false,
      type: QueryTypes.SELECT,
      transaction,
    },
  )
}

/**
 * Store user's last active datetime
 *
 * @param {string} userId
 * @returns {Promise<void>}
 */
const logUserLastActiveDatetime = async (transaction: Transaction, userId: string): Promise<void> => {
  const curdate = new Date()
  await sequelize.query(`UPDATE m_user_tot SET LAST_ACTIVE_TIMESTAMP = :curdate WHERE USER_ID = :userId;`, {
    replacements: {
      userId,
      curdate,
    },
    raw: true,
    type: QueryTypes.UPDATE,
    transaction,
  })
}

/**
 * Description getOperation
 *
 * @param {getToTUserPreferenceRequest} input
 * @returns {Promise<operation[]>} operation
 */
const getOperation = (transaction: Transaction, input: getToTUserPreferenceRequest): Promise<operation[]> => {
  return sequelize.query(
    `select 
    GTO.OPERATION_ID as 'operation-id',
    O.OPERATION_NAME as 'operation-name'
    from ${ASSETTASKGROUPTEAMOPERATIONTABLE} GTO,
    ${TABLE} UT, ${OPERATIONTABLE} O
    WHERE UT.USER_ID = :id
    AND  UT.TEAM_ID = GTO.TEAM_ID
    AND GTO.OPERATION_ID = O.OPERATION_ID; `,
    {
      replacements: { id: input["user-id"] },
      raw: true,
      plain: false,
      type: QueryTypes.SELECT,
      transaction,
    },
  )
}

/**
 * Description getUser
 *
 * @param {getToTUserPreferenceRequest} input
 * @returns {(Promise<userData | null>)} user
 */
const getUser = (transaction: Transaction, input: getToTUserPreferenceRequest): Promise<userData | null> => {
  /* get user query */
  return sequelize.query(
    `SELECT 
  USER_NAME as 'user-name',
  PLANT_ID as 'power-plant-id',
  ASSET_TASK_GROUP_ID as 'asset-task-group-id',
  TEAM_ID as 'team-id',
  DEVICE_TOKEN as 'device-token'
  FROM ${TABLE} 
  WHERE USER_ID = :id`,
    {
      replacements: { id: input["user-id"] },
      raw: true,
      plain: true,
      type: QueryTypes.SELECT,
      transaction,
    },
  )
}

/**
 * Description get user Preference
 *
 * @async
 * @param {(getToTUserPreferenceRequest | Record<string, any>)} postValidationInput
 * @returns {Promise<getToTUserPreferenceAPIResponse>} getToTUserPreference
 */
const getToTUserPreference = async (
  postValidationInput: getToTUserPreferenceRequest | Record<string, any>,
): Promise<getToTUserPreferenceAPIResponse> => {
  try {
    // Start a database transaction
    const result = await wrapInTransaction(async (transaction: Transaction) => {
      const input = postValidationInput as getToTUserPreferenceRequest
      const user = await getUser(transaction, input)

      if (!user) {
        return {
          code: 404,
          body: "Not Found - User id was not found",
        }
      }

      // log user's last active time
      await logUserLastActiveDatetime(transaction, input["user-id"])

      const assetTaskGroup = user["asset-task-group-id"]

      /* get asset task group details */
      const assetTaskGroupDetails = await getAssetTaskGroup(transaction, assetTaskGroup)

      /**
       * Description get operation based on team
       *
       * @type {*}
       */
      const operation = await getOperation(transaction, input)
      return {
        code: 200,
        body: {
          "power-plant-id": user["power-plant-id"],
          "user-name": user["user-name"],
          "asset-task-group-id": Number(user["asset-task-group-id"]),
          "team-id": Number(user["team-id"]),
          "device-token": user["device-token"],
          "asset-groups": assetTaskGroupDetails,
          operation: operation,
        },
      }
    })
    return result
  } catch (err) {
    logger.error(err)
    return {
      code: Constants.ERROR_CODES.BAD_REQUEST,
      body: Constants.ERROR_MESSAGES.BAD_REQUEST,
    }
  }
}

/**
 * Description consolidate user request parameter
 *
 * @param {Request} req
 * @returns {(getToTUserPreferenceRequest | Record<string, any>)} get TOT user preference request
 */
export const consolidategetToTUserPreferenceRequest = (
  req: Request,
): getToTUserPreferenceRequest | Record<string, any> => ({
  "user-id": req.params.userId,
})

/**
 * Description getToTUserPreference
 *
 * @type {*}
 */
export const getToTUserPreferenceController = jsonResponse(
  extractValue(consolidategetToTUserPreferenceRequest)(getToTUserPreference),
)
