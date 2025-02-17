// Initially copied from ToT-BE, commit 545c1dd02ed8df920e315645df162212e80b2a03

import fs from "fs"
import path from "path"

import { Request, Response } from "express"
import { Sequelize, UniqueConstraintError } from "sequelize"

import logger, { loggerStorage } from "../infrastructure/logger.js"
import { fileURLToPath } from "url"
export type Result = {
  code: number
  body: any
}

const _handleErrorFn = (error: unknown): Result => {
  if (error instanceof Error && error.message === "REVISION_MISMATCH") {
    return {
      code: 409,
      // This means the management item record has already been changed by another user.
      body: "Revision Mismatch",
    }
  }

  if (error instanceof UniqueConstraintError && error.name === "SequelizeUniqueConstraintError") {
    const badFields = Object.keys(error.fields)
    const badValues = Object.values(error.fields)
    return {
      code: 400,
      body: `A record with the value ${badValues[0]} for the key ${badFields} already exists.`,
    }
  }

  if (error instanceof Error && error.message === "INVALID_OFFSET") {
    return {
      code: 400,
      body: "Cannot set minus number for offset.",
    }
  }

  if (error instanceof Error && error.message === "NO_FIELD_TO_UPDATE") {
    return {
      code: 400,
      body: "No Field to Update",
    }
  }

  if (error instanceof Error && error.message === "RECORD_NOT_FOUND") {
    return {
      code: 400,
      body: "The record id you sent does not match any record we have",
    }
  }
  if (error instanceof Error && error.message === "NO_RECORD_TO_UPDATE") {
    return {
      code: 400,
      body: "No Record to Update",
    }
  }

  if (error instanceof Error && error.message === "NO_CONCERN_FOUND") {
    return {
      code: 400,
      body: "Concern not found",
    }
  }

  if (error instanceof Error && error.message === "FACTOR_DOES_NOT_EXIST") {
    return {
      code: 400,
      body: "Parent Factor Does Not Exist",
    }
  }

  if (error instanceof Error && error.message === "NO_INVESTIGATION_FOUND") {
    return {
      code: 400,
      body: "Some investigation not found",
    }
  }

  if (error instanceof Error && error.message === "FACTOR_HAS_CHILD") {
    return {
      code: 400,
      body: "Cannot delete factor which has a child",
    }
  }

  if (error instanceof Error && error.message === "FACTOR_HAS_INVESTIGATION") {
    return {
      code: 400,
      body: "Cannot delete facto which has a investigation",
    }
  }

  if (error instanceof Error && error.message === "OCCURRENCE_HAS_CHILD") {
    return {
      code: 400,
      body: "Cannot delete occurrence which has a child",
    }
  }

  if (error instanceof Error && error.message === "OCCURRENCE_HAS_INVESTIGATION") {
    return {
      code: 400,
      body: "Cannot delete occurrence which has a investigation",
    }
  }

  if (error instanceof Error && error.message === "NO_CONNECTION_ENV_VALUE") {
    return {
      code: 400,
      body: "The Connection String environmental variable was not set.",
    }
  }

  if (error instanceof Error && error.message === "BLOB_FILE_NAME_ERROR") {
    return {
      code: 400,
      body: "The file already exists.",
    }
  }

  if (error instanceof Error && error.message === "NO_FILE_TO_DOWNLOAD") {
    return {
      code: 400,
      body: "No file to download.",
    }
  }

  if (error instanceof Error && error.message === "NO_BLOB_FILE_ERROR") {
    return {
      code: 400,
      body: "The file is not found.",
    }
  }

  if (error instanceof Error && error.message === "NO_FIELD_TO_UPDATE") {
    return {
      code: 400,
      body: "No field to update.",
    }
  }

  if (error instanceof Error && error.message === "NO_DATA") {
    return {
      code: 404,
      body: "No data is found.",
    }
  }

  logger.error(error)
  return {
    code: 500,
    body: "unknown error",
  }
}

export const testHandleErrors = (
  decoratedFn: (...input: any) => Promise<Result> | Result,
  handlerFn = _handleErrorFn,
): any => {
  return async (input: any): Promise<Result> => {
    try {
      const response = await decoratedFn(input)
      return response
    } catch (error: any) {
      return handlerFn(error)
    }
  }
}

export const handleErrors = (
  decoratedFn: (...input: any) => Promise<Result> | Result,
  handlerFn = _handleErrorFn,
): any => {
  return async (req: Request, res: Response): Promise<Result> => {
    try {
      return await decoratedFn(req, res)
    } catch (error) {
      return handlerFn(error)
    }
  }
}

export const emptyResponse =
  (decoratedFn: (...input: any) => Promise<Result> | Result) =>
  async (req: Request, res: Response): Promise<void> => {
    const result: Result = await decoratedFn(req, res)
    res.status(result.code)
    res.end()
  }

export const emptyResponseWithErrorHandler = (decoratedFn: (...input: any) => Promise<Result> | Result) =>
  emptyResponse(handleErrors(decoratedFn))

export const jsonResponse =
  (decoratedFn: (...input: any) => Promise<Result> | Result) =>
  async (req: Request, res: Response): Promise<void> => {
    const result: Result = await decoratedFn(req, res)
    const store = loggerStorage.getStore()
    if (store) {
      store.resBody = result.body
    }
    res.status(result.code)
    res.json(result.body)
    res.end()
  }

export const jsonResponseWithErrorHandler = (decoratedFn: (...input: any) => Promise<Result> | Result) =>
  jsonResponse(handleErrors(decoratedFn))

export const jsonOrEmptyResponse =
  (decoratedFn: (...input: any) => Promise<Result> | Result, jsonStatusCodes: number[]) =>
  async (req: Request, res: Response): Promise<void> => {
    const result: Result = await decoratedFn(req, res)
    res.status(result.code)
    if (jsonStatusCodes.includes(result.code)) {
      const store = loggerStorage.getStore()
      if (store) {
        store.resBody = result.body
      }
      res.json(result.body)
    }
    res.end()
  }

export const extractValue =
  (fn: any) =>
  (decoratedFn: (...input: any) => Promise<Result> | Result) =>
  async (req: Request): Promise<any> => {
    return decoratedFn(fn(req))
  }

export const overrideResponse =
  (cde: number, flnm: string) =>
  (_req: Request, res: Response): void => {
    const __filename = fileURLToPath(import.meta.url)
    const __dirname = path.dirname(__filename)

    res.status(cde)
    const data = JSON.parse(fs.readFileSync(path.resolve(__dirname, `./data/${flnm}`), "utf8"))
    res.json(data)
    res.end()
  }
// The behavior for all our update functions should be the same.  This ensures that.
export const updateHandler = (fn: (_: any) => Promise<[undefined, number]>) => async (input: any) => {
  const [, updateCount] = await fn(input)
  if (updateCount === 0) {
    throw new Error("NO_RECORD_TO_UPDATE")
  }
  return "OK"
}

export const wrapTransaction = (sequelize: Sequelize) => (fn: any) => async (input: unknown) => {
  let ret
  await sequelize.transaction(async (t) => {
    ret = await fn(input, t)
  })
  return ret
}
