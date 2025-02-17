// Initially copied from ToT-BE, commit 545c1dd02ed8df920e315645df162212e80b2a03
import { pipe } from "fp-ts/lib/function.js"
import * as t from "io-ts/lib/Decoder.js"

/** request paramaters */
export type updateTaskForecastRequest = {
  "task-forecast-id": number
  "event-type-id"?: number
  "task-type-id"?: number
  month: number
  year: number
  "total-hours": number
  "team-id": number
  "operate-user-id": string
  "total-tasks"?: number
}

/** paramaters are required */
const updateTaskForecastRequiredDecoder = t.struct({
  "task-forecast-id": t.number,
  month: t.number,
  year: t.number,
  "total-hours": t.number,
  "team-id": t.number,
  "operate-user-id": t.string,
})

const updateTaskForecastPartialDecoder = t.partial({
  "total-tasks": t.number,
  "event-type-id": t.number,
  "task-type-id": t.number,
})

type UpdateTaskForecastDecodeType = t.Decoder<any, updateTaskForecastRequest>

export const updateTaskForecastDecoder: UpdateTaskForecastDecodeType = pipe(
  updateTaskForecastRequiredDecoder,
  t.intersect(updateTaskForecastPartialDecoder),
)

/** To validate response code and message */
export type updateTaskForecastAPIResponse =
  | { code: 200; body: "OK" }
  | { code: 400; body: "Bad Request" }
  | { code: 401; body: "Unauthorized" }
  | {
      code: 404
      body: "Not Found - Task forecast id was not found"
    }
  | { code: 409; body: "Conflict" }
  | {
      code: 404
      body: "Not Found - Event type id or Task type id was not found"
    }
  | {
      code: 404
      body: "Not Found - Asset Task Group id was not found"
    }
