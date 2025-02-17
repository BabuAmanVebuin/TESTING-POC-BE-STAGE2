// Initially copied from ToT-BE, commit 545c1dd02ed8df920e315645df162212e80b2a03

/* eslint-disable @typescript-eslint/no-explicit-any */

import { pipe } from "fp-ts/lib/function.js"
import * as t from "io-ts/lib/Decoder.js"

export type updateToTUserPreferencesRequest = {
  "user-id": string
  "user-name": string
  "power-plant-id": string
  "asset-task-group-id": number
  "team-id": number
  "device-token"?: string
}

const updateToTUserPreferencesRequestRequiredDecoder = t.struct({
  "user-id": t.string,
  "user-name": t.string,
  "power-plant-id": t.string,
  "asset-task-group-id": t.number,
  "team-id": t.number,
})

const updateToTUserPreferencesRequestPartialDecoder = t.partial({
  "device-token": t.string,
})

type updateToTUserPreferencesDecodeType = t.Decoder<any, updateToTUserPreferencesRequest>

export const updateToTUserPreferencesRequestDecoder: updateToTUserPreferencesDecodeType = pipe(
  updateToTUserPreferencesRequestRequiredDecoder,
  t.intersect(updateToTUserPreferencesRequestPartialDecoder),
)

export type updateToTUserPreferencesAPIResponse = {
  code: 204 | 400 | 401 | 409
  body:
    | "OK"
    | "Bad Request"
    | "Unauthorized"
    | "Conflict"
    | "Error during Insert request.  Data has been logged.  Please try again."
}
