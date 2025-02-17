// Initially copied from ToT-BE, commit 545c1dd02ed8df920e315645df162212e80b2a03

import { Request } from "express"
import { QueryTypes } from "sequelize"

import {
  deleteChainMemoAPIResponse,
  deleteChainMemoRequest,
} from "../../../../domain/entities/tot/v1/deleteChainMemo.js"
import logger from "../../../../infrastructure/logger.js"
import { sequelize } from "../../../../infrastructure/orm/sqlize/index.js"
import { emptyResponse, extractValue } from "../../../decorators.js"

/* delete chain memo function */
const deleteChainMemo = async (
  postValidationInput: deleteChainMemoRequest | Record<string, any>,
): Promise<deleteChainMemoAPIResponse> => {
  const input = postValidationInput as deleteChainMemoRequest

  try {
    return sequelize.transaction(async (t) => {
      // Lock the row for deletion
      const selectChainMemoQuery = `SELECT *
        FROM t_chain_memo
        WHERE CHAIN_MEMO_ID = $chainMemoID
        FOR UPDATE;`
      const chainMemo = await sequelize.query(selectChainMemoQuery, {
        raw: true,
        type: QueryTypes.SELECT,
        bind: { chainMemoID: input["chain-memo-id"] },
      })

      if (chainMemo.length === 0) {
        return {
          code: 404,
          body: "Not Found - Task id was not found.",
        }
      }
      /* delete chain memo by chain memo id */
      const deleteChainMemoQuery = `DELETE
        FROM t_chain_memo
        WHERE CHAIN_MEMO_ID = $chainMemoID;`

      await sequelize.query(deleteChainMemoQuery, {
        transaction: t,
        raw: true,
        type: QueryTypes.DELETE,
        bind: { chainMemoID: input["chain-memo-id"] },
      })

      return {
        code: 200,
        body: "OK",
      }
    })
  } catch (error) {
    logger.error(error)
    return {
      code: 400,
      body: "Bad Request",
    }
  }
}

/* consolidate user request parameter */
export const consolidatedeleteChainMemoRequest = (req: Request): deleteChainMemoRequest | Record<string, any> => ({
  "chain-memo-id": Number(req.params.chainMemoId),
})

export const deleteChainMemoController = emptyResponse(extractValue(consolidatedeleteChainMemoRequest)(deleteChainMemo))
