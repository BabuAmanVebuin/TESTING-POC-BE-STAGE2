// Initially copied from ToT-BE, commit 545c1dd02ed8df920e315645df162212e80b2a03
import Express from "express"
import { validation } from "./util.js"

import { getToTUserPreferenceRequestDecoder } from "../../../../domain/entities/tot/v1/getToTUserPreference.js"
import {
  consolidategetToTUserPreferenceRequest,
  getToTUserPreferenceController,
} from "../../../controllers/tot/v1/getToTUserPreferenceController.js"

import { createToTUserPreferencesRequestDecoder } from "../../../../domain/entities/tot/v1/createTotUserPreference.js"
import {
  consolidatecreateToTUserPreferencesRequest,
  createToTUserPreferenceController,
} from "../../../controllers/tot/v1/createTotUserPreference.js"
import {
  consolidateupdateToTUserPreferencesRequest,
  updateToTUserPreferenceController,
} from "../../../controllers/tot/v1/updateTotUserPreference.js"
import { updateToTUserPreferencesRequestDecoder } from "../../../../domain/entities/tot/v1/updateToTUserPreferences.js"

import { getToTUsersRequestDecoder } from "../../../../domain/entities/tot/v1/getToTUsers.js"
import {
  consolidategetToTUsersRequest,
  getToTUsersController,
} from "../../../controllers/tot/v1/getToTUsersController.js"
import { updateInactivateToTUsersController } from "../../../controllers/tot/v1/updateInactivateToTUsersController.js"

const route = Express.Router()

export const UserRoutes = (router: Express.Router): void => {
  router.use("/user/", route)

  // getToTUsers
  route.get("/ToT/", validation(consolidategetToTUsersRequest)(getToTUsersRequestDecoder), getToTUsersController)

  // getToTUserPreference
  route.get(
    "/ToT/:userId/",
    validation(consolidategetToTUserPreferenceRequest)(getToTUserPreferenceRequestDecoder),
    getToTUserPreferenceController,
  )

  // Inactivate user
  route.post("/ToT/inactive", updateInactivateToTUsersController)

  // updateToTUserPreferences
  route.patch(
    "/ToT/:userId/",
    validation(consolidateupdateToTUserPreferencesRequest)(updateToTUserPreferencesRequestDecoder),
    updateToTUserPreferenceController,
  )
  // overrideEmptyResponse(200));

  // createToTUserPreferences
  route.post(
    "/ToT/:userId/",
    validation(consolidatecreateToTUserPreferencesRequest)(createToTUserPreferencesRequestDecoder),
    createToTUserPreferenceController,
  )
}
