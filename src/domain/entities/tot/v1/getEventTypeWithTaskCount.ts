// Initially copied from ToT-BE, commit 545c1dd02ed8df920e315645df162212e80b2a03
import { pipe } from "fp-ts/lib/function.js"
import * as t from "io-ts/lib/Decoder.js"

/** request param */
export type getEventTypeWithTaskCountRequest = {
  "asset-task-group-id"?: number
  "end-date-time-from"?: string
  "end-date-time-to"?: string
  "task-status-id"?: number[]
}
const getEventTypeWithTaskCountRequiredDecoder = t.struct({
  "asset-task-group-id": t.number,
})
const getEventTypeWithTaskCountRequestPartialDecoder = t.partial({})

type getTasksDecodeType = t.Decoder<any, getEventTypeWithTaskCountRequest>

export const getEventTypeAuditWithTaskRequestDecoder: getTasksDecodeType = pipe(
  getEventTypeWithTaskCountRequiredDecoder,
  t.intersect(getEventTypeWithTaskCountRequestPartialDecoder),
)

/** task audit response param */
export type TaskCountQueryResponse = {
  "event-type-name": any
  "event-type-id": any
  "task-id": any
  "working-hours": any
}

/** task response param */
export type Task = {
  "event-type-id"?: number
  "event-type-name"?: string
  "total-tasks": any
  "total-working-hours": any
}

export type getTaskTypeWithTaskCountAPIResponse = {
  code: number
  body: any
}
