// Initially copied from ToT-BE, commit 545c1dd02ed8df920e315645df162212e80b2a03
/* eslint-disable @typescript-eslint/no-explicit-any */
import { pipe } from "fp-ts/lib/function.js"
import * as t from "io-ts/lib/Decoder.js"

import { dateDecoder } from "./utils.js"

export type createTasksResponse = {
  "task-id": number
}
export type createTasksAPIResponse =
  | { code: 201; body: createTasksResponse[] }
  | {
      code: 404
      body: {
        errors: {
          "error-type": "NOT_FOUND_ASSET_CODE"
          "invalid-values": any[]
        }[]
      }
    }
  | { code: 400 | 401 | 409; body: string }

export type Task = {
  "power-plant-id": string
  "asset-task-group-id": number
  "task-type-id": number
  "task-name": string
  "asset-id"?: number
  "asset-code"?: string
  "planned-date-time"?: Date
  "task-priority-id"?: number
  "estimated-task-time"?: string
  "due-date-time"?: Date
  "working-hours"?: string
  "task-status-id": number
  "takeover-team-id"?: number
  remarks?: string
  "order-id"?: string
  "event-id"?: string
  "event-name"?: string
  "event-type-id": number
  "operation-id"?: number
  "routing-id"?: number
  "routing-counter"?: number
  "activity-id"?: string
  "sap-task-category-id"?: number
}

export type createTasksRequest = {
  "operate-user-id": string
  tasks: Task[]
}

const taskRequiredDecoder = t.struct({
  "power-plant-id": t.string,
  "asset-task-group-id": t.number,
  "task-type-id": t.number,
  "task-name": t.string,
  "task-status-id": t.number,
  "event-type-id": t.number,
})

const taskPartialDecoder = t.partial({
  "planned-date-time": dateDecoder,
  "asset-id": t.number,
  "asset-code": t.string,
  "task-priority-id": t.number,
  "due-date-time": dateDecoder,
  "working-hours": t.string,
  "estimated-task-time": t.string,
  "takeover-team-id": t.number,
  remarks: t.string,
  "order-id": t.string,
  "event-id": t.string,
  "event-name": t.string,
  "event-type-id": t.number,
  "operation-id": t.number,
  "routing-id": t.number,
  "routing-counter": t.number,
  "activity-id": t.string,
  "sap-task-cateogry-id": t.number,
})

const taskDecoder = pipe(taskRequiredDecoder, t.intersect(taskPartialDecoder))

const createTasksRequestRequiredDecoder = t.struct({
  "operate-user-id": t.string,
  tasks: t.array(taskDecoder),
})

type createTasksDecodeType = t.Decoder<any, createTasksRequest>
export const createTasksRequestDecoder: createTasksDecodeType = createTasksRequestRequiredDecoder
