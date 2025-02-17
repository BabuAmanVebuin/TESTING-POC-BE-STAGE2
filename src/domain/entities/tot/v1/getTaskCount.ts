// Initially copied from ToT-BE, commit 545c1dd02ed8df920e315645df162212e80b2a03
import { pipe } from "fp-ts/lib/function.js"
import * as t from "io-ts/lib/Decoder.js"
import { dateDecoder } from "./utils.js"

export type getTaskCountRequest = {
  "planned-date-time-to"?: Date
  "planned-date-time-from"?: Date
  "planned-date-time-blank-flag"?: boolean
  "power-plant-id": string
  "asset-task-group-id": string
}

const getTaskCountRequiredDecoder = t.struct({
  "power-plant-id": t.string,
  "asset-task-group-id": t.string,
})

const getTaskCountPartialDecoder = t.partial({
  "planned-date-time-to": dateDecoder,
  "planned-date-time-from": dateDecoder,
  "planned-date-time-blank-flag": t.boolean,
})

type getTaskCountDecodeType = t.Decoder<any, getTaskCountRequest>

export const getTaskCountDecoder: getTaskCountDecodeType = pipe(
  getTaskCountRequiredDecoder,
  t.intersect(getTaskCountPartialDecoder),
)

export type TaskCountPlannedQueryResponse = {
  "planned-task-count": number
}

export type TaskCountUnPlannedQueryResponse = {
  "unplanned-task-count": number
}

export type getTaskCountResponse = {
  "planned-task-count": number
  "unplanned-task-count": number
}

export type getTaskCountAPIResponse = {
  code: number
  body: getTaskCountResponse | string
}
