// Initially copied from ToT-BE, commit 545c1dd02ed8df920e315645df162212e80b2a03

/* eslint-disable @typescript-eslint/no-explicit-any */

import * as t from "io-ts/lib/Decoder.js"

export type createToTUserPreferencesRequest = {
  "user-id": string
  "user-name": string
  "power-plant-id": string
  "asset-task-group-id": number
  "team-id": number
}

const createToTUserPreferencesRequestRequiredDecoder = t.struct({
  "user-id": t.string,
  "user-name": t.string,
  "power-plant-id": t.string,
  "asset-task-group-id": t.number,
  "team-id": t.number,
})

type createToTUserPreferencesDecodeType = t.Decoder<any, createToTUserPreferencesRequest>
export const createToTUserPreferencesRequestDecoder: createToTUserPreferencesDecodeType =
  createToTUserPreferencesRequestRequiredDecoder
