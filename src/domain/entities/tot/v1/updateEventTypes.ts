// Initially copied from ToT-BE, commit 545c1dd02ed8df920e315645df162212e80b2a03
import { pipe } from "fp-ts/lib/function.js"
import * as t from "io-ts/lib/Decoder.js"

import { ERROR_CODES, STATUS_CODES } from "./utils.js"

/**
 * Description updateEventTypeResponse
 *
 * @export
 * @typedef {updateEventTypeResponse} updateEventTypeResponse
 */
export type updateEventTypeResponse = {
  "event-type-id": string
}

/**
 * Description updateEventTypeAPIResponse
 *
 * @export
 * @typedef {updateEventTypeAPIResponse} updateEventTypeAPIResponse
 */
export type updateEventTypeAPIResponse = {
  code: ERROR_CODES | STATUS_CODES.SUCCESS_CODE
  body: string
}

/**
 * Description updateEventTypesRequest params
 *
 * @export
 * @typedef {updateEventTypesRequestItem} updateEventTypesRequestItem
 */
export type updateEventTypesRequestItem = {
  "event-type-id": number
  "event-type-name": string
}

/**
 * Description updateEventTypesRequest
 *
 * @export
 * @typedef {updateEventTypesRequest} updateEventTypesRequest
 */
export type updateEventTypesRequest = {
  "operate-user-id": string
  eventTypes: updateEventTypesRequestItem[]
}

/**
 * Description updateEventTypesDecoder
 *
 * @type {*}
 */
const updateEventTypesDecoder = t.struct({
  "event-type-id": t.number,
  "event-type-name": t.string,
})

const updateEventTypes = pipe(updateEventTypesDecoder)

/**
 * Description update event type required params validation
 *
 * @type {*}
 */
const updateEventTypesRequestRequiredDecoder = t.struct({
  "operate-user-id": t.string,
  eventTypes: t.array(updateEventTypes),
})

type UpdateEventTypesDecodeType = t.Decoder<any, updateEventTypesRequest>
export const updateEventTypesRequestDecoder: UpdateEventTypesDecodeType = updateEventTypesRequestRequiredDecoder
