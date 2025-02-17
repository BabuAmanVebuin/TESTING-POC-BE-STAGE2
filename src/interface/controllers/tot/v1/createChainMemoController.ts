// Initially copied from ToT-BE, commit 545c1dd02ed8df920e315645df162212e80b2a03

import { Request } from "express"
/*import { strictEqual } from "fp-ts/lib/Eq";*/
import { QueryTypes } from "sequelize"

import {
  createChainMemoRequest,
  createChainMemoAPIResponse,
} from "../../../../domain/entities/tot/v1/createChainMemo.js"
import { sequelize } from "../../../../infrastructure/orm/sqlize/index.js"
import { extractValue, jsonResponse } from "../../../decorators.js"

/*import { handleDbError, EnumFromString, BoolFromString, DateTimeFromString, DateFromString } from "./utils";*/

/* create chain memo function */
const createChainMemo = async (
  postValidationInput: createChainMemoRequest | Record<string, any>,
): Promise<createChainMemoAPIResponse> => {
  const input = postValidationInput as createChainMemoRequest

  const timestamp = new Date()

  /* select task id for update */
  const selectTaskQuery = `SELECT TASK_ID FROM t_task WHERE TASK_ID = :taskId FOR UPDATE;`
  /* insert chain memo */
  const insertChainMemoQuery = `INSERT INTO t_chain_memo (
      CHAIN_MEMO_TEXT,
      TASK_ID,
      CREATE_USER_ID,
      CREATE_TEAM_ID,
      CREATE_TIMESTAMP
    )
    VALUES (
      :chainMemoText,
      :taskId,
      :createUserId,
      :teamId,
      :timestamp
    );`

  try {
    const insertedChainMemoId = await sequelize.transaction<number>(async (transaction) => {
      const tasks = await sequelize.query(selectTaskQuery, {
        raw: true,
        type: QueryTypes.SELECT,
        transaction,
        replacements: { taskId: input["task-id"] },
      })
      if (tasks.length === 0) {
        throw new Error("TASK_ID_NOT_FOUND")
      }

      const [_insertedChainMemoId, _] = await sequelize.query(insertChainMemoQuery, {
        raw: true,
        type: QueryTypes.INSERT,
        transaction,
        replacements: {
          chainMemoText: input["chain-memo-text"],
          taskId: input["task-id"],
          createUserId: input["create-user-id"],
          teamId: input["team-id"],
          timestamp,
        },
      })

      return _insertedChainMemoId
    })
    return {
      code: 201,
      body: { "chain-memo-id": insertedChainMemoId }, // TODO
    }
  } catch (err: any) {
    if (err.message === "TASK_ID_NOT_FOUND") {
      return {
        code: 404,
        body: "Not Found - Task id was not found.",
      }
    }
    return {
      code: 400,
      body: "Bad Request",
    }
  }
}

/* consolidate user request parameter */
export const consolidatecreateChainMemoRequest = (req: Request): createChainMemoRequest | Record<string, any> => ({
  "task-id": req.params.taskId,
  "create-user-id": req.body["create-user-id"],
  "team-id": Number(req.body["team-id"]),
  "chain-memo-text": req.body["chain-memo-text"],
})

export const createChainMemoController = jsonResponse(extractValue(consolidatecreateChainMemoRequest)(createChainMemo))
