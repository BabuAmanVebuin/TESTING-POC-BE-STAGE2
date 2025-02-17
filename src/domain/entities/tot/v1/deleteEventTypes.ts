// Initially copied from ToT-BE, commit 545c1dd02ed8df920e315645df162212e80b2a03
import * as t from "io-ts/lib/Decoder.js"

import { ERROR_CODES, STATUS_CODES } from "./utils.js"

/**
 * Description deleteEventTypeAPIResponse
 *
 * @export
 * @typedef {deleteEventTypeAPIResponse} deleteEventTypeAPIResponse
 */
export type deleteEventTypeAPIResponse = {
  code: ERROR_CODES | STATUS_CODES.SUCCESS_CODE
  body: string
}

/**
 * Description deleteEventTypesRequest
 *
 * @export
 * @typedef {deleteEventTypesRequest} deleteEventTypesRequest
 */
export type deleteEventTypesRequest = {
  "operate-user-id": string
  "event-type-id": number
}

/**
 * Description delete event type required params validation
 *
 * @type {*}
 */
const deleteEventTypesRequestRequiredDecoder = t.struct({
  "operate-user-id": t.string,
  "event-type-id": t.number,
})

type deleteEventTypesDecodeType = t.Decoder<any, deleteEventTypesRequest>
export const deleteEventTypesRequestDecoder: deleteEventTypesDecodeType = deleteEventTypesRequestRequiredDecoder
