// Initially copied from ToT-BE, commit 545c1dd02ed8df920e315645df162212e80b2a03
import { NextFunction, Request, Response } from "express"
import { Either } from "fp-ts/lib/Either.js"
import * as D from "io-ts/lib/Decoder.js"
import { logResponse } from "../../dpm/util.js"

export const asyncWrapper = (cb: (req: Request, res: Response, next: NextFunction) => Promise<void>) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    cb(req, res, next).catch(next)
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
