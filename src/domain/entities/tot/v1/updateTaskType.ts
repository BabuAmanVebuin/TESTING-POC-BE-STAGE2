// Initially copied from ToT-BE, commit 545c1dd02ed8df920e315645df162212e80b2a03
import { pipe } from "fp-ts/lib/function.js"
import * as t from "io-ts/lib/Decoder.js"

import { ERROR_CODES, STATUS_CODES } from "./utils.js"

/**
 * Description updateTaskTypeResponse
 *
 * @export
 * @typedef {updateTaskTypeResponse} updateTaskTypeResponse
 */
export type updateTaskTypeResponse = {
  "task-type-id": string
}

/**
 * Description updateTaskTypeAPIResponse
 *
 * @export
 * @typedef {updateTaskTypeAPIResponse} updateTaskTypeAPIResponse
 */
export type updateTaskTypeAPIResponse = {
  code: ERROR_CODES | STATUS_CODES.SUCCESS_CODE
  body: string
}

/**
 * Description updateTaskTypeRequest params
 *
 * @export
 * @typedef {updateTaskTypeRequestItem} updateTaskTypeRequestItem
 */
export type updateTaskTypeRequestItem = {
  "task-type-id": number
  "task-type-name": string
  "task-category-id": number
  "task-category-name": string
  "task-execution-time": string
}

/**
 * Description updateTaskTypeRequest
 *
 * @export
 * @typedef {updateTaskTypeRequest} updateTaskTypeRequest
 */
export type updateTaskTypeRequest = {
  "operate-user-id": string
  taskTypes: updateTaskTypeRequestItem[]
}

/**
 * Description updateTaskTypeDecoder
 *
 * @type {*}
 */
const updateTaskTypeDecoder = t.struct({
  "task-type-id": t.number,
  "task-type-name": t.string,
  "task-category-id": t.number,
  "task-category-name": t.string,
  "task-execution-time": t.string,
})

const updateTaskType = pipe(updateTaskTypeDecoder)

/**
 * Description update task type required params validation
 *
 * @type {*}
 */
const updateTaskTypeRequestRequiredDecoder = t.struct({
  "operate-user-id": t.string,
  taskTypes: t.array(updateTaskType),
})

type UpdateTaskTypeDecodeType = t.Decoder<any, updateTaskTypeRequest>
export const updateTaskTypeRequestDecoder: UpdateTaskTypeDecodeType = updateTaskTypeRequestRequiredDecoder
