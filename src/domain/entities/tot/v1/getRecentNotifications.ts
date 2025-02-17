// Initially copied from ToT-BE, commit 545c1dd02ed8df920e315645df162212e80b2a03
import { pipe } from "fp-ts/lib/function.js"
import * as t from "io-ts/lib/Decoder.js"

//Get recent notification request
export type getRecentNotificationsRequest = {
  "user-id": string
  "search-hours": number
  "search-upper-limit": number
  type?: string
}

//Get recent notification request required param
const getRecentNotificationsRequestRequiredDecoder = t.struct({
  "user-id": t.string,
  "search-hours": t.number,
  "search-upper-limit": t.number,
})

//Get recent notification request optional param
const getRecentNotificationsRequestPartialDecoder = t.partial({
  type: t.string,
})

type getRecentNotificationsDecodeType = t.Decoder<any, getRecentNotificationsRequest>

export const getRecentNotificationsRequestDecoder: getRecentNotificationsDecodeType = pipe(
  getRecentNotificationsRequestRequiredDecoder,
  t.intersect(getRecentNotificationsRequestPartialDecoder),
)

//Get recent notification response
export type getRecentNotificationsResponse = {
  "notification-id": number
  "target-user-id": string
  message: string
  "task-id": number
  "task-name": string
  "planned-date-time": Date
  type: string
  "create-timestamp": Date
}

//Get recent notification api response
export type getRecentNotificationsAPIResponse = {
  code: number
  body: getRecentNotificationsResponse[] | string
}
