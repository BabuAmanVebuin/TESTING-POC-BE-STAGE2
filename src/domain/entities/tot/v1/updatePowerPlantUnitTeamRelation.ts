import * as t from "io-ts/lib/Decoder.js"
import { pipe } from "fp-ts/lib/function.js"
import { ERROR_CODES, nonEmptyArray, nonEmptyString, STATUS_CODES, STATUS_MESSAGE, validateHHMMSS } from "./utils.js"

/**
 * Update PowerPlantUnitTeamRelationAPI Response Type
 */
export type updatePowerPlantUnitTeamRelationAPIResponse =
  | {
      code: STATUS_CODES.SUCCESS_CODE
      body: STATUS_MESSAGE.SUCCESS_MESSAGE
    }
  | {
      code: ERROR_CODES
      body: string
    }

// type Team
export type Team = {
  "team-id": number
  "team-name"?: string
  "operation-id"?: number[]
}

// type Asset
export type Asset = {
  "asset-task-group-id": number
  "asset-task-group-name"?: string
  "hours-per-day"?: string
  "asset-group-id"?: string[]
  teams?: Team[]
}

/**
 * Update PowerPlantUnitTeamRelation Request Type
 */
export type updatePowerPlantUnitTeamRelationRequest = {
  "power-plant-id": string
  asset: Asset[]
}

const teamDecoder = pipe(
  t.struct({
    "team-id": t.number,
  }),
  t.intersect(
    t.partial({
      "team-name": nonEmptyString(),
      "operation-id": t.array(t.number),
    }),
  ),
)

const assetDecoder = pipe(
  t.struct({
    "asset-task-group-id": t.number,
  }),
  t.intersect(
    t.partial({
      "asset-task-group-name": nonEmptyString(),
      "hours-per-day": validateHHMMSS(),
      "asset-group-id": t.array(nonEmptyString()),
      teams: t.array(teamDecoder),
    }),
  ),
)

const updatePowerPlantUnitTeamRelationRequiredDecoder = t.struct({
  "power-plant-id": nonEmptyString(),
  asset: nonEmptyArray(assetDecoder),
})

type updatePowerPlantUnitTeamRelationDecodeType = t.Decoder<any, updatePowerPlantUnitTeamRelationRequest>
export const updatePowerPlantUnitTeamRelationRequestDecoder: updatePowerPlantUnitTeamRelationDecodeType =
  updatePowerPlantUnitTeamRelationRequiredDecoder
