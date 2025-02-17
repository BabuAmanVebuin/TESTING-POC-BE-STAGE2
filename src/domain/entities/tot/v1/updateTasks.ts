// Initially copied from ToT-BE, commit 545c1dd02ed8df920e315645df162212e80b2a03
/* eslint-disable @typescript-eslint/no-explicit-any */
import { pipe } from "fp-ts/lib/function.js"
import * as t from "io-ts/lib/Decoder.js"

import { dateDecoder } from "./utils.js"

export type updateTasksResponse = {
  "task-id": string
}
export type updateTasksAPIResponse =
  | { code: 200; body: "OK" }
  | { code: 400; body: "Bad Request" }
  | { code: 401; body: "Unauthorized" }
  | {
      code: 404
      body: {
        errors: (
          | {
              "error-type": "NOT_FOUND_ASSET_CODE"
              "invalid-values": string[]
            }
          | {
              "error-type": "NOT_FOUND_TASK_ID"
              "invalid-values": number[]
            }
        )[]
      }
    }
  | { code: 409; body: "Conflict" }

export type updateTasksRequestItem = {
  "task-id": number
  "task-type-id"?: number | null
  "task-name"?: string | null
  "asset-id"?: number | null
  "asset-code"?: string | null
  "planned-date-time"?: Date | null
  "task-priority-id"?: number | null
  "due-date-time"?: Date | null
  "start-date-time"?: Date | null
  "end-date-time"?: Date | null
  "working-hours"?: string | null
  "estimated-task-time"?: string | null
  "takeover-team-id"?: number | null
  remarks?: string | null
  "order-id"?: string | null
  "event-type-id"?: number | null
  "event-name"?: string | null
}

export type updateTasksRequest = {
  "operate-user-id": string
  tasks: updateTasksRequestItem[]
}

const updateTasksDecoder = t.struct({
  "task-id": t.number,
})

const updateTasksPartialDecoder = t.partial({
  "task-type-id": t.nullable(t.number),
  "task-name": t.nullable(t.string),
  "asset-id": t.nullable(t.number),
  "asset-code": t.nullable(t.string),
  "planned-date-time": t.nullable(dateDecoder),
  "task-priority-id": t.nullable(t.number),
  "due-date-time": t.nullable(dateDecoder),
  "start-date-time": t.nullable(dateDecoder),
  "end-date-time": t.nullable(dateDecoder),
  "working-hours": t.nullable(t.string),
  "estimated-task-time": t.nullable(t.string),
  "takeover-team-id": t.nullable(t.number),
  remarks: t.nullable(t.string),
  "order-id": t.nullable(t.string),
  "event-type-id": t.nullable(t.number),
  "event-name": t.nullable(t.string),
})

const updateTasks = pipe(updateTasksDecoder, t.intersect(updateTasksPartialDecoder))

const updateTasksRequestRequiredDecoder = t.struct({
  "operate-user-id": t.string,
  tasks: t.array(updateTasks),
})

type UpdateTasksDecodeType = t.Decoder<any, updateTasksRequest>
export const updateTasksRequestDecoder: UpdateTasksDecodeType = updateTasksRequestRequiredDecoder
