// Initially copied from ToT-BE, commit 545c1dd02ed8df920e315645df162212e80b2a03

import t from "io-ts/lib/Decoder.js"

/**
 * Description TOT User Preference Response
 *
 * @export
 * @typedef {getToTUserPreferenceResponse} TOT User Preference Response
 */
export type getToTUserPreferenceResponse = {
  "user-name": string
  "power-plant-id": string
  "asset-task-group-id": number
  "asset-groups": {
    "asset-group-id": string
  }[]
  "device-token"?: string
  "team-id": number
  operation: {
    "operation-id": number
    "operation-name": string
  }[]
}

/**
 * Description TOT User Preference API Response
 *
 * @export
 * @typedef {getToTUserPreferenceAPIResponse} TOT User Preference API Response
 */
export type getToTUserPreferenceAPIResponse = {
  code: number
  body: getToTUserPreferenceResponse | string
}

/**
 * Description TOT User Preference Request
 *
 * @export
 * @typedef {getToTUserPreferenceRequest} TOT User Preference Request
 */
export type getToTUserPreferenceRequest = {
  "user-id": string
}

const getToTUserPreferenceRequestRequiredDecoder = t.struct({
  "user-id": t.string,
})

type getToTUserPreferenceDecodeType = t.Decoder<any, getToTUserPreferenceRequest>
export const getToTUserPreferenceRequestDecoder: getToTUserPreferenceDecodeType =
  getToTUserPreferenceRequestRequiredDecoder
