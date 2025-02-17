// Initially copied from ToT-BE, commit 545c1dd02ed8df920e315645df162212e80b2a03
import * as t from "io-ts/lib/Decoder.js"

export type getEventTemplatesByIdResponse = {
  "task-type-id": number
  "task-type-name": string
  "event-template-id": number
  "task-category-id": number
  "task-category-name": string
  "task-priority-id": number
  "task-priority-name": string
}
export type getEventTemplatesByIdAPIResponse = {
  code: number
  body: getEventTemplatesByIdResponse[] | string
}

export type getEventTemplatesByIdRequest = {
  "event-type-id": string
}

const getEventTemplatesByIdRequestRequiredDecoder = t.struct({
  "event-type-id": t.string,
})

type getEventTemplatesByIdDecodeType = t.Decoder<any, getEventTemplatesByIdRequest>
export const getEventTemplatesByIdRequestDecoder: getEventTemplatesByIdDecodeType =
  getEventTemplatesByIdRequestRequiredDecoder
