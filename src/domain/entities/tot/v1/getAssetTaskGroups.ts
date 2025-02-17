// Initially copied from ToT-BE, commit 545c1dd02ed8df920e315645df162212e80b2a03
import * as t from "io-ts/lib/Decoder.js"

/**
 * Description getAssetTaskGroupsResponse
 *
 * @export
 * @typedef {getAssetTaskGroupsResponse} AssetTaskGroup Response
 */
export type getAssetTaskGroupsResponse = {
  "asset-task-group-id": number
  "asset-task-group-name": string
  teams: {
    "team-id": number
    "team-name": string
    operation: {
      "operation-id": number
      "operation-name": string
    }[]
  }[]
}

/**
 * Description getAssetTaskGroupsAPIResponse
 *
 * @export
 * @typedef {getAssetTaskGroupsAPIResponse} getAssetTaskGroupsAPIResponse
 */
export type getAssetTaskGroupsAPIResponse = {
  code: number
  body: getAssetTaskGroupsResponse[] | string
}

/**
 * Description getAssetTaskGroupsRequest
 *
 * @export
 * @typedef {getAssetTaskGroupsRequest}
 */
export type getAssetTaskGroupsRequest = {
  "power-plant-id": string
}

const getAssetTaskGroupsRequestRequiredDecoder = t.struct({
  "power-plant-id": t.string,
})

type getAssetTaskGroupsDecodeType = t.Decoder<any, getAssetTaskGroupsRequest>
export const getAssetTaskGroupsRequestDecoder: getAssetTaskGroupsDecodeType = getAssetTaskGroupsRequestRequiredDecoder
