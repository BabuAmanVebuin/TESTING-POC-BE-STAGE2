// Initially copied from ToT-BE, commit 545c1dd02ed8df920e315645df162212e80b2a03
import * as t from "io-ts/lib/Decoder.js"

import { ERROR_CODES, STATUS_CODES } from "./utils.js"

/**
 * Description create eventType Response
 *
 * @export
 * @typedef {createEventTypeResponse} create EventType Response
 */
export type createEventTypeResponse = {
  "event-type-id": number
}

/**
 * Description create eventTypeAPI Response
 *
 * @export
 * @typedef {createEventTypeAPIResponse} create EventTypeAPI Response
 */
export type createEventTypeAPIResponse =
  | { code: STATUS_CODES.CREATE_SUCCESS_CODE; body: createEventTypeResponse[] }
  | {
      code: ERROR_CODES
      body: string
    }

/**
 * Description event Type
 *
 * @export
 * @typedef {EventType} eventType
 */
export type EventType = {
  "event-type-name": string
}

/**
 * Description createEventTypeRequest
 *
 * @export
 * @typedef {createEventTypeRequest} createEventTypeRequest
 */
export type createEventTypeRequest = {
  "operate-user-id": string
  eventTypes: EventType[]
}

/**
 * Description event type required param validation
 *
 * @type {*}
 */
const eventTypeRequiredDecoder = t.struct({
  "event-type-name": t.string,
})

const eventTypeDecoder = eventTypeRequiredDecoder

/**
 * Description create eventTypeRequest Required Decoder
 *
 * @type {*}
 */
const createeventTypeRequestRequiredDecoder = t.struct({
  "operate-user-id": t.string,
  eventTypes: t.array(eventTypeDecoder),
})

type createEventTypeDecodeType = t.Decoder<any, createEventTypeRequest>
export const createEventTypesRequestDecoder: createEventTypeDecodeType = createeventTypeRequestRequiredDecoder
