import * as t from "io-ts/lib/Decoder.js"
import { ERROR_CODES, STATUS_CODES } from "./utils.js"

/**
 * Update operation-event relation API Response
 *
 * @export
 * @typedef {updateOperationEventTypeAPIResponse} update operation-event relation API Response
 */
export type updateOperationEventTypeAPIResponse =
  | {
      code: STATUS_CODES.CREATE_SUCCESS_CODE
      body: string
    }
  | {
      code: ERROR_CODES
      body: string
    }

/**
 * updateOperationEventType Request type
 *
 * @export
 * @typedef {updateOperationEventTypeRequest} updateOperationEventTypeRequest
 */
export type updateOperationEventTypeRequest = {
  "event-type-id": number
  "event-type-name": string
  "operation-name": string
  "operate-user-id": string
}

/**
 * updateOperationEventTypeRequest Required Decoder
 *
 * @type {*}
 */
const updateOperationEventTypeRequestRequiredDecoder = t.struct({
  "event-type-id": t.number,
  "event-type-name": t.string,
  "operation-name": t.string,
  "operate-user-id": t.string,
})

type updateOperationEventTypeDecodeType = t.Decoder<any, updateOperationEventTypeRequest>
export const updateOperationEventTypeRequestDecoder: updateOperationEventTypeDecodeType =
  updateOperationEventTypeRequestRequiredDecoder
