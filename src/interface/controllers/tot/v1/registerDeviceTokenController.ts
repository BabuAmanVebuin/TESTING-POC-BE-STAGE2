// Initially copied from ToT-BE, commit 545c1dd02ed8df920e315645df162212e80b2a03

import { env } from "process"
import { TextEncoder } from "util"

import axios from "axios"
import { Request } from "express"

import {
  registerDeviceTokenRequest,
  registerDeviceTokenAPIResponse,
} from "../../../../domain/entities/tot/v1/registerDeviceToken.js"
import { extractValue, jsonOrEmptyResponse } from "../../../decorators.js"

import crypto from "crypto"
import logger from "../../../../infrastructure/logger.js"
import { URL } from "url"

class MissingRequiredParameterError extends Error {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(...params: any[]) {
    super(...params)
  }
}

const createSharedAccessToken = (uri: string, saName: string, saKey: string): string => {
  if (!uri || !saName || !saKey) {
    throw new MissingRequiredParameterError()
  }

  const encoded = encodeURIComponent(uri)
  const now = new Date()

  // TODO: confirm how long we want the TTL to be
  const sec = 600
  const ttl = Math.round(now.getTime() / 1000) + sec

  const signature = `${encoded}\n${ttl}`
  const utf8 = new TextEncoder()
  const signatureUTF8 = utf8.encode(signature)
  const hash = crypto.createHmac("sha256", saKey).update(signatureUTF8).digest("base64")
  return `SharedAccessSignature sr=${encoded}&sig=${encodeURIComponent(hash)}&se=${ttl}&skn=${saName}`
}
/* register device token function */
const registerDeviceToken = async (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  postValidationInput: registerDeviceTokenRequest | Record<string, any>,
): Promise<registerDeviceTokenAPIResponse> => {
  try {
    const input = postValidationInput as registerDeviceTokenRequest
    logger.debug("==== registerDeviceToken ====")
    logger.debug(`env.NTF_PUSH_NOTIFICATION_CONNECTION_STRING: ${env.NTF_PUSH_NOTIFICATION_CONNECTION_STRING}`)
    const [_END_POINT, _SHARED_ACCESS_KEY_NAME, _SHARED_ACCESS_KEY] = (
      env.NTF_PUSH_NOTIFICATION_CONNECTION_STRING as string
    ).split(";")
    logger.debug(`_END_POINT: ${_END_POINT}`)
    logger.debug(`_SHARED_ACCESS_KEY_NAME: ${_SHARED_ACCESS_KEY_NAME}`)
    logger.debug(`_SHARED_ACCESS_KEY: ${_SHARED_ACCESS_KEY}`)
    const END_POINT = (_END_POINT as string).replace(/^Endpoint=sb/, "https")
    logger.debug(`END_POINT: ${END_POINT}`)
    const SHARED_ACCESS_KEY_NAME = (_SHARED_ACCESS_KEY_NAME as string).replace(/^SharedAccessKeyName=/, "")
    logger.debug(`SHARED_ACCESS_KEY_NAME: ${SHARED_ACCESS_KEY_NAME}`)
    const SHARED_ACCESS_KEY = (_SHARED_ACCESS_KEY as string).replace(/^SharedAccessKey=/, "")
    logger.debug(`SHARED_ACCESS_KEY: ${SHARED_ACCESS_KEY}`)

    const SASToken = createSharedAccessToken(END_POINT, SHARED_ACCESS_KEY_NAME, SHARED_ACCESS_KEY)
    logger.debug(`SASToken: ${SASToken}`)

    let installationId: string
    if (
      input["installation-id"] === undefined ||
      input["installation-id"] === null ||
      input["installation-id"] === ""
    ) {
      logger.debug("No installation ID from input, getting a new installation ID from notification hub...")
      const config = {
        headers: {
          "Content-Type": "application/atom+xml;type=entry;charset=utf-8",
          Authorization: SASToken,
          "x-ms-version": "2015-01",
        },
      }

      const response = await axios.post(
        `${END_POINT}/${env.NOTIFICATION_HUB_NAME}/registrationIDs/?api-version=2015-01`,
        "",
        config,
      )

      // At the time of this writing, Microsoft's documentation* is incorrect.
      // The response header to look for is not 'Content-Location', but rather 'Location'.
      // The format of the header _value_ is also incorrect. It's not
      //   https://{namespace}.servicebus.windows.net/{NotificationHub}/registrations/<registrationId>
      // but rather
      //   https://{namespace}.servicebus.windows.net/{NotificationHub}/registrationIDs/<registrationId>?api-version=2015-01
      //
      // * https://web.archive.org/web/20210625071223/https://docs.microsoft.com/en-us/rest/api/notificationhubs/create-registration-id#response-headers
      const headerKey = "location"
      let contentLocationSegments: string[]
      logger.debug(`Response status from registrationIDs endpoint: ${response.status} - ${response.statusText}`)
      logger.debug(`Response body from registrationIDs endpoint: ${response.data}`)
      switch (response.status) {
        case 400:
          return {
            code: 400,
            body: "Bad Request",
          }
        case 401:
          return {
            code: 401,
            body: "Unauthorized",
          }
        case 403:
          return {
            code: 403,
            body: "Quota exceeded or registration operation rate too high",
          }
        default:
          logger.debug(`Response headers: ${JSON.stringify(response.headers)}`)

          // assuming HTTP 201, according to documentation
          contentLocationSegments = new URL(response.headers[headerKey]).pathname.split("/")
          installationId = contentLocationSegments[contentLocationSegments.length - 1]
          logger.debug(`installationId from registrationIDs endpoint: ${installationId}`)
      }
    } else {
      logger.debug(`Using installation ID from input: ${input["installation-id"]}`)
      installationId = input["installation-id"]
    }

    const registerResponse = await axios.put(
      `${END_POINT}${env.NOTIFICATION_HUB_NAME}/installations/${installationId}?api-version=2015-01`,
      {
        installationId,
        userID: input["user-id"],
        platform: "APNS",
        pushChannel: input["device-token"],
        tags: [`userId:${input["user-id"]}`],
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: SASToken,
          "x-ms-version": "2015-01",
        },
      },
    )
    logger.debug(
      `Response status from installations endpoint: ${registerResponse.status} - ${registerResponse.statusText}`,
    )
    logger.debug(`Response body from installations endpoint: ${registerResponse.data}`)

    switch (registerResponse.status) {
      case 400:
        return {
          code: 400,
          body: "Bad Request",
        }
      case 401:
        return {
          code: 401,
          body: "Unauthorized",
        }
      case 403:
        return {
          code: 403,
          body: "Quota exceeded or registration operation rate too high",
        }
      default:
        // assuming HTTP 200, according to documentation
        return {
          code: 200,
          body: { "installation-id": installationId },
        }
    }
  } catch (err) {
    logger.error(err)
    if (axios.isAxiosError(err)) {
      logger.error("Got AxiosError.")
      logger.error(JSON.stringify(err.toJSON()))
    }
    return {
      code: 400,
      body: "Bad Request",
    }
  }
}
/* consolidate user request parameter */
export const consolidateregisterDeviceTokenRequest = (req: Request): registerDeviceTokenRequest => ({
  "user-id": req.body["user-id"],
  "installation-id": req.body["installation-id"],
  "device-token": req.body["device-token"],
})

export const registerDeviceTokenController = jsonOrEmptyResponse(
  extractValue(consolidateregisterDeviceTokenRequest)(registerDeviceToken),
  [200],
)
