import { Constants } from "../../../../config/constants.js"
import { inactivateUserAPIResponse } from "../../../../domain/entities/tot/v1/inactivateUser.js"
import { jsonResponse } from "../../../decorators.js"
import logger from "../../../../infrastructure/logger.js"
import { sequelize, wrapInTransaction } from "../../../../infrastructure/orm/sqlize/index.js"
import { QueryTypes, Transaction } from "sequelize"

/**
 * Inactivate user function.
 * This function is responsible for inactivating users based on a certain time threshold.
 * It updates the user records in the database with the specified inactivation values.
 * @returns {Promise<inactivateUserAPIResponse>} The API response indicating the success or failure of the inactivation process.
 */
const inactivateUser = async (): Promise<inactivateUserAPIResponse> => {
  try {
    // Start a database transaction
    const result = await wrapInTransaction(async (transaction: Transaction) => {
      // Calculate the time threshold to inactivate users
      const inactiveUserAfterTime = new Date(new Date().getTime() - Constants.INACTIVE_USER.AFTER_TIME)

      // Construct the query to update the user records
      const updateUserQuery = `
      UPDATE m_user_tot
      SET PLANT_ID = :plantId, ASSET_TASK_GROUP_ID = :assetTaskGroupId, TEAM_ID = :teamId
      WHERE (PLANT_ID <> :plantId OR ASSET_TASK_GROUP_ID <> :assetTaskGroupId) AND LAST_ACTIVE_TIMESTAMP <= :inactiveUserAfterTime;
    `

      // Execute the query to inactivate users
      await sequelize.query(updateUserQuery, {
        raw: true,
        type: QueryTypes.UPDATE,
        transaction,
        replacements: {
          plantId: Constants.INACTIVE_USER.POWER_PLANT_ID,
          assetTaskGroupId: Constants.INACTIVE_USER.ASSET_TASK_GROUP_ID,
          teamId: Constants.INACTIVE_USER.TEAM_ID,
          inactiveUserAfterTime,
        },
      })

      // Return a success response
      return {
        code: Constants.STATUS_CODES.SUCCESS_CODE,
        body: Constants.SUCCESS_MESSAGES.SUCCESS,
      }
    })

    return result
  } catch (err) {
    // Log and handle any errors that occurred during the inactivation process
    logger.error(err)

    // Return an error response
    return {
      code: Constants.ERROR_CODES.BAD_REQUEST,
      body: Constants.ERROR_MESSAGES.BAD_REQUEST,
    }
  }
}

/**
 * Inactivate user controller.
 * This controller function wraps the inactivateUser function and applies a JSON response decorator.
 * @returns {Promise<inactivateUserAPIResponse>} The JSON response containing the result of the inactivation process.
 */
export const updateInactivateToTUsersController = jsonResponse(inactivateUser)
