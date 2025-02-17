// Initially copied from ToT-BE, commit 545c1dd02ed8df920e315645df162212e80b2a03
import Express from "express"
/*import { getRecentNotificationsRequestDecoder } from '../../../v1/domain/entities/getRecentNotifications'*/
import { registerDeviceTokenRequestDecoder } from "../../../../domain/entities/tot/v1/registerDeviceToken.js"
import { getRecentNotificationsController } from "../../../controllers/tot/v1/getRecentNotificationsController.js"
import { notificationsController } from "../../../controllers/tot/v1/notificationsController.js"
import {
  consolidateregisterDeviceTokenRequest,
  registerDeviceTokenController,
} from "../../../controllers/tot/v1/registerDeviceTokenController.js"

/*import { overrideResponse } from '../decorators.ts'*/
import { validation } from "./util.js"

export const NotificationRoutes = (router: Express.Router) => {
  router.put(
    "/device-token",
    validation(consolidateregisterDeviceTokenRequest)(registerDeviceTokenRequestDecoder),
    registerDeviceTokenController,
  )
  // Send Notification
  router.post("/notifications", notificationsController)

  //Get Recent Notification
  router.get("/notifications/recent", getRecentNotificationsController)
}
