// Initially copied from ToT-BE, commit 545c1dd02ed8df920e315645df162212e80b2a03
import { pipe } from "fp-ts/lib/function.js"
import * as t from "io-ts/lib/Decoder.js"
export type getTaskAuditWithTaskRequest = {
  "team-id"?: number
  "audit-start-date-time"?: string
  "audit-end-date-time"?: string
  "task-status-id"?: number[]
  "planned-date-time-to"?: string
  "planned-date-time-from"?: string
}
const getTaskAuditWithTaskRequestRequiredDecoder = t.struct({
  "team-id": t.number,
})
const getTaskAuditWithTaskRequestPartialDecoder = t.partial({})

type getTasksDecodeType = t.Decoder<any, getTaskAuditWithTaskRequest>

export const getTaskTypeAuditWithTaskRequestDecoder: getTasksDecodeType = pipe(
  getTaskAuditWithTaskRequestRequiredDecoder,
  t.intersect(getTaskAuditWithTaskRequestPartialDecoder),
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
}

export type Task = {
  "task-type-id"?: number
  "task-type-name"?: string
  audits: auditQueryResponse[]
}

export type Team = {
  "team-id"?: number
}

export type getTaskAuditWithTaskResponse = {
  tasksAuditWithTaskReports: Task[]
}

export type getTaskAuditWithTaskAPIResponse = {
  code: number
  body: getTaskAuditWithTaskResponse | any
}
