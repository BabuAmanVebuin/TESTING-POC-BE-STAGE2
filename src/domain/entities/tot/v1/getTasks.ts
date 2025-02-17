// Initially copied from ToT-BE, commit 545c1dd02ed8df920e315645df162212e80b2a03
/* eslint-disable @typescript-eslint/no-explicit-any */
import { pipe } from "fp-ts/lib/function.js"
import * as t from "io-ts/lib/Decoder.js"

import { dateDecoder } from "./utils.js"

export type getTasksRequest = {
  "power-plant-id": string
  "asset-task-group-id": number
  "search-upper-limit"?: number
  "task-name"?: string
  "task-status-id"?: number[]
  "planned-date-time-to"?: Date
  "planned-date-time-from"?: Date
  "planned-date-time-blank-flag"?: boolean
  "operation-id"?: number
}

const getTasksRequestRequiredDecoder = t.struct({
  "power-plant-id": t.string,
  "asset-task-group-id": t.number,
})

const getTasksRequestPartialDecoder = t.partial({
  "search-upper-limit": t.number,
  "task-name": t.string,
  "task-status-id": t.array(t.number),
  "planned-date-time-to": dateDecoder,
  "planned-date-time-from": dateDecoder,
  "planned-date-time-blank-flag": t.boolean,
})

type getTasksDecodeType = t.Decoder<any, getTasksRequest>

export const getTasksRequestDecoder: getTasksDecodeType = pipe(
  getTasksRequestRequiredDecoder,
  t.intersect(getTasksRequestPartialDecoder),
)

export type Task = {
  "task-id"?: number
  "power-plant-id": string
  "power-plant-text": string
  "asset-task-group-id": number
  "asset-task-group-name": string
  "task-type-id": number
  "task-type-name": string
  "task-category-id"?: number
  "task-category-name"?: string
  "task-name"?: string
  "asset-id"?: number
  "asset-name"?: string
  "asset-code"?: string
  "planned-date-time"?: Date
  "task-priority-id"?: number
  "task-priority-name"?: string
  "estimated-task-time"?: string
  "due-date-time"?: Date
  "start-date-time"?: Date
  "end-date-time"?: Date
  "working-hours"?: string
  "task-status-id": number
  "task-status-name": string
  "takeover-team-id"?: number
  "takeover-team-name"?: string
  remarks?: string
  "order-id"?: string
  "event-id"?: string
  "event-name"?: string
  "event-type-id"?: number
  "event-type-name"?: string
  "routing-id"?: number
  "routing-counter"?: number
  "activity-id"?: string
  "sap-task-category-id": number
  "sap-task-category-name": string
  "is-lock"?: number
  "create-timestamp": Date
  "create-user-id": string
  "update-timestamp": Date
  "update-user-id": string
  "is-chain-memo-available": boolean
}

export type Assignee = {
  "user-id": string
  "task-id": string
  "user-name": string
}

export type getTasksResponse = {
  tasks: Task[]
  assignees: Assignee[]
}

export type getTasksAPIResponse = {
  code: number
  body: getTasksResponse | string
}
