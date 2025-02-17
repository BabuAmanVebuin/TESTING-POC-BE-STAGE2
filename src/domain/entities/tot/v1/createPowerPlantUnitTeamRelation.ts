import * as t from "io-ts/lib/Decoder.js"
import { pipe } from "fp-ts/lib/function.js"
import { ERROR_CODES, nonEmptyArray, nonEmptyString, STATUS_CODES, STATUS_MESSAGE, validateHHMMSS } from "./utils.js"

/**
 * Create PowerPlantUnitTeamRelationAPI Response Type
 */
export type createPowerPlantUnitTeamRelationAPIResponse =
  | {
      code: STATUS_CODES.CREATE_SUCCESS_CODE
      body: STATUS_MESSAGE.SUCCESS_MESSAGE
    }
  | {
      code: ERROR_CODES
      body: string
    }

// type Team
export type Team = {
  "team-name": string
  "operation-id": number[]
}

// type Asset
export type Asset = {
  "asset-task-group-id"?: number
  "asset-task-group-name": string
  "hours-per-day": string
  "asset-group-id": string[]
  teams: Team[]
}

/**
 * Create PowerPlantUnitTeamRelation Request Type
 */
export type createPowerPlantUnitTeamRelationRequest = {
  "power-plant-id": string
  asset: Asset[]
}

const teamDecoder = t.struct({
  "team-name": nonEmptyString(),
  "operation-id": nonEmptyArray(t.number),
})

const assetDecoder = pipe(
  t.struct({
    "asset-task-group-name": nonEmptyString(),
    "hours-per-day": validateHHMMSS(),
    "asset-group-id": nonEmptyArray(nonEmptyString()),
    teams: nonEmptyArray(teamDecoder),
  }),
  t.intersect(
    t.partial({
      "asset-task-group-id": t.number,
    }),
  ),
)

const createPowerPlantUnitTeamRelationRequiredDecoder = t.struct({
  "power-plant-id": nonEmptyString(),
  asset: nonEmptyArray(assetDecoder),
})

type createPowerPlantUnitTeamRelationDecodeType = t.Decoder<any, createPowerPlantUnitTeamRelationRequest>
export const createPowerPlantUnitTeamRelationRequestDecoder: createPowerPlantUnitTeamRelationDecodeType =
  createPowerPlantUnitTeamRelationRequiredDecoder
