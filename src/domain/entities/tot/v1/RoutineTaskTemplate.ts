// Initially copied from ToT-BE, commit 545c1dd02ed8df920e315645df162212e80b2a03

import { pipe } from "fp-ts/lib/function.js"
import * as t from "io-ts/lib/Decoder.js"
import { dateDecoder, ERROR_CODES, STATUS_CODES } from "./utils.js"

/** routine task template data */
export type RoutineTaskTemplate = {
  "routine-task-template-id": number
  "task-name": number
  "event-type-id": number
  "operation-id"?: number
  "event-type-name": string
  "is-event-type-delete": boolean | number
  "event-name": string
  "task-type-id": string
  "task-type-name": string
  "task-category-id": string
  "task-category-name": string
  "is-task-type-delete": boolean | number
  "valid-start-date": Date
  "valid-end-date": Date
  "work-start-time": string
  "work-end-time": string
  "designation-id": number
  "designation-name": string
  "estimated-task-time": string
  pattern: string
  "pattern-rule": string
  remarks: string
  "asset-task-group-id": number
  "asset-task-group-name": string
  "create-timestamp": Date
  "create-user-id": string
  "update-timestamp": Date
  "update-user-id": string
  "is-operation-event-delete": boolean | number
}

/** routine task template req param for create and update */
export type RoutineTaskTemplateRequest = {
  "routine-task-template-id"?: number
  "asset-task-group-id": number
  "event-type-id": number
  "operation-id"?: number
  "event-name"?: string
  "task-type-id": number
  "task-name": string
  "valid-start-date": Date
  "valid-end-date"?: Date
  "work-start-time": string
  "work-end-time": string
  "designation-id": number
  "estimated-task-time": string
  pattern: string
  "pattern-rule": string
  remarks?: string
  "operate-user-id": string
}

/** create routine task template response param and routine task template req param for soft delete  */
export type createRoutineTaskTemplateResponse_OR_DeleteRoutineTaskTemplateRequest = {
  "routine-task-template-id": number
}

/** create and update routine task template api response */
export type RoutineTaskTemplateAPIResponse =
  | {
      code: STATUS_CODES.CREATE_SUCCESS_CODE
      body: createRoutineTaskTemplateResponse_OR_DeleteRoutineTaskTemplateRequest
    }
  | {
      code: ERROR_CODES | STATUS_CODES.SUCCESS_CODE
      body: string
    }

/** routine task template param */
export type getRoutineTaskTemplateRequest = {
  "valid-date"?: Date
  "asset-task-group-id": number
  "operation-id"?: number
}

/** request required param */
const getRoutineTaskTemplateRequiredDecoder = t.struct({
  "asset-task-group-id": t.number,
})

/** request Optional param */
const getRoutineTaskTemplateOptionalDecoder = t.partial({
  "valid-date": dateDecoder,
})

/** delete request required param */
const deleteRoutineTaskTemplateRequiredDecoder = t.struct({
  "routine-task-template-id": t.number,
})

type getRoutineTaskTemplateDecodeType = t.Decoder<any, getRoutineTaskTemplateRequest>

type deleteRoutineTaskTemplateDecodeType = t.Decoder<
  any,
  createRoutineTaskTemplateResponse_OR_DeleteRoutineTaskTemplateRequest
>

export const getRoutineTaskTemplateDecoder: getRoutineTaskTemplateDecodeType = pipe(
  getRoutineTaskTemplateRequiredDecoder,
  t.intersect(getRoutineTaskTemplateOptionalDecoder),
)

export const deleteRoutineTaskTemplateDecoder: deleteRoutineTaskTemplateDecodeType = pipe(
  deleteRoutineTaskTemplateRequiredDecoder,
)

/** routine task template for create and update required param using decoder */
const routineTaskTemplateRequiredDecoder = t.struct({
  "asset-task-group-id": t.number,
  "event-type-id": t.number,
  "task-type-id": t.number,
  "task-name": t.string,
  "valid-start-date": dateDecoder,
  "work-start-time": t.string,
  "work-end-time": t.string,
  "designation-id": t.number,
  "estimated-task-time": t.string,
  pattern: t.string,
  "pattern-rule": t.string,
  "operate-user-id": t.string,
})

type routineTaskTemplateDecodeType = t.Decoder<any, RoutineTaskTemplateRequest>

/** routine task template for create and update optional param using decoder */
const routineTaskTemplatePartialDecoder = t.partial({
  "routine-task-template-id": t.number,
  "event-name": t.string,
  "valid-end-date": dateDecoder,
  remarks: t.string,
})

/** routine task template for create and update request param validate */
export const RoutineTaskTemplateRequestDecoder: routineTaskTemplateDecodeType = pipe(
  routineTaskTemplateRequiredDecoder,
  t.intersect(routineTaskTemplatePartialDecoder),
)

/** routine task template api response */
export type getRoutineTaskTemplateAPIResponse = {
  code: number
  body: RoutineTaskTemplate[] | string
}
