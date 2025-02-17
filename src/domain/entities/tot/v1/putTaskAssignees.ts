// Initially copied from ToT-BE, commit 545c1dd02ed8df920e315645df162212e80b2a03
import * as t from "io-ts/lib/Decoder.js"

const Assignee = t.struct({
  "user-id": t.string,
})

const Assignment = t.struct({
  "task-id": t.number,
  assignees: t.array(Assignee),
})

export const putTaskAssigneesRequestDecoder = t.struct({
  "operate-user-id": t.string,
  assignments: t.array(Assignment),
})

export type putTaskAssigneesRequest = t.TypeOf<typeof putTaskAssigneesRequestDecoder>

export type putTaskAssigneesAPIResponse =
  | { code: 200; body: "OK" }
  | {
      code: 404
      body: {
        errors: (
          | { "error-type": "NOT_FOUND_USER_ID"; "invalid-values": string[] }
          | { "error-type": "NOT_FOUND_OPERATE_USER_ID" }
          | { "error-type": "NOT_FOUND_TASK_ID"; "invalid-values": number[] }
        )[]
      }
    }
