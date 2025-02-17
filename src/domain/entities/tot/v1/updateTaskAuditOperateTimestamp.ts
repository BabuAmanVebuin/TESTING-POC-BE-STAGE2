// Initially copied from ToT-BE, commit 545c1dd02ed8df920e315645df162212e80b2a03
import * as t from "io-ts/lib/Decoder.js"
import { dateDecoder } from "./utils.js"

/** request paramaters */
export type updateTaskAuditOperateTimestampRequest = {
  "task-id": number
  taskAudits: updateTaskAuditOperateTimestampRequestItem[]
}
/** request paramaters for taskAudits */
export type updateTaskAuditOperateTimestampRequestItem = {
  "task-audit-id": number
  "operate-timestamp": Date | undefined
}

/** To validate response code and message */
export type updateTaskAuditOperateTimestampAPIResponse = { code: 200; body: "OK" } | { code: 400; body: "Bad Request" }

/** validator for taskAudit array */
const updateTaskAuditOperateTimestamp = t.struct({
  "task-audit-id": t.number,
  "operate-timestamp": dateDecoder,
})

/** validator for taskAuditOperateTimestamp  */
const updateTasksAuditOperateTimestampRequestRequiredDecoder = t.struct({
  "task-id": t.number,
  taskAudits: t.array(updateTaskAuditOperateTimestamp),
})

type updateTasksAuditOperateTimestampRequestDecodeType = t.Decoder<any, updateTaskAuditOperateTimestampRequest>
export const updateTaskAuditOperateTimestampDecoder: updateTasksAuditOperateTimestampRequestDecodeType =
  updateTasksAuditOperateTimestampRequestRequiredDecoder
