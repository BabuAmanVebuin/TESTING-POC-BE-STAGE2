// Initially copied from ToT-BE, commit 545c1dd02ed8df920e315645df162212e80b2a03
import * as t from "io-ts/lib/Decoder.js"

export type ChainMemo = {
  "chain-memo-id": number
  "chain-memo-text": string
  "create-user-id": string
  "create-user-name": string
  "create-team-name": string
  "create-timestamp": Date
}

export type getChainMemosResponse = {
  "task-name": string
  "chain-memos": ChainMemo[]
}
export type getChainMemosAPIResponse = {
  code: number
  body: getChainMemosResponse | string
}

export type getChainMemosRequest = {
  "task-id": number
}

const getChainMemosRequestRequiredDecoder = t.struct({
  "task-id": t.number,
})

type getChainMemosDecodeType = t.Decoder<any, getChainMemosRequest>
export const getChainMemosRequestDecoder: getChainMemosDecodeType = getChainMemosRequestRequiredDecoder
