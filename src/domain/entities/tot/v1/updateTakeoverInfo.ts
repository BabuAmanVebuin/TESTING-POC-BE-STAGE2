// Initially copied from ToT-BE, commit 545c1dd02ed8df920e315645df162212e80b2a03
/*import { pipe } from "fp-ts/lib/pipeable";*/
import * as t from "io-ts/lib/Decoder.js"

/*import { dateDecoder } from "./utils";*/

/* Manual generation */

export type updateTakeoverInfoAPIResponse =
  | { code: 200; body: "OK" }
  | { code: 400; body: "Bad Request" }
  | { code: 401; body: "Unauthorized" }
  | {
      code: 404
      body: "Task ID does not exist" | "Operate user ID does not exist"
    }
  | { code: 409; body: "Conflict" }
  | { code: 412; body: "Precondition Failed" }

export type updateTakeoverInfoRequest = {
  "power-plant-id": string
  "asset-task-group-id": number
  "operate-user-id": string
}

const updateTakeoverInfoRequestRequiredDecoder = t.struct({
  "power-plant-id": t.string,
  "asset-task-group-id": t.number,
  "operate-user-id": t.string,
})

type updateTakeoverInfoDecodeType = t.Decoder<any, updateTakeoverInfoRequest>
export const updateTakeoverInfoRequestDecoder: updateTakeoverInfoDecodeType = updateTakeoverInfoRequestRequiredDecoder
