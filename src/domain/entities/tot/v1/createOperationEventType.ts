import * as t from "io-ts/lib/Decoder.js"
import { ERROR_CODES, STATUS_CODES } from "./utils.js"

/**
 * create operation-event relation API Response
 *
 * @export
 * @typedef {createOperationEventTypeAPIResponse} create operation-event relation API Response
 */
export type createOperationEventTypeAPIResponse =
  | {
      code: STATUS_CODES.CREATE_SUCCESS_CODE
      body: string
    }
  | {
      code: ERROR_CODES
      body: string
    }

/**
 * createOperationEventTypeRequest
 *
 * @export
 * @typedef {createOperationEventTypeRequest} createOperationEventTypeRequest
 */
export type createOperationEventTypeRequest = {
  "event-type-id": number
  "event-type-name": string
  "operation-name": string
  "operate-user-id": string
}

/**
 * create OperationEventTypeRequest Required Decoder
 *
 * @type {*}
 */
const createOperationEventTypeRequestRequiredDecoder = t.struct({
  "event-type-id": t.number,
  "event-type-name": t.string,
  "operation-name": t.string,
  "operate-user-id": t.string,
})

type createOperationEventTypeDecodeType = t.Decoder<any, createOperationEventTypeRequest>
export const createOperationEventTypeRequestDecoder: createOperationEventTypeDecodeType =
  createOperationEventTypeRequestRequiredDecoder
