// Initially copied from ToT-BE, commit 545c1dd02ed8df920e315645df162212e80b2a03
import * as t from "io-ts/lib/Decoder.js"

export type deleteTaskAssigneesRequest = {
  "operate-user-id": string
  assignments: {
    "task-id": number
    assignees: {
      "user-id": string
    }[]
  }[]
}

// export type deleteTaskAssigneesRequest = {
//   "task-id": string,
//   "notification-flag": boolean,
//   "assignees": {
//     "user-id": string
//   }[]
// }[]

const Assignees = t.struct({
  "user-id": t.string,
})

const Assignments = t.struct({
  "task-id": t.number,
  assignees: t.array(Assignees),
})

const deleteTaskAssigneesRequestRequiredDecoder = t.struct({
  "operate-user-id": t.string,
  assignments: t.array(Assignments),
})

type deleteTaskAssigneesDecodeType = t.Decoder<any, deleteTaskAssigneesRequest>
export const deleteTaskAssigneesRequestDecoder: deleteTaskAssigneesDecodeType =
  deleteTaskAssigneesRequestRequiredDecoder

export type deleteTaskAssigneesAPIResponse =
  | { code: 200; body: "OK" }
  | { code: 400; body: "Bad Request" }
  | { code: 401; body: "Unauthorized" }
  | { code: 404; body: string }
