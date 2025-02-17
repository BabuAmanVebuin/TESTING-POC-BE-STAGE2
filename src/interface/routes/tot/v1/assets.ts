// Initially copied from ToT-BE, commit 545c1dd02ed8df920e315645df162212e80b2a03
import Express from "express"
import { getAssetGroupIdsRequestDecoder } from "../../../../domain/entities/tot/v1/getAssetGroupIds.js"
import { getAssetTaskGroupsRequestDecoder } from "../../../../domain/entities/tot/v1/getAssetTaskGroups.js"
import {
  consolidategetAssetTaskGroupsRequest,
  getAssetTaskGroupsController,
} from "../../../controllers/tot/v1/getAssetTaskGroupsController.js"
import {
  consolidategetGetAssetGroupIdsRequest,
  getAssetGroupIdsController,
} from "../../../controllers/tot/v1/getAssetGroupIdsController.js"

import { validation } from "./util.js"

const route = Express.Router()

export const AssetRoutes = (router: Express.Router) => {
  router.use("/asset", route)
  // Get ASSET_GROUP_ID by Asset Task Group ID
  route.get(
    "/asset-group-ids",
    validation(consolidategetGetAssetGroupIdsRequest)(getAssetGroupIdsRequestDecoder),
    getAssetGroupIdsController,
  )

  // getAssetTaskGroups
  route.get(
    "/asset-task-groups",
    validation(consolidategetAssetTaskGroupsRequest)(getAssetTaskGroupsRequestDecoder),
    getAssetTaskGroupsController,
  )
}
