// Initially copied from ToT-BE, commit 545c1dd02ed8df920e315645df162212e80b2a03
import { pipe } from "fp-ts/lib/function.js"
import * as t from "io-ts/lib/Decoder.js"

/** request parameter */
export type createTaskForecastRequest = {
  "event-type-id": number
  "task-type-id": number
  month: number
  year: number
  "total-hours": number
  "team-id": number
  "operate-user-id": string
  "total-tasks"?: number
  "operation-id"?: number
}

/** required request parameter */
const createTaskForecastRequiredDecoder = t.struct({
  "event-type-id": t.number,
  "task-type-id": t.number,
  month: t.number,
  year: t.number,
  "total-hours": t.number,
  "team-id": t.number,
  "operate-user-id": t.string,
})

const createTaskForecastPartialDecoder = t.partial({
  "total-tasks": t.number,
})

type createTaskForecastDecodeType = t.Decoder<any, createTaskForecastRequest>

export const createTaskForecastDecoder: createTaskForecastDecodeType = pipe(
  createTaskForecastRequiredDecoder,
  t.intersect(createTaskForecastPartialDecoder),
)

/** response task forecast id */
export type createTaskForecastResponse = {
  "task-forecast-id": number
}

/** set response validator */
export type createTaskForecastAPIResponse =
  | { code: 201; body: createTaskForecastResponse | string }
  | { code: 400 | 401 | 404 | 409; body: string }
