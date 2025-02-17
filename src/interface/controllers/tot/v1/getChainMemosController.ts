// Initially copied from ToT-BE, commit 545c1dd02ed8df920e315645df162212e80b2a03

import { Request } from "express"
import { QueryTypes } from "sequelize"

import {
  getChainMemosRequest,
  getChainMemosAPIResponse,
  ChainMemo,
} from "../../../../domain/entities/tot/v1/getChainMemos.js"
import { sequelize } from "../../../../infrastructure/orm/sqlize/index.js"
import { extractValue, jsonResponse } from "../../../decorators.js"

/* get chain memo function */
const getChainMemos = async (
  postValidationInput: getChainMemosRequest | Record<string, any>,
): Promise<getChainMemosAPIResponse> => {
  const input = postValidationInput as getChainMemosRequest

  /* select task name by task id */
  const taskQuery = `SELECT TASK_NAME 'task-name' FROM t_task WHERE TASK_ID = $taskId;`
  const task = await sequelize.query<{ "task-name": string }>(taskQuery, {
    raw: true,
    type: QueryTypes.SELECT,
    plain: true,
    bind: { taskId: input["task-id"] },
  })

  if (task === null) {
    return {
      code: 404,
      body: "Not Found - Task ID was not found.",
    }
  }
  /* select chain memo */
  const chainMemoQuery = `SELECT
      T1.CHAIN_MEMO_ID 'chain-memo-id',
      T1.CHAIN_MEMO_TEXT 'chain-memo-text',
      T1.CREATE_USER_ID 'create-user-id',
      T1.CREATE_TIMESTAMP 'create-timestamp',
      T2.TEAM_NAME 'create-team-name',
      T3.USER_NAME 'create-user-name'
    FROM
      t_chain_memo T1 JOIN
      m_team T2 ON T1.CREATE_TEAM_ID = T2.TEAM_ID JOIN
      m_user_tot T3 ON T1.CREATE_USER_ID = T3.USER_ID
    WHERE T1.TASK_ID = :taskId
    ORDER BY T1.CREATE_TIMESTAMP DESC;`

  const chainMemos = await sequelize.query<ChainMemo>(chainMemoQuery, {
    raw: true,
    type: QueryTypes.SELECT,
    replacements: { taskId: input["task-id"] },
  })

  return {
    code: 200,
    body: {
      ...task,
      "chain-memos": chainMemos,
    },
  }
}

/* consolidate user request parameter */
export const consolidategetChainMemosRequest = (req: Request): getChainMemosRequest | Record<string, any> => ({
  "task-id": Number(req.params.taskId),
})

export const getChainMemosController = jsonResponse(extractValue(consolidategetChainMemosRequest)(getChainMemos))
