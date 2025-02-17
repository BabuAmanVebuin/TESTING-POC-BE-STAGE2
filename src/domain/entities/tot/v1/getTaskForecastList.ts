// Initially copied from ToT-BE, commit 545c1dd02ed8df920e315645df162212e80b2a03
/* eslint-disable @typescript-eslint/no-explicit-any */
import * as t from "io-ts/lib/Decoder.js"

/** request param */
export type getTaskForecastListRequest = {
  "asset-task-group-id": number
  "start-year"?: string
  "end-year"?: string
  "page-no"?: number
  "page-search-limit"?: number
  "event-type-id"?: number
  "task-type-id"?: number
  "operation-id"?: number
}

/** request required param */
const getTaskForecastListRequestRequiredDecoder = t.struct({
  "asset-task-group-id": t.number,
})

type getTaskForecastListDecodeType = t.Decoder<any, getTaskForecastListRequest>
export const getTaskForecastListRequestDecoder: getTaskForecastListDecodeType =
  getTaskForecastListRequestRequiredDecoder

/** response param */
export type getTaskForecastListResponse = {
  "task-forecast-id": number
  "event-type-id": number
  "event-type-name": string
  "is-event-type-delete": boolean | number
  "task-type-id": number
  "task-type-name": string
  "is-task-type-delete": boolean | number
  month: number
  year: number
  "total-hours": number
  "team-id": number
  "asset-task-group-id": number
  "created-by-id": string
  "updated-by-id": string
  "created-datetime": Date
  "updated-datetime": Date
  "is-operation-event-delete": boolean | number
}

export type getTaskForecastListAPIResponse = {
  code: number
  body: getTaskForecastListResponse[] | string
}
