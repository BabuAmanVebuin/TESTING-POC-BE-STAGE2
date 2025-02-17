// Initially copied from ToT-BE, commit 545c1dd02ed8df920e315645df162212e80b2a03
import morgan from "morgan"
import Winston from "winston"
import { NextFunction, Request, Response } from "express"
import { env } from "./env/index.js"
import { AsyncLocalStorage } from "async_hooks"
import { randomUUID } from "crypto"

type loggerStorageType = {
  id: string
  query?: Record<string, unknown>
  reqBody?: Record<string, unknown>
  resBody?: unknown
}
export const loggerStorage = new AsyncLocalStorage<loggerStorageType>()

const transports: Array<Winston.transport> = []

transports.push(new Winston.transports.Console())

const logFromat = Winston.format((info) => {
  const requestId = loggerStorage.getStore()?.id
  const messageJson = {
    logDatetime: new Date(),
    requestId: requestId,
    logLevel: info.level,
    message:
      info.level === "error" && info.stack
        ? `${String(info.message).replace(/[\r\n]/g, "\\n")}\\n${String(info.stack).replace(/[\r\n]/g, "\\n")}`
        : `${String(info.message).replace(/[\r\n]/g, "\\n")}`,
  }
  info.logMessage = JSON.stringify(messageJson)
  return info
})

const logger: Winston.Logger = Winston.createLogger({
  level: env.LOG_LEVEL,
  levels: Winston.config.npm.levels,
  format: Winston.format.combine(
    Winston.format.splat(),
    Winston.format.errors({ stack: true }),
    logFromat(),
    Winston.format.printf(({ logMessage }) => `${logMessage}`),
  ),
  silent: false,
  transports,
})

export const loggerForMorgan: Winston.Logger = Winston.createLogger({
  level: env.LOG_LEVEL,
  levels: Winston.config.npm.levels,
  format: Winston.format.combine(
    Winston.format.errors({ stack: true }),
    Winston.format.splat(),
    Winston.format.printf(({ message }) => `${message}`),
  ),
  silent: false,
  transports,
})

export const LoggerStream = {
  write: (message: string): void => {
    loggerForMorgan.info(message.trim())
  },
}

export const setMorgan = morgan(
  (tokens, req, res) => {
    const store = loggerStorage.getStore()
    return JSON.stringify({
      logDatetime: new Date(),
      requestId: store?.id,
      logLevel: "info",
      method: tokens.method(req, res),
      url: tokens.url(req, res),
      query: store?.query,
      reqBody: store?.reqBody,
      status: tokens.status(req, res),
      resBody: store?.resBody === undefined ? {} : store.resBody,
      resTime: tokens["response-time"](req, res) + " ms",
    }).replace(/[\r\n]/g, "\\n")
  },
  {
    stream: LoggerStream,
  },
)

export const assignUuid = (req: Request, res: Response, next: NextFunction) => {
  const id: string = (req.headers["X-Request-Id"] as string) || randomUUID()
  res.setHeader("X-Request-Id", id)
  const store: loggerStorageType = { id, query: req.query, reqBody: req.body }
  loggerStorage.run(store, () => {
    next()
  })
}

export const uuidContextWrapper = async (fn: () => Promise<void>) => {
  const id = randomUUID()
  const store: loggerStorageType = { id }
  await loggerStorage.run(store, async () => {
    await fn()
  })
}

export default logger
