// Initially copied from ToT-BE, commit 545c1dd02ed8df920e315645df162212e80b2a03
import * as t from "io-ts/lib/Decoder.js"

export type deleteTaskForecastByIdRequest = {
  "task-forecast-id": number
}

const deleteTaskForecastByIdRequestRequiredDecoder = t.struct({
  "task-forecast-id": t.number,
})

type deleteTaskForecastByIdDecodeType = t.Decoder<any, deleteTaskForecastByIdRequest>
export const deleteTaskForecastByIdRequestDecoder: deleteTaskForecastByIdDecodeType =
  deleteTaskForecastByIdRequestRequiredDecoder

export type deleteTaskForecastByIdQueryResponse = {
  "task-forecast-id": number
}

export type deleteTaskForecastByIdAPIResponse = {
  code: number
  body: deleteTaskForecastByIdQueryResponse | string
}
