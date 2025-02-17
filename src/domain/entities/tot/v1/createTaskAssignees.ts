// Initially copied from ToT-BE, commit 545c1dd02ed8df920e315645df162212e80b2a03
import * as t from "io-ts/lib/Decoder.js"
//Create Task assignee  request
export type createTaskAssigneesRequest = {
  "operate-user-id": string
  assignments: {
    "task-id": number
    assignees: {
      "user-id": string
    }[]
  }[]
}

const Assignees = t.struct({
  "user-id": t.string,
})

//Task assignee required param request
const AssignmentsL1 = t.struct({
  "task-id": t.number,
  assignees: t.array(Assignees),
})

//create Task Assignee request required param
const createTaskAssigneesRequestRequiredDecoder = t.struct({
  "operate-user-id": t.string,
  assignments: t.array(AssignmentsL1),
})

type createTaskAssigneesDecodeType = t.Decoder<any, createTaskAssigneesRequest>
export const createTaskAssigneesRequestDecoder: createTaskAssigneesDecodeType =
  createTaskAssigneesRequestRequiredDecoder

//create Task assignee response
export type createTaskAssigneesAPIResponse =
  | { code: 200; body: "OK" }
  | { code: 400; body: "Bad Request" }
  | { code: 401; body: "Unauthorized" }
  | {
      code: 404
      body: {
        errors: {
          "error-type": "NOT_FOUND_USER_ID"
          "invalid-values": string[]
        }[]
      }
    }
  | { code: 409; body: "Conflict" }
