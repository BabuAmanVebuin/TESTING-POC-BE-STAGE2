// Initially copied from ToT-BE, commit 545c1dd02ed8df920e315645df162212e80b2a03
import { Request } from "express"
/*import { pass } from "fp-ts/lib/Writer";*/
import { QueryTypes } from "sequelize"

import {
  getAssetGroupIdsAPIResponse,
  getAssetGroupIdsRequest,
  assetGroupIdsQueryResponse,
} from "../../../../domain/entities/tot/v1/getAssetGroupIds.js"
import { sequelize } from "../../../../infrastructure/orm/sqlize/index.js"
import { extractValue, jsonResponse } from "../../../decorators.js"

import { poorlyShapedRequest } from "./utils.js"

import { Constants } from "../../../../config/constants.js"

/* get asset group id, team-id and asset task group name from asset task group by plant id */
const assetTaskGroupQuery = `
SELECT ATG.ASSET_GROUP_ID as 'asset-group-id',
    ATG.TEAM_ID as 'team-id',
    ATG.ASSET_TASK_GROUP_NAME as 'asset-task-group-name'
FROM m_asset_task_group  ATG
WHERE PLANT_ID = :plantId 
AND ASSET_TASK_GROUP_ID = :assetTaskGroupId
ORDER BY ASSET_TASK_GROUP_ID ASC
`
/**
 *
 * @param postValidationInput Input from the request
 * @returns array of objects of asset task group information in getAssetGroupIdsAPIResponse format
 */
const getAssetGroupIds = async (
  postValidationInput: getAssetGroupIdsRequest | Record<string, any>,
): Promise<getAssetGroupIdsAPIResponse> => {
  try {
    const input = postValidationInput as getAssetGroupIdsRequest

    /**
     * Fetching data set from database for m_asset_task_group table
     */
    const assetTaskGroupData: assetGroupIdsQueryResponse[] = await sequelize.query(assetTaskGroupQuery, {
      replacements: {
        plantId: input[Constants.FIELDS.POWER_PLANT_ID],
        assetTaskGroupId: input[Constants.FIELDS.ASSET_TASK_GROUP_ID],
      },
      raw: true,
      type: QueryTypes.SELECT,
    })

    return {
      code: 200,
      body: assetTaskGroupData,
    }
  } catch (error) {
    return {
      code: 400,
      body: "Bad Request",
    }
  }
}

/* consolidate get asset group ids request parameter */
export const consolidategetGetAssetGroupIdsRequest = (req: Request): getAssetGroupIdsRequest | poorlyShapedRequest => ({
  "power-plant-id": req.query[Constants.FIELDS.POWER_PLANT_ID] as string,
  "asset-task-group-id": req.query[Constants.FIELDS.ASSET_TASK_GROUP_ID],
})

export const getAssetGroupIdsController = jsonResponse(
  extractValue(consolidategetGetAssetGroupIdsRequest)(getAssetGroupIds),
)
