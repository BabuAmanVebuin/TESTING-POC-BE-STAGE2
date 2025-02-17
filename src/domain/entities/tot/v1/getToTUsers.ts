// Initially copied from ToT-BE, commit 545c1dd02ed8df920e315645df162212e80b2a03

/* eslint-disable @typescript-eslint/no-explicit-any */

import * as t from "io-ts/lib/Decoder.js"

export type getToTUsersResponse = {
  "team-id": number
  "team-name": string
  users: {
    "user-id": string
    "user-name": string
  }[]
}

export type getToTUsersAPIResponse = {
  code: number
  body: getToTUsersResponse[] | string
}

export type getToTUsersRequest = {
  "power-plant-id": string
  "asset-task-group-id": number
}

const getToTUsersRequestRequiredDecoder = t.struct({
  "power-plant-id": t.string,
  "asset-task-group-id": t.number,
})

type getToTUsersDecodeType = t.Decoder<any, getToTUsersRequest>
export const getToTUsersRequestDecoder: getToTUsersDecodeType = getToTUsersRequestRequiredDecoder
