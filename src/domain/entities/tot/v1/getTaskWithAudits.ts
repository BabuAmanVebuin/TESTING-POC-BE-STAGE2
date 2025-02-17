// Initially copied from ToT-BE, commit 545c1dd02ed8df920e315645df162212e80b2a03
import { pipe } from "fp-ts/lib/function.js"
import * as t from "io-ts/lib/Decoder.js"
import { dateDecoder } from "./utils.js"

export type getTaskAuditWithTaskRequest = {
  "planned-date-time"?: Date
  "due-date-time"?: Date
  "task-status-id"?: number[]
  "team-id"?: string
  "power-plant-id": string
  "asset-task-group-id": string
}

const getTaskWithAuditsRequestRequiredDecoder = t.struct({
  "power-plant-id": t.string,
  "asset-task-group-id": t.string,
  "planned-date-time": dateDecoder,
  "due-date-time": dateDecoder,
})

const getTaskWithAuditsRequestPartialDecoder = t.partial({
  "team-id": t.string,
  "task-status-id": t.array(t.number),
})

type getTaskWithAuditsDecodeType = t.Decoder<any, getTaskAuditWithTaskRequest>

export const getTasksWithAuditsDecoder: getTaskWithAuditsDecodeType = pipe(
  getTaskWithAuditsRequestRequiredDecoder,
  t.intersect(getTaskWithAuditsRequestPartialDecoder),
)

export type auditQueryResponse = {
  "task-audit-id": number
  "task-id": number
  "pre-task-status-id": number
  "post-task-status-id": number
  "team-id": number
  "operate-user-id": string
  "operate-timestamp": Date
}

export type TaskAudit = {
  "task-type-id"?: number
  audits: string
}

export type AssigneeData = {
  "user-id": string
  "task-id": number
  "user-name": string
  "team-id": string
}

export type TaskAuditQueryResponse = {
  "task-type-name": any
  "task-type-id": any
  "task-execution-time": any
  "task-id": any
  "task-status": any
  "task-audit-id": any
  "pre-task-status-id": any
  "post-task-status-id": any
  "team-id": any
  "operate-user-id": any
  "operate-timestamp": any
  "is-lock": number | boolean
}

export type Task = {
  "task-type-id"?: number
  "task-type-name"?: string
  audits: auditQueryResponse[]
}

export type Team = {
  "team-id"?: number
}

export type getTaskWithAuditsResponse = {
  tasksAuditWithTaskReports: Task[]
}

export type getTaskWithAuditsAPIResponse = {
  code: number
  body: getTaskWithAuditsResponse | any
}
