import * as t from "io-ts/lib/Decoder.js"

/**
 * type Operation
 */
export type Operation = {
  "operation-id": number
  "operation-name": string
}

/**
 * type Team
 */
export type Team = {
  "team-name": string
  operation: Operation[]
  "team-id": number
}

/**
 * type Asset
 */
export type Asset = {
  "asset-task-group-id": number
  "asset-task-group-name": string
  "hours-per-day": string
  "asset-group-id": string[]
  teams: Team[]
}

/** type plantQuery */
export type plantQuery = {
  "power-plant-id": string
  "power-plant-name": string
}

/**
 * type assetTaskGroupQuery
 */
export type assetTaskGroupQuery = {
  "power-plant-id": string
  "asset-task-group-id": number
  "asset-task-group-name": string
  "hours-per-day": string
}

/**
 * type teamQueryResponse
 */
export type teamQueryResponse = {
  "asset-task-group-id": number
  "team-id": number
  "team-name": string
  "operation-id": number
  "operation-name": string
  "asset-group-id": string
}

/**
 * getPowerPlantUnitTeamRelation Response
 *
 * @export
 * @typedef {getPowerPlantUnitTeamRelationResponse} getPowerPlantUnitTeamRelationResponse Response
 */
export type getPowerPlantUnitTeamRelationResponse = {
  "power-plant-id": string
  "power-plant-name": string
  asset: Asset[]
}

/**
 * getPowerPlantUnitTeamRelationAPIResponse
 *
 * @export
 * @typedef {getPowerPlantUnitTeamRelationAPIResponse} getPowerPlantUnitTeamRelationAPIResponse
 */
export type getPowerPlantUnitTeamRelationAPIResponse = {
  code: number
  body: getPowerPlantUnitTeamRelationResponse[] | string
}

/**
 * type getPowerPlantUnitTeamRelationRequest
 *
 * @export
 * @typedef {getPowerPlantUnitTeamRelationRequest}
 */
export type getPowerPlantUnitTeamRelationRequest = {
  "power-plant-id"?: string
}

const getPowerPlantUnitTeamRelationRequestPartialDecoder = t.partial({
  "power-plant-id": t.string,
})

type getPowerPlantUnitTeamRelationDecodeType = t.Decoder<any, getPowerPlantUnitTeamRelationRequest>
export const getPowerPlantUnitTeamRelationRequestDecoder: getPowerPlantUnitTeamRelationDecodeType =
  getPowerPlantUnitTeamRelationRequestPartialDecoder
