// Initially copied from ToT-BE, commit 545c1dd02ed8df920e315645df162212e80b2a03
import { pipe } from "fp-ts/lib/function.js"
import * as t from "io-ts/lib/Decoder.js"

//Update sap task status api response
export type updateSapTaskStatusAPIResponse =
  | { code: 200; body: "OK" }
  | { code: 400; body: "Bad Request" }
  | { code: 401; body: "Unauthorized" }
  | {
      code: 404
      body:
        | "Not Found - Task was not found"
        | "Not Found - Operate user id was not found"
        | "Not Found - User Assignee was not found"
    }
  | { code: 409; body: "Conflict" }

//Sap task status request
export type updateSapTaskStatusRequest = {
  "order-id": string
  "sap-task-category-id": number
  "task-status-id": number
  "routing-id": number
  "routing-counter": number
  "planned-date-time": string
  "actual-start-date-time": string
  "actual-end-date-time"?: string | null | any
  "activity-id"?: string | null
}

//Fetch the task on the basis on search criteria
export type Task = {
  "task-id": number
  "task-status-id": number
  "is-lock": number
  "start-date-time": Date
  "end-date-time": Date
}

//Update sap task status required param for validation
const updateSapTaskStatusRequestRequiredDecoder = t.struct({
  "order-id": t.string,
  "sap-task-category-id": t.number,
  "task-status-id": t.number,
  "routing-id": t.number,
  "routing-counter": t.number,
  "planned-date-time": t.string,
  "actual-start-date-time": t.string,
})

//Update sap task status optional param for validation
const updateSapTaskStatusPartialDecoder = t.partial({
  "activity-id": t.nullable(t.string),
  "actual-end-date-time": t.nullable(t.string),
})

type updateSapTaskStatusDecodeType = t.Decoder<any, updateSapTaskStatusRequest>

export const updateSapTaskStatusRequestDecoder: updateSapTaskStatusDecodeType = pipe(
  updateSapTaskStatusRequestRequiredDecoder,
  t.intersect(updateSapTaskStatusPartialDecoder),
)
