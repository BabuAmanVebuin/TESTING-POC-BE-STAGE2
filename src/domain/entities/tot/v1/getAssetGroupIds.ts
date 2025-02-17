// Initially copied from ToT-BE, commit 545c1dd02ed8df920e315645df162212e80b2a03
import * as t from "io-ts/lib/Decoder.js"

export type getAssetGroupIdsRequest = {
  "power-plant-id": string
  "asset-task-group-id": string
}

const getAssetGroupIdsRequestRequiredDecoder = t.struct({
  "power-plant-id": t.string,
  "asset-task-group-id": t.string,
})

type getAssetGroupIdsDecodeType = t.Decoder<any, getAssetGroupIdsRequest>
export const getAssetGroupIdsRequestDecoder: getAssetGroupIdsDecodeType = getAssetGroupIdsRequestRequiredDecoder

export type assetGroupIdsQueryResponse = {
  "asset-group-id": string
  "team-id": string
  "asset-task-group-name": string
}

export type getAssetGroupIdsResponse = {
  "asset-group-id": string
  "team-id": string
  "asset-task-group-name": string
}

export type getAssetGroupIdsAPIResponse = {
  code: number
  body: getAssetGroupIdsResponse[] | string
}
