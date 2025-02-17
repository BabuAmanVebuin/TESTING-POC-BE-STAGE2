// Initially copied from DPM-BE, commit d0e2f45544cc9890762f93cf3e8f224f15efd619
import { NextFunction, Request, Response } from "express"
import logger, { loggerStorage } from "../../../infrastructure/logger.js"
import { Either } from "fp-ts/lib/Either.js"
import * as D from "io-ts/lib/Decoder.js"

export const asyncWrapper = (cb: (req: Request, res: Response, next: NextFunction) => Promise<void>) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    cb(req, res, next).catch((error) => {
      logger.error(error)
      next(error)
    })
  }
}

export const validation =
  (fn: (req: Request) => any) =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (reqType: D.Decoder<any, any>) =>
  (req: Request, res: Response, next: NextFunction): void => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: Either<D.DecodeError, any> = reqType.decode(fn(req))
    switch (result._tag) {
      case "Right": {
        next()
        break
      }
      case "Left": {
        logResponse(D.draw(result.left))
        res.status(400).json(D.draw(result.left))
        break
      }
    }
  }

export const logResponse = (responseBody: unknown) => {
  const store = loggerStorage.getStore()
  if (store) {
    store.resBody = responseBody
  }
}
