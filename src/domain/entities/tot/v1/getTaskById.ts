// Initially copied from ToT-BE, commit 545c1dd02ed8df920e315645df162212e80b2a03
/* eslint-disable @typescript-eslint/no-explicit-any */
import * as t from "io-ts/lib/Decoder.js"

export type getTaskByIdRequest = {
  "task-id": string
}

const getTaskByIdRequestRequiredDecoder = t.struct({
  "task-id": t.string,
})

type getTaskByIdDecodeType = t.Decoder<any, getTaskByIdRequest>
export const getTaskByIdRequestDecoder: getTaskByIdDecodeType = getTaskByIdRequestRequiredDecoder

export type AssigneeData = {
  "user-id": string
  "task-id": string
  "user-name": string
}

export type TaskAudit = {
  "task-audit-id": number
  "task-id": number
  "pre-task-status-id": number
  "post-task-status-id": number
  "operate-user-id": string
  "operate-timestamp": Date
}

export type getTaskByIdResponse = {
  "power-plant-id": string
  "asset-task-group-id": number
  "task-type-id": number
  "task-type-name": string
  "is-task-type-delete": boolean | number
  "task-category-id": number
  "task-category-name": string
  "task-name": string
  "asset-id": number
  "asset-name": string
  "asset-code": string
  "planned-date-time": Date
  "task-priority-id": number
  "task-priority-name": string
  "due-date-time": Date
  "start-date-time": Date
  "end-date-time": Date
  "working-hours": string
  "estimated-task-time": string
  "task-status-id": number
  "task-status-name": string
  "takeover-team-id": number
  "takeover-team-name": string
  remarks: string
  "order-id": string
  "event-id": string
  "event-type-id": number
  "event-type-name": string
  "is-event-type-delete": boolean | number
  "routing-id"?: number
  "routing-counter"?: number
  "activity-id"?: string
  "sap-task-category-id": number
  "sap-task-category-name": string
  "is-lock"?: number
  "event-template-id": number
  "create-timestamp": Date
  "create-user-id": string
  "update-timestamp": Date
  "update-user-id": string
  "is-chain-memo-available": boolean
  assignees: AssigneeData[]
  "task-audits": TaskAudit[]
  "is-operation-event-delete": boolean | number
}

export type getTaskByIdAPIResponse = {
  code: number
  body: getTaskByIdResponse | string
}
