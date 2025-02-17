// Initially copied from ToT-BE, commit 545c1dd02ed8df920e315645df162212e80b2a03
import * as t from "io-ts/lib/Decoder.js"

import { ERROR_CODES, STATUS_CODES } from "./utils.js"

/**
 * Description create taskType Response
 *
 * @export
 * @typedef {createTaskTypeResponse} create TaskType Response
 */
export type createTaskTypeResponse = {
  "task-type-id": number
}

/**
 * Description create taskTypeAPI Response
 *
 * @export
 * @typedef {createTaskTypeAPIResponse} create TaskTypeAPI Response
 */
export type createTaskTypeAPIResponse =
  | { code: STATUS_CODES.CREATE_SUCCESS_CODE; body: createTaskTypeResponse[] }
  | {
      code: ERROR_CODES
      body: string
    }

/**
 * Description task Type
 *
 * @export
 * @typedef {TaskType} taskType
 */
export type TaskType = {
  "task-type-name": string
  "task-category-id": number
  "task-category-name": string
  "task-execution-time": string
}

/**
 * Description createTaskTypeRequest
 *
 * @export
 * @typedef {createTaskTypeRequest} createTaskTypeRequest
 */
export type createTaskTypeRequest = {
  "operate-user-id": string
  taskTypes: TaskType[]
}

/**
 * Description task type required param validation
 *
 * @type {*}
 */
const taskTypeRequiredDecoder = t.struct({
  "task-type-name": t.string,
  "task-category-id": t.number,
  "task-category-name": t.string,
  "task-execution-time": t.string,
})

const taskTypeDecoder = taskTypeRequiredDecoder

/**
 * Description create taskTypeRequest Required Decoder
 *
 * @type {*}
 */
const createtaskTypeRequestRequiredDecoder = t.struct({
  "operate-user-id": t.string,
  taskTypes: t.array(taskTypeDecoder),
})

type createTaskTypeDecodeType = t.Decoder<any, createTaskTypeRequest>
export const createTaskTypeRequestDecoder: createTaskTypeDecodeType = createtaskTypeRequestRequiredDecoder
