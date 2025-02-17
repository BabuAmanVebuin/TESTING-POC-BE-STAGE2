import * as t from "io-ts/lib/Decoder.js"

import { ERROR_CODES, STATUS_CODES } from "./utils.js"

/**
 * Description deleteTaskTypeResponse
 *
 * @export
 * @typedef {deleteTaskTypeResponse} deleteTaskTypeResponse
 */
export type deleteTaskTypeResponse = {
  "task-type-id": string
}

/**
 * Description deleteTaskTypeAPIResponse
 *
 * @export
 * @typedef {deleteTaskTypeAPIResponse} deleteTaskTypeAPIResponse
 */
export type deleteTaskTypeAPIResponse = {
  code: ERROR_CODES | STATUS_CODES.SUCCESS_CODE
  body: string
}

/**
 * Description deleteTaskTypesRequest
 *
 * @export
 * @typedef {deleteTaskTypesRequest} deleteTaskTypesRequest
 */
export type deleteTaskTypesRequest = {
  "operate-user-id": string
  "task-type-id": number
}

/**
 * Description delete task type required params validation
 *
 * @type {*}
 */
const deleteTaskTypesRequestRequiredDecoder = t.struct({
  "operate-user-id": t.string,
  "task-type-id": t.number,
})

type deleteTaskTypesDecodeType = t.Decoder<any, deleteTaskTypesRequest>
export const deleteTaskTypesRequestDecoder: deleteTaskTypesDecodeType = deleteTaskTypesRequestRequiredDecoder
