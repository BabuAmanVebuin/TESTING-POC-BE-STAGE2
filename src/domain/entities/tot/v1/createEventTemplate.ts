// Initially copied from ToT-BE, commit 545c1dd02ed8df920e315645df162212e80b2a03
import * as t from "io-ts/lib/Decoder.js"

import { ERROR_CODES, STATUS_CODES, STATUS_MESSAGE } from "./utils.js"

/**
 * Description create event template Response
 *
 * @export
 * @typedef {createEventTemplateResponse} create Event Template Response
 */
export type createEventTemplateResponse = {
  "event-template-id": number
}

/**
 * Description create Event Template API Response
 *
 * @export
 * @typedef {createEventTemplateResponse} create Event Template API Response
 */
export type createEventTemplateAPIResponse =
  | {
      code: STATUS_CODES.CREATE_SUCCESS_CODE
      body: STATUS_MESSAGE.SUCCESS_MESSAGE
    }
  | {
      code: ERROR_CODES
      body: string
    }

/**
 * Description createEventTemplateRequest
 *
 * @export
 * @typedef {createEventTemplateRequest} createEventTemplateRequest
 */
export type createEventTemplateRequest = {
  "event-type-id": number
  "event-type-name": string
  "task-type-id": number
  "task-type-name": string
  "operate-user-id": string
}

/**
 * Description create eventTemplateRequest Required Decoder
 *
 * @type {*}
 */
const createEventTemplateRequestRequiredDecoder = t.struct({
  "event-type-id": t.number,
  "event-type-name": t.string,
  "task-type-id": t.number,
  "task-type-name": t.string,
  "operate-user-id": t.string,
})

type createEventTemplateDecodeType = t.Decoder<any, createEventTemplateRequest>
export const createEventTemplateRequestDecoder: createEventTemplateDecodeType =
  createEventTemplateRequestRequiredDecoder
