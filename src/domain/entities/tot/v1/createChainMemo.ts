// Initially copied from ToT-BE, commit 545c1dd02ed8df920e315645df162212e80b2a03
import * as t from "io-ts/lib/Decoder.js"

export type createChainMemoResponse = {
  "chain-memo-id": number
}
export type createChainMemoAPIResponse = {
  code: number
  body: createChainMemoResponse | string
}

export type createChainMemoRequest = {
  "task-id": string
  "create-user-id": string
  "team-id": number
  "chain-memo-text": string
}

const createChainMemoRequestRequiredDecoder = t.struct({
  "task-id": t.string,
  "create-user-id": t.string,
  "team-id": t.number,
  "chain-memo-text": t.string,
})

type createChainMemoDecodeType = t.Decoder<any, createChainMemoRequest>
export const createChainMemoRequestDecoder: createChainMemoDecodeType = createChainMemoRequestRequiredDecoder
