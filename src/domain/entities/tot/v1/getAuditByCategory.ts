// Initially copied from ToT-BE, commit 545c1dd02ed8df920e315645df162212e80b2a03
import { pipe } from "fp-ts/lib/function.js"
import * as t from "io-ts/lib/Decoder.js"

export type getTaskCategoryRequest = {
  "team-id"?: number
  "audit-start-date-time"?: string
  "audit-end-date-time"?: string
  "task-status-id"?: number[]
}

const getTaskCategoryRequestRequiredDecoder = t.struct({
  "team-id": t.number,
})

const getTaskCategoryRequestPartialDecoder = t.partial({})

type getTasksDecodeType = t.Decoder<any, getTaskCategoryRequest>

export const getTaskCategoryRequestDecoder: getTasksDecodeType = pipe(
  getTaskCategoryRequestRequiredDecoder,
  t.intersect(getTaskCategoryRequestPartialDecoder),
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
  "task-category-id"?: number
  audits: string
}

export type TaskAuditQueryResponse = {
  "task-category-name": any
  "task-category-id": any
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
  "task-category-id"?: number
  "task-category-name"?: string
  audits: auditQueryResponse[]
}

export type Team = {
  "team-id"?: number
}

export type getTaskCategoryResponse = {
  tasksCategorysReports: Task[]
}

export type getTaskCategoryAPIResponse = {
  code: number
  body: getTaskCategoryResponse | any
}
