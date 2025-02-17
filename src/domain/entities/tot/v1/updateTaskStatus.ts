// Initially copied from ToT-BE, commit 545c1dd02ed8df920e315645df162212e80b2a03
import { pipe } from "fp-ts/lib/function.js"
import * as t from "io-ts/lib/Decoder.js"

import { dateDecoder } from "./utils.js"

export type updateTaskStatusRequest = {
  "task-id": number
  "operate-user-id": string
  "task-status-id": number
  "notification-type"?: string
  "update-timestamp": Date
}

const updateTaskStatusRequestRequiredDecoder = t.struct({
  "task-id": t.number,
  "operate-user-id": t.string,
  "task-status-id": t.number,
  "update-timestamp": dateDecoder,
})

const updateTaskStatusRequestOptionalDecoder = t.partial({
  "notification-type": t.string,
})

type updateTaskStatusDecodeType = t.Decoder<any, updateTaskStatusRequest>
export const updateTaskStatusRequestDecoder: updateTaskStatusDecodeType = pipe(
  updateTaskStatusRequestRequiredDecoder,
  t.intersect(updateTaskStatusRequestOptionalDecoder),
)

export type updateTaskStatusAPIResponse =
  | { code: 200; body: "OK" }
  | { code: 400; body: "Bad Request" }
  | { code: 401; body: "Unauthorized" }
  | {
      code: 404
      body: "Not Found - Task id was not found" | "Not Found - Operate user id was not found"
    }
  | { code: 409; body: "Conflict" }
