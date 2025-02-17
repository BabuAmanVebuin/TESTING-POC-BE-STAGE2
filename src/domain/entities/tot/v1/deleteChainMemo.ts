// Initially copied from ToT-BE, commit 545c1dd02ed8df920e315645df162212e80b2a03
import * as t from "io-ts/lib/Decoder.js"

export type deleteChainMemoRequest = {
  "chain-memo-id": number
}

const deleteChainMemoRequestRequiredDecoder = t.struct({
  "chain-memo-id": t.number,
})

type deleteChainMemoDecodeType = t.Decoder<any, deleteChainMemoRequest>
export const deleteChainMemoRequestDecoder: deleteChainMemoDecodeType = deleteChainMemoRequestRequiredDecoder

export type deleteChainMemoAPIResponse =
  | { code: 200; body: "OK" }
  | { code: 400; body: "Bad Request" }
  | { code: 401; body: "Unauthorized" }
  | { code: 404; body: "Not Found - Task id was not found." }
